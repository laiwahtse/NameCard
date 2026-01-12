@echo off
setlocal

rem One-click npm launcher for NameCard backend.
rem 1) Ensures Node is on PATH for this session
rem 2) Runs: npm install && npm run dev

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

"%NODE_DIR%\npm.cmd" install
if errorlevel 1 goto end
"%NODE_DIR%\npm.cmd" run dev

:end
endlocal
