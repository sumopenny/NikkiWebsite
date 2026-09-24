@echo off
setlocal
title NikkiWebsite - Local Preview
cd /d "%~dp0"

echo.
echo ============================================================
echo  NikkiWebsite - Local Preview
echo ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js was not found. Install Node.js LTS from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm was not found. Repair or reinstall Node.js LTS:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

if not exist "package.json" (
    echo [ERROR] package.json was not found beside this launcher.
    echo Keep Start-Website.bat in the NikkiWebsite project root.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
    echo First run: installing website dependencies. This may take a few minutes.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Dependency installation failed. Check your network and retry.
        echo.
        pause
        exit /b 1
    )
)

set "WEBSITE_PORT="
for /f %%P in ('powershell -NoProfile -Command "$ports = 5180..5190; foreach ($port in $ports) { $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port); try { $listener.Start(); $listener.Stop(); Write-Output $port; break } catch { } }"') do set "WEBSITE_PORT=%%P"
if not defined WEBSITE_PORT (
    echo [ERROR] No available local port was found between 5180 and 5190.
    echo Close another local service or check your Windows PowerShell installation.
    echo.
    pause
    exit /b 1
)

echo Starting the local website at http://localhost:%WEBSITE_PORT%
start "NikkiWebsite Dev Server" /D "%~dp0" cmd /k "npm run dev -- --port %WEBSITE_PORT%"
timeout /t 3 /nobreak >nul
start "" http://localhost:%WEBSITE_PORT%
echo If the browser did not open, visit http://localhost:%WEBSITE_PORT%
echo Keep the server window open while using the site.
timeout /t 3 /nobreak >nul
endlocal
