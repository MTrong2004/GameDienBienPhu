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
    t = re.sub(r'<[^>]+>', '', text)
    t = t.replace('B-52', 'B 52')
    t = t.replace('MiG-21MF', 'Mích 21 M F').replace('MiG-21', 'Mích 21')
    t = t.replace('SAM-2', 'Sam 2').replace('V-750', 'Vê 750').replace('K-13', 'Ca 13')
    t = t.replace('F-111A', 'Ép 111 A').replace('F-111', 'Ép 111')
    t = t.replace('F-105', 'Ép 105').replace('F-4', 'Ép 4')
    t = t.replace('SR-71', 'Ét R 71').replace('BQM-34', 'B Q M 34')
    t = t.replace('PK-KQ', 'Phòng không Không quân').replace('QĐND', 'Quân đội nhân dân')
    t = t.replace('ЗАХВАТ', 'Zác-vát').replace('ASP-PFD', 'A S P').replace('SNR-75', 'S N R 75')
    t = t.replace('Pa-ri', 'Pa ri').replace('Ních-xơn', 'Ních xơn').replace('Nixon', 'Ních xơn')
    t = t.replace('U-Tapao', 'U Ta-pao').replace('Linebacker II', 'Lai-bếch-cơ hai')
    t = re.sub(r'(\d+)/(\d+)/(\d{4})', r'\1 tháng \2 năm \3', t)
    t = re.sub(r'(\d+)/(\d+)', r'\1 tháng \2', t)
    t = re.sub(r'(\d+)\s*km/h', r'\1 ki-lô-mét trên giờ', t)
    t = re.sub(r'(\d+)\s*km\b', r'\1 ki-lô-mét', t)
    t = re.sub(r'(\d+)\s*MHz\b', r'\1 mê-ga-héc', t)
    t = re.sub(r'(\d+)\s*kHz\b', r'\1 ki-lô-héc', t)
    t = re.sub(r'(\d+)h(\d+)', r'\1 giờ \2 phút', t)
    t = re.sub(r'(\d+)h\b', r'\1 giờ', t)
    t = t.replace('—', ', ').replace('–', ', ')
    return t

# History debrief summaries using HoaiMy
missions_history = {
    'm1': 'Khoảng 20 giờ 13 phút đêm 18 tháng 12 năm 1972, Tiểu đoàn 59 Trung đoàn 261 phóng 2 quả đạn, bắn rơi chiếc B-52 đầu tiên của chiến dịch trên cánh đồng Phù Lỗ, Đông Anh.',
    'm2': 'Đêm 19 rạng sáng 20 tháng 12, Tiểu đoàn 77 tại trận địa Chèm kiên cường bám trận địa vạch nhiễu, cùng lưới lửa phòng không bảo vệ an toàn làn sóng Đài Tiếng nói Việt Nam tại Mễ Trì.',
    'm3': 'Đêm 20 rạng sáng 21 tháng 12, quân dân Thủ đô bắn rơi 7 pháo đài bay B-52, lập kỷ lục tiêu diệt máy bay chiến lược nhiều nhất trong một đêm, trong đó Tiểu đoàn 77 bắn rơi tại chỗ một chiếc tại Vạn Thắng, Ba Vì.',
    'm4': 'Đêm 21 tháng 12, Tiểu đoàn 57 kiên cường bám trận địa Đại Đồng, xã Đại Mạch, Đông Anh, vạch nhiễu tìm thù, hạ gục 3 pháo đài bay B-52, bảo vệ vững chắc cửa ngõ phía Bắc Thủ đô.',
    'm5': 'Rạng sáng 22 tháng 12, bom rải thảm B-52 tàn phá Bệnh viện Bạch Mai. Biến đau thương thành hành động chiến đấu, bộ đội phòng không Hà Nội đánh trả quyết liệt, bắn rơi máy bay cánh cụp cánh xòe F-111 của địch.',
    'm6': 'Rạng sáng 23 tháng 12, Tiểu đoàn 82 tại trận địa An Lão và Tiểu đoàn 73 kiên cường đánh trả đợt tập kích B-52, bắn rơi 2 pháo đài bay B-52, mở đầu chiến công vẻ vang của quân dân Hải Phòng.',
    'm7': 'Đêm 24 tháng 12, trước giờ ngừng bắn Noel, quân dân miền Bắc giáng đòn quyết định, bắn rơi thêm 1 pháo đài bay B-52, khép lại 7 ngày đêm Đợt 1 với 18 chiếc B-52 bị tiêu diệt.',
    'm8': 'Ngày 25 tháng 12, ngày lễ Giáng sinh. Bộ đội tên lửa chạy đua với thời gian, nạp đạn, cân chỉnh khí tài, sẵn sàng bước vào trận quyết chiến lịch sử.',
    'm9': 'Đêm 26 tháng 12, đêm quyết chiến lịch sử. Toàn mặt trận hợp đồng tác chiến bắn rơi 8 máy bay B-52, đập tan đòn tập kích lớn nhất của không quân Mỹ.',
    'm10': 'Đêm 27 tháng 12, Anh hùng phi công Phạm Tuân trên chiếc Én bạc Mích 21 số hiệu 5121 xuất kích bắn rơi B-52 trên bầu trời Mộc Châu.',
    'm11': 'Đêm 28 tháng 12, Anh hùng phi công Vũ Xuân Thiều lái chiếc Mích 21 số hiệu 5046 dũng cảm biến máy bay của mình thành quả tên lửa thứ ba tiêu diệt B-52 địch.',
    'm12': '23 giờ 16 phút đêm 29/12/1972, Tiểu đoàn tên lửa 79, Trung đoàn 257, bắn rơi chiếc B-52 cuối cùng của chiến dịch. Đến 23 giờ 29 phút, Tiểu đoàn 72, Trung đoàn 285, phóng quả tên lửa cuối cùng, khép lại 12 ngày đêm chiến đấu lịch sử. 7 giờ sáng ngày 30/12/1972, Tổng thống Mỹ Richard Nixon buộc phải tuyên bố ngừng ném bom từ vĩ tuyến 20 trở ra và đề nghị nối lại đàm phán Paris. Sau 12 ngày đêm, quân và dân miền Bắc tuyên bố bắn rơi 81 máy bay Mỹ, trong đó có 34 chiếc B-52 và 5 chiếc F-111. Ngày 27/1/1973, Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký kết.'
}

