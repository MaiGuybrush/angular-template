# TemplateApp (Angular Enterprise Template 2026)

本專案為企業級 Angular 21 標準範本，整合 Tailwind CSS、企業 SSO 認證（`@inx/inx-auth-lib`）、ESLint 與 Vitest 單元測試框架。

---

## 快速建立新專案 (Scaffolding)

本專案提供 PowerShell 腳手架腳本 `scaffold.ps1`，讓開發者能直接透過參數 `<appName>` 從 Gitea 克隆本範本，並自動將專案更名為新開發專案：

```powershell
# 基本用法：指定新專案名稱（將自動從 Gitea clone 至 ./my-new-app 並完成初始化）
.\scaffold.ps1 -AppName "my-new-app"

# 進階用法：自訂目標目錄、略過 npm install
.\scaffold.ps1 -AppName "my-new-app" -TargetDir "D:\Projects\my-new-app" -SkipInstall
```

---

## 開發指南 (Development)

### 啟動本地開發伺服器
```bash
npm start
# 或 ng serve
```
預設將啟動於 `http://localhost:4200/`。

### 建置專案
```bash
npm run build
```

### 執行單元測試
```bash
npm test
```

### 程式碼檢查與排版
```bash
npm run lint
npm run format
```
