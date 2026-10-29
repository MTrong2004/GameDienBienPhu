import os
import re
import sys
import datetime

sys.stdout.reconfigure(encoding='utf-8')

# 1. Read src/js/07_campaign_missions.js
with open('src/js/07_campaign_missions.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# 2. Read generate_voices.py
import generate_voices

print("=====================================================================")
print("           HỆ THỐNG KIỂM TOÁN TÍNH ĐỒNG BỘ CỦA VOICE DẪN CHUYỆN      ")
print("=====================================================================")

# Check matches in generate_voices
matches = generate_voices.matches
print(f"[*] Số màn chơi tìm thấy trong 07_campaign_missions.js: {len(matches)}")

# Audit each mission
audio_dir = os.path.join('assets', 'audio')

for idx, (mid, story) in enumerate(matches, 1):
    print(f"\n---------------------------------------------------------------------")
    print(f"MÀN {idx} ({mid})")
    print(f"---------------------------------------------------------------------")
    
    # 1. Briefing Story Text
    cleaned_story = generate_voices.clean_for_tts(story)
    story_file = os.path.join(audio_dir, f"story_{mid}.mp3")
    story_exists = os.path.exists(story_file)
    story_size = os.path.getsize(story_file) if story_exists else 0
    story_mtime = datetime.datetime.fromtimestamp(os.path.getmtime(story_file)).strftime('%Y-%m-%d %H:%M:%S') if story_exists else "N/A"
    
    print(f"[STORY VĂN BẢN TRONG JS]:\n  \"{story}\"")
    print(f"[STORY TTS ĐÃ LÀM SẠCH]:\n  \"{cleaned_story}\"")
    print(f"[FILE STORY MP3]: {story_file} | Tồn tại: {story_exists} | Kích thước: {story_size:,} bytes | Thời gian: {story_mtime}")
    
    # 2. Debriefing History Text
    gv_hist = generate_voices.missions_history.get(mid, "")
    cleaned_hist = generate_voices.clean_for_tts(gv_hist)
    hist_file = os.path.join(audio_dir, f"history_{mid}.mp3")
    hist_exists = os.path.exists(hist_file)
    hist_size = os.path.getsize(hist_file) if hist_exists else 0
    hist_mtime = datetime.datetime.fromtimestamp(os.path.getmtime(hist_file)).strftime('%Y-%m-%d %H:%M:%S') if hist_exists else "N/A"
    
    # Find history in JS
    hist_pattern = rf'id:\s*["\']{mid}["\'][\s\S]*?history:\s*(\[[^\]]+\]|["\'][^"\']+["\'])'
    h_match = re.search(hist_pattern, js_content)
    js_hist_text = ""
    if h_match:
        raw_h = h_match.group(1)
        if raw_h.startswith('['):
            lines = re.findall(r'["\']([^"\']+)["\']', raw_h)
            js_hist_text = " ".join(lines)
        else:
            js_hist_text = raw_h.strip('"\'')
            
    print(f"\n[DEBRIEFING VĂN BẢN TRONG JS]:\n  \"{js_hist_text[:160]}...\"")
    print(f"[DEBRIEFING TRONG generate_voices.py]:\n  \"{gv_hist}\"")
    print(f"[DEBRIEFING TTS ĐÃ LÀM SẠCH]:\n  \"{cleaned_hist}\"")
    print(f"[FILE HISTORY MP3]: {hist_file} | Tồn tại: {hist_exists} | Kích thước: {hist_size:,} bytes | Thời gian: {hist_mtime}")
