
const CONTROLS_SAM2 = [
            'Di chuột: quay ăng-ten Fan Song và bệ phóng. Giữ vòng ngắm trên một B-52 khoảng <b>2 giây</b> để BÁM',
            'Thanh TẦN SỐ / phím <b>Q · E</b>: nhảy tần tránh đỉnh nhiễu đỏ trên phổ. Máy gây nhiễu sẽ dò theo tần số của bạn',
            'Click / <b>Space</b>: phóng. Camera bay theo đạn: lệch chuột khỏi tâm để lái, bấm Space lần nữa để lệnh nổ',
            'Khi đạn đang bay vẫn phải nhảy tần: mất tín hiệu quá <b>2 giây</b> là đạn lạc. Đạn chỉ hạ được B-52 khi nổ thật sát',
            'Đưa chuột ra <b>mép màn hình</b> để xoay bệ phóng (quay được ra sau) · lên mép trên để ngẩng, tới gần 90°',
            'Bắn xong, tổ nạp đạn <b>tự lắp quả mới</b> lên bệ trống (~12 giây/quả) · Esc: tạm dừng'
        ];
        const CONTROLS_MIG21 = [
            'Chuột là cần lái: lệch trái/phải để nghiêng và vòng, lên/xuống để ngóc/chúc mũi',
            '<b>W / S</b>: tăng / giảm ga (trên 85% là bật tăng lực)',
            'Vào sau đuôi B-52 (±35°), cự ly 1–5 km, đưa vào vòng ngắm đến khi đèn <b>ЗАХВАТ</b> sáng và có tiếng gầm',
            'Click / <b>Space</b>: phóng K-13 (2 quả)',
            'Chuột phải / Phím <b>F · C</b> (hoặc click khi hết K-13): Bắn pháo 23mm GSh-23L khi áp sát dưới 1.2 km',
            '<b>Esc</b>: tạm dừng'
        ];

