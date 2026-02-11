@echo off
echo [RyzenShield] Starting Prototype...

start "RyzenShield Backend" cmd /k "python -m python_core.api.server"
start "RyzenShield Proxy" cmd /k "mitmweb -s python_core/proxy/interceptor.py"
start "RyzenShield Dash" cmd /k "cd electron-app & npm run dev"

echo All systems go!
