import os
import re
import asyncio
import edge_tts

OUTPUT_DIR = os.path.join('assets', 'audio')
os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(os.path.join('src', 'js', '07_campaign_missions.js'), 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern matching id and story in missions
pattern = r'id:\s*[\'"](m\d+)[\'"][^}]*?story:\s*[\'"]([^\'"]+)[\'"]'
matches = re.findall(pattern, content)

def clean_for_tts(text):
    t = text.replace('B-52', 'B 52').replace('MiG-21', 'Mích 21')
    t = t.replace('SAM-2', 'Sam 2').replace('V-750', 'Vê 750').replace('K-13', 'Ca 13')
    t = t.replace('F-4', 'Ép 4').replace('F-111', 'Ép 111')
    t = t.replace('Pa-ri', 'Pa ri').replace('Ních-xơn', 'Ních xơn')
    t = t.replace('—', ', ').replace('–', ', ')
    return t

async def generate():
    print(f"Generating voice narration for {len(matches)} missions using vi-VN-HoaiMyNeural...")
    for m_id, story in matches:
        out_file = os.path.join(OUTPUT_DIR, f"story_{m_id}.mp3")
        cleaned_text = clean_for_tts(story)
        print(f"Synthesizing {m_id} -> {out_file}...")
        comm = edge_tts.Communicate(cleaned_text, voice="vi-VN-HoaiMyNeural", rate="-2%", pitch="+0Hz")
        await comm.save(out_file)
        size = os.path.getsize(out_file)
        print(f"  [OK] {m_id}: {size:,} bytes")

    # Command cues using male military voice NamMinh
    cues = {
        'cue_sam2': 'Tiểu đoàn vào cấp một! Tiêu diệt B 52 bảo vệ Hà Nội!',
        'cue_mig21_5121': 'Tiêm kích 5121 bật tăng lực xuất kích, tiếp cận mục tiêu!',
        'cue_mig21_046': 'Tiêm kích 046 bật tăng lực xuất kích, tiếp cận mục tiêu!'
    }
    for cue_id, text in cues.items():
        out_file = os.path.join(OUTPUT_DIR, f"{cue_id}.mp3")
        comm = edge_tts.Communicate(text, voice="vi-VN-NamMinhNeural", rate="+6%", pitch="-2Hz")
        await comm.save(out_file)
        print(f"  [OK] {cue_id}: {os.path.getsize(out_file):,} bytes")

    print("All voice files generated successfully!")

if __name__ == '__main__':
    asyncio.run(generate())
