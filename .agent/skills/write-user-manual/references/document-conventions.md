# Document Conventions

## Directory Structure

```
docs/user-manual/
├── book.toml                  # mdbook config
└── src/
    ├── SUMMARY.md             # Navigation index (required by mdbook)
    ├── images/                # All screenshots (flat, no subdirs)
    ├── index.md               # Homepage
    ├── feature-a.md           # Top-level page
    └── feature-b/             # Section with sub-pages
        ├── overview.md
        └── sub-feature.md
```

## Image Naming Rules

- All lowercase, words separated by hyphens
- Format: `<feature>-<state>[-<step>].png`
- Include UI state for dialogs: `order-delete-confirm-dialog.png`
- Include step number for sequences: `create-user-step-1-basic-info.png`
- Good: `user-list-main.png`, `product-edit-form.png`, `invoice-approve-dialog.png`
- Bad: `screenshot1.png`, `新增訂單.png`, `formView.png`

## Markdown Page Template

```markdown
# 功能名稱

一至兩句說明此頁面的用途與適用情境。

## 介面總覽

![功能主畫面](./images/feature-main-view.png)

| 元素 | 說明 |
|------|------|
| 按鈕／欄位名稱 | 功能或限制說明 |

## 操作步驟

### 任務名稱（例：新增資料）

1. 點擊右上角「新增」按鈕，開啟新增表單。

   ![新增表單](./images/feature-create-form.png)

2. 填寫必填欄位（標有 `*` 者），點擊「儲存」。

## 注意事項

- 列出限制、警告或常見錯誤（若無可省略此節）。
```

## SUMMARY.md Format

```markdown
# Summary

- [首頁](./index.md)

# 功能名稱

- [功能 A 概覽](./feature-a.md)
- [功能 B](./feature-b/overview.md)
  - [子功能](./feature-b/sub-feature.md)
```

## Writing Style

- 全程使用**繁體中文**，語氣專業、客觀
- 以**使用者視角**撰寫步驟（「點擊」而非「讓使用者點擊」）
- 按鈕、欄位名稱使用 `「引號」` 標示
- 程式碼或系統訊息使用 `` `backtick` ``
- 截圖加入 mdbook 語法：`![圖片說明](./images/xxx.png)`
- 圖說簡短說明截圖的內容或狀態
