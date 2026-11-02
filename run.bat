@echo off
title Automata Simulation Launcher
echo ========================================================
echo         LAUNCHING AUTOMATA SIMULATION STUDIO
echo ========================================================
echo.

:: 1. Start C++ Crow Backend API in background terminal
echo [1/3] Starting C++ Backend Server (Port 18080)...
start "Automata C++ API (Port 18080)" cmd /k "cd /d %~dp0backend\build && automata_api_server.exe"

:: 2. Start Vite Frontend Dev Server in background terminal
echo [2/3] Starting Frontend Vite Server (Port 5173)...
start "Automata Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

:: 3. Wait 2 seconds and open default web browser
echo [3/3] Opening browser at http://localhost:5173 ...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================================
echo  Both servers are running!
echo  - Frontend: http://localhost:5173
echo  - Backend:  http://localhost:18080/api/health
echo ========================================================
pause
