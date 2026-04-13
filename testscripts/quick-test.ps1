# Test Register API
$Body = @{
    email = "test$(Get-Random -Maximum 9999)@mailinator.com"
    password = "TestPass123"
    name = "Test User"
} | ConvertTo-Json

Write-Host "Testing Register API..." -ForegroundColor Cyan
Write-Host "Email: $($Body.email)" -ForegroundColor White
Write-Host "Password: $($Body.password)" -ForegroundColor White
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -ContentType "application/json" -Body $Body -TimeoutSec 30
    $Response | ConvertTo-Json -Depth 5
    
    if ($Response.success) {
        Write-Host "`n[SUCCESS] User registered!" -ForegroundColor Green
    } else {
        Write-Host "`n[FAILED] Registration failed: $($Response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

# Test Login
Write-Host "`n`nTesting Login API..." -ForegroundColor Cyan

$LoginBody = @{
    email = $Body.email
    password = $Body.password
} | ConvertTo-Json

try {
    $LoginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body $LoginBody -TimeoutSec 30
    $LoginResponse | ConvertTo-Json -Depth 5
    
    if ($LoginResponse.success) {
        Write-Host "`n[SUCCESS] User logged in!" -ForegroundColor Green
    } else {
        Write-Host "`n[FAILED] Login failed: $($LoginResponse.message)" -ForegroundColor Yellow
        if ($LoginResponse.message -match "confirm|verify") {
            Write-Host "Note: Email confirmation required" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}
