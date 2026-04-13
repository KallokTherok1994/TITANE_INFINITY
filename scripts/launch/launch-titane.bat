@echo off
:: ================================================================
::  TITANE∞ v30 — Windows Launcher
::  Usage: launch-titane.bat [dev|build|check|clean]
:: ================================================================

setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0..\..\"
set "MODE=%~1"
if "%MODE%"=="" set "MODE=dev"

echo.
echo  ===================================================
echo   TITANE^∞  Windows Launcher  ^|  Mode: %MODE%
echo  ===================================================
echo.

:: ── Node ────────────────────────────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js introuvable. Installez Node 24 via nvm-windows.
    echo         https://github.com/coreybutler/nvm-windows
    goto :fail
)
for /f "tokens=*" %%V in ('node --version 2^>nul') do set "NODE_VER=%%V"
echo [OK] Node    %NODE_VER%

:: ── pnpm ────────────────────────────────────────────────────────
where pnpm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pnpm introuvable. Executez : corepack enable
    goto :fail
)
for /f "tokens=*" %%V in ('pnpm --version 2^>nul') do set "PNPM_VER=%%V"
echo [OK] pnpm    %PNPM_VER%

:: ── Rust / Cargo ────────────────────────────────────────────────
where cargo >nul 2>&1
if errorlevel 1 (
    echo [WARN] Cargo introuvable. Build Tauri impossible.
    echo        Installez Rust via https://rustup.rs
) else (
    for /f "tokens=3" %%V in ('cargo --version 2^>nul') do set "CARGO_VER=%%V"
    echo [OK] Cargo   %CARGO_VER%
)

:: ── .env ────────────────────────────────────────────────────────
if not exist "%ROOT%.env" (
    echo [WARN] Fichier .env absent. Copie de .env.example vers .env
    copy /Y "%ROOT%.env.example" "%ROOT%.env" >nul 2>&1
    echo        Editez .env et renseignez vos cles d'API avant de continuer.
)

:: ── node_modules ────────────────────────────────────────────────
if not exist "%ROOT%node_modules" (
    echo [INFO] node_modules absent — installation en cours...
    pushd "%ROOT%"
    call pnpm install
    if errorlevel 1 ( echo [ERROR] pnpm install a echoue ^(exit non nul^). & goto :fail )
    popd
)

:: ── Route selon le mode ─────────────────────────────────────────
if /i "%MODE%"=="dev"    goto :mode_dev
if /i "%MODE%"=="build"  goto :mode_build
if /i "%MODE%"=="check"  goto :mode_check
if /i "%MODE%"=="clean"  goto :mode_clean
echo [ERROR] Mode inconnu : %MODE%. Valeurs acceptees : dev, build, check, clean
goto :fail

:: ────────────────────────────────────────────────────────────────
:mode_dev
echo.
echo  >> Demarrage en mode developpement (Tauri + Vite HMR)
echo.
pushd "%ROOT%"
call pnpm run gen:tauri-config 2>nul
call pnpm run dev:tauri
popd
goto :end

:: ────────────────────────────────────────────────────────────────
:mode_build
echo.
echo  >> Build production Windows
echo.
pushd "%ROOT%"
call pnpm run bump:version
call pnpm run sync:versions
call pnpm run build:production
popd
echo.
echo  Artefacts dans : src-tauri\target\release\bundle\
goto :end

:: ────────────────────────────────────────────────────────────────
:mode_check
echo.
echo  >> Verification TypeScript + Lint + Tests
echo.
pushd "%ROOT%"
call pnpm run check
call pnpm run lint
call pnpm run test:all
popd
goto :end

:: ────────────────────────────────────────────────────────────────
:mode_clean
echo.
echo  >> Nettoyage des artefacts
echo.
pushd "%ROOT%"
call pnpm run clean:all
popd
echo  [OK] Nettoyage termine.
goto :end

:: ────────────────────────────────────────────────────────────────
:fail
echo.
echo  [FAIL] Le lancement a echoue. Consultez docs\windows\SPINUP_WINDOWS.md
echo.
endlocal
exit /b 1

:end
echo.
echo  [DONE]
endlocal
exit /b 0
