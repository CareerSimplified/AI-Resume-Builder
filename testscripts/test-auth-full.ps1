# Register and Login Test

$email = "test$(Get-Random -Maximum 9999)@mailinator.com"
$password = "TestPass123"
$name = "Test User"

Write-Host "=== Testing Auth APIs ===" -ForegroundColor Cyan
Write-Host "Email: $email" -ForegroundColor White
Write-Host "Password: $password" -ForegroundColor White
Write-Host ""

# Test Register
Write-Host "[1] Testing Register..." -ForegroundColor Yellow
$regBody = @{
    email = $email
    password = $password
    name = $name
} | ConvertTo-Json

try {
    $regResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -ContentType "application/json" -Body $regBody -TimeoutSec 10
    if ($regResponse.success) {
        Write-Host "    [PASS] User registered: $($regResponse.data.userId)" -ForegroundColor Green
    } else {
        Write-Host "    [FAIL] $($regResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "    [ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

# Test Login (same user)
Write-Host "`n[2] Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -TimeoutSec 10
    if ($loginResponse.success) {
        Write-Host "    [PASS] Logged in! Token: $($loginResponse.data.session.accessToken.Substring(0, [Math]::Min(20, $loginResponse.data.session.accessToken.Length)))..." -ForegroundColor Green
    } else {
        Write-Host "    [FAIL] $($loginResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "    [ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

# Test Wrong Password
Write-Host "`n[3] Testing Wrong Password..." -ForegroundColor Yellow
$wrongBody = @{
    email = $email
    password = "WrongPassword"
} | ConvertTo-Json

try {
    $wrongResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body $wrongBody -TimeoutSec 10
    if (-not $wrongResponse.success) {
        Write-Host "    [PASS] Wrong password rejected" -ForegroundColor Green
    } else {
        Write-Host "    [FAIL] Should have rejected wrong password" -ForegroundColor Red
    }
} catch {
    Write-Host "    [ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Cyan
