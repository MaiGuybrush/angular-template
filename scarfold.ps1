<#
.SYNOPSIS
    scarfold.ps1 (別名腳本，直接導向並轉發所有參數至 scaffold.ps1)
#>

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$scaffoldScript = Join-Path $scriptDir "scaffold.ps1"

& $scaffoldScript @args