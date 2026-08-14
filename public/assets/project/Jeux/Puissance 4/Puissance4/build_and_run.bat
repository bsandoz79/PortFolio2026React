@echo off
title Puissance 4 - Build & Run
color 0A

echo.
echo  ========================================
echo   PUISSANCE 4 - Build et Lancement
echo  ========================================
echo.

where dotnet >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERREUR] .NET SDK non trouve.
    echo  Telechargez-le sur : https://dotnet.microsoft.com/download
    echo.
    pause
    exit /b 1
)

echo  Compilation en cours...
dotnet build Puissance4.csproj -c Release --nologo -v quiet

if %errorlevel% neq 0 (
    echo.
    echo  [ERREUR] La compilation a echoue.
    pause
    exit /b 1
)

echo  Lancement du jeu...
echo.
dotnet run --project Puissance4.csproj -c Release --no-build

pause
