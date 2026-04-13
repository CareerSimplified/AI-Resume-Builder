$body = @{
    email = "test9999@mailinator.com"
    password = "TestPass123"
    name = "Test User"
} | ConvertTo-Json

Write-Host "Testing Register with Supabase..." -ForegroundColor Cyan
Write-Host ""

try {
    $Response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 15
    Write-Host "Success:" -ForegroundColor Green
    $Response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    try {
        $errorResponse = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd()
        Write-Host "Response Body: $errorResponse" -ForegroundColor Yellow
    } catch {}
}
