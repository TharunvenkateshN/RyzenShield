@echo off
:: Get the directory where the script is located and move up one level to the root
SET "ROOT_DIR=%~dp0.."
pushd "%ROOT_DIR%"

:: Cleanup old processes
echo [RyzenShield] Cleaning up previous sessions...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM electron.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo [RyzenShield] Starting Prototype from %CD%...

:: Start Backend
start "RyzenShield Backend" cmd /k "python -m python_core.api.server"

:: Start Proxy
start "RyzenShield Proxy" cmd /k "mitmweb -s python_core/proxy/interceptor.py"

:: Start Frontend Dashboard
start "RyzenShield Dash" cmd /k "cd electron-app && npm run dev"

echo All systems go!
popd
