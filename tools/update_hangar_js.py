import re

def update_hangar_js():
    with open('src/js/04_cockpit_radar_hangar.js', 'r', encoding='utf-8') as f:
        code = f.read()

    # Target HANGAR_META and loadHangarShowcaseModel
    old_meta_pattern = r'const HANGAR_META = \{[\s\S]*?\n\};\n\nfunction loadHangarShowcaseModel\(key\) \{[\s\S]*?\n    \}\n\}'

    new_meta_and_func = '''const HANGAR_META = {
    MIG21: {
        name: 'TIÊM KÍCH MIG-21BIS (#5121 — 5 NGÔI SAO ĐỎ CHIẾN CÔNG)',
        photo: 'assets/images/hangar/mig21.jpg',
        photoFull: 'assets/images/hangar/mig21_raw.jpg',
        photoCaption: 'MiG-21MF #5121 (Bảo vật Quốc gia) tại Bảo tàng Lịch sử Quân sự Việt Nam',
        photoDetail: 'Chiếc tiêm kích MiG-21MF số hiệu 5121 được Thượng úy phi công Phạm Tuân điều khiển đêm 27/12/1972 xuất kích từ sân bay Yên Bái bắn rơi pháo đài bay B-52 trên vùng trời Mộc Châu. Mang 5 ngôi sao đỏ ghi dấu 5 chiến công bắn rơi máy bay Mỹ.',
        photoCredit: 'Tư liệu ảnh hiện vật: Bảo tàng Lịch sử Quân sự Việt Nam / Wikimedia Commons',
        specs: [
            { k: 'KÍCH THƯỚC', v: 'Dài 15.5m · Sải cánh 7.15m' },
            { k: 'TỐC ĐỘ MAX', v: '2.175 km/h (Mach 2.05)' },
            { k: 'VŨ KHÍ', v: '2× K-13 Atoll · Pháo 23mm GSh-23L' },
            { k: 'CHIẾN CÔNG', v: 'Hạ B-52 đêm 27/12/1972 (Phạm Tuân)' }
        ],
        desc: 'Chiếc tiêm kích huyền thoại số hiệu 5121 thuộc Trung đoàn Sao Đỏ (921). Cánh tam giác xuôi 57°, trang bị động cơ phản lực R-25-300 tạo chuỗi kim cương Mach rực sáng. Mang 5 ngôi sao đỏ trên mũi ghi dấu 5 chiến công bắn rơi máy bay Mỹ.'
    },
    B52: {
        name: 'PHÁO ĐÀI BAY B-52G STRATOFORTRESS // KHÔNG QUÂN MỸ',
        photo: 'assets/images/hangar/b52.jpg',
        photoFull: 'assets/images/hangar/b52_raw.jpg',
        photoCaption: 'B-52G bung dù giảm tốc tại căn cứ Andersen (Guam) trong Linebacker II, tháng 12/1972',
        photoDetail: 'Pháo đài bay chiến lược Boeing B-52G thuộc Bộ Chỉ huy Không quân Chiến lược Mỹ (SAC) bung dù giảm tốc khi đáp xuống căn cứ không quân Andersen trên đảo Guam sau một phi vụ không kích Hà Nội trong Chiến dịch Linebacker II.',
        photoCredit: 'Ảnh tư liệu lịch sử Không quân Mỹ (USAF / National Archives / Wikimedia Commons)',
        specs: [
            { k: 'KÍCH THƯỚC', v: 'Dài 48.5m · Sải cánh 56.4m' },
            { k: 'TẢI BOM', v: 'Đến 31.5 tấn bom rải thảm' },
            { k: 'TÁC CHIẾN ĐIỆN TỬ', v: '15 máy gây nhiễu ALQ chủ động' },
            { k: 'HỎA LỰC PHÒNG VỆ', v: 'Tháp pháo đuôi 4× 12.7mm radar' }
        ],
        desc: 'Pháo đài bay ném bom chiến lược hạng nặng của Không quân Mỹ. Mỗi phi vụ bay theo tốp 3 chiếc tạo dải nhiễu dày đặc che chắn cho nhau. Trong 12 ngày đêm, Mỹ đã tổn thất 34 chiếc B-52 trước lưới lửa phòng không ba thứ quân miền Bắc.'
    },
    SAM2: {
        name: 'TỔ HỢP TÊN LỬA SAM-2 (S-75 DVINA / ĐẠN V-750 & BỆ SM-63)',
        photo: 'assets/images/hangar/sam2.jpg',
        photoFull: 'assets/images/hangar/sam2_raw.jpg',
        photoCaption: 'Bệ phóng SM-63 & tên lửa SAM-2 tại Bảo tàng Phòng không - Không quân Hà Nội',
        photoDetail: 'Bệ phóng di động SM-63 cùng đạn tên lửa SAM-2 (S-75 Dvina) của Quân chủng Phòng không - Không quân Việt Nam. Trong chiến dịch "Điện Biên Phủ trên không", tên lửa SAM-2 là đòn hỏa lực chủ công bắn rơi phần lớn pháo đài bay B-52.',
        photoCredit: 'Tư liệu ảnh hiện vật: Bảo tàng Phòng không - Không quân / Wikimedia Commons',
        specs: [
            { k: 'CHIỀU DÀI ĐẠN', v: '10.6m · Trọng lượng 2.3 tấn' },
            { k: 'TẦM BẮN / TRẦN', v: 'Tầm xa 34 km · Độ cao 22.000m' },
            { k: 'ĐẦU NỔ', v: '196 kg mảnh văng sát thương cao' },
            { k: 'BỆ PHÓNG', v: 'SM-63 xoay 360°, nâng hạ thủy lực' }
        ],
        desc: 'Đạn tên lửa hai tầng V-750 phóng từ bệ SM-63 điều khiển bằng sóng vô tuyến từ đài SNR-75. Đòn hỏa lực chủ công của Bộ đội Tên lửa Việt Nam, làm nên nòng cốt kỳ tích bắn rơi hàng chục siêu pháo đài bay B-52.'
    },
    RADAR: {
        name: 'ĐÀI RADAR ĐIỀU KHIỂN HỎA LỰC SNR-75 "FAN SONG"',
        photo: 'assets/images/hangar/radar.jpg',
        photoFull: 'assets/images/hangar/radar_raw.jpg',
        photoCaption: 'Đài điều khiển SNR-75 (Fan Song) tại Bảo tàng Chiến thắng B-52, Hà Nội',
        photoDetail: 'Đài radar điều khiển và dẫn đường hỏa lực SNR-75 (NATO gọi là Fan Song) thuộc tổ hợp tên lửa SAM-2. Đài có nhiệm vụ bám sát mục tiêu B-52 xuyên qua dải nhiễu điện tử dày đặc và điều khiển đạn tên lửa đánh trúng đích.',
        photoCredit: 'Tư liệu ảnh hiện vật: Bảo tàng Chiến thắng B-52 (Đội Cấn, Hà Nội) / Wikimedia Commons',
        specs: [
            { k: 'CẤU TẠO ĂNG-TEN', v: '2 máng quét góc tà/phương vị + chảo' },
            { k: 'DẢI TẦN SỐ', v: '2900 – 3100 MHz (Nhảy tần ECCM)' },
            { k: 'TẦM THEO DÕI', v: 'Đến 60 – 75 km' },
            { k: 'NGHỆ THUẬT TÁC CHIẾN', v: 'Cẩm nang bìa đỏ — Vạch nhiễu tìm thù' }
        ],
        desc: '"Đôi mắt thần" chỉ huy của mỗi tiểu đoàn tên lửa SAM-2. Nơi các kíp trắc thủ phương vị, góc tà và cự ly dày dạn kinh nghiệm phân biệt vệt phản xạ thật của B-52 ẩn sâu trong rừng nhiễu tích cực và tiêu cực.'
    }
};

function openHangarPhotoModal() {
    const meta = HANGAR_META[currentHangarKey];
    if (!meta) return;
    const modal = document.getElementById('hangar-photo-modal');
    const modalImg = document.getElementById('hangar-modal-photo-img');
    const modalTitle = document.getElementById('hangar-modal-photo-title');
    const modalDesc = document.getElementById('hangar-modal-photo-desc');
    const modalCredit = document.getElementById('hangar-modal-photo-credit');

    if (modalImg) modalImg.src = meta.photoFull || meta.photo;
    if (modalTitle) modalTitle.textContent = meta.name;
    if (modalDesc) modalDesc.textContent = meta.photoDetail || meta.photoCaption;
    if (modalCredit) modalCredit.textContent = meta.photoCredit || '';

    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeHangarPhotoModal(e) {
    if (e && e.target && e.target.id !== 'hangar-photo-modal' && !e.target.closest('button')) {
        return;
    }
    const modal = document.getElementById('hangar-photo-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function loadHangarShowcaseModel(key) {
    currentHangarKey = key;
    while (hangarPivot.children.length > 0) {
        hangarPivot.remove(hangarPivot.children[0]);
    }

    let obj;
    if (key === 'MIG21') {
        obj = HighPolyFactory.createMiG21Bis();
        obj.scale.set(1.25, 1.25, 1.25);
        hangarDist = 16;
    } else if (key === 'B52') {
        obj = HighPolyFactory.createB52G();
        const aura = obj.getObjectByName('jamAura');
        if (aura) aura.visible = false;
        hangarDist = 23;
    } else if (key === 'SAM2') {
        const b = HighPolyFactory.createSM63LauncherBattery();
        b.pitchBoom.rotation.x = 0.52;
        obj = b.root;
        obj.position.y = -2.2;
        obj.scale.set(1.25, 1.25, 1.25);
        hangarDist = 16;
    } else if (key === 'RADAR') {
        obj = HighPolyFactory.createFanSongRadar();
        obj.position.y = -2.8;
        obj.scale.set(1.35, 1.35, 1.35);
        hangarDist = 16;
    }

    if (hangarWireframe) {
        obj.traverse(c => { if (c.isMesh && c.material) c.material.wireframe = true; });
    }
    hangarPivot.add(obj);

    ['MIG21', 'B52', 'SAM2', 'RADAR'].forEach(k => {
        const btn = document.getElementById(`h-model-${k}`);
        if (!btn) return;
        btn.className = (k === key)
            ? 'hangar-dock-btn flex-1 p-2 rounded-lg border text-left transition bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_16px_rgba(16,185,129,0.35)]'
            : 'hangar-dock-btn flex-1 p-2 rounded-lg border border-white/10 bg-black/60 text-zinc-400 hover:text-white hover:border-white/30 text-left transition';
    });

    const meta = HANGAR_META[key];
    if (meta) {
        document.getElementById('hangar-model-name').textContent = meta.name;
        document.getElementById('hangar-model-desc').textContent = meta.desc;

        const photoEl = document.getElementById('hangar-real-photo');
        if (photoEl && meta.photo) {
            photoEl.src = meta.photo;
            photoEl.alt = meta.photoCaption || meta.name;
        }
        const photoCapEl = document.getElementById('hangar-real-photo-caption');
        if (photoCapEl && meta.photoCaption) {
            photoCapEl.textContent = meta.photoCaption;
        }

        const specsEl = document.getElementById('hangar-model-specs');
        if (specsEl && meta.specs) {
            specsEl.innerHTML = meta.specs.map(s => `
                        <div class="p-1.5 rounded bg-black/60 border border-emerald-500/20">
                            <span class="text-emerald-400 block text-[9px] uppercase tracking-wider font-semibold font-mono">${s.k}</span>
                            <span class="text-alabaster font-mono text-[11px] font-medium">${s.v}</span>
                        </div>
                    `).join('');
        }
    }
}'''

    # Replace normalized
    code_norm = code.replace('\r\n', '\n')
    match = re.search(old_meta_pattern, code_norm)
    if not match:
        raise RuntimeError("Could not find HANGAR_META pattern in 04_cockpit_radar_hangar.js")

    code_norm = code_norm[:match.start()] + new_meta_and_func + code_norm[match.end():]

    # Also update Escape key handler around line 922
    old_esc = '''        if (e.code === 'Escape') {
            if (archiveOpen) toggleCampaignArchive(false);
            else if (guideOpen) toggleTacticalGuide(false);
            else if (radioLogOpen) toggleRadioLog(false);
            else if (gameState === 'PLAYING') gamePaused ? resumeMission() : pauseMission();
        }'''

    new_esc = '''        const photoModal = document.getElementById('hangar-photo-modal');
        const photoModalOpen = photoModal && !photoModal.classList.contains('hidden');

        if (e.code === 'Escape') {
            if (photoModalOpen) closeHangarPhotoModal();
            else if (archiveOpen) toggleCampaignArchive(false);
            else if (guideOpen) toggleTacticalGuide(false);
            else if (radioLogOpen) toggleRadioLog(false);
            else if (currentMode === 'HANGAR') leaveHangar();
            else if (gameState === 'PLAYING') gamePaused ? resumeMission() : pauseMission();
        }'''

    if old_esc in code_norm:
        code_norm = code_norm.replace(old_esc, new_esc)
    else:
        print("[WARN] old_esc not found directly in code_norm, searching with regex...")
        # Check if already updated or slight variation
        if 'photoModalOpen' not in code_norm:
            esc_regex = r"if \(e\.code === 'Escape'\) \{[\s\S]*?else if \(gameState === 'PLAYING'\) gamePaused \? resumeMission\(\) : pauseMission\(\);\s*\}"
            code_norm = re.sub(esc_regex, new_esc.strip(), code_norm)

    # Restore CRLF
    final_code = code_norm.replace('\n', '\r\n')
    with open('src/js/04_cockpit_radar_hangar.js', 'w', encoding='utf-8', newline='') as f:
        f.write(final_code)
    print("[OK] Updated src/js/04_cockpit_radar_hangar.js")

if __name__ == '__main__':
    update_hangar_js()
