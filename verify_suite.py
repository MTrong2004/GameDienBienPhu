import sys
import re
import subprocess
from html.parser import HTMLParser

sys.stdout.reconfigure(encoding='utf-8')

print("=== STARTING COMPREHENSIVE VERIFICATION SUITE ===")

import os
import hashlib

FILE_PRIMARY = 'index.html'
FILE_DIST = 'h_n_i_12_ng_y_m_18_12_29_12_1972.html'

print("\n--- SECTION 0: Cryptographic Dual-File Synchronization Check ---")
if not os.path.exists(FILE_PRIMARY):
    print(f"✗ CRITICAL FAILURE: Primary file '{FILE_PRIMARY}' does not exist!")
    sys.exit(1)
if not os.path.exists(FILE_DIST):
    print(f"✗ CRITICAL FAILURE: Distribution file '{FILE_DIST}' does not exist!")
    print(f"  Run 'python sync_distribution.py' to generate and synchronize.")
    sys.exit(1)

with open(FILE_PRIMARY, 'rb') as f1, open(FILE_DIST, 'rb') as f2:
    bytes_primary = f1.read()
    bytes_dist = f2.read()

hash_primary = hashlib.sha256(bytes_primary).hexdigest()
hash_dist = hashlib.sha256(bytes_dist).hexdigest()

print(f"  {FILE_PRIMARY} ({len(bytes_primary):,} bytes): {hash_primary}")
print(f"  {FILE_DIST} ({len(bytes_dist):,} bytes): {hash_dist}")

if hash_primary != hash_dist:
    print(f"✗ INTEGRITY VIOLATION: Files are not bit-for-bit identical!")
    print(f"  Size difference: {abs(len(bytes_primary) - len(bytes_dist))} bytes.")
    print(f"  Action required: Run 'python sync_distribution.py' before running verification.")
    sys.exit(1)

print(f"✓ Dual-file cryptographic parity verified. SHA256: {hash_primary}\n")

content = bytes_primary.decode('utf-8').replace('\r\n', '\n')

# 1. HTML Syntax & DOM Structure Check
class TagCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.ids = set()
        self.errors = []
        self.scripts = []
        self.current_script = []
        self.in_script = False

    def handle_starttag(self, tag, attrs):
        self.tags.append(tag)
        for attr, val in attrs:
            if attr == 'id' and val:
                if val in self.ids:
                    self.errors.append(f"Duplicate ID found: {val}")
                self.ids.add(val)
        if tag == 'script':
            self.in_script = True
            self.current_script = []

    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False
            self.scripts.append("".join(self.current_script))
            self.current_script = []

    def handle_data(self, data):
        if self.in_script:
            self.current_script.append(data)

parser = TagCollector()
try:
    parser.feed(content)
    print("✓ HTML Parser passed without structural parse errors.")
except Exception as e:
    print(f"✗ HTML Parser error: {e}")

if parser.errors:
    print(f"✗ Duplicate IDs detected: {parser.errors}")
else:
    print(f"✓ No duplicate IDs found. Total unique IDs: {len(parser.ids)}")

# 2. Check essential IDs
required_ids = [
    'screen-menu',
    'screen-campaign',
    'screen-briefing',
    'screen-pause',
    'screen-debrief',
    'screen-victory',
    'modal-tactical-guide',
    'combat-alert-banner',
    'kill-splash',
    'timeline-track',
    'campaign-progress-badge',
    'menu-campaign-progress',
    'btn-continue-campaign',
    'menu-prog-text',
    'menu-prog-sub',
    'game-toolbar',
    'radio-box',
    'radio-who',
    'radio-text'
]

missing_ids = [rid for rid in required_ids if rid not in parser.ids]
if missing_ids:
    print(f"✗ Missing required IDs: {missing_ids}")
else:
    print(f"✓ All {len(required_ids)} required UI/Screen/Overlay IDs exist in the DOM.")

# Check all getElementById in scripts against DOM IDs
js_code = "\n".join(parser.scripts)
get_id_calls = re.findall(r"getElementById\(['\"]([a-zA-Z0-9_\-]+)['\"]\)", js_code)
unique_get_ids = set(get_id_calls)
missing_dynamic = [gid for gid in unique_get_ids if gid not in parser.ids]
print(f"✓ Total getElementById calls: {len(get_id_calls)}, unique IDs queried: {len(unique_get_ids)}")
if missing_dynamic:
    print(f"  Note: getElementById IDs not in static DOM: {missing_dynamic}")
else:
    print("✓ 100% of getElementById calls match static DOM elements.")

# 3. JavaScript Syntax Verification with Node.js
print("\n--- Verifying JavaScript Syntax with Node.js ---")
temp_js = 'temp_game_script.js'
with open(temp_js, 'w', encoding='utf-8') as f:
    f.write(js_code)

res = subprocess.run(['node', '--check', temp_js], capture_output=True, text=True, encoding='utf-8')
if res.returncode == 0:
    print("✓ Node.js syntax check passed! No syntax errors in extracted scripts.")
else:
    print("✗ Node.js syntax check failed:")
    print(res.stderr)

# 4. Check MISSIONS structure in JS
print("\n--- Verifying MISSIONS Array & Radio Chatter Structure ---")
c_start = js_code.find('const CONTROLS_SAM2 = [')
m_start = js_code.find('const MISSIONS = [', c_start)
m_end = js_code.find('];\n', m_start) + 3
missions_snippet = js_code[c_start:m_end]

node_eval_script = f"""
{missions_snippet}
console.log('✓ Successfully evaluated MISSIONS array. Total missions: ' + MISSIONS.length);
let totalRadio = 0;
MISSIONS.forEach((m, idx) => {{
    console.log(`  [Mission ${{idx+1}}] ID: ${{m.id}} | Mode: ${{m.mode}} | Title: ${{m.title}}`);
    console.log(`    Date: ${{m.dateLabel}} | Target Kills: ${{m.kills}} | Ammo: ${{m.ammo}} | TimeLimit: ${{m.timeLimit}}s`);
    const rCount = m.radio ? m.radio.length : 0;
    totalRadio += rCount;
    console.log(`    Radio transmissions: ${{rCount}}`);
    if (m.radio) {{
        m.radio.forEach(rc => {{
            if (typeof rc.at !== 'number' || !rc.who || !rc.text) {{
                console.error(`    ✗ Malformed radio item in mission ${{idx+1}}:`, rc);
            }}
        }});
        const lastAt = m.radio[m.radio.length - 1].at;
        console.log(`    Radio timeline span: ${{m.radio[0].at}}s -> ${{lastAt}}s (Time limit: ${{m.timeLimit}}s)`);
    }}
}});
console.log(`✓ Total radio transmissions across campaign: ${{totalRadio}}`);
"""

with open('test_missions.js', 'w', encoding='utf-8') as f:
    f.write(node_eval_script)

res_m = subprocess.run(['node', 'test_missions.js'], capture_output=True, text=True, encoding='utf-8')
print(res_m.stdout)
if res_m.stderr:
    print("Stderr:", res_m.stderr)

if res.returncode != 0:
    print("✗ Node.js syntax check failed!")
    sys.exit(1)

if res_m.returncode != 0:
    print("✗ MISSIONS evaluation failed!")
    sys.exit(1)

if parser.errors:
    print(f"✗ HTML Parser errors encountered: {len(parser.errors)}")
    sys.exit(1)

if missing_ids:
    print(f"✗ Verification failed due to missing required DOM IDs: {missing_ids}")
    sys.exit(1)

print("=== VERIFICATION SUITE FINISHED (ALL CHECKS PASSED) ===")