const MISSIONS = [
            {
                id: "m1",
                story: "Hà Nội, đêm 18 tháng 12 năm 1972. Đàm phán Pa-ri bế tắc, Tổng thống Ních-xơn tung những pháo đài bay B-52 vào đánh phá Thủ đô. Tiểu đoàn tên lửa 59 vào cấp một. Đồng chí trắc thủ, cả Hà Nội đang trông vào các anh.",
                date: "18.12.1972",
                dateLabel: "Đêm 18/12/1972",
                clock: [19, 40],
                title: "Đòn phủ đầu",
                unit: "Tiểu đoàn 59 · Trung đoàn 261",
                place: "Trận địa Tráng Việt, Mê Linh",
                mode: "SAM2",
                camera: "DECK",
                briefing: [
                    "Đàm phán Paris bế tắc. Ngày 18/12/1972, Tổng thống Mỹ Richard Nixon ra lệnh mở chiến dịch tập kích đường không chiến lược <b>Linebacker II</b>: dùng B-52 ném bom rải thảm Hà Nội, Hải Phòng để ép Việt Nam ký hiệp định theo điều kiện của Mỹ.",
                    "B-52 bay theo <b>tốp 3 chiếc</b>. Mỗi chiếc mang máy gây nhiễu tích cực, cả tốp cùng phát nhiễu che cho nhau. Ở xa, tín hiệu phản xạ từ máy bay yếu hơn nhiễu rất nhiều; khi B-52 vào gần, tín hiệu mạnh lên nhanh hơn nhiễu và dần \"xuyên\" qua được.",
                    "Bạn là trắc thủ của Tiểu đoàn 59. Theo <b>\"Cẩm nang bìa đỏ\"</b> về cách đánh B-52: phát sóng ngắn, đổi tần số tránh nhiễu, bám chắc mục tiêu rồi mới phóng."
                ],
                forces: "phía Việt Nam ghi nhận <b>90 lần chiếc B-52</b> ném bom Hà Nội trong 3 đợt; phía Mỹ ghi <b>129 lần chiếc</b> B-52 xuất kích cả đêm.",
                kills: 3, ammo: 8, timeLimit: 265, speed: 1.0,
                waves: [3, 15, 55, 95],
                jam: {"power": 5, "barrage": 0.1, "retune": 14, "lookThrough": 2.2, "chaff": false, "startFreq": 2960},
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: "SỞ CHỈ HUY", text: "Toàn tiểu đoàn vào cấp 1! Địch mở chiến dịch Linebacker II, tốp B-52 đang tiến vào từ hướng Tây Bắc cự ly 50 km!" },
                    { at: 7, who: "LOA PHÒNG KHÔNG", text: "Đồng bào chú ý! Máy bay địch cách Hà Nội 50 km! Nhân dân khẩn trương xuống hầm trú ẩn!" },
                    { at: 16, who: "TRẮC THỦ", text: "Màn hiện sóng SNR-75 toàn bão nhiễu! Kéo thanh tần số hoặc bấm Q / E để đưa vạch phát ra khỏi đỉnh nhiễu đỏ!" },
                    { at: 28, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Tốp B-52 số 1 đã vào cự ly 35 km! Chờ tín hiệu phản xạ ổn định. Ba bệ phóng tên lửa đã sẵn sàng!" },
                    { at: 42, who: "HƯỚNG DẪN", text: "Giữ vòng ngắm trên B-52 khoảng 2 giây để BÁM. Khi có tín hiệu sóng sạch, bấm Chuột hoặc Space để phóng!" },
                    { at: 65, who: "ĐÀI RADAR 291", text: "Báo cáo: Tốp B-52 thứ hai xuất hiện ở cự ly 45 km, trần bay 10.000m hướng về phía Đông Anh!" },
                    { at: 95, who: "ĐÀI QUAN SÁT", text: "Đèn chiếu phòng không sân bay Nội Bài đã bắt được vệt khói mục tiêu! Pháo 100mm đang bắn đón chặn đường bay!" },
                    { at: 130, who: "SỞ CHỈ HUY", text: "Đợt tập kích thứ ba đang tiến vào! Giữ vững trận địa, quyết tâm bắn rơi tại chỗ pháo đài bay của địch!" },
                    { at: 170, who: "TRẮC THỦ", text: "Máy gây nhiễu cơ động đổi tần số! Nhảy tần số Q / E liên tục để duy trì cánh sóng bám mục tiêu!" },
                    { at: 210, who: "SỞ CHỈ HUY", text: "Hơn 50 vạn đồng bào nội thành đang dõi theo trận địa ta! Khóa chặt mục tiêu, phóng đạn tiêu diệt!" }
                ],
                lines: {
                    clean: "Đã bám chắc mục tiêu! Phóng — bấm chuột hoặc Space.",
                    shift: "Máy gây nhiễu đã dò ra tần số của ta! Nhảy tần (Q / E)!",
                    kill: "Mục tiêu bốc cháy! B-52 rơi tại chỗ trên cánh đồng Phù Lỗ!",
                    win: "Báo cáo Sở chỉ huy: Tiểu đoàn 59 đã bắn rơi B-52 đầu tiên!"
                },
                history: [
                    "Khoảng <b>20 giờ 13 phút</b> đêm 18/12/1972, Tiểu đoàn 59 (Trung đoàn tên lửa 261) tại trận địa Cổ Loa – Tráng Việt phóng 2 quả đạn, bắn rơi chiếc B-52 đầu tiên của chiến dịch. Xác máy bay rơi trên cánh đồng Phù Lỗ – Đông Anh.",
                    "Cùng đêm, các tiểu đoàn khác bắn rơi thêm B-52; Tiểu đoàn 77 bảo vệ hướng Tây Bắc bắn rơi 1 chiếc, Tiểu đoàn 52 (Trung đoàn 267) bắn bị thương 1 chiếc rơi tại Đà Nẵng.",
                    "Tổng cộng trong đêm mở màn, quân dân ta bắn rơi 3 chiếc B-52 (phía Mỹ thừa nhận mất 3 chiếc B-52G và B-52D). Toàn bộ âm mưu đánh đòn bất ngờ của địch bị bẻ gãy ngay từ giờ phút đầu."
                ]
            },
            {
                id: "m2",
                story: "Rạng sáng và đêm 19 tháng 12 năm 1972. Sau thất bại đêm mở màn, địch thay đổi chiến thuật: cho B-52 bay vòng tránh trận địa phía Bắc, tiếp cận tầm thấp dọc triền sông Hồng. Trận địa Chèm của Tiểu đoàn 77 đón đầu.",
                date: "19.12.1972",
                dateLabel: "Đêm 19/12/1972",
                clock: [4, 5],
                title: "Lưới lửa tầm thấp",
                unit: "Tiểu đoàn 77 · Trung đoàn 257",
                place: "Trận địa Chèm – Thượng Cát",
                mode: "SAM2",
                camera: "DECK",
                briefing: [
                    "Sau đêm 18/12, địch phát hiện hệ thống hỏa lực phòng không của ta ở phía Bắc. Đêm 19/12, các tốp B-52 chuyển hướng tiếp cận từ phía Tây và Tây Nam men theo triền sông Hồng ở độ cao thấp hơn.",
                    "Tiểu đoàn 77 chốt giữ trận địa Chèm – Thượng Cát. Đồng chí Tiểu đoàn trưởng Đinh Thế Văn chỉ đạo trắc thủ vạch nhiễu đón lõng, áp dụng phương pháp bắn đón nửa góc và ba điểm.",
                    "Địch tăng cường gây nhiễu rãnh đạn và dùng F-4 bắn tên lửa Shrike vào đài radar. Hãy phát sóng chớp nhoáng và cơ động nhảy tần số kịp thời."
                ],
                forces: "địch huy động <b>87 lần chiếc B-52</b> cùng hàng trăm lượt máy bay chiến thuật F-4, F-105 yểm trợ dọn đường.",
                kills: 2, ammo: 6, timeLimit: 260, speed: 1.0,
                waves: [3, 20, 50, 85],
                jam: {"power": 5.5, "barrage": 0.11, "retune": 16, "lookThrough": 2.1, "chaff": false, "startFreq": 2990},
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: "SỞ CHỈ HUY", text: "Báo động toàn trận địa! Địch chuyển hướng tiếp cận dọc triền sông Hồng ở độ cao 9.000m!" },
                    { at: 8, who: "TRẮC THỦ", text: "Nhiễu tiêu cực và tích cực đan xen rất dày! Đang dò dải sóng sạch trên dải tần 2990 MHz!" },
                    { at: 20, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Tiểu đoàn 77 chuẩn bị phần tử bắn đón nửa góc! Chờ mục tiêu vào cự ly hiệu quả 32 km!" },
                    { at: 45, who: "ĐÀI RADAR 291", text: "Phát hiện tốp B-52 thứ hai đang bẻ ngoặt hướng vào Thượng Cát! Cảnh giác tên lửa Shrike chống radar!" },
                    { at: 75, who: "SỞ CHỈ HUY", text: "Phát sóng ngắn! Bám chắc dải nhiễu bản thân B-52 rồi ấn nút phóng đạn!" },
                    { at: 115, who: "TRẮC THỦ", text: "Tín hiệu phản xạ mục tiêu đã xuyên qua màn nhiễu! Bắt được mục tiêu số 1!" },
                    { at: 160, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Phóng đạn đợt hai! Giữ cánh sóng điều khiển bám sát mục tiêu!" },
                    { at: 210, who: "SỞ CHỈ HUY", text: "Địch đang tháo lui về phía Tây! Bắn đón chặn đường rút của pháo đài bay!" }
                ],
                lines: {
                    clean: "Đã bắt được dải phản xạ B-52 tầm thấp! Phóng đạn!",
                    shift: "Địch đổi tần số gây nhiễu! Nhảy tần (Q / E) ngay!",
                    kill: "Trúng rồi! B-52 bốc cháy dữ dội rơi xuống mạn sông Hồng!",
                    win: "Tiểu đoàn 77 hoàn thành xuất sắc nhiệm vụ bảo vệ cửa ngõ Tây Bắc!"
                },
                history: [
                    "04 giờ 05 phút rạng sáng 20/12 (thuộc đợt tác chiến đêm 19/12), Tiểu đoàn 77 (Trung đoàn 257) tại trận địa Chèm phóng 2 quả đạn, bắn rơi tại chỗ 1 pháo đài bay B-52.",
                    "Trong đêm 19 rạng sáng 20/12, quân dân miền Bắc bắn rơi thêm 2 chiếc B-52 nữa, khẳng định bộ đội tên lửa ta hoàn toàn làm chủ khí tài và đánh bại thủ đoạn bay thấp luồn lách của địch.",
                    "Chiến thuật phát sóng ngắn và đánh đón lõng của Tiểu đoàn trưởng Đinh Thế Văn trở thành bài học kinh nghiệm quý giá cho toàn Quân chủng."
                ]
            },
            {
                id: "m3",
                story: "Đêm 20 tháng 12 năm 1972. Sau hai đêm bị giáng đòn, không quân chiến lược Mỹ tung lực lượng quy mô lớn chưa từng thấy: gần 100 lần chiếc B-52 dội bom ga Yên Viên, cầu Đuống, Gia Lâm. Bầu trời Hà Nội đêm nay rực lửa.",
                date: "20.12.1972",
                dateLabel: "Đêm 20/12/1972",
                clock: [20, 0],
                title: "Đêm rực lửa Yên Viên – Gia Lâm",
                unit: "Tiểu đoàn 93 · Trung đoàn 261",
                place: "Hướng ga Yên Viên – Gia Lâm – Đông Anh",
                mode: "SAM2",
                camera: "DECK",
                briefing: [
                    "Sau hai đêm đầu, các đơn vị tên lửa rút kinh nghiệm: B-52 bay theo những đường bay cố định. Trắc thủ chuyển sang bám vào <b>dải nhiễu</b> do chính máy bay phát ra và chỉ phát sóng ngắn để tránh tên lửa chống radar Shrike.",
                    "Đêm 20/12, địch tiếp tục đánh vào ga Yên Viên, Gia Lâm, Đông Anh. Đi trước các tốp B-52, tiêm kích F-4 rải <b>dải kim loại (chaff)</b> tạo hành lang nhiễu tiêu cực: radar thấy hàng loạt mục tiêu giả, cổng bám bị kéo lệch khỏi máy bay thật.",
                    "Khi đạn đi vào hành lang chaff, hãy tự lái đạn bám vào B-52 thật trong camera theo đạn."
                ],
                forces: "phía Việt Nam ghi <b>gần 100 lần chiếc B-52</b> cùng hơn 100 lần máy bay chiến thuật; phía Mỹ ghi khoảng <b>99 lần chiếc B-52</b>.",
                kills: 7, ammo: 18, timeLimit: 320, speed: 1.0,
                waves: [3, 15, 30, 48, 66, 85, 105, 125],
                jam: {"power": 6.0, "barrage": 0.12, "retune": 18, "lookThrough": 2.0, "chaff": true, "startFreq": 3040},
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: "SỞ CHỈ HUY", text: "Báo động toàn mặt trận! Đêm nay địch đưa gần 100 lần chiếc B-52 đánh phá ga Yên Viên, Gia Lâm và Đông Anh!" },
                    { at: 8, who: "LOA PHÒNG KHÔNG", text: "Còi báo động rú vang toàn thành phố! Hỏa lực cao xạ các cửa ô đồng loạt sẵn sàng chiến đấu!" },
                    { at: 16, who: "TRẮC THỦ", text: "F-4 đang rải dải kim loại chaff tạo hành lang nhiễu tiêu cực! Màn hiện sóng xuất hiện vô số mục tiêu giả li ti!" },
                    { at: 28, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Kinh nghiệm Cẩm nang đỏ: Bám vào tâm dải nhiễu do máy gây nhiễu tích cực của B-52 phát ra! Không bám vào chaff!" },
                    { at: 48, who: "HƯỚNG DẪN", text: "Khi đạn bay qua hành lang chaff, hãy tự dùng chuột lái đạn bám vào thân B-52 thật trong camera theo đạn!" },
                    { at: 75, who: "ĐÀI QUAN SÁT GIA LÂM", text: "Cầu Đuống, ga Yên Viên đang là hướng ném bom chính của địch! Đèn chiếu đang quét rực sáng bầu trời phía Bắc!" },
                    { at: 110, who: "SỞ CHỈ HUY", text: "Tiểu đoàn 93 vừa bắn rơi tại chỗ 1 chiếc B-52 ở Yên Viên! Tiểu đoàn ta tiếp tục tiêu diệt tốp tiếp theo!" },
                    { at: 145, who: "TRẮC THỦ", text: "Nhiễu lấn át kênh phương vị! Nhảy tần số Q / E để bám chắc dải nhiễu bản thân B-52!" },
                    { at: 180, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Tổ nạp đạn khẩn trương lắp quả mới lên bệ! Cơ số đạn sẵn sàng, quyết chiến rực lửa!" },
                    { at: 220, who: "SỞ CHỈ HUY", text: "Các tiểu đoàn 57, 77, 79 đang liên tiếp lập công! Bầu trời Hà Nội đêm nay rực lửa chiến thắng!" },
                    { at: 260, who: "ĐÀI QUAN SÁT", text: "Đội hình B-52 địch bắt đầu hoảng loạn tách tốp tháo chạy! Đuổi đánh tiêu diệt đến cùng!" }
                ],
                lines: {
                    clean: "Đã tách được mục tiêu khỏi dải nhiễu — bám chắc!",
                    shift: "Địch dò theo tần số của ta! Nhảy tần (Q / E)!",
                    kill: "Trúng rồi! Thêm một chiếc B-52 bốc cháy dữ dội!",
                    win: "Đêm rực lửa toàn thắng! Lập kỷ lục bắn rơi nhiều B-52 nhất!"
                },
                history: [
                    "Đêm 20 rạng sáng 21/12/1972 là <b>\"Đêm rực lửa\"</b> của lưới lửa phòng không Hà Nội: quân dân ta bắn rơi <b>7 chiếc B-52</b> (trong đó có 5 chiếc rơi tại chỗ).",
                    "Đặc biệt, rạng sáng 21/12, các Tiểu đoàn 57 và 77 lập kỳ tích bắn rơi 4 chiếc B-52 chỉ trong vòng <b>9 phút</b> (từ 05h09 đến 05h18).",
                    "Trận đánh này bẻ gãy hoàn toàn chiến thuật dùng dải kim loại chaff che chắn của không quân Mỹ, chứng minh tài trí thao lược của bộ đội tên lửa Việt Nam."
                ]
            },
            {
                id: "m4",
                story: "Đêm 21 rạng sáng 22 tháng 12 năm 1972. Bão nhiễu điện tử của không quân Mỹ đạt đỉnh điểm tàn khốc. Sĩ quan chỉ huy Nguyễn Văn Phiệt cùng kíp chiến đấu Tiểu đoàn 57 kiên cường vạch nhiễu tìm thù, bảo vệ cửa ngõ Thủ đô.",
                date: "21.12.1972",
                dateLabel: "Đêm 21/12/1972",
                clock: [21, 30],
                title: "Vạch nhiễu tìm thù",
                unit: "Tiểu đoàn 57 · Trung đoàn 261",
                place: "Trận địa Đại Mỗ – Hoài Đức",
                mode: "SAM2",
                camera: "DECK",
                briefing: [
                    "Sau ba đêm tổn thất nặng nề, Mỹ dốc toàn lực tăng công suất các máy phát nhiễu ALQ-100 và ALQ-117. Màn hiện sóng radar phủ kín dải nhiễu râu tôm và nhiễu xung kim đan chéo.",
                    "Tại trận địa Đại Mỗ, Tiểu đoàn trưởng Nguyễn Văn Phiệt chỉ đạo trắc thủ góc tà và trắc thủ cự ly hiệp đồng chặt chẽ: đo dải nhiễu quét, xác định đúng tâm tín hiệu B-52 thật.",
                    "Hãy tiết kiệm cơ số đạn, kiên quyết bám sát mục tiêu cho đến cự ly phóng tối ưu 25–28 km mới phát lệnh điểm hỏa."
                ],
                forces: "địch huy động <b>hơn 90 lần chiếc B-52</b> cùng hàng chục tốp F-111 cánh cụp cánh xòe đánh phá ác liệt.",
                kills: 3, ammo: 9, timeLimit: 285, speed: 1.05,
                waves: [3, 25, 50, 75, 100],
                jam: {"power": 6.5, "barrage": 0.13, "retune": 20, "lookThrough": 1.9, "chaff": true, "startFreq": 2950},
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: "SỞ CHỈ HUY", text: "Tiểu đoàn 57 vào cấp 1! Địch mở đợt tập kích từ hướng Tây Nam, bão nhiễu rất nặng!" },
                    { at: 10, who: "TRẮC THỦ", text: "Nhiễu râu tôm ngập tràn hai màn hiện sóng phương vị và góc tà! Đang xoay đổi phân cực ăng-ten!" },
                    { at: 25, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Bình tĩnh đo dải nhiễu! Nhảy tần số Q / E để tìm khe hở giữa các đỉnh nhiễu của địch!" },
                    { at: 55, who: "ĐÀI RADAR 291", text: "Tốp B-52 số hiệu 318 đang tiến vào cự ly 30 km, tốc độ 900 km/h hướng về Đại Mỗ!" },
                    { at: 90, who: "SỞ CHỈ HUY", text: "Khóa chắc tâm dải nhiễu! Chờ tín hiệu vượt ngưỡng rồi phóng 2 quả liên tiếp!" },
                    { at: 135, who: "TRẮC THỦ", text: "Đã bắt được vệt sáng phản xạ B-52! Tín hiệu đè bão nhiễu rất rõ!" },
                    { at: 180, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Phóng đạn! Quả 1 vút lên, quả 2 xuất kích theo sau!" },
                    { at: 225, who: "ĐÀI QUAN SÁT", text: "Một đám cháy khổng lồ bùng lên trên bầu trời Hoài Đức! B-52 đã đền tội!" },
                    { at: 260, who: "SỞ CHỈ HUY", text: "Tiểu đoàn 57 lập công xuất sắc! Giữ vững trận địa đón đánh đợt tiếp theo!" }
                ],
                lines: {
                    clean: "Đã vạch được nhiễu, bắt trúng tâm B-52! Phóng đạn!",
                    shift: "Địch cơ động nhảy tần nhiễu! Nhảy tần (Q / E) bám đuổi!",
                    kill: "Trúng rồi! Xác B-52 bốc cháy ngùn ngụt rơi tại chỗ!",
                    win: "Tiểu đoàn 57 đã bắn rơi B-52, bảo vệ bình yên trận địa Đại Mỗ!"
                },
                history: [
                    "Đêm 21 rạng sáng 22/12/1972, kíp chiến đấu Tiểu đoàn 57 dưới sự chỉ huy của Tiểu đoàn trưởng Nguyễn Văn Phiệt đã lập chiến công bắn rơi <b>3 chiếc B-52</b>.",
                    "Đồng chí Nguyễn Văn Phiệt sau này được phong tặng danh hiệu Anh hùng Lực lượng Vũ trang Nhân dân, trở thành Trung tướng, Phó Tư lệnh Quân chủng PK-KQ.",
                    "Cùng đêm đó, quân dân ta còn bắn rơi 1 máy bay cánh cụp cánh xòe F-111 hiện đại bậc nhất của Mỹ tại khu vực Hà Tây."
                ]
            },
            {
                id: "m5",
                story: "Rạng sáng ngày 22 tháng 12 năm 1972. Tội ác tột cùng của đế quốc Mỹ: bom rải thảm B-52 phá hủy hoàn toàn Bệnh viện Bạch Mai, vùi lấp y bác sĩ và bệnh nhân. Nén đau thương thành sức mạnh, lưới lửa phòng không Hà Nội quyết trả thù cho đồng bào.",
                date: "22.12.1972",
                dateLabel: "Đêm 22/12/1972",
                clock: [3, 45],
                title: "Bệnh viện Bạch Mai căm thù",
                unit: "Tiểu đoàn 78 · Trung đoàn 257",
                place: "Nội thành Hà Nội – Đống Đa – Bạch Mai",
                mode: "SAM2",
                camera: "DECK",
                briefing: [
                    "Rạng sáng 22/12, các tốp B-52 trút hàng ngàn tấn bom xuống Bệnh viện Bạch Mai – cơ sở chữa bệnh lớn nhất miền Bắc, cướp đi sinh mạng của nhiều y bác sĩ và người bệnh.",
                    "Tin đau thương truyền tới các bệ phóng. Chiến sĩ Tiểu đoàn 78 và tự vệ Thủ đô siết chặt tay súng, biến đau thương thành ngọn lửa căm thù ngùn ngụt.",
                    "Địch tăng cường các tốp tiêm kích giả dạng đi kèm nhằm đánh lừa đài radar. Hãy quan sát tốc độ và dải xung để nhắm đúng B-52 thật."
                ],
                forces: "địch xuất kích <b>hơn 70 lần chiếc B-52</b> rải thảm khu nội thành đông dân cư và bệnh viện.",
                kills: 3, ammo: 9, timeLimit: 280, speed: 1.05,
                waves: [3, 22, 45, 70, 95],
                jam: {"power": 6.8, "barrage": 0.14, "retune": 20, "lookThrough": 1.8, "chaff": true, "startFreq": 3010},
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: "SỞ CHỈ HUY", text: "Báo động khẩn cấp! Địch vừa ném bom rải thảm trúng Bệnh viện Bạch Mai! Toàn thành phố căm thù sục sôi!" },
                    { at: 8, who: "LOA PHÒNG KHÔNG", text: "Đồng bào Bạch Mai, Đống Đa kiên cường! Hãy biến đau thương thành hành động chiến đấu!" },
                    { at: 18, who: "TRẮC THỦ", text: "Tốp B-52 tội ác đang bay trên hướng Đông Nam cự ly 35 km! Dải nhiễu đặc quánh!" },
                    { at: 32, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Nén đau thương, bắn rơi tại chỗ pháo đài bay đền tội cho đồng bào và các thầy thuốc Bạch Mai!" },
                    { at: 60, who: "ĐÀI QUAN SÁT", text: "Khói lửa bom đạn đang bốc lên ngùn ngụt từ nội thành. Các trận địa pháo cao xạ đang nổ súng đánh chặn!" },
                    { at: 100, who: "SỞ CHỈ HUY", text: "Tiểu đoàn 78 khóa mục tiêu! Tiêu diệt tốp B-52 ném bom đợt hai!" },
                    { at: 145, who: "TRẮC THỦ", text: "Đã bắt chắc vệt sáng B-52! Tần số ổn định tại 3010 MHz!" },
                    { at: 190, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Phóng đạn! Đạn tên lửa vút lên trời cao xé tan màn đêm!" },
                    { at: 240, who: "SỞ CHỈ HUY", text: "Trúng rồi! Chiếc B-52 bốc cháy như ngọn đuốc khổng lồ! Bạch Mai đã trả hận!" }
                ],
                lines: {
                    clean: "Khóa chặt pháo đài bay tội ác! Phóng đạn!",
                    shift: "Địch đổi tần số hòng thoát thân! Nhảy tần (Q / E) truy kích!",
                    kill: "B-52 trúng đạn bốc cháy rừng rực! Trả thù cho Bạch Mai!",
                    win: "Tiểu đoàn 78 giáng đòn trừng phạt đích đáng xuống lũ cướp trời!"
                },
                history: [
                    "Vụ ném bom tàn bạo rạng sáng 22/12/1972 đã phá hủy khu bệnh phòng Bệnh viện Bạch Mai, làm 28 bác sĩ, y tá và nhân viên y tế hy sinh, nhiều bệnh nhân bị thương vong.",
                    "Tội ác dã man này khiến dư luận toàn thế giới phẫn nộ, làn sóng biểu tình phản đối Tổng thống Nixon bùng nổ dữ dội trên khắp các thủ đô phương Tây.",
                    "Trong ngày và đêm 22/12, quân dân miền Bắc bắn rơi <b>3 chiếc B-52</b> và 4 máy bay chiến thuật, đập tan luận điệu ném bom hủy diệt để khuất phục ý chí dân tộc ta."
                ]
            },
            {
                id: "m6",
                story: "Đêm 23 tháng 12 năm 1972. Bị tổn thất nặng, Mỹ điều chỉnh hướng tấn công sang các kho xăng dầu Đức Giang, ga Giáp Bát và các tuyến vận chuyển tiếp tế huyết mạch. Tiểu đoàn 82 kiên cường bám trận địa chốt giữ bầu trời.",
                date: "23.12.1972",
                dateLabel: "Đêm 23/12/1972",
                clock: [22, 15],
                title: "Chặn đứng đòn chia cắt",
                unit: "Tiểu đoàn 82 · Trung đoàn 238",
                place: "Hướng Giáp Bát, kho xăng Đức Giang",
                mode: "SAM2",
                camera: "DECK",
                briefing: [
                    "Địch chuyển trọng tâm sang phá hủy đầu mối hậu cần giao thông vận tải: tổng kho xăng dầu Đức Giang, các ga đường sắt Giáp Bát, Văn Điển nhằm cắt đứt nguồn tiếp tế vũ khí, lương thực.",
                    "Tiểu đoàn 82 cơ động trận địa chốt chặn hướng tấn công từ phía Đông và Đông Bắc.",
                    "Máy bay địch bay theo cự ly giãn cách rộng hơn, cơ động đổi độ cao liên tục. Cần phán đoán quỹ đạo và phóng đón kịp thời trước khi chúng cắt bom."
                ],
                forces: "địch dùng <b>54 lần chiếc B-52</b> cùng 80 lần chiếc cường kích hải quân và không quân chiến thuật.",
                kills: 2, ammo: 6, timeLimit: 260, speed: 1.1,
                waves: [3, 24, 52, 85],
                jam: {"power": 7.0, "barrage": 0.14, "retune": 21, "lookThrough": 1.8, "chaff": true, "startFreq": 2975},
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: "SỞ CHỈ HUY", text: "Địch đổi hướng đánh vào kho xăng dầu Đức Giang và ga Giáp Bát! Bảo vệ bằng mọi giá các kho tàng huyết mạch!" },
                    { at: 12, who: "TRẮC THỦ", text: "Tốp B-52 bay giãn cách đội hình 3 km! Nhiễu ALQ-117 quét rất nhanh trên dải tần 2975 MHz!" },
                    { at: 28, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Tiểu đoàn 82 sẵn sàng phần tử đón lõng! Chờ thời cơ địch bay bằng cắt bom!" },
                    { at: 60, who: "ĐÀI QUAN SÁT", text: "Cụm đèn chiếu Long Biên quét sáng rực góc trời Gia Lâm! Đã thấy bóng dáng B-52!" },
                    { at: 105, who: "SỞ CHỈ HUY", text: "Khóa mục tiêu dẫn đầu tốp 2! Không cho chúng tiếp cận kho dầu Đức Giang!" },
                    { at: 150, who: "TRẮC THỦ", text: "Tín hiệu phản xạ rất rõ nét! Bấm nút bám tự động!" },
                    { at: 195, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Phóng đạn! Tên lửa bay thẳng vào tim mục tiêu!" },
                    { at: 235, who: "SỞ CHỈ HUY", text: "Mục tiêu bị tiêu diệt! Kho xăng Đức Giang được bảo vệ an toàn tuyệt đối!" }
                ],
                lines: {
                    clean: "Đã bắt chắc B-52 hướng Giáp Bát! Phóng!",
                    shift: "Địch chuyển kênh gây nhiễu! Nhảy tần (Q / E) bám mục tiêu!",
                    kill: "Trúng rồi! Xác B-52 rơi tại ngoại thành phía Đông!",
                    win: "Tiểu đoàn 82 hoàn thành vẻ vang nhiệm vụ bảo vệ mạch máu giao thông Thủ đô!"
                },
                history: [
                    "Đêm 23/12/1972, không quân Mỹ dùng 54 lần chiếc B-52 ném bom các cơ sở hậu cần trọng yếu, nhưng hệ thống phòng không dày đặc của ta đã bảo vệ an toàn phần lớn kho xăng Đức Giang.",
                    "Quân dân miền Bắc bắn rơi <b>4 máy bay địch</b>, trong đó có <b>2 chiếc B-52</b> và 1 tiêm kích F-4.",
                    "Tỷ lệ tổn thất cao liên tục khiến các phi công B-52 tại căn cứ Guam và U-Tapao bắt đầu xuất hiện tâm lý hoang mang, phản chiến, từ chối bay xuất kích."
                ]
            },
            {
                id: "m7",
                story: "Đêm 24 tháng 12 năm 1972. Trước áp lực quốc tế và thiệt hại ngoài dự liệu, Mỹ chuẩn bị tạm ngừng ném bom 36 giờ nhân dịp Giáng sinh. Nhưng trước giờ ngừng bắn, địch điên cuồng tung đợt ném bom dữ dội đánh ga Kép, Thái Nguyên và cửa ngõ Thủ đô.",
                date: "24.12.1972",
                dateLabel: "Đêm 24/12/1972",
                clock: [19, 40],
                title: "Trước giờ ngừng bắn Noel",
                unit: "Tiểu đoàn 71 · Trung đoàn 285",
                place: "Phía Đông Bắc Hà Nội – Ga Kép",
                mode: "SAM2",
                camera: "DECK",
                briefing: [
                    "Trước thời điểm 24h ngày 24/12 – thời điểm Nhà Trắng tuyên bố tạm ngừng ném bom 36 tiếng, không quân chiến lược Mỹ liều mạng mở đợt tập kích quy mô lớn.",
                    "Địch nhắm vào ga Kép, sân bay Kép và các tuyến đường sắt kết nối Hà Nội với biên giới phía Bắc.",
                    "Tiểu đoàn 71 kiên cường bám trận địa đón đánh các tốp B-52 từ hướng biển và hướng Đông Bắc tràn vào. Phải giáng đòn tiêu diệt dứt khoát trước nửa đêm."
                ],
                forces: "địch tung <b>45 lần chiếc B-52</b> ném bom dồn dập trước giờ Giáng sinh.",
                kills: 2, ammo: 6, timeLimit: 255, speed: 1.1,
                waves: [3, 26, 56, 88],
                jam: {"power": 7.2, "barrage": 0.15, "retune": 22, "lookThrough": 1.7, "chaff": true, "startFreq": 3030},
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: "SỞ CHỈ HUY", text: "Toàn đơn vị sẵn sàng! Địch ném bom dồn dập trước thời khắc tạm ngừng ném bom Noel!" },
                    { at: 12, who: "TRẮC THỦ", text: "Tốp B-52 tiến vào từ hướng Đông Bắc qua ga Kép cự ly 40 km! Bão nhiễu rải chaff rất rộng!" },
                    { at: 30, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Giữ vững trận địa! Địch muốn tạo áp lực tâm lý trước Giáng sinh. Quyết không cho chúng lọt lưới!" },
                    { at: 65, who: "ĐÀI RADAR 291", text: "Phát hiện tốp B-52 thứ hai đang bay chúc mũi xuống độ cao 8.500m!" },
                    { at: 110, who: "TRẮC THỦ", text: "Đã bắt được tín hiệu trung tâm! Nhảy tần số Q / E tránh nhiễu thành công!" },
                    { at: 155, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Phóng đạn! Cả hai quả đạn mang theo lời thề chiến thắng vút lên trời xanh!" },
                    { at: 200, who: "SỞ CHỈ HUY", text: "B-52 bốc cháy dữ dội trên bầu trời ga Kép! Đòn trừng phạt đanh thép trước giờ Noel!" },
                    { at: 235, who: "ĐÀI QUAN SÁT", text: "Đúng 24h, địch buộc phải ngừng ném bom. Chiến công xuất sắc của toàn mặt trận!" }
                ],
                lines: {
                    clean: "Đã khóa mục tiêu hướng Đông Bắc! Phóng!",
                    shift: "Địch tăng công suất gây nhiễu! Nhảy tần (Q / E) ngay!",
                    kill: "Trúng đạn rồi! B-52 rơi tại chỗ trên bầu trời phía Bắc!",
                    win: "Tiểu đoàn 71 giáng đòn sấm sét khép lại giai đoạn 1 của chiến dịch!"
                },
                history: [
                    "Đêm 24/12/1972, quân dân miền Bắc bắn rơi thêm <b>2 chiếc B-52</b> và nhiều máy bay chiến thuật trước khi lệnh tạm ngừng ném bom có hiệu lực.",
                    "Sau 7 ngày đêm chiến đấu liên tục, quân dân ta đã bắn rơi tổng cộng <b>53 máy bay Mỹ, trong đó có 23 chiếc B-52</b>, giáng một đòn chí mạng vào lực lượng răn đe hạt nhân chiến lược của Lầu Năm Góc.",
                    "Đúng 24 giờ ngày 24/12, Tổng thống Nixon buộc phải ra lệnh tạm ngừng ném bom 36 giờ lấy cớ nghỉ lễ Noel, nhưng thực chất là để củng cố lại lực lượng đang suy sụp nghiêm trọng."
                ]
            },
            {
                id: "m8",
                story: "Ngày 25 tháng 12 năm 1972, ngày lễ Giáng sinh. Địch tạm ngừng ném bom 36 giờ. Bộ Tư lệnh Quân chủng PK-KQ nhận định: địch tạm dừng để củng cố lực lượng, sau Noel chắc chắn sẽ đánh ác liệt hơn. Thời khắc này quý hơn vàng: nạp đạn, cân chỉnh radar, cơ động trận địa sẵn sàng giáng trả.",
                date: "25.12.1972",
                dateLabel: "Ngày 25/12/1972",
                clock: [14, 0],
                title: "Thời khắc quý hơn vàng",
                unit: "Tiểu đoàn 77 & Trung đoàn 257",
                place: "Ngoại thành Hà Nội – Cơ động trận địa",
                mode: "SAM2",
                camera: "DECK",
                briefing: [
                    "Ngày 25/12 là khoảng lặng chiến lược vô cùng quý giá. Toàn bộ các trung đoàn tên lửa, pháo cao xạ khẩn trương cơ động trận địa dự bị, tiếp nhận đạn tên lửa mới vận chuyển từ Quân khu 4 ra.",
                    "Địch không ném bom rải thảm B-52 ban ngày nhưng vẫn cho máy bay trinh sát không người lái SR-71 và tiêm kích F-111 bay luồn lách thăm dò trận địa của ta.",
                    "Nhiệm vụ: Cảnh giác cao độ, bắt bám và tiêu diệt các tốp máy bay trinh sát xâm nhập tầng cao, bảo vệ tuyệt đối bí mật vị trí bố phòng mới."
                ],
                forces: "địch tạm ngừng B-52, tung <b>máy bay trinh sát không người lái tầng cao và F-111</b> luồn lách do thám.",
                kills: 1, ammo: 4, timeLimit: 220, speed: 1.15,
                waves: [3, 35, 75],
                jam: {"power": 6.0, "barrage": 0.1, "retune": 18, "lookThrough": 2.0, "chaff": false, "startFreq": 2940},
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: "SỞ CHỈ HUY", text: "Ngày Noel địch tạm ngừng ném bom B-52 nhưng vẫn cho máy bay trinh sát tầng cao xâm nhập! Toàn đơn vị giữ vững cảnh giác!" },
                    { at: 12, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Tổ xe nạp đạn khẩn trương lắp tên lửa mới lên các bệ! Cân chỉnh góc đón cho radar Fan Song!" },
                    { at: 25, who: "TRẮC THỦ", text: "Phát hiện mục tiêu bay nhanh ở độ cao 12.000m hướng Tây Bắc! Tốc độ hơn 1000 km/h!" },
                    { at: 50, who: "SỞ CHỈ HUY", text: "Đó là tốp máy bay xâm nhập trinh sát chụp ảnh trận địa! Bám chắc mục tiêu, không để chúng mang tin tức về!" },
                    { at: 85, who: "TRẮC THỦ", text: "Ăng-ten Fan Song đã bắt trúng cánh sóng! Tín hiệu cực kỳ ổn định tại 2940 MHz!" },
                    { at: 120, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Phóng đạn! Quả tên lửa V-750 bay vút lên bầu trời ban ngày!" },
                    { at: 160, who: "ĐÀI QUAN SÁT", text: "Mục tiêu nổ tung trên tầng bình lưu! Mảnh vỡ rơi rải rác trên vùng đồi ngoại thành!" },
                    { at: 195, who: "SỞ CHỈ HUY", text: "Bắn rơi mục tiêu xuất sắc! Hoàn tất cơ động trận địa, chuẩn bị đón đêm quyết chiến lịch sử sau Noel!" }
                ],
                lines: {
                    clean: "Đã bắt trúng mục tiêu trinh sát xâm nhập! Phóng!",
                    shift: "Mục tiêu đổi góc lượn! Nhảy tần (Q / E) bám chắc!",
                    kill: "Bắn hạ mục tiêu xâm nhập! Bảo vệ tuyệt mật trận địa!",
                    win: "Tiểu đoàn hoàn thành xuất sắc nhiệm vụ bảo vệ trận địa ngày Noel!"
                },
                history: [
                    "Ngày 25/12/1972, Bộ Tư lệnh Quân chủng Phòng không - Không quân họp hội nghị rút kinh nghiệm tác chiến toàn diện sau 7 ngày đêm đầu tiên.",
                    "Hội nghị dự báo chính xác: Sau 36 giờ ngừng ném bom Noel, địch chắc chắn sẽ tập trung lực lượng tối đa đánh ồ ạt, ném bom hủy diệt nội thành Hà Nội vào đêm 26/12.",
                    "Trong ngày 25/12, các đoàn xe vận tải của Tổng cục Hậu cần đã vượt qua bom đạn, kịp thời tiếp tế hàng trăm quả tên lửa V-750 từ Quân khu 4 ra bổ sung cho các bệ phóng bảo vệ Hà Nội."
                ]
            },
            {
                id: "m9",
                story: "Đêm 26 tháng 12 năm 1972, đêm quyết chiến lịch sử. Vừa hết giờ ngừng bắn Noel, Mỹ tung hơn 100 lần chiếc B-52 từ nhiều hướng đồng loạt ném bom rải thảm tàn khốc xuống phố Khâm Thiên và khu đông dân. Hợp đồng tác chiến toàn mặt trận giáng đòn sấm sét.",
                date: "26.12.1972",
                dateLabel: "Đêm 26/12/1972",
                clock: [22, 5],
                title: "Khâm Thiên – Đòn trả lời đanh thép",
                unit: "Trung đoàn 261 & Trung đoàn 257",
                place: "Nội thành Hà Nội – Phố Khâm Thiên – Định Công",
                mode: "SAM2",
                camera: "DECK",
                briefing: [
                    "Đúng 22h05 đêm 26/12, vừa hết 36 giờ ngừng ném bom, địch đồng loạt tung <b>105 lần chiếc B-52</b> (phía Mỹ ghi 120 lần chiếc) cùng 110 lần máy bay tiêm kích tấn công ồ ạt từ nhiều hướng: Tây Bắc, Tây Nam và Đông Nam.",
                    "Bom rải thảm dã man tàn phá phố Khâm Thiên, khu Định Công, An Dương, chôn vùi hàng trăm người dân vô tội. Khâm Thiên chìm trong biển lửa.",
                    "Toàn bộ lưới lửa tên lửa phòng không Hà Nội vào trận quyết chiến lịch sử. Hãy giữ vững ý chí, đánh hiệp đồng tập trung hỏa lực bắn rơi tại chỗ pháo đài bay địch."
                ],
                forces: "cuộc tập kích lớn nhất lịch sử: <b>105 lần chiếc B-52</b> (phía Mỹ ghi 120 lần chiếc) dội bom cùng hơn 110 lần máy bay tiêm kích yểm hộ từ 3 hướng.",
                kills: 7, ammo: 18, timeLimit: 320, speed: 1.15,
                waves: [3, 12, 24, 40, 58, 76, 95, 115],
                jam: {"power": 8.0, "barrage": 0.16, "retune": 25, "lookThrough": 1.6, "chaff": true, "startFreq": 2930},
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: "SỞ CHỈ HUY", text: "Báo động toàn mặt trận! Địch tung hơn 100 lần chiếc B-52 đánh ồ ạt từ ba hướng! Đây là đêm quyết chiến lịch sử!" },
                    { at: 10, who: "LOA PHÒNG KHÔNG", text: "Còi báo động rú vang liên tục! Toàn dân xuống hầm! Các chiến sĩ tự vệ, dân quân vào vị trí chiến đấu!" },
                    { at: 20, who: "TRẮC THỦ", text: "Bão nhiễu dày đặc chưa từng thấy! Màn hiện sóng SNR-75 như sôi lên! Đang dò tần số thoát nhiễu!" },
                    { at: 38, who: "SỞ CHỈ HUY", text: "Bom rơi xuống phố Khâm Thiên rồi! Khâm Thiên đang bốc cháy! Các đồng chí trắc thủ, bắn cháy B-52 trả thù cho Khâm Thiên!" },
                    { at: 65, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Tất cả các bệ phóng sẵn sàng! Bắn hiệp đồng tập trung hỏa lực! Khóa chặt tốp B-52 số 1!" },
                    { at: 105, who: "ĐÀI QUAN SÁT", text: "Một chiếc B-52 trúng đạn bốc cháy rừng rực trên bầu trời Định Công! Rơi tại chỗ rồi!" },
                    { at: 150, who: "TRẮC THỦ", text: "Tốp B-52 thứ ba đang lao vào trung tâm! Đã bắt được dải nhiễu bản thân!" },
                    { at: 195, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Phóng đạn! Tiếp tục phóng loạt hai quả! Không để chúng cắt bom vào khu dân cư!" },
                    { at: 240, who: "SỞ CHỈ HUY", text: "Tiểu đoàn 76, 78, 57 liên tiếp bắn rơi B-52! Hà Nội đang giáng đòn sấm sét bẻ gãy đòn thù!" },
                    { at: 280, who: "ĐÀI QUAN SÁT", text: "Đội hình B-52 địch tan vỡ hoàn toàn, hoảng loạn vứt bom bừa bãi tháo chạy ra biển!" }
                ],
                lines: {
                    clean: "Khóa chặt pháo đài bay Khâm Thiên! Bắn trả thù!",
                    shift: "Địch cuống cuồng nhảy tần số! Nhảy tần (Q / E) truy đuổi!",
                    kill: "B-52 bốc cháy như đuốc rơi xuống Định Công! Khâm Thiên đã trả thù!",
                    win: "Đêm quyết chiến toàn thắng! Đập tan đòn tập kích lớn nhất của Lầu Năm Góc!"
                },
                history: [
                    "Đêm 26/12/1972 là cuộc tập kích hủy diệt lớn nhất trong toàn bộ chiến dịch: bom B-52 tàn sát phố Khâm Thiên làm <b>287 người chết, 290 người bị thương</b>, phá hủy hoàn toàn gần 2.000 ngôi nhà.",
                    "Trong đêm quyết chiến lịch sử này, quân dân miền Bắc lập chiến công vang dội: bắn rơi <b>8 chiếc B-52</b> (riêng Hà Nội hạ 5 chiếc, có 4 chiếc rơi tại chỗ), cùng 10 máy bay chiến thuật khác.",
                    "Đòn giáng trả mãnh liệt trong đêm 26/12 đã làm phá sản hoàn toàn toan tính quân sự của Tổng thống Nixon, đẩy không quân Mỹ vào thế thất bại không thể đảo ngược."
                ]
            },
            {
                id: "m10",
                story: "Đêm 27 tháng 12 năm 1972. Phi công Phạm Tuân lái chiếc MiG-21 số hiệu 5121 cất cánh từ sân bay dã chiến Yên Bái, bay thấp vượt qua hàng rào tiêm kích F-4 rồi vọt lên tầng cao. Lần đầu tiên trong lịch sử, én bạc MiG-21 xuất kích bắn rơi pháo đài bay B-52 trên không.",
                date: "27.12.1972",
                dateLabel: "Đêm 27/12/1972",
                clock: [22, 20],
                title: "Phạm Tuân trên bầu trời Mộc Châu",
                unit: "Phi công Phạm Tuân · Trung đoàn không quân 921",
                place: "Vùng trời Mộc Châu (Sơn La) – Cất cánh từ Yên Bái",
                mode: "MIG21",
                camera: "COCKPIT",
                pilot: "5121",
                briefing: [
                    "Đêm 27/12, địch dùng 54 lần chiếc B-52 đánh phá Hà Nội. Để tránh radar tiêm kích F-4 yểm hộ dày đặc, phi công Phạm Tuân bí mật cất cánh từ đường băng dã chiến ngắn tại Yên Bái.",
                    "Bay men theo thung lũng ở độ cao thấp, sau đó tắt đài vô tuyến, theo lệnh Sở chỉ huy bất ngờ vọt lên độ cao 10.000m tiếp cận tốp B-52 từ phía sau trên vùng trời Mộc Châu.",
                    "Bạn đang ở trong buồng lái MiG-21 số hiệu 5121. Tăng ga bật tăng lực, bám sát góc đuôi B-52 trong góc ±35°, đưa mục tiêu vào vòng ngắm ASP-PFD đến khi đèn <b>ЗАХВАТ</b> sáng đỏ rồi ấn phóng tên lửa K-13!"
                ],
                forces: "địch dùng <b>54 lần chiếc B-52</b> đánh phá Hà Nội. Không quân nhân dân Việt Nam bí mật xuất kích từ sân bay ngắn dã chiến.",
                kills: 1, ammo: 2, timeLimit: 180, speed: 1.2,
                waves: [4, 60],
                jam: null,
                controls: CONTROLS_MIG21,
                radio: [
                    { at: 1, who: "SỞ CHỈ HUY", text: "5121, nghe rõ! Bạn đã cất cánh an toàn từ sân bay dã chiến Yên Bái! Giữ độ cao thấp bay qua dãy Hoàng Liên Sơn!" },
                    { at: 10, who: "SỞ CHỈ HUY", text: "5121, vọt lên độ cao 10.000m! Bật radar, hướng bay 210 độ qua Mộc Châu đón đầu tốp B-52!" },
                    { at: 22, who: "5121", text: "5121 nghe rõ! Tôi đã phát hiện luồng phụt sáng của B-52 trên nền trời đêm Tây Bắc!" },
                    { at: 38, who: "SỞ CHỈ HUY", text: "Vượt qua hàng rào tiêm kích F-4! Tiếp cận góc đuôi B-52, cự ly 4 km!" },
                    { at: 58, who: "5121", text: "Đang tăng lực bám đuổi! Cự ly đang rút ngắn. Đưa mục tiêu vào vòng ngắm ASP-PFD!" },
                    { at: 85, who: "SỞ CHỈ HUY", text: "Đèn đỏ ЗАХВАТ sáng chưa? Khóa chắc đầu dò hồng ngoại rồi phóng cả 2 quả đạn!" },
                    { at: 115, who: "5121", text: "Đèn ЗАХВАТ đã sáng đỏ! Có tiếng rít gầm trong tai nghe! Phóng tên lửa K-13!" },
                    { at: 145, who: "5121", text: "Báo cáo Sở chỉ huy: Hai quả tên lửa nổ trùm lên B-52! Pháo đài bay địch đã bốc cháy rơi xuống rừng núi Mộc Châu!" }
                ],
                lines: {
                    clean: "Đèn đỏ ЗАХВАТ sáng rực — đã khóa luồng nhiệt B-52! Phóng K-13!",
                    shift: "Mục tiêu cơ động gắt! Giữ chặt cần lái bám góc đuôi!",
                    kill: "Tên lửa K-13 phát nổ trùm thân B-52! Máy bay địch bốc cháy rơi tại chỗ!",
                    win: "5121 đã bắn rơi B-52 — kỳ tích Không quân nhân dân Việt Nam!"
                },
                history: [
                    "22 giờ 20 phút đêm 27/12/1972, Thượng úy phi công <b>Phạm Tuân</b> lái chiếc tiêm kích MiG-21MF số hiệu 5121 cất cánh từ sân bay Yên Bái, bắn hạ 1 chiếc B-52 trên vùng trời Mộc Châu – Sơn La, rồi hạ cánh an toàn.",
                    "Đây là chiến công đầu tiên của Không quân nhân dân Việt Nam bắn rơi tại chỗ siêu pháo đài bay B-52 trên không, đập tan huyền thoại B-52 không thể bị tiêm kích đánh chặn.",
                    "Cũng trong đêm 27/12, Tiểu đoàn 72 (Trung đoàn 285) bắn rơi 1 chiếc B-52 cắm xác xuống <b>hồ Hữu Tiệp</b> (làng hoa Ngọc Hà, Ba Đình), nay trở thành di tích lịch sử trường tồn giữa lòng Thủ đô."
                ]
            },
            {
                id: "m11",
                story: "Đêm 28 tháng 12 năm 1972. Phi công Vũ Xuân Thiều xuất kích trên chiếc MiG-21 số hiệu 046 từ sân bay Cẩm Thủy. Vượt qua màn nhiễu dày đặc, anh tiếp cận tốp B-52. Ở cự ly quá gần, sau khi phóng hai quả tên lửa K-13, người anh hùng đã dũng cảm biến chiếc máy bay của mình thành quả tên lửa thứ ba tiêu diệt pháo đài bay địch.",
                date: "28.12.1972",
                dateLabel: "Đêm 28/12/1972",
                clock: [21, 48],
                title: "Vũ Xuân Thiều – Quả tên lửa thứ ba",
                unit: "Phi công Vũ Xuân Thiều · Trung đoàn không quân 927",
                place: "Vùng trời Cẩm Thủy – Nà Sản",
                mode: "MIG21",
                camera: "COCKPIT",
                pilot: "046",
                briefing: [
                    "Đêm 28/12, địch điên cuồng tung các tốp B-52 đánh phá các tuyến giao thông liên tỉnh. Thượng úy phi công Vũ Xuân Thiều được lệnh xuất kích từ sân bay dã chiến Cẩm Thủy (Thanh Hóa).",
                    "Được Sở chỉ huy dẫn đường khéo léo, chiếc MiG-21 số hiệu 046 bay vọt lên vùng trời Nà Sản – Sơn La, đón lõng tốp B-52 đang trên đường tháo chạy.",
                    "Khoảng cách rút ngắn rất nhanh, màn đêm đen đặc. Khi đèn <b>ЗАХВАТ</b> sáng, hãy phóng tên lửa K-13. Nếu mục tiêu chưa rơi ở cự ly cận chiến, tinh thần quyết tử vì Tổ quốc sẽ dẫn lối cho chiến công bất tử."
                ],
                forces: "địch huy động <b>khoảng 60 lần chiếc B-52</b> đánh phá khu vực quanh Hà Nội và các tuyến giao thông liên tỉnh.",
                kills: 1, ammo: 2, timeLimit: 180, speed: 1.2,
                waves: [4, 50],
                jam: null,
                controls: CONTROLS_MIG21,
                radio: [
                    { at: 1, who: "SỞ CHỈ HUY", text: "046, nghe rõ! Bạn đã cất cánh từ sân bay dã chiến Cẩm Thủy! Hướng bay 330 độ về phía Nà Sản!" },
                    { at: 12, who: "046", text: "046 nghe rõ! Trần mây dày, tôi đang bay xuyên mây lên độ cao 10.500m!" },
                    { at: 25, who: "SỞ CHỈ HUY", text: "Chú ý tiêm kích F-4 địch đang bay kèm bảo vệ! Tiếp cận mục tiêu từ phía sau bán cầu!" },
                    { at: 45, who: "046", text: "Đã phát hiện B-52! Vệt khói động cơ và đèn hàng hải của địch đang ở ngay phía trước!" },
                    { at: 70, who: "SỞ CHỈ HUY", text: "046, bật tăng lực áp sát! Cự ly phóng tối ưu 2 km, bắn xong cơ động thoát ly ngay!" },
                    { at: 100, who: "046", text: "Đèn đỏ ЗАХВАТ đã sáng! Tôi đã phóng cả 2 quả đạn K-13! Đạn trúng cánh B-52 nhưng nó vẫn cố bay!" },
                    { at: 130, who: "046", text: "Cự ly quá gần, chỉ còn vài trăm mét! Tôi quyết tâm tiêu diệt nó! Xin chào Sở chỉ huy!" },
                    { at: 155, who: "SỞ CHỈ HUY", text: "046! 046 nghe rõ trả lời!... Pháo đài bay B-52 đã nổ tung rực sáng bầu trời Tây Bắc!" }
                ],
                lines: {
                    clean: "Đèn đỏ ЗАХВАТ rực sáng — bám chắc mục tiêu! Phóng K-13!",
                    shift: "Mục tiêu cơ động né tránh! Tăng hết ga áp sát!",
                    kill: "B-52 nổ tung rực sáng! Chiến công anh dũng tột bậc của Anh hùng Vũ Xuân Thiều!",
                    win: "Chiếc MiG-21 số hiệu 046 đã trở thành quả tên lửa thứ ba bất tử!"
                },
                history: [
                    "21 giờ 48 phút đêm 28/12/1972, Thượng úy phi công <b>Vũ Xuân Thiều</b> (Trung đoàn 927) lái MiG-21bis số hiệu 046 xuất kích từ sân bay Cẩm Thủy, dũng cảm bắn hạ 1 chiếc B-52 trên vùng trời Nà Sản – Sơn La.",
                    "Sau khi phóng 2 quả tên lửa K-13 ở cự ly quá gần, chiếc B-52 bốc cháy dữ dội nhưng chưa rơi hẳn, Vũ Xuân Thiều đã lao thẳng chiếc MiG-21 của mình vào pháo đài bay địch, anh dũng hy sinh vì bầu trời Tổ quốc.",
                    "Hành động anh hùng của Vũ Xuân Thiều được vinh danh là biểu tượng sáng ngời của ý chí quyết tử cho Tổ quốc quyết sinh, biến chiếc máy bay thành \"quả tên lửa thứ ba\" tiêu diệt kẻ thù."
                ]
            },
            {
                id: "m12",
                story: "Đêm 29 tháng 12 năm 1972, đêm cuối cùng của chiến dịch 12 ngày đêm. Mười hai ngày đêm kiên cường đứng vững dưới mưa bom. Tiểu đoàn tên lửa 79 và 72 đón đánh những tốp B-52 cuối cùng, khép lại bản anh hùng ca Điện Biên Phủ trên không chấn động địa cầu.",
                date: "29.12.1972",
                dateLabel: "Đêm 29/12/1972",
                clock: [23, 16],
                title: "Trận đánh cuối cùng – Toàn thắng Điện Biên Phủ trên không",
                unit: "Tiểu đoàn 79 & Tiểu đoàn 72 · Trung đoàn 257",
                place: "Trận địa Kim Anh – Đa Phúc – Thái Nguyên",
                mode: "SAM2",
                camera: "DECK",
                briefing: [
                    "Sau 11 ngày đêm bị giáng đòn tiêu hao nặng nề, lực lượng B-52 của Mỹ hoàn toàn kiệt quệ về tinh thần và vũ khí. Đêm 29/12 là đêm cuối cùng của chiến dịch Linebacker II.",
                    "Địch tung những tốp B-52 cuối cùng đánh phá khu gang thép Thái Nguyên, Đồng Mỏ (Lạng Sơn) và sân bay Kim Anh.",
                    "Kho đạn tên lửa đã vơi sau nhiều ngày đêm chiến đấu ròng rã: tiểu đoàn chỉ còn những quả đạn quý giá cuối cùng trên bệ. Hãy chắt chiu từng phát bắn, bám chắc phương pháp 3 điểm để kết thúc chiến dịch trong khúc ca toàn thắng."
                ],
                forces: "từ 23 giờ 16 phút: <b>60 lần chiếc B-52</b> (30 đánh gang thép Thái Nguyên – Trại Cau, 18 Đồng Mỏ, 12 Kim Anh). Hai phía cùng ghi 60 lần chiếc.",
                kills: 2, ammo: 6, timeLimit: 260, speed: 1.2,
                waves: [3, 28, 55, 80],
                jam: {"power": 8.5, "barrage": 0.16, "retune": 26, "lookThrough": 1.6, "chaff": true, "startFreq": 3075},
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: "SỞ CHỈ HUY", text: "Toàn tiểu đoàn vào vị trí! Đêm nay là trận quyết chiến chiến lược cuối cùng! Mỹ tung lực lượng B-52 đánh Kim Anh, Thái Nguyên, Lạng Sơn!" },
                    { at: 10, who: "TRẮC THỦ", text: "Kho đạn đã vơi sau 11 ngày đêm chiến đấu ròng rã! Tiểu đoàn chỉ còn những quả đạn V-750 quý giá cuối cùng!" },
                    { at: 24, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Mỗi quả đạn là mồ hôi nước mắt của đồng bào công binh, hậu cần! Không được bắn phí một quả nào! Bám thật chắc mới phóng!" },
                    { at: 45, who: "ĐÀI RADAR 291", text: "Tốp B-52 thứ hai bay vào hướng Kim Anh! Nhiễu cực mạnh, địch thay đổi tần số liên tục!" },
                    { at: 75, who: "ĐÀI QUAN SÁT", text: "Bộ đội phòng không và Không quân đang hiệp đồng chặt chẽ. Cả nước đang dõi theo từng phút giây của Hà Nội!" },
                    { at: 110, who: "SỞ CHỈ HUY", text: "Đợt tập kích cuối cùng của địch! Giữ vững trận địa, bình tĩnh vạch nhiễu tìm thù!" },
                    { at: 155, who: "TRẮC THỦ", text: "Tín hiệu phản xạ của B-52 đã hiện rõ trên màn hiện sóng SNR-75! Sẵn sàng hỏa lực!" },
                    { at: 195, who: "SỞ CHỈ HUY", text: "Các tốp B-52 cuối cùng đang hoảng hốt tìm đường thoát ly ra biển! Giáng đòn sấm sét cuối cùng!" },
                    { at: 235, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Khóa mục tiêu! Bắn rơi B-52, khép lại 12 ngày đêm Điện Biên Phủ trên không toàn thắng!" }
                ],
                lines: {
                    clean: "Bám chắc rồi! Cự ly phóng tối ưu!",
                    shift: "Địch lại dò ra tần số! Nhảy tần (Q / E)!",
                    kill: "Trúng! B-52 bốc cháy dữ dội!",
                    win: "Tiểu đoàn 79 đã bắn rơi B-52 trong đêm cuối cùng — Toàn thắng chiến dịch Điện Biên Phủ trên không!"
                },
                history: [
                    "23 giờ 29 phút đêm 29/12/1972, Tiểu đoàn tên lửa 79 (Trung đoàn 257) tại trận địa Đa Phúc phóng 2 quả đạn, bắn rơi tại chỗ <b>1 chiếc B-52</b> rơi tại Phúc Yên – Vĩnh Phú, khép lại chiến dịch 12 ngày đêm lịch sử.",
                    "<b>7 giờ sáng ngày 30/12/1972</b>, Tổng thống Mỹ Richard Nixon buộc phải tuyên bố ngừng hoàn toàn chiến dịch ném bom Linebacker II từ vĩ tuyến 20 trở ra và chấp nhận ngồi lại bàn đàm phán Paris.",
                    "Sau 12 ngày đêm, quân dân miền Bắc bắn rơi <b>81 máy bay Mỹ, trong đó có 34 chiếc B-52, 5 chiếc F-111</b>, bắt sống 43 phi công Mỹ. Ngày <b>27/1/1973</b>, Hiệp định Paris được ký kết, buộc quân đội viễn chinh Mỹ phải rút hoàn toàn khỏi Việt Nam."
                ]
            }
        ];

console.log('✓ Successfully evaluated MISSIONS array. Total missions: ' + MISSIONS.length);
let totalRadio = 0;
MISSIONS.forEach((m, idx) => {
    console.log(`  [Mission ${idx+1}] ID: ${m.id} | Mode: ${m.mode} | Title: ${m.title}`);
    console.log(`    Date: ${m.dateLabel} | Target Kills: ${m.kills} | Ammo: ${m.ammo} | TimeLimit: ${m.timeLimit}s`);
    const rCount = m.radio ? m.radio.length : 0;
    totalRadio += rCount;
    console.log(`    Radio transmissions: ${rCount}`);
    if (m.radio) {
        m.radio.forEach(rc => {
            if (typeof rc.at !== 'number' || !rc.who || !rc.text) {
                console.error(`    ✗ Malformed radio item in mission ${idx+1}:`, rc);
            }
        });
        const lastAt = m.radio[m.radio.length - 1].at;
        console.log(`    Radio timeline span: ${m.radio[0].at}s -> ${lastAt}s (Time limit: ${m.timeLimit}s)`);
    }
});
console.log(`✓ Total radio transmissions across campaign: ${totalRadio}`);
