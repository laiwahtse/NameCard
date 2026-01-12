@echo off
setlocal

rem Simple launcher to run the NameCard backend without npm/PowerShell policy issues.
rem 1) Ensures Node is on PATH for this session
rem 2) Starts server: node src/server.js

set "NODE_DIR=C:\Program Files\nodejs"
if exist "%NODE_DIR%\node.exe" goto use_node_dir

rem Fallback to per-user installation
set "NODE_DIR=%LOCALAPPDATA%\Programs\nodejs"
if not exist "%NODE_DIR%\node.exe" (
  echo Could not find node.exe in ^"C:\Program Files\nodejs^" or ^"%LOCALAPPDATA%\Programs\nodejs^".
  echo Please install Node.js LTS from https://nodejs.org/ and try again.
  exit /b 1
)

:use_node_dir
set "PATH=%NODE_DIR%;%PATH%"

rem Move to this script directory (backend)
cd /d "%~dp0"

rem Minimized mode (optional): pass "min" to run in a separate minimized window and return immediately
if /I "%~1"=="min" (
  echo Using Node from: "%NODE_DIR%\node.exe"
  echo Starting NameCard backend in minimized window...
  start /min "NameCard Backend" "%NODE_DIR%\node.exe" src\server.js
  goto :eof
)

rem Start server (normal mode)
echo Using Node from: "%NODE_DIR%\node.exe"
echo Starting NameCard backend...
"%NODE_DIR%\node.exe" src\server.js
if errorlevel 1 (
  echo.
  echo Server exited with an error (errorlevel %errorlevel%).
  echo Press any key to close this window.
  pause >nul
)

endlocal
