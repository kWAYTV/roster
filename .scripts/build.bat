@echo off
setlocal

cd /d "%~dp0.."
set "TAURI_SIGNING_PRIVATE_KEY_PATH=%CD%\signing\roster.key"

if not exist "%TAURI_SIGNING_PRIVATE_KEY_PATH%" (
  echo Signing key not found: %TAURI_SIGNING_PRIVATE_KEY_PATH%
  exit /b 1
)

echo Building signed NSIS installer...
call npm run tauri build
if errorlevel 1 exit /b 1

for /f "delims=" %%f in ('dir /b /s "src-tauri\target\release\bundle\nsis\*-setup.exe" 2^>nul') do set "INSTALLER=%%f"
if defined INSTALLER (
  echo.
  echo Installer: %INSTALLER%
) else (
  echo.
  echo Build finished but no NSIS setup.exe was found under src-tauri\target\release\bundle\nsis
)

endlocal
