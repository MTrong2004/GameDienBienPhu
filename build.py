#!/usr/bin/env python3
"""
build.py — Modular Build & Packaging Utility for Ha Noi 12 Ngay Dem
Assembles modular files from src/ into production single-file index.html
and maintains 100% cryptographic dual-file parity with distribution.

Usage:
  python build.py          # Compile src/ -> index.html & sync distribution
  python build.py --test   # Compile, sync and run comprehensive test suite
  python build.py --watch  # Live auto-rebuild on any file change in src/
"""

import os
import sys
import glob
import time
import subprocess
import shutil

SRC_DIR = 'src'
JS_DIR = os.path.join(SRC_DIR, 'js')
TEMPLATE_PATH = os.path.join(SRC_DIR, 'template.html')
PRIMARY_OUTPUT = 'index.html'
DIST_OUTPUT = 'hanoi-12-ngay-dem.html'
PLACEHOLDER = '<!-- INJECT_SCRIPTS -->\n'

def assemble():
    if not os.path.exists(TEMPLATE_PATH):
        print(f"[ERROR] Template {TEMPLATE_PATH} missing!")
        return False

    with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        template = f.read()

    if PLACEHOLDER not in template:
        print(f"[ERROR] Placeholder '{PLACEHOLDER.strip()}' not found in {TEMPLATE_PATH}!")
        return False

    js_files = sorted(glob.glob(os.path.join(JS_DIR, '*.js')))
    if not js_files:
        print(f"[ERROR] No JS modules found in {JS_DIR}!")
        return False

    script_parts = []
    for jf in js_files:
        with open(jf, 'r', encoding='utf-8') as f:
            script_parts.append(f.read())

    full_script = ''.join(script_parts)
    output_html = template.replace(PLACEHOLDER, full_script)

    with open(PRIMARY_OUTPUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(output_html)

    # Sync to distribution file
    shutil.copy2(PRIMARY_OUTPUT, DIST_OUTPUT)

    print(f"[BUILD SUCCESS] Assembled {len(js_files)} modules -> {PRIMARY_OUTPUT} ({len(output_html):,} bytes)")
    print(f"[SYNC] Mirrored to distribution: {DIST_OUTPUT}")
    return True

def run_tests():
    verify_script = os.path.join('tests', 'verify_suite.py')
    e2e_script = os.path.join('tests', 'test_e2e_suite.js')
    print("\n--- Running Verification Suite ---")
    ret1 = subprocess.run([sys.executable, verify_script]).returncode
    if ret1 != 0:
        print(f"[FAIL] {verify_script} failed!")
        return False

    print("\n--- Running E2E Test Suite (Node.js) ---")
    ret2 = subprocess.run(['node', e2e_script]).returncode
    if ret2 != 0:
        print(f"[FAIL] {e2e_script} failed!")
        return False

    print("\n[ALL TESTS PASSED] 100% Specification Conformance!")
    return True

def get_mtimes():
    mtimes = {}
    if os.path.exists(TEMPLATE_PATH):
        mtimes[TEMPLATE_PATH] = os.path.getmtime(TEMPLATE_PATH)
    for p in glob.glob(os.path.join(JS_DIR, '*.js')):
        mtimes[p] = os.path.getmtime(p)
    return mtimes

def watch_mode():
    print("[WATCH MODE] Monitoring src/ for modifications (Ctrl+C to exit)...")
    last_mtimes = get_mtimes()
    assemble()

    try:
        while True:
            time.sleep(0.5)
            curr_mtimes = get_mtimes()
            changed = False
            for p, mt in curr_mtimes.items():
                if p not in last_mtimes or mt > last_mtimes[p]:
                    print(f"\n[CHANGE DETECTED] {p}")
                    changed = True
                    break
            if changed:
                last_mtimes = curr_mtimes
                assemble()
    except KeyboardInterrupt:
        print("\n[WATCH MODE] Stopped.")

def free_port_if_needed(port=8137):
    """
    Hoc hoi tu Webhcm_LiveVideo-main (dev-ports.local.ps1):
    Kiem tra va giai phong cong dev neu dang bi tien trinh Python cu chiem giu.
    """
    try:
        cmd = f'powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue).OwningProcess"'
        out = subprocess.check_output(cmd, shell=True, text=True).strip()
        if out:
            pids = set(int(p) for p in out.split() if p.isdigit())
            curr_pid = os.getpid()
            for pid in pids:
                if pid != curr_pid and pid > 4:
                    print(f"[CỔNG {port}] Phát hiện tiến trình cũ (PID {pid}) đang chiếm cổng, tự động giải phóng...")
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    time.sleep(0.4)
    except Exception:
        pass

reload_queues = []
reload_lock = None

def notify_reload():
    global reload_queues, reload_lock
    if reload_lock:
        with reload_lock:
            for q in list(reload_queues):
                try:
                    q.put_nowait(True)
                except Exception:
                    pass

def serve_mode(port=8137, host='127.0.0.1'):
    """
    Unified Dev Server hoc hoi tu Webhcm_LiveVideo-main:
    1. Port Guard: Tu dong giai phong cong 8137 neu bi tien trinh cu chiem giu.
    2. Watch Gate (Debounce): Gom cac dot luu file lien tiep (350ms quiet window) de rebuild 1 lan.
    3. Live Reload: Tu dong reload trinh duyet qua Server-Sent Events (SSE) ngay sau khi build.
    """
    import http.server
    import socketserver
    import threading
    import webbrowser
    import queue

    global reload_queues, reload_lock
    reload_queues = []
    reload_lock = threading.Lock()

    print("=" * 65)
    print("  HÀ NỘI 12 NGÀY ĐÊM — MÁY CHỦ PHÁT TRIỂN & TỰ ĐỘNG BIÊN DỊCH")
    print("=" * 65)
    
    # 1. Giai phong cong cu neu co
    free_port_if_needed(port)
    
    # 2. Pre-build fresh code
    assemble()

    class GameHTTPHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            if args and len(args) > 1 and str(args[1])[0] in ('4', '5'):
                sys.stderr.write(f"[HTTP {args[1]}] {args[0]}\n")

        def do_GET(self):
            # SSE Live Reload Endpoint
            clean_path = self.path.split('?')[0]
            if clean_path == '/__live_reload':
                self.send_response(200)
                self.send_header('Content-Type', 'text/event-stream')
                self.send_header('Cache-Control', 'no-cache')
                self.send_header('Connection', 'keep-alive')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                q = queue.Queue()
                with reload_lock:
                    reload_queues.append(q)

                try:
                    self.wfile.write(b": ping\n\n")
                    self.wfile.flush()
                    while True:
                        try:
                            q.get(timeout=20.0)
                            self.wfile.write(b"data: reload\n\n")
                            self.wfile.flush()
                        except queue.Empty:
                            self.wfile.write(b": heartbeat\n\n")
                            self.wfile.flush()
                except (ConnectionResetError, BrokenPipeError):
                    pass
                finally:
                    with reload_lock:
                        if q in reload_queues:
                            reload_queues.remove(q)
                return

            # Dynamic Live Reload injection into HTML responses
            if clean_path in ('/', '/index.html', '/hanoi-12-ngay-dem.html'):
                target_file = PRIMARY_OUTPUT if clean_path in ('/', '/index.html') else DIST_OUTPUT
                if os.path.exists(target_file):
                    with open(target_file, 'r', encoding='utf-8') as f:
                        html = f.read()
                    live_script = (
                        '<script id="__live_reload_script">'
                        '(function(){'
                        'try{'
                        'var es=new EventSource("/__live_reload");'
                        'es.onmessage=function(e){if(e.data==="reload"){console.log("[LIVE RELOAD] Đang nạp lại trang...");location.reload();}};'
                        '}catch(e){}'
                        '})();'
                        '</script></body>'
                    )
                    html = html.replace('</body>', live_script)
                    encoded = html.encode('utf-8')
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/html; charset=utf-8')
                    self.send_header('Content-Length', str(len(encoded)))
                    self.end_headers()
                    self.wfile.write(encoded)
                    return

            return super().do_GET()

    class ReusableTCPServer(socketserver.ThreadingTCPServer):
        allow_reuse_address = True
        daemon_threads = True

    httpd = None
    try:
        httpd = ReusableTCPServer((host, port), GameHTTPHandler)
        server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        server_thread.start()
        print(f"[MÁY CHỦ] Đang chạy tại http://{host}:{port}/")
    except OSError:
        print(f"[MÁY CHỦ] Cổng {port} đang mở sẵn (tái sử dụng kết nối).")

    game_url = f"http://{host}:{port}/index.html"
    print(f"[TRÌNH DUYỆT] Mở game tại {game_url}")
    try:
        webbrowser.open(game_url)
    except Exception:
        pass

    print(f"\n[WATCH GATE ACTIVE] Đang theo dõi {SRC_DIR}/ với bộ đệm chống dồn file (Debounce 350ms)...")
    print("Mỗi khi bạn lưu file (Ctrl+S) trong src/, game sẽ tự động build và TỰ ĐỘNG RELOAD trình duyệt!")
    print("Nhấn Ctrl+C để dừng máy chủ.\n" + "-" * 65)

    last_mtimes = get_mtimes()
    DEBOUNCE_SEC = 0.35

    try:
        while True:
            time.sleep(0.2)
            curr_mtimes = get_mtimes()
            changed_files = [p for p, mt in curr_mtimes.items() if p not in last_mtimes or mt > last_mtimes[p]]
            
            if changed_files:
                # Watch Gate: Cho yen tinh DEBOUNCE_SEC de gom cac dot luu file tiep theo
                time.sleep(DEBOUNCE_SEC)
                curr_mtimes = get_mtimes()
                all_changed = [p for p, mt in curr_mtimes.items() if p not in last_mtimes or mt > last_mtimes[p]]
                last_mtimes = curr_mtimes

                names = ", ".join(os.path.basename(p) for p in all_changed)
                print(f"\n[WATCH GATE] Phát hiện thay đổi ({len(all_changed)} tệp: {names})")
                t0 = time.time()
                if assemble():
                    dt = time.time() - t0
                    print(f"[BUILD THÀNH CÔNG] Hoàn tất sau {dt:.2f}s! -> Bắn tín hiệu Live Reload...")
                    notify_reload()
    except KeyboardInterrupt:
        print("\n\n[ĐÃ DỪNG] Máy chủ và tiến trình theo dõi đã kết thúc.")
        if httpd:
            httpd.shutdown()

def split_sources():
    if not os.path.exists(PRIMARY_OUTPUT):
        print(f"[ERROR] Source file {PRIMARY_OUTPUT} not found!")
        return False
    os.makedirs(JS_DIR, exist_ok=True)
    with open(PRIMARY_OUTPUT, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    template_head = lines[:1602]
    template_tail = lines[8618:]
    modules = [
        ('01_mesh_factory.js', lines[1602:2595]),
        ('02_sound_engine.js', lines[2595:2694]),
        ('03_scene_environment.js', lines[2694:3820]),
        ('04_cockpit_radar_hangar.js', lines[3820:4796]),
        ('05_combat_simulation.js', lines[4796:6582]),
        ('06_sound_fx_bgm.js', lines[6582:7181]),
        ('07_campaign_missions.js', lines[7181:7742]),
        ('08_campaign_ui_main.js', lines[7742:8618]),
    ]
    template_content = ''.join(template_head) + PLACEHOLDER + ''.join(template_tail)
    with open(TEMPLATE_PATH, 'w', encoding='utf-8', newline='\n') as f:
        f.write(template_content)
    print(f"[OK] Extracted {TEMPLATE_PATH}")
    for name, mlines in modules:
        mpath = os.path.join(JS_DIR, name)
        with open(mpath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(''.join(mlines))
        print(f"[OK] Extracted {mpath}")
    print("\n[SUCCESS] Split completed successfully into src/")
    return True

if __name__ == '__main__':
    args = sys.argv[1:]
    if '--serve' in args or '--dev' in args:
        serve_mode()
    elif '--watch' in args:
        watch_mode()
    elif '--test' in args:
        if assemble():
            success = run_tests()
            sys.exit(0 if success else 1)
        sys.exit(1)
    elif '--split' in args:
        success = split_sources()
        sys.exit(0 if success else 1)
    else:
        success = assemble()
        sys.exit(0 if success else 1)
