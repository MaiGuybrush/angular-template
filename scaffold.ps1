<#
.SYNOPSIS
    Angular 專案範本腳手架生成腳本 (angular-template-2026)

.DESCRIPTION
    從 Gitea 克隆 template-app 範本專案，並自動將專案名稱、package.json、angular.json、
    HTML 標題等替換為新專案名稱，並重新初始化全新乾淨的 Git 歷史紀錄。
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0, HelpMessage = "請輸入新專案名稱 (例: my-new-app)")]
    [ValidateNotNullOrEmpty()]
    [ValidatePattern('^[a-zA-Z0-9\-_]+$')]
    [string]$AppName,

    [Parameter(Mandatory = $false, Position = 1)]
    [string]$TargetDir,

    [Parameter(Mandatory = $false)]
    [string]$TemplateUrl = "http://tncimweb.cminl.oa/git-server/guy.mai/angular-template-2026.git",

    [Parameter(Mandatory = $false)]
    [string]$Branch = "master",

    [Parameter(Mandatory = $false)]
    [switch]$SkipInstall,

    [Parameter(Mandatory = $false)]
    [switch]$InPlace
)

$ErrorActionPreference = "Stop"

function ConvertTo-KebabCase([string]$text) {
    $kebab = $text -creplace '([a-z0-9])([A-Z])', '$1-$2'
    $kebab = $kebab -replace '[_\s]+', '-'
    $kebab = $kebab.ToLower().Trim('-')
    return $kebab
}

function ConvertTo-PascalCase([string]$text) {
    $normalized = $text -creplace '([a-z0-9])([A-Z])', '$1-$2'
    $parts = $normalized -split '[-_\s]+'
    $pascal = ($parts | ForEach-Object {
        if ($_.Length -gt 0) {
            $_.Substring(0, 1).ToUpper() + $_.Substring(1).ToLower()
        }
    }) -join ''
    return $pascal
}

$KebabName = ConvertTo-KebabCase $AppName
$PascalName = ConvertTo-PascalCase $AppName

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Angular 專案腳手架啟動 (angular-template-2026)" -ForegroundColor Cyan
Write-Host "  - 專案標識 (Kebab-case) : $KebabName" -ForegroundColor White
Write-Host "  - 應用標題 (PascalCase) : $PascalName" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "找不到 'git' 指令，請先安裝 Git 並加入 PATH 環境變數。"
    exit 1
}

if ($InPlace) {
    $WorkDir = (Get-Location).Path
    Write-Host "[資訊] 使用當前目錄就地更名模式: $WorkDir" -ForegroundColor Yellow
} else {
    if ([string]::IsNullOrWhiteSpace($TargetDir)) {
        $WorkDir = Join-Path (Get-Location).Path $KebabName
    } else {
        $WorkDir = [System.IO.Path]::GetFullPath($TargetDir)
    }

    if (Test-Path $WorkDir) {
        Write-Error "目標目錄已存在: $WorkDir，請指定不存在的目錄或更換 AppName。"
        exit 1
    }

    Write-Host "[步驟 1/5] 正在從 Gitea 克隆範本專案..." -ForegroundColor Cyan
    Write-Host "          來源: $TemplateUrl (分支: $Branch)" -ForegroundColor Gray
    Write-Host "          目標: $WorkDir" -ForegroundColor Gray

    & git clone -b $Branch $TemplateUrl $WorkDir
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Git clone 失敗，請確認網路連線或 Gitea 權限。"
        exit 1
    }
}

$gitPath = Join-Path $WorkDir ".git"
if (Test-Path $gitPath) {
    Write-Host "[步驟 2/5] 正在移除範本舊 Git 歷史紀錄..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force $gitPath
}

Write-Host "[步驟 3/5] 正在更新專案設定與程式碼識別名稱..." -ForegroundColor Cyan

function Replace-FileString([string]$filePath, [hashtable]$replacements) {
    if (Test-Path $filePath) {
        $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        foreach ($key in $replacements.Keys) {
            $val = $replacements[$key]
            $content = $content.Replace($key, $val)
        }
        $utf8Encoding = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($filePath, $content, $utf8Encoding)
        Write-Host "           [更新] $(Split-Path $filePath -Leaf)" -ForegroundColor Green
    }
}

Replace-FileString (Join-Path $WorkDir "package.json") @{
    '"name": "template-app"' = ('"name": "' + $KebabName + '"')
}

