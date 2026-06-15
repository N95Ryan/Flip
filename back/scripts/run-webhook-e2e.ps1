# Run webhook E2E tests (Windows PowerShell).
# Requires TEST_DATABASE_URL in back/.env (Neon branch test-e2e).
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$envFile = Join-Path $PWD ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
        $parts = $_ -split '=', 2
        if ($parts.Count -eq 2) {
            Set-Item -Path "Env:$($parts[0].Trim())" -Value $parts[1].Trim()
        }
    }
}

if (-not $env:TEST_DATABASE_URL) {
    Write-Error "TEST_DATABASE_URL is not set in back/.env"
}

if ($env:DATABASE_URL -and $env:TEST_DATABASE_URL -eq $env:DATABASE_URL) {
    Write-Error "TEST_DATABASE_URL must not equal DATABASE_URL (E2E tests TRUNCATE users)."
}

Write-Host "Running webhook E2E tests..."
go test -tags=integration ./test/e2e/ -v @args
