$body = @{
    email = "test@example.com"
    password = "TestPass123"
    name = "Test User"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -ContentType "application/json" -Body $body

$response | ConvertTo-Json
