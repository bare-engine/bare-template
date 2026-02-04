@echo off
setlocal

echo Happy coding!

REM install deps
call npm install
if errorlevel 1 goto :eof

REM start dev server in a new window
start "" cmd /c "npm run dev:open"

REM create helper bat files
(
echo @echo off
echo npm run build
) > BUILD.bat

(
echo @echo off
echo npm run build-zip
) > BUILD-ZIP.bat

(
echo @echo off
echo npm run dev:open
) > DEBUG.bat

REM allow server to spawn, then delete this script
timeout /t 2 /nobreak >nul
del "%~f0"

endlocal
exit
