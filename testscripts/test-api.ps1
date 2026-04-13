# API Test Script for Resume Analyzer
# Run: .\test-api.ps1

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$TestEmail = "test$(Get-Random -Maximum 9999)@test.com",
    [string]$TestPassword = "TestPass123",
    [string]$TestName = "Test User"
)

$script:SuccessCount = 0
$script:FailureCount = 0

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[PASS] $Message" -ForegroundColor Green
    $script:SuccessCount++
}

function Write-Failure {
    param([string]$Message)
    Write-Host "[FAIL] $Message" -ForegroundColor Red
    $script:FailureCount++
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Yellow
}

# Test 1: Register User
Write-TestHeader "TEST 1: User Registration"

$registerBody = @{
    email = $TestEmail
    password = $TestPassword
    name = $TestName
} | ConvertTo-Json

Write-Info "Testing registration with email: $TestEmail"

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body $registerBody -TimeoutSec 30
    $responseJson = $response | ConvertTo-Json -Depth 10
    
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host $responseJson -ForegroundColor Gray
    
    if ($response.success -eq $true) {
        Write-Success "User registered successfully"
        Write-Host "  - User ID: $($response.data.userId)" -ForegroundColor Gray
        Write-Host "  - Email: $($response.data.email)" -ForegroundColor Gray
        Write-Host "  - Email Confirmed: $($response.data.emailConfirmed)" -ForegroundColor Gray
        
        # Store for next test
        $script:RegisteredUserId = $response.data.userId
        $script:RegisteredEmail = $TestEmail
    } else {
        Write-Failure "Registration failed: $($response.message)"
    }
} catch {
    Write-Failure "Registration request failed: $($_.Exception.Message)"
}

# Test 2: Register with Duplicate Email
Write-TestHeader "TEST 2: Duplicate Registration Prevention"

$dupBody = @{
    email = $TestEmail
    password = "DifferentPass123"
    name = "Another User"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body $dupBody -TimeoutSec 30
    
    if ($response.success -eq $false) {
        Write-Success "Duplicate registration correctly prevented"
        Write-Host "  - Error: $($response.error)" -ForegroundColor Gray
    } else {
        Write-Failure "Should have prevented duplicate registration"
    }
} catch {
    Write-Failure "Duplicate check request failed"
}

# Test 3: Register with Invalid Data
Write-TestHeader "TEST 3: Validation - Missing Fields"

$invalidBody = @{ email = "" } | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body $invalidBody -TimeoutSec 30
    
    if ($response.success -eq $false) {
        Write-Success "Missing fields validation working"
    } else {
        Write-Failure "Should have rejected missing fields"
    }
} catch {
    Write-Info "Expected validation error caught"
}

# Test 4: Register with Short Password
Write-TestHeader "TEST 4: Validation - Short Password"

$shortPassBody = @{
    email = "short@test.com"
    password = "123"
    name = "Test"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" -Method Post -ContentType "application/json" -Body $shortPassBody -TimeoutSec 30
    
    if ($response.success -eq $false -and $response.error -match "password|short") {
        Write-Success "Short password validation working"
    } else {
        Write-Failure "Should have rejected short password"
    }
} catch {
    Write-Info "Expected validation error caught"
}

# Test 5: Login (if we have a confirmed user)
Write-TestHeader "TEST 5: User Login"

if ($RegisteredEmail) {
    $loginBody = @{
        email = $RegisteredEmail
        password = $TestPassword
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -TimeoutSec 30
        $responseJson = $response | ConvertTo-Json -Depth 10
        
        Write-Host "Response:" -ForegroundColor Gray
        Write-Host $responseJson -ForegroundColor Gray
        
        if ($response.success -eq $true) {
            Write-Success "User logged in successfully"
            Write-Host "  - User ID: $($response.data.user.id)" -ForegroundColor Gray
            Write-Host "  - Email: $($response.data.user.email)" -ForegroundColor Gray
            Write-Host "  - Has Access Token: $($response.data.session.accessToken -ne $null)" -ForegroundColor Gray
            
            $script:AccessToken = $response.data.session.accessToken
        } else {
            Write-Failure "Login failed: $($response.message)"
            
            if ($response.message -match "not confirmed|verify") {
                Write-Host "  Note: Email verification required before login" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Failure "Login request failed: $($_.Exception.Message)"
    }
} else {
    Write-Host "Skipped - No registered user from Test 1" -ForegroundColor Yellow
}

# Test 6: Login with Wrong Password
Write-TestHeader "TEST 6: Login - Wrong Password"

$wrongPassBody = @{
    email = $TestEmail
    password = "WrongPassword123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $wrongPassBody -TimeoutSec 30
    
    if ($response.success -eq $false) {
        Write-Success "Wrong password correctly rejected"
    } else {
        Write-Failure "Should have rejected wrong password"
    }
} catch {
    Write-Failure "Wrong password check failed"
}

# Test 7: Login with Non-existent User
Write-TestHeader "TEST 7: Login - Non-existent User"

$nonExistentBody = @{
    email = "nonexistent@test.com"
    password = "SomePass123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $nonExistentBody -TimeoutSec 30
    
    if ($response.success -eq $false) {
        Write-Success "Non-existent user correctly handled"
    } else {
        Write-Failure "Should have rejected non-existent user"
    }
} catch {
    Write-Failure "Non-existent user check failed"
}

# Summary
Write-TestHeader "TEST SUMMARY"
Write-Host "Passed: $SuccessCount" -ForegroundColor Green
Write-Host "Failed: $FailureCount" -ForegroundColor Red

if ($FailureCount -eq 0) {
    Write-Host "`nAll tests passed! API is working correctly." -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed. Please review the output above." -ForegroundColor Yellow
}

# Save test credentials for manual DB verification
Write-Host "`n--- Test Credentials for Manual DB Verification ---" -ForegroundColor Cyan
Write-Host "Email: $TestEmail" -ForegroundColor White
Write-Host "Password: $TestPassword" -ForegroundColor White
if ($RegisteredUserId) {
    Write-Host "User ID: $RegisteredUserId" -ForegroundColor White
}
Write-Host "------------------------------------------------`n" -ForegroundColor Cyan
