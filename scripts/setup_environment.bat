@echo off
echo ==========================================
echo Setting up RyzenShield Environment...
echo ==========================================

echo [1/3] Installing Python Backend Dependencies...
cd python_core
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    exit /b %errorlevel%
)
cd ..

echo [2/3] Installing Node.js Frontend Dependencies...
cd electron-app
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Node dependencies.
    pause
    exit /b %errorlevel%
)
cd ..

echo [3/3] Setup Complete!
echo You can now run the app checks.
pause