# Command cues using military voices
cues = {
    'cue_sam2': ('Tiểu đoàn vào cấp một! Tiêu diệt B 52 bảo vệ Hà Nội!', 'vi-VN-NamMinhNeural'),
    'cue_mig21_5121': ('Tiêm kích 5121 bật tăng lực xuất kích, tiếp cận mục tiêu!', 'vi-VN-NamMinhNeural'),
    'cue_mig21_046': ('Tiêm kích 5046 bật tăng lực xuất kích, tiếp cận mục tiêu!', 'vi-VN-NamMinhNeural'),
    'cue_mig21_5046': ('Tiêm kích 5046 bật tăng lực xuất kích, tiếp cận mục tiêu!', 'vi-VN-NamMinhNeural'),
    'cue_air_raid': ('Đồng bào chú ý! Đồng bào chú ý! Máy bay địch cách Hà Nội 50 kilômét. Nhân dân khẩn trương xuống hầm trú ẩn!', 'vi-VN-HoaiMyNeural'),
    'cue_kill': ('Mục tiêu bốc cháy! B 52 rơi tại chỗ!', 'vi-VN-NamMinhNeural'),
    'cue_win': ('Báo cáo Sở chỉ huy: Toàn tiểu đoàn hoàn thành xuất sắc nhiệm vụ!', 'vi-VN-NamMinhNeural'),
    'cue_lock': ('Đã bám chắc mục tiêu! Phóng đạn!', 'vi-VN-NamMinhNeural'),
    'cue_jam': ('Nhiễu nặng!', 'vi-VN-NamMinhNeural')
}

async def generate():
    print(f"Generating voice narration for {len(matches)} missions using vi-VN-HoaiMyNeural...")
    for m_id, story in matches:
        out_file = os.path.join(OUTPUT_DIR, f"story_{m_id}.mp3")
        cleaned_text = clean_for_tts(story)
        print(f"Synthesizing story {m_id} -> {out_file}...")
        comm = edge_tts.Communicate(cleaned_text, voice="vi-VN-HoaiMyNeural", rate="-2%", pitch="+0Hz")
        await comm.save(out_file)
        size = os.path.getsize(out_file)
        print(f"  [OK] story_{m_id}: {size:,} bytes")

    for cue_id, (text, voice) in cues.items():
        out_file = os.path.join(OUTPUT_DIR, f"{cue_id}.mp3")
        cleaned_cue = clean_for_tts(text)
        comm = edge_tts.Communicate(cleaned_cue, voice=voice, rate="+4%", pitch="-1Hz")
        await comm.save(out_file)
        print(f"  [OK] {cue_id}: {os.path.getsize(out_file):,} bytes")

    for mid, text in missions_history.items():
        out_file = os.path.join(OUTPUT_DIR, f"history_{mid}.mp3")
        cleaned_hist = clean_for_tts(text)
        print(f"Synthesizing history {mid} -> {out_file}...")
        comm = edge_tts.Communicate(cleaned_hist, voice="vi-VN-HoaiMyNeural", rate="-2%")
        await comm.save(out_file)
        print(f"  [OK] history_{mid}: {os.path.getsize(out_file):,} bytes")

    print("All voice files generated successfully!")

if __name__ == '__main__':
    asyncio.run(generate())
