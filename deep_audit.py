import os
import re
import sys
import datetime

sys.stdout.reconfigure(encoding='utf-8')

with open('src/js/07_campaign_missions.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

with open('generate_voices.py', 'r', encoding='utf-8') as f:
    gv_content = f.read()

import generate_voices

print("=====================================================================")
print("  CHI TIẾT ĐỐI CHIẾU VĂN BẢN VÀ ÂM THANH DẪN CHUYỆN (12 MÀN CHƠI)    ")
print("=====================================================================")

# Extract missions from JS
pattern = r'id:\s*["\'](m\d+)["\'][\s\S]*?(?=\bid:\s*["\']m\d+["\']|\Z)'
missions = {}
for m in re.finditer(pattern, js_content):
    mid = m.group(1)
    block = m.group(0)
    
    title_m = re.search(r'title:\s*["\']([^"\']+)["\']', block)
    title = title_m.group(1) if title_m else ""
    
    story_m = re.search(r'story:\s*["\']([^"\']+)["\']', block)
    story = story_m.group(1) if story_m else ""
    
    hist_m = re.search(r'history:\s*(\[[^\]]+\]|["\'][^"\']+["\'])', block)
    raw_h = hist_m.group(1) if hist_m else ""
    if raw_h.startswith('['):
        lines = re.findall(r'["\']([^"\']+)["\']', raw_h)
        history = " ".join(lines)
    else:
        history = raw_h.strip('"\'')
        
    missions[mid] = {
        'title': title,
        'story': story,
        'history': history
    }

audio_dir = os.path.join('assets', 'audio')

# Let's check regex matching in generate_voices
gv_matches = dict(generate_voices.matches)

discrepancies = []

for mid in [f"m{i}" for i in range(1, 13)]:
    data = missions.get(mid, {})
    js_story = data.get('story', '')
    js_hist = data.get('history', '')
    title = data.get('title', '')
    
    gv_story = gv_matches.get(mid, "")
    gv_hist = generate_voices.missions_history.get(mid, "")
    
    # Audio files
    story_file = os.path.join(audio_dir, f"story_{mid}.mp3")
    hist_file = os.path.join(audio_dir, f"history_{mid}.mp3")
    
    story_stat = os.stat(story_file) if os.path.exists(story_file) else None
    hist_stat = os.stat(hist_file) if os.path.exists(hist_file) else None
    
    story_time = datetime.datetime.fromtimestamp(story_stat.st_mtime) if story_stat else None
    hist_time = datetime.datetime.fromtimestamp(hist_stat.st_mtime) if hist_stat else None
    
    print(f"\n>>> [{mid}] {title}")
    
    # 1. Story comparison
    story_match = (js_story == gv_story)
    print(f"  [STORY]: Khớp regex giữa JS và generate_voices: {story_match}")
    if not story_match:
        print(f"    JS : {js_story}")
        print(f"    GV : {gv_story}")
        discrepancies.append((mid, 'story_regex_mismatch', js_story, gv_story))
    else:
        print(f"    Nội dung: \"{js_story[:90]}...\"")
        
    print(f"    File story_{mid}.mp3: size={story_stat.st_size if story_stat else 0:,} B | mtime={story_time.strftime('%H:%M:%S %d/%m') if story_time else 'MISSING'}")
    
    # 2. History comparison
    print(f"  [HISTORY / CHIẾN SỬ]:")
    print(f"    Văn bản trong JS: \"{js_hist[:100]}...\"")
    print(f"    Văn bản trong generate_voices: \"{gv_hist[:100]}...\"")
    print(f"    File history_{mid}.mp3: size={hist_stat.st_size if hist_stat else 0:,} B | mtime={hist_time.strftime('%H:%M:%S %d/%m') if hist_time else 'MISSING'}")

print("\n" + "="*69)
print(f"TỔNG KẾT BẤT ĐỒNG BỘ: {len(discrepancies)} điểm")
for d in discrepancies:
    print(f" - {d[0]}: {d[1]}")
