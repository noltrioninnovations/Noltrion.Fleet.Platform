@echo off
echo Starting Noltrion FleetX Platform...

:: Start Backend
start "FleetX Backend API" cmd /k "cd backend\Noltrion.FleetX.API && dotnet run"

:: Start Frontend
start "FleetX Frontend" cmd /k "cd frontend && npm run dev"

echo Services are starting...
echo Backend: https://localhost:7285/swagger
echo Frontend: http://localhost:5173
pause