Replace-FileString (Join-Path $WorkDir "package-lock.json") @{
    '"name": "template-app"' = ('"name": "' + $KebabName + '"')
}

Replace-FileString (Join-Path $WorkDir "angular.json") @{
    '"template-app": {' = ('"' + $KebabName + '": {')
    'template-app:build:' = ($KebabName + ':build:')
}

Replace-FileString (Join-Path $WorkDir "src\app\app.ts") @{
    "title = signal('template-app')" = ("title = signal('" + $KebabName + "')")
}

Replace-FileString (Join-Path $WorkDir "src\app\app.spec.ts") @{
    "Hello, template-app" = ("Hello, " + $KebabName)
}

Replace-FileString (Join-Path $WorkDir "src\index.html") @{
    "<title>TemplateApp</title>" = ("<title>" + $PascalName + "</title>")
    "template-app" = $KebabName
}

Replace-FileString (Join-Path $WorkDir "README.md") @{
    "# TemplateApp" = ("# " + $PascalName)
    "template-app" = $KebabName
}

Replace-FileString (Join-Path $WorkDir "conductor\product.md") @{
    "template-app" = $KebabName
}

Replace-FileString (Join-Path $WorkDir "GLOSSARY.md") @{
    "# Angular Enterprise Template" = ("# " + $PascalName)
}

Replace-FileString (Join-Path $WorkDir "src\assets\config.json") @{
    '"appTitle": "template-app"' = ('"appTitle": "' + $KebabName + '"')
}

$tracksDir = Join-Path $WorkDir "conductor\tracks"
if (Test-Path $tracksDir) {
    Remove-Item -Recurse -Force $tracksDir
    Write-Host "           [清理] 已重置 conductor\tracks 目錄" -ForegroundColor Gray
}

if (-not $InPlace) {
    $scriptFilesToClean = @("scaffold.ps1", "scarfold.ps1")
    foreach ($f in $scriptFilesToClean) {
        $targetFile = Join-Path $WorkDir $f
        if (Test-Path $targetFile) {
            Remove-Item -Force $targetFile
            Write-Host "           [清理] 已移除新專案目錄下的 $f" -ForegroundColor Gray
        }
    }
}

Write-Host "[步驟 4/5] 正在初始化全新 Git 倉儲..." -ForegroundColor Cyan
Push-Location $WorkDir
try {
    & git init -b $Branch
    & git add .
    & git commit -m "feat: initial commit for $KebabName from angular-template-2026"
    Write-Host "           [完成] Git 倉儲已初始化並完成首個提交 (分支: $Branch)" -ForegroundColor Green
} catch {
    Write-Warning "Git 初始化提交時發生警告: $_"
} finally {
    Pop-Location
}

if (-not $SkipInstall) {
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "[步驟 5/5] 正在執行 npm install (可使用 -SkipInstall 跳過)..." -ForegroundColor Cyan
        Push-Location $WorkDir
        try {
            & npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Host "           [完成] 依賴套件安裝成功！" -ForegroundColor Green
            } else {
                Write-Warning "npm install 回傳非零狀態碼，您可稍後手動執行 npm install。"
            }
        } finally {
            Pop-Location
        }
    } else {
        Write-Warning "找不到 npm 指令，已略過自動安裝依賴。"
    }
} else {
    Write-Host "[步驟 5/5] 已指定 -SkipInstall，略過 npm install。" -ForegroundColor Gray
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "  專案 $KebabName ($PascalName) 建立成功！" -ForegroundColor Green
Write-Host "  專案路徑: $WorkDir" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
Write-Host "下一步操作指引：" -ForegroundColor Yellow
Write-Host "  1. 進入專案目錄:  cd `"$WorkDir`"" -ForegroundColor White
if ($SkipInstall) {
    Write-Host "  2. 安裝相依套件:  npm install" -ForegroundColor White
    Write-Host "  3. 啟動開發伺服器: npm start" -ForegroundColor White
} else {
    Write-Host "  2. 啟動開發伺服器: npm start" -ForegroundColor White
}
Write-Host "  4. 設定新遠端倉儲: git remote add origin [您的新專案-Git-URL]" -ForegroundColor White
Write-Host "  5. 推送至遠端:     git push -u origin $Branch" -ForegroundColor White
Write-Host "========================================================`n" -ForegroundColor Green