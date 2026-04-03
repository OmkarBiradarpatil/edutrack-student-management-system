@echo off
title EduTrack - Student Management System
echo.
echo   ========================================
echo     EduTrack Student Management System
echo   ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo   Installing dependencies...
    echo.
    call npm install
    echo.
)

echo   Starting server...
echo   Open http://localhost:3000 in your browser
echo.
node server/app.js
pause
