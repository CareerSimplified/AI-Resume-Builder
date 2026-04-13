# Complete Test Suite Runner
# Run: .\run-all-tests.ps1

param(
    [switch]$SkipRegister,
    [switch]$SkipLogin,
    [switch]$SkipDB
)

$script:TotalStartTime = Get-Date

Write-Host @"
╔════════════════════════════════════════════════════════════╗
║          Resume Analyzer - Complete Test Suite            ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Magenta

Write-Host "Started at: $script:TotalStartTime`n" -ForegroundColor Gray

# Check if dev server is running
Write-Host "[CHECK] Testing if dev server is running on localhost:3000..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "[OK] Dev server is running!`n" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Dev server is not running!" -ForegroundColor Red
    Write-Host "Please start the dev server first: npm run dev`n" -ForegroundColor Yellow
    exit 1
}

# Run API Tests
if (-not $SkipRegister) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host " Running API Tests" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    & "$PSScriptRoot\test-api.ps1"
}

# Run DB Tests
if (-not $SkipDB) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host " Running Database Tests" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    & "$PSScriptRoot\test-db-connection.ps1"
}

# Summary
$script:TotalEndTime = Get-Date
$script:TotalDuration = $script:TotalEndTime - $script:TotalStartTime

Write-Host @"
╔════════════════════════════════════════════════════════════╗
║                    Test Suite Complete                     ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Magenta

Write-Host "Completed at: $script:TotalEndTime" -ForegroundColor Gray
Write-Host "Total Duration: $($script:TotalDuration.ToString('mm\:ss'))" -ForegroundColor Gray

Write-Host "`nUsage:" -ForegroundColor Cyan
Write-Host "  .\run-all-tests.ps1          - Run all tests" -ForegroundColor White
Write-Host "  .\run-all-tests.ps1 -SkipDB  - Skip database tests" -ForegroundColor White
Write-Host "  .\test-api.ps1               - Run API tests only" -ForegroundColor White
Write-Host "  .\test-db-connection.ps1     - Run DB tests only" -ForegroundColor White
Write-Host ""
