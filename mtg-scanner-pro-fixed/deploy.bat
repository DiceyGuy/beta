@echo off
REM MTG Scanner Pro - Windows Deployment Script

echo.
echo  MTG Scanner Pro - Deployment Script
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
echo.

REM Check for .env file
if not exist .env (
    echo [WARNING] No .env file found. Creating from .env.example...
    copy .env.example .env
    echo.
    echo Please edit .env with your API keys before deploying!
    echo.
    pause
)

REM Railway check
echo.
echo Checking Railway CLI...
where railway >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Railway CLI is installed
    echo.
    set /p deploy_railway="Deploy to Railway? (y/n): "
    if /i "%deploy_railway%"=="y" (
        echo Deploying to Railway...
        call railway up
    )
) else (
    echo [WARNING] Railway CLI not installed.
    echo Install with: npm install -g @railway/cli
)

REM Git setup
echo.
echo Setting up Git...
if not exist .git (
    git init
    git add .
    git commit -m "Initial commit: MTG Scanner Pro v1.3"
    echo [OK] Git repository initialized
) else (
    echo [OK] Git repository already exists
)

REM Local test
echo.
set /p start_local="Start local server for testing? (y/n): "
if /i "%start_local%"=="y" (
    echo.
    echo Starting local server on http://localhost:3000
    echo Press Ctrl+C to stop the server
    echo.
    call npm start
)

echo.
echo [OK] Setup complete!
echo.
echo Next steps:
echo 1. Update .env with your Stripe and other API keys
echo 2. Set up Stripe products and webhooks
echo 3. Deploy to Railway or your preferred host
echo 4. Configure custom domain
echo.
echo Happy scanning! 
echo.
pause
