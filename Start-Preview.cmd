@echo off
cd /d "%~dp0"
echo Local draft: http://127.0.0.1:5173/
echo If the preview is already running, open that address in your browser.
call npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
pause
