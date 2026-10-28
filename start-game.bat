@echo off
REM Chay game qua may chu cuc bo de nap duoc anh AI trong thu muc assets\
cd /d "%~dp0"
start "" "http://127.0.0.1:8137/h_n_i_12_ng_y_m_18_12_29_12_1972.html"
python -m http.server 8137 --bind 127.0.0.1
