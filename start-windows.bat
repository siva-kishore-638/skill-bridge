@echo off
setlocal
cd /d "%~dp0"

echo.
echo  PathPilot - local development launcher
echo ---------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed or is not available on PATH.
  echo Install Node.js 20 or newer, then reopen this window.
  pause
  exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing project dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Dependency installation failed. Check your internet connection and npm output above.
    pause
    exit /b 1
  )
)

echo.
echo Starting PathPilot. Keep this window open while using the app.
echo Open http://localhost:5173 in your browser.
echo Press Ctrl+C to stop the servers.
echo.
call npm.cmd run dev:all
set "EXIT_CODE=%ERRORLEVEL%"
if not "%EXIT_CODE%"=="0" (
  echo.
  echo PathPilot stopped with exit code %EXIT_CODE%.
  pause
)
exit /b %EXIT_CODE%
