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

    # Command cues using military voices
    cues = {
        'cue_sam2': ('Tiểu đoàn vào cấp một! Tiêu diệt B 52 bảo vệ Hà Nội!', 'vi-VN-NamMinhNeural'),
        'cue_mig21_5121': ('Tiêm kích 5121 bật tăng lực xuất kích, tiếp cận mục tiêu!', 'vi-VN-NamMinhNeural'),
        'cue_mig21_046': ('Tiêm kích 5046 bật tăng lực xuất kích, tiếp cận mục tiêu!', 'vi-VN-NamMinhNeural'),
        'cue_air_raid': ('Đồng bào chú ý! Đồng bào chú ý! Máy bay địch cách Hà Nội 50 kilômét. Nhân dân khẩn trương xuống hầm trú ẩn!', 'vi-VN-HoaiMyNeural'),
        'cue_kill': ('Mục tiêu bốc cháy! B 52 rơi tại chỗ!', 'vi-VN-NamMinhNeural'),
        'cue_win': ('Báo cáo Sở chỉ huy: Toàn tiểu đoàn hoàn thành xuất sắc nhiệm vụ!', 'vi-VN-NamMinhNeural'),
        'cue_lock': ('Đã bám chắc mục tiêu! Phóng đạn!', 'vi-VN-NamMinhNeural'),
        'cue_jam': ('Nhiễu nặng!', 'vi-VN-NamMinhNeural')
    }
    for cue_id, (text, voice) in cues.items():
        out_file = os.path.join(OUTPUT_DIR, f"{cue_id}.mp3")
        comm = edge_tts.Communicate(text, voice=voice, rate="+4%", pitch="-1Hz")
        await comm.save(out_file)
        print(f"  [OK] {cue_id}: {os.path.getsize(out_file):,} bytes")

    # History debrief summaries using HoaiMy
    missions_history = {
        'm1': 'Khoảng 20 giờ 13 phút đêm 18 tháng 12 năm 1972, Tiểu đoàn 59 Trung đoàn 261 phóng 2 quả đạn, bắn rơi chiếc B-52 đầu tiên của chiến dịch trên cánh đồng Phù Lỗ, Đông Anh.',
        'm2': 'Đêm 19 rạng sáng 20 tháng 12, Tiểu đoàn 77 tại trận địa Chèm kiên cường bám trận địa vạch nhiễu, cùng lưới lửa phòng không bắn rơi B-52, bảo vệ Đài phát thanh Mễ Trì và Tiếng nói Việt Nam.',
        'm3': 'Đêm 20 rạng sáng 21 tháng 12, quân dân Thủ đô bắn rơi 7 pháo đài bay B-52, lập kỷ lục tiêu diệt máy bay chiến lược nhiều nhất trong một đêm.',
        'm4': 'Đêm 21 tháng 12, Tiểu đoàn 57 kiên cường bám trận địa Đại Đồng, Đông Anh, vạch nhiễu tìm thù, hạ gục B-52 bảo vệ vững chắc cửa ngõ phía Bắc Thủ đô.',
        'm5': 'Rạng sáng 22 tháng 12, bom rải thảm B-52 tàn phá Bệnh viện Bạch Mai. Biến đau thương thành hành động chiến đấu, bộ đội phòng không Hà Nội đánh trả quyết liệt, bắn rơi máy bay cánh cụp cánh xòe F-111 của địch.',
        'm6': 'Đêm 23 tháng 12, Tiểu đoàn 82 chốt giữ trận địa, bắn rơi B-52 bảo vệ an toàn các kho xăng dầu và huyết mạch tiếp tế Thủ đô.',
        'm7': 'Đêm 24 tháng 12, trước giờ ngừng bắn Noel, quân dân miền Bắc giáng đòn quyết định, bắn rơi thêm nhiều máy bay chiến lược của không quân Mỹ.',
        'm8': 'Ngày 25 tháng 12, ngày lễ Giáng sinh. Bộ đội tên lửa chạy đua với thời gian, nạp đạn, cân chỉnh khí tài, sẵn sàng bước vào trận quyết chiến lịch sử.',
        'm9': 'Đêm 26 tháng 12, đêm quyết chiến lịch sử. Toàn mặt trận hợp đồng tác chiến bắn rơi 8 máy bay B-52, đập tan đòn tập kích lớn nhất của không quân Mỹ.',
        'm10': 'Đêm 27 tháng 12, Anh hùng phi công Phạm Tuân trên chiếc Én bạc Mích 21 số hiệu 5121 xuất kích bắn rơi B-52 trên bầu trời Mộc Châu.',
        'm11': 'Đêm 28 tháng 12, Anh hùng phi công Vũ Xuân Thiều lái chiếc Mích 21 số hiệu 5046 dũng cảm biến máy bay của mình thành quả tên lửa thứ ba tiêu diệt B-52 địch.',
        'm12': 'Đêm 29 tháng 12, trận đánh kết thúc chiến dịch. Tiểu đoàn 79 bắn rơi B-52 cuối cùng, hoàn thành đại thắng Điện Biên Phủ trên không chấn động địa cầu.'
    }
    for mid, text in missions_history.items():
        out_file = os.path.join(OUTPUT_DIR, f"history_{mid}.mp3")
        comm = edge_tts.Communicate(clean_for_tts(text), voice="vi-VN-HoaiMyNeural", rate="-2%")
        await comm.save(out_file)
        print(f"  [OK] history_{mid}: {os.path.getsize(out_file):,} bytes")

    print("All voice files generated successfully!")

if __name__ == '__main__':
    asyncio.run(generate())
