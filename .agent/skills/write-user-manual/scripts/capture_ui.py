#!/usr/bin/env python3
"""
UI screenshot helper for user manual generation.

Usage:
  python capture_ui.py <url> <output_path> [options]

Options:
  --interactions        JSON array (or @file.json) of interaction steps before screenshot
  --annotations         JSON array (or @file.json) of DOM overlay annotations
  --local-storage       JSON object (or @file.json) of localStorage key-value pairs
  --cookies             JSON array (or @file.json) of cookie objects [{"name": "...", "value": "...", "domain": "..."}]
  --width               Viewport width (default: 1280)
  --height              Viewport height (default: 800)
  --wait                Extra wait in ms after navigation (default: 500)
  --headed              Show the browser window (useful for debugging)
  --slow-mo             Slow down actions by N ms when --headed (default: 0)
  --pause-after-storage Pause after storage injection (press Resume in Playwright inspector)

Interaction step schema:
  {"action": "click",    "selector": "button.submit"}
  {"action": "fill",     "selector": "input[name=email]", "value": "test@example.com"}
  {"action": "select",   "selector": "select#role",       "value": "admin"}
  {"action": "wait",     "value": "1000"}
  {"action": "keyboard", "value": "Enter"}
  {"action": "hover",    "selector": ".menu-item"}

Annotation schema:
  {"selector": ".save-btn", "label": "① 儲存按鈕"}
  {"selector": "#form",     "label": "② 表單區域", "color": "#ffeb3b"}  # text color auto-adapts (or set "textColor": "#000")

Examples:
  # Simple page capture
  python capture_ui.py http://localhost:4200/users docs/user-manual/src/images/users-list.png

  # With interaction and annotation
  python capture_ui.py http://localhost:4200/orders docs/user-manual/src/images/orders-create.png \
    --interactions '[{"action":"click","selector":"button.new-order"}]' \
    --annotations '[{"selector":".order-form","label":"① 訂單表單"}]'
"""

import argparse
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Error: playwright not installed. Run: pip install playwright && playwright install chromium")
    sys.exit(1)

ANNOTATION_JS = """
(specs) => {
    function getContrastTextColor(bgColor, userTextColor) {
        if (userTextColor) return userTextColor;
        try {
            const temp = document.createElement('div');
            temp.style.color = bgColor || 'red';
            document.body.appendChild(temp);
            const computedColor = window.getComputedStyle(temp).color;
            document.body.removeChild(temp);

            const match = computedColor.match(/\\d+/g);
            if (match && match.length >= 3) {
                const r = parseInt(match[0], 10);
                const g = parseInt(match[1], 10);
                const b = parseInt(match[2], 10);
                // YIQ brightness formula (standard for perceived luminance)
                const yiq = (r * 299 + g * 587 + b * 114) / 1000;
                return yiq >= 140 ? '#111827' : '#ffffff';
            }
        } catch (e) {
            console.warn('Failed to calculate contrast color', e);
        }
        return '#ffffff';
    }

    // 1. Safe view adjustment: scroll into view and reserve top/bottom margins
    specs.forEach(spec => {
        const el = document.querySelector(spec.selector);
        if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < 50 || rect.bottom > window.innerHeight) {
                el.scrollIntoView({ behavior: 'instant', block: 'nearest' });
                const afterRect = el.getBoundingClientRect();
                if (afterRect.top < 50 && window.scrollY > 0) {
                    window.scrollBy({ top: Math.max(-50, afterRect.top - 60), behavior: 'instant' });
                }
            }
        }
    });

    // 2. Render overlays and collision-free badges
    specs.forEach(spec => {
        const el = document.querySelector(spec.selector);
        if (!el) { console.warn('Annotation selector not found:', spec.selector); return; }
        const rect = el.getBoundingClientRect();
        const color = spec.color || '#ef4444';
        const textColor = getContrastTextColor(color, spec.textColor);
        const overlay = document.createElement('div');
        overlay.setAttribute('data-manual-annotation', 'true');
        overlay.style.cssText = [
            'position:fixed',
            `left:${rect.left}px`,
            `top:${rect.top}px`,
            `width:${rect.width}px`,
            `height:${rect.height}px`,
            `border:2.5px solid ${color}`,
            'background:rgba(255,255,255,0.02)',
            'z-index:99999',
            'pointer-events:none',
            'box-sizing:border-box',
        ].join(';');

        if (spec.label) {
            const badge = document.createElement('span');
            badge.textContent = spec.label;

            // Collision-aware position calculation
            const topSpace = rect.top;
            const bottomSpace = window.innerHeight - rect.bottom;
            const elementHeight = rect.height;

            let positionStyles = '';
            if (topSpace >= 36) {
                // Space above is sufficient -> Top-Outer
                positionStyles = 'bottom:100%; left:-1px; margin-bottom:4px;';
            } else if (elementHeight < 45 && bottomSpace >= 36) {
                // Element is small/flat & top is tight -> Bottom-Outer
                positionStyles = 'top:100%; left:-1px; margin-top:4px;';
            } else {
                // Element is tall or both outside spaces tight -> Top-Inner
                positionStyles = 'top:4px; left:4px;';
            }

            // Horizontal edge safety guards
            if (rect.left < 4) {
                positionStyles += ' left:2px;';
            } else if (rect.right > window.innerWidth - 20) {
                positionStyles += ' right:2px; left:auto;';
            }

            badge.style.cssText = [
                'position:absolute',
                positionStyles,
                `background:${color}`,
                `color:${textColor}`,
                'font:bold 14px/1.3 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                'padding:3px 8px',
                'border-radius:4px',
                'box-shadow:0 2px 6px rgba(0,0,0,0.3)',
                'white-space:nowrap',
                'letter-spacing:0.3px',
            ].join(';');
            overlay.appendChild(badge);
        }
        document.body.appendChild(overlay);
    });
}
"""

