---
name: write-user-manual
description: 撰寫或依據 Git 異動更新前端使用者操作手冊（User Manual），支援 Playwright 自動截圖與標註。觸發時機：需要撰寫/更新操作手冊，或依 Git commit 變更同步手冊時。
---

# 撰寫前端 User Manual

## 入口判斷 (Branch Selection)

- **[Branch A] 全新撰寫 / 功能手冊** → 進入 [Phase 1](#phase-1規劃章節大綱)
- **[Branch B] 根據 Git 異動增量更新** → 進入 [Phase 0](#phase-0git-異動分析)

---

## Phase 0：Git 異動分析

### 0-A 取得變動檔案清單

```powershell
# 指定 commit 範圍或比對最新 commit
git diff --name-only HEAD~1 HEAD
```

過濾前端 UI 相關檔案（如 `.component.ts`, `.component.html`, `.service.ts`, `.vue`, `.tsx` 等）。

### 0-B 映射章節 (Exhaustive Mapping)

讀取 `docs/user-manual/src/SUMMARY.md`，比對變動元件與現有章節：
- 命中現有章節標題或檔名關鍵字 → 標記為「待更新」
- 無對應章節 → 標記為「建議新增」

### 0-C 呈現範圍與 Checkpoint Gate

向使用者呈現分析結果：

```
## Git 異動影響範圍
變動檔案：
  - src/app/orders/order-list.component.ts   → 第 2 章「訂單列表」
  - src/app/orders/order-form.component.html → 第 3 章「新增訂單」
  - src/app/shared/date-picker.component.ts  → ⚠ 未找到對應章節（建議新增）
```

**等待使用者確認受影響章節後，才進入 Phase 2。**

---

## Phase 1：規劃章節大綱

### 1-A 需求與原始碼分析

1. **需求釐清**：目標功能、頁面路徑（Route）、涵蓋操作情境（新增/編輯/刪除/Dialog）。
2. **原始碼分析**：表單欄位、驗證規則、按鈕行為、Dialog 觸發點。
3. **路由模式檢查**：檢查前端路由是否啟用 Hash 模式（`/#/`），以確保截圖 URL 組合正確。

### 1-B 產出大綱與 Checkpoint Gate

向使用者提出章節大綱與預計產出：

```
## 建議章節大綱
- [ ] 第 1 章：功能概覽（route: /xxx）
- [ ] 第 2 章：新增流程（含表單截圖）
預計產出：N 個 .md 檔案、M 張截圖
```

**等待使用者確認或調整大綱後，才進入 Phase 2。**

---

## Phase 2：逐章執行 (Step-by-Step Loop)

依序處理確認的章節清單，**每完成一章即回報進度，確認後再進行下一章**。

### 2-A 擷取截圖

確認 Dev Server（預設 `http://localhost:4200`）正常運行。
若需登入狀態或特定狀態，先詢問使用者是否提供 LocalStorage / Cookie 資料。

```powershell
# 範例：使用 @ 語法傳入暫存 JSON 檔案
python .agents/skills/write-user-manual/scripts/capture_ui.py `
  http://localhost:4200/#/orders `
  docs/user-manual/src/images/orders-create-form.png `
  --local-storage @temp_storage.json `
  --interactions '[{"action":"click","selector":"button.new-order"}]' `
  --annotations '[{"selector":".order-form","label":"① 訂單表單"}]'
```

> 提示：若長頁面需要完整截圖可加上 `--full-page`。圖檔命名與存放規則參見 [`references/document-conventions.md`](references/document-conventions.md)。

### 2-B 撰寫或更新 Markdown 文件

在 `docs/user-manual/src/` 建立或更新 `.md` 檔案。
- **新章節**：使用 [`references/document-conventions.md`](references/document-conventions.md) 的頁面範本。
- **更新既有章節**：僅更新受影響的段落與截圖，保留其餘內容。
- **寫作規範**：遵循 [`references/document-conventions.md`](references/document-conventions.md)（繁體中文、使用者視角、按鈕欄位加「引號」）。

### 2-C 更新目錄

若為新章節，將路徑加入 `docs/user-manual/src/SUMMARY.md`。

### 2-D 章節 Checkpoint

```
✓ 第 N 章完成：<檔案路徑>
  截圖：<圖檔清單>
  變更摘要：<新增 / 更新了哪些段落>

繼續第 N+1 章「<章節名稱>」嗎？
```

---

## Phase 3：驗證與收尾 (Verification Loop)

1. **建置檢查**：若專案配置 mdbook，執行 `mdbook build docs/user-manual` 驗證導覽與語法無誤。
2. **完整性檢查**：確認所有章節已登記於 `SUMMARY.md` 且截圖皆已正確產生。
3. **清理暫存**：刪除測試過程中產生的臨時登入 JSON 檔案。
4. **交付回報**：條列所有新增/更新的文件與截圖清單。
