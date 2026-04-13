$body = @{
    email = "test$(Get-Random -Maximum 9999)@mailinator.com"
    password = "TestPass123"
    name = "Test User"
} | ConvertTo-Json

Write-Host "Testing Register API..." -ForegroundColor Cyan
Write-Host "Body: $body"
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 10
    Write-Host "Response:" -ForegroundColor Green
    $Response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
