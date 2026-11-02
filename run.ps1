# Automata Simulation 1-Click PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       LAUNCHING AUTOMATA SIMULATION STUDIO" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Start C++ Backend
Write-Host "[1/3] Starting C++ Backend Server (Port 18080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend\build'; .\automata_api_server.exe"

# 2. Start Frontend
Write-Host "[2/3] Starting Frontend Vite Server (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

# 3. Open browser
Write-Host "[3/3] Opening browser at http://localhost:5173 ..." -ForegroundColor Green
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host "`nAll services launched successfully!" -ForegroundColor Green
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host "- Backend:  http://localhost:18080" -ForegroundColor Gray