REMOVE_ANNOTATIONS_JS = """
() => document.querySelectorAll('[data-manual-annotation]').forEach(el => el.remove())
"""


def apply_interaction(page, step):
    action = step.get("action")
    selector = step.get("selector", "")
    value = step.get("value", "")

    if action == "click":
        page.click(selector)
    elif action == "fill":
        page.fill(selector, value)
    elif action == "select":
        page.select_option(selector, value)
    elif action == "hover":
        page.hover(selector)
    elif action == "keyboard":
        page.keyboard.press(value)
    elif action == "evaluate":
        page.evaluate(value)
    elif action == "pause":
        print("  [PAUSED] Interaction paused. Click Resume in Playwright Inspector to continue...")
        page.pause()
    elif action == "wait":
        page.wait_for_timeout(int(value))
    else:
        print(f"  Warning: unknown action '{action}', skipping")


def capture(url, output_path, interactions, annotations, local_storage, cookies, width, height, extra_wait, headed=False, slow_mo=0, pause_after_storage=False, full_page=False):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not headed, slow_mo=slow_mo)
        context = browser.new_context(viewport={"width": width, "height": height})

        if cookies:
            print(f"  Injecting {len(cookies)} cookie(s)...")
            context.add_cookies(cookies)

        page = context.new_page()

        if local_storage:
            print("  Injecting LocalStorage...")
            parsed_url = urlparse(url)
            origin_url = f"{parsed_url.scheme}://{parsed_url.netloc}/favicon.ico"
            try:
                page.goto(origin_url)
            except Exception as e:
                print(f"  Warning: failed to establish origin via {origin_url}: {e}")

            page.evaluate("""(ls) => {
                for (const key in ls) {
                    let value = ls[key];
                    if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    } else if (typeof value !== 'string') {
                        value = String(value);
                    }
                    localStorage.setItem(key, value);
                }
            }""", local_storage)

            if pause_after_storage:
                print("  [PAUSED] LocalStorage injected. Playwright Inspector is open — click Resume to continue.")
                page.pause()

        print(f"  Navigating to {url} ...")
        page.goto(url, wait_until="domcontentloaded", timeout=60000)

        if extra_wait:
            page.wait_for_timeout(extra_wait)

        for i, step in enumerate(interactions):
            print(f"  Interaction [{i+1}/{len(interactions)}]: {step.get('action')} {step.get('selector', '')}")
            apply_interaction(page, step)
            page.wait_for_timeout(300)

        if annotations:
            print(f"  Applying {len(annotations)} annotation(s) ...")
            page.evaluate(ANNOTATION_JS, annotations)

        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(out), full_page=full_page)
        print(f"  Saved: {out}")

        if annotations:
            page.evaluate(REMOVE_ANNOTATIONS_JS)

        browser.close()


def load_json_arg(arg_value, default_val):
    if not arg_value:
        return default_val
    if isinstance(arg_value, str) and arg_value.startswith('@'):
        file_path = arg_value[1:]
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    if isinstance(arg_value, str):
        return json.loads(arg_value)
    return arg_value


def main():
    parser = argparse.ArgumentParser(description="Capture UI screenshots for user manuals")
    parser.add_argument("url", help="Page URL to capture")
    parser.add_argument("output", help="Output image path")
    parser.add_argument("--interactions", default="[]", help="JSON array or @file.json of interaction steps")
    parser.add_argument("--annotations", default="[]", help="JSON array or @file.json of DOM annotation specs")
    parser.add_argument("--local-storage", default="{}", help="JSON object or @file.json of localStorage key-value pairs")
    parser.add_argument("--cookies", default="[]", help="JSON array or @file.json of cookie objects")
    parser.add_argument("--width", type=int, default=1280, help="Viewport width")
    parser.add_argument("--height", type=int, default=800, help="Viewport height")
    parser.add_argument("--wait", type=int, default=500, help="Extra wait ms after navigation")
    parser.add_argument("--headed", action="store_true", help="Show the browser window")
    parser.add_argument("--slow-mo", type=int, default=0, help="Slow down actions by N ms (useful with --headed)")
    parser.add_argument("--pause-after-storage", action="store_true", help="Pause after storage injection")
    parser.add_argument("--full-page", action="store_true", help="Capture full scrollable page")
    args = parser.parse_args()

    try:
        interactions = load_json_arg(args.interactions, [])
        annotations = load_json_arg(args.annotations, [])
        local_storage = load_json_arg(args.local_storage, {})
        cookies = load_json_arg(args.cookies, [])
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        sys.exit(1)
    except FileNotFoundError as e:
        print(f"Error reading file: {e}")
        sys.exit(1)

    capture(
        url=args.url,
        output_path=args.output,
        interactions=interactions,
        annotations=annotations,
        local_storage=local_storage,
        cookies=cookies,
        width=args.width,
        height=args.height,
        extra_wait=args.wait,
        headed=args.headed,
        slow_mo=args.slow_mo,
        pause_after_storage=args.pause_after_storage,
        full_page=args.full_page
    )


if __name__ == "__main__":
    main()
