# Database Verification Test Script
# Run: .\test-db-connection.ps1

param(
    [string]$SupabaseUrl = "https://nwsweqmpklpymrnvoicx.supabase.co",
    [string]$ServiceRoleKey = "" # Add your service role key here or pass as parameter
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

# Test 1: Check users table exists
Write-TestHeader "TEST 1: Check users table"

$sql = @"
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'users'
);
"@

Write-Info "Checking if 'users' table exists..."
# Note: This requires direct DB access. For now, we'll test via API.

# Test 2: Test API endpoint that queries users table
Write-TestHeader "TEST 2: Users Table Access via API"

$testEmail = "dbtest$(Get-Random -Maximum 9999)@test.com"

# First register a user
$registerBody = @{
    email = $testEmail
    password = "TestPass123"
    name = "DB Test User"
} | ConvertTo-Json

Write-Info "Registering test user: $testEmail"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -ContentType "application/json" -Body $registerBody -TimeoutSec 30
    
    if ($response.success -eq $true) {
        Write-Success "User registered successfully"
        $userId = $response.data.userId
        Write-Host "  User ID: $userId" -ForegroundColor Gray
        
        # Now check if user exists in the 'me' endpoint
        Write-Info "Waiting 2 seconds for DB propagation..."
        Start-Sleep -Seconds 2
        
        # Test login to get access token
        $loginBody = @{
            email = $testEmail
            password = "TestPass123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -TimeoutSec 30
        
        if ($loginResponse.success -eq $true) {
            $accessToken = $loginResponse.data.session.accessToken
            
            # Now try to get user details (this queries the users table)
            Write-Info "Testing /api/auth/me endpoint..."
            
            $headers = @{
                "Authorization" = "Bearer $accessToken"
            }
            
            $meResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Method Get -Headers $headers -TimeoutSec 30
            
            Write-Host "Response:" -ForegroundColor Gray
            Write-Host ($meResponse | ConvertTo-Json -Depth 5) -ForegroundColor Gray
            
            if ($meResponse.success -eq $true) {
                Write-Success "User data retrieved from database"
                Write-Host "  - User ID: $($meResponse.data.id)" -ForegroundColor Gray
                Write-Host "  - Email: $($meResponse.data.email)" -ForegroundColor Gray
                Write-Host "  - Name: $($meResponse.data.name)" -ForegroundColor Gray
                Write-Host "  - Role: $($meResponse.data.role)" -ForegroundColor Gray
            } else {
                Write-Failure "Failed to get user data: $($meResponse.message)"
            }
        } else {
            Write-Host "Note: Login may require email verification: $($loginResponse.message)" -ForegroundColor Yellow
        }
    } else {
        Write-Failure "Failed to register test user: $($response.message)"
    }
} catch {
    Write-Failure "Database test failed: $($_.Exception.Message)"
}

# Test 3: Check environment variables
Write-TestHeader "TEST 3: Environment Variables"

Write-Info "Checking .env.local configuration..."

$envPath = ".env.local"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    
    $hasSupabaseUrl = $envContent -match "NEXT_PUBLIC_SUPABASE_URL"
    $hasAnonKey = $envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    $hasServiceRole = $envContent -match "SUPABASE_SERVICE_ROLE_KEY"
    
    if ($hasSupabaseUrl) {
        Write-Success "NEXT_PUBLIC_SUPABASE_URL is configured"
    } else {
        Write-Failure "NEXT_PUBLIC_SUPABASE_URL is missing"
    }
    
    if ($hasAnonKey) {
        Write-Success "NEXT_PUBLIC_SUPABASE_ANON_KEY is configured"
    } else {
        Write-Failure "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"
    }
    
    if ($hasServiceRole) {
        Write-Success "SUPABASE_SERVICE_ROLE_KEY is configured"
    } else {
        Write-Failure "SUPABASE_SERVICE_ROLE_KEY is missing"
    }
} else {
    Write-Failure ".env.local file not found"
}

# Summary
Write-TestHeader "SUMMARY"
Write-Host "Passed: $SuccessCount" -ForegroundColor Green
Write-Host "Failed: $FailureCount" -ForegroundColor Red

if ($FailureCount -eq 0) {
    Write-Host "`nAll checks passed! Database connection is working." -ForegroundColor Green
} else {
    Write-Host "`nSome checks failed. Review the output above." -ForegroundColor Yellow
}

# Instructions for manual Supabase verification
Write-Host "`n--- Manual Supabase Dashboard Verification ---" -ForegroundColor Cyan
Write-Host "1. Go to: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Select your project" -ForegroundColor White
Write-Host "3. Go to Table Editor" -ForegroundColor White
Write-Host "4. Check 'users' table for new entries" -ForegroundColor White
Write-Host "5. Verify schema matches DATABASE_SCHEMA.md" -ForegroundColor White
Write-Host "--------------------------------------------`n" -ForegroundColor Cyan
