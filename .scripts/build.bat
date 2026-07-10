@echo off
setlocal

cd /d "%~dp0.."
set "KEYFILE=%CD%\signing\roster.key"

if not exist "%KEYFILE%" (
  echo Signing key not found: %KEYFILE%
  exit /b 1
)

for /f "usebackq delims=" %%K in ("%KEYFILE%") do set "TAURI_SIGNING_PRIVATE_KEY=%%K"

echo Building signed NSIS installer...
call npm run tauri build
if errorlevel 1 exit /b 1

for /f "delims=" %%f in ('dir /b /s "src-tauri\target\release\bundle\nsis\*-setup.exe" 2^>nul') do set "INSTALLER=%%f"
if defined INSTALLER (
  echo.
  echo Installer: %INSTALLER%
  if exist "%INSTALLER%.sig" echo Signature: %INSTALLER%.sig
) else (
  echo.
  echo Build finished but no NSIS setup.exe was found under src-tauri\target\release\bundle\nsis
)

endlocal
