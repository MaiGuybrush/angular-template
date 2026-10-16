<#
.SYNOPSIS
    scarfold.ps1 (別名腳本，導向至 scaffold.ps1)
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$AppName,

    [Parameter(Mandatory = $false, Position = 1)]
    [string]$TargetDir,

    [Parameter(ValueFromRemainingArguments = $true)]
    $RemainingArgs
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$scaffoldScript = Join-Path $scriptDir "scaffold.ps1"

& $scaffoldScript @PSBoundParameters @RemainingArgs