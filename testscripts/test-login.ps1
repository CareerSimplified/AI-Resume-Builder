$body = @{
    email = "test@example.com"
    password = "TestPass123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body $body

$response | ConvertTo-Json
