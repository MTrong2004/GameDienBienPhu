@echo off
REM Chay game qua may chu cuc bo de nap duoc anh AI trong thu muc assets\
cd /d "%~dp0"
start "" "http://127.0.0.1:8137/index.html"
python -m http.server 8137 --bind 127.0.0.1
