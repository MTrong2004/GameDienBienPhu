import sys
import re
import subprocess
from html.parser import HTMLParser

sys.stdout.reconfigure(encoding='utf-8')

print("=== STARTING COMPREHENSIVE VERIFICATION SUITE ===")

with open('h_n_i_12_ng_y_m_18_12_29_12_1972.html', 'r', encoding='utf-8') as f:
    content = f.read()

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

print("=== VERIFICATION SUITE FINISHED ===")
