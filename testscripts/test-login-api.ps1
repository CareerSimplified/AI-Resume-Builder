$loginBody = @{
    email = "test2704@mailinator.com"
    password = "TestPass123"
} | ConvertTo-Json

Write-Host "Testing Login API..." -ForegroundColor Cyan

try {
    $Response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -TimeoutSec 10
    Write-Host "Response:" -ForegroundColor Green
    $Response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
