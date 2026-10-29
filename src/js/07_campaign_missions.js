/* ============================================================================
   14. CAMPAIGN: 12 MISSIONS FOLLOWING THE REAL TIMELINE OF 18/12 – 29/12/1972
   Figures are the Vietnamese official record unless stated otherwise.
   ============================================================================ */
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
        place: "Trận địa Cổ Loa, Đông Anh",
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
        jam: { "power": 5, "barrage": 0.1, "retune": 14, "lookThrough": 2.2, "chaff": false, "startFreq": 2960 },
        controls: CONTROLS_SAM2,
        radio: [
            { at: 1, who: "SỞ CHỈ HUY", text: "Toàn tiểu đoàn vào cấp 1! Địch mở chiến dịch Linebacker II, tốp B-52 đang tiến vào từ hướng Tây Bắc cự ly 50 km!" },
            { at: 7, who: "LOA PHÒNG KHÔNG", text: "Đồng bào chú ý! Máy bay địch cách Hà Nội 50 km! Nhân dân khẩn trương xuống hầm trú ẩn!" },
            { at: 16, who: "TRẮC THỦ", text: "Màn hiện sóng SNR-75 toàn bão nhiễu tích cực! Đang đổi tần số bám dải nhiễu!" },
            { at: 28, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Tốp B-52 số 1 đã vào cự ly 35 km! Chờ tín hiệu phản xạ ổn định. Ba bệ phóng tên lửa đã sẵn sàng!" },
            { at: 42, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Dải phản xạ B-52 đã hiện rõ trên màn hiện sóng! Chuẩn bị phần tử phóng đạn!" },
            { at: 65, who: "ĐÀI RADAR 291", text: "Báo cáo: Tốp B-52 thứ hai xuất hiện ở cự ly 45 km, trần bay 10.000m hướng về phía Đông Anh!" },
            { at: 95, who: "ĐÀI QUAN SÁT", text: "Đèn chiếu phòng không sân bay Nội Bài đã bắt được vệt khói mục tiêu! Pháo 100mm đang bắn đón chặn đường bay!" },
            { at: 130, who: "SỞ CHỈ HUY", text: "Đợt tập kích thứ ba đang tiến vào! Giữ vững trận địa, quyết tâm bắn rơi tại chỗ pháo đài bay của địch!" },
            { at: 170, who: "TRẮC THỦ", text: "Máy gây nhiễu cơ động đổi tần số! Cơ động chuyển tần số bám sát mục tiêu!" },
            { at: 210, who: "SỞ CHỈ HUY", text: "Hơn 50 vạn đồng bào nội thành đang dõi theo trận địa ta! Khóa chặt mục tiêu, phóng đạn tiêu diệt!" }
        ],
        lines: {
            clean: "Đã bám chắc mục tiêu! Phóng đạn!",
            shift: "Máy gây nhiễu đã bám tần số của ta! Chuyển ngay tần số dự phòng!",
            kill: "Mục tiêu bốc cháy! B-52 rơi tại chỗ trên cánh đồng Phù Lỗ!",
            win: "Báo cáo Sở chỉ huy: Tiểu đoàn 59 đã bắn rơi B-52 đầu tiên!"
        },
        history: [
            "Khoảng <b>20 giờ 13 phút</b> đêm 18/12/1972, Tiểu đoàn 59 (Trung đoàn tên lửa 261) tại trận địa Cổ Loa – Tráng Việt phóng 2 quả đạn, bắn rơi chiếc B-52 đầu tiên của chiến dịch. Xác máy bay rơi trên cánh đồng Phù Lỗ – Đông Anh.",
            "Cùng đêm, các tiểu đoàn khác bắn rơi thêm B-52; Tiểu đoàn 77 bảo vệ hướng Tây Bắc bắn rơi 1 chiếc.",
            "Tổng cộng trong đêm mở màn, quân dân ta bắn rơi 3 chiếc B-52 (phía Mỹ thừa nhận mất 3 chiếc B-52 trong đêm đầu). Toàn bộ âm mưu đánh đòn bất ngờ của địch bị bẻ gãy ngay từ giờ phút đầu."
        ]
    },
    {
        id: "m2",
        story: "Đêm 19 rạng sáng 20 tháng 12 năm 1972. Sau thất bại đêm mở màn, địch thay đổi chiến thuật: cho các tốp B-52 chuyển hướng tiếp cận từ phía Tây và Tây Bắc. Trận địa Chèm của Tiểu đoàn 77 đón đầu.",
        date: "19.12.1972",
        dateLabel: "Đêm 19/12/1972",
        clock: [20, 0],
        title: "Vạch nhiễu vượt nửa góc",
        unit: "Tiểu đoàn 77 · Trung đoàn 257",
        place: "Trận địa Chèm – Thượng Cát",
        mode: "SAM2",
        camera: "DECK",
        briefing: [
            "Sau đêm đầu của chiến dịch, Mỹ tiếp tục điều chỉnh đường bay và tăng cường các biện pháp gây nhiễu điện tử nhằm đối phó với mạng lưới phòng không miền Bắc. Đêm 19 rạng sáng 20/12/1972, theo thống kê phía Mỹ, có 93 lần xuất kích B-52 trong đêm.",
            "Tiểu đoàn 77, Trung đoàn 257, tại trận địa Chèm do đồng chí Đinh Thế Văn chỉ huy, tiếp tục bảo vệ hướng Tây và Tây Bắc Thủ đô. Bộ đội tên lửa kiên trì phân biệt tín hiệu mục tiêu giữa các dải nhiễu, vận dụng những phương pháp điều khiển và bám sát phù hợp để đối phó với B-52.",
            "Địch tăng cường gây nhiễu radar và sử dụng máy bay chế áp phòng không mang tên lửa chống radar Shrike. Các đơn vị phải chủ động phát sóng hợp lý, bám sát mục tiêu và cơ động khi cần thiết."
        ],
        forces: "địch huy động <b>93 lần chiếc B-52 (theo phía Mỹ)</b> cùng hàng trăm lượt máy bay chiến thuật F-4, F-105 yểm trợ dọn đường.",
        kills: 2, ammo: 6, timeLimit: 260, speed: 1.0,
        waves: [3, 20, 50, 85],
        jam: { "power": 5.5, "barrage": 0.11, "retune": 16, "lookThrough": 2.1, "chaff": false, "startFreq": 2990 },
        controls: CONTROLS_SAM2,
        radio: [
            { at: 1, who: "SỞ CHỈ HUY", text: "Báo động toàn trận địa! Các tốp B-52 chuyển hướng tiếp cận từ phía Tây và Tây Bắc!" },
            { at: 8, who: "TRẮC THỦ", text: "Nhiễu tiêu cực và tích cực đan xen rất dày! Đang dò dải sóng sạch trên dải tần 2990 MHz!" },
            { at: 20, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Tiểu đoàn 77 chuẩn bị phần tử bắn đón nửa góc! Chờ mục tiêu vào cự ly hiệu quả 32 km!" },
            { at: 45, who: "ĐÀI RADAR 291", text: "Phát hiện tốp B-52 thứ hai đang bẻ ngoặt hướng vào Thượng Cát! Cảnh giác tên lửa Shrike chống radar!" },
            { at: 75, who: "SỞ CHỈ HUY", text: "Phát sóng ngắn! Bám chắc dải nhiễu bản thân B-52 rồi ấn nút phóng đạn!" },
            { at: 115, who: "TRẮC THỦ", text: "Tín hiệu phản xạ mục tiêu đã xuyên qua màn nhiễu! Bắt được mục tiêu số 1!" },
            { at: 160, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Phóng đạn đợt hai! Giữ cánh sóng điều khiển bám sát mục tiêu!" },
            { at: 210, who: "SỞ CHỈ HUY", text: "Địch đang tháo lui về phía Tây! Bắn đón chặn đường rút của pháo đài bay!" }
        ],
        lines: {
            clean: "Đã bắt chắc dải phản xạ B-52! Phóng đạn!",
            shift: "Địch đổi tần số gây nhiễu! Chuyển ngay tần số dự phòng!",
            kill: "Trúng rồi! B-52 bốc cháy dữ dội!",
            win: "Tiểu đoàn 77 hoàn thành xuất sắc nhiệm vụ bảo vệ cửa ngõ Tây Bắc!"
        },
        history: [
            "Đêm 19 rạng sáng 20/12/1972, không quân Mỹ huy động 87 lần chiếc B-52 tập kích Hà Nội và Hải Phòng, ném bom đánh phá Đài phát thanh Mễ Trì hòng dập tắt Tiếng nói Việt Nam.",
            "Tiểu đoàn 77 (Trung đoàn 257) tại trận địa Chèm kiên cường bám trận địa vạch nhiễu, cùng lưới lửa phòng không bắn rơi máy bay B-52 địch; Đài Mễ Trì bị trúng bom nhưng chỉ gián đoạn 9 phút rồi tiếp tục phát sóng từ trạm dự phòng.",
            "Chiến thuật phát sóng ngắn và đánh đón nửa góc của Tiểu đoàn trưởng Đinh Thế Văn tiếp tục được hoàn thiện, chuẩn bị cho chiến công bắn rơi tại chỗ B-52 ở Vạn Thắng (Ba Vì) vào đêm 20/12 tiếp theo."
        ]
    },
    {
        id: "m3",
        story: "Đêm 20 rạng sáng 21 tháng 12 năm 1972. Sau hai đêm đầu của Chiến dịch Linebacker II, không quân chiến lược Mỹ tiếp tục huy động lực lượng B-52 quy mô lớn, đánh phá Hà Nội và một số mục tiêu trọng yếu ở miền Bắc. Các khu vực mục tiêu quanh Thủ đô, trong đó có vùng ga Yên Viên, tiếp tục hứng chịu những đợt không kích dữ dội. Bầu trời Hà Nội lại rực sáng bởi bom đạn.",
        date: "20.12.1972",
        dateLabel: "Đêm 20/12/1972",
        clock: [20, 0],
        title: "Đêm rực lửa Yên Viên – Gia Lâm",
        unit: "Tiểu đoàn 93 · Trung đoàn 261",
        place: "Trận địa Phú Thụy (Gia Lâm) – Hướng ga Yên Viên",
        mode: "SAM2",
        camera: "DECK",
        briefing: [
            "Qua hai đêm đầu, các đơn vị phòng không rút kinh nghiệm về quy luật hoạt động của B-52. Các tốp B-52 lặp lại những đường bay tương đối cố định. Dù hệ thống gây nhiễu điện tử khiến radar gặp nhiều khó khăn, bộ đội ra-đa vẫn khai thác các dải nhiễu đặc trưng để phát hiện và nhận diện đội hình B-52. Các đơn vị tên lửa áp dụng phương pháp phát sóng ngắn hoặc ngắt quãng nhằm giảm nguy cơ bị tên lửa chống radar Shrike phát hiện.",
            "Đêm 20 rạng sáng 21/12, máy bay Mỹ tiếp tục đánh phá các mục tiêu tại Hà Nội và vùng phụ cận. Các máy bay F-4 trong lực lượng yểm trợ thả những dải kim loại gây nhiễu (chaff), tạo thêm tín hiệu phản xạ trên màn hình radar, khiến việc phân biệt mục tiêu thật trở nên khó khăn hơn.",
            "Để đối phó với nhiễu điện tử, các kíp tên lửa linh hoạt thay đổi phương pháp điều khiển và bám bắt mục tiêu. Tại Tiểu đoàn 93, sau hai quả đạn theo phương pháp ba điểm không đạt kết quả, quả thứ ba được bắn theo phương pháp “vượt nửa góc”, tiêu diệt một máy bay B-52 tại khu vực Yên Thường."
        ],
        forces: "Theo thống kê phía Mỹ, có <b>99 phi vụ B-52</b> cùng khoảng <b>99 phi vụ máy bay chiến thuật yểm trợ</b>.",
        kills: 7, ammo: 18, timeLimit: 320, speed: 1.0,
        waves: [3, 15, 30, 48, 66, 85, 105, 125],
        jam: { "power": 6.0, "barrage": 0.12, "retune": 18, "lookThrough": 2.0, "chaff": true, "startFreq": 3040 },
        controls: CONTROLS_SAM2,
        radio: [
            { at: 1, who: "SỞ CHỈ HUY", text: "Báo động toàn mặt trận! Đêm nay địch đưa gần 100 lần chiếc B-52 đánh phá ga Yên Viên, Gia Lâm và Đông Anh!" },
            { at: 8, who: "LOA PHÒNG KHÔNG", text: "Còi báo động rú vang toàn thành phố! Hỏa lực cao xạ các cửa ô đồng loạt sẵn sàng chiến đấu!" },
            { at: 16, who: "TRẮC THỦ", text: "F-4 đang rải dải kim loại chaff tạo hành lang nhiễu tiêu cực! Màn hiện sóng xuất hiện vô số mục tiêu giả li ti!" },
            { at: 28, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Kinh nghiệm Cẩm nang đỏ: Bám vào tâm dải nhiễu do máy gây nhiễu tích cực của B-52 phát ra! Không bám vào chaff!" },
            { at: 48, who: "TRẮC THỦ", text: "Đạn đang xuyên qua hành lang nhiễu tiêu cực! Giữ chắc cánh sóng bám sát thân B-52!" },
            { at: 75, who: "ĐÀI QUAN SÁT GIA LÂM", text: "Cầu Đuống, ga Yên Viên đang là hướng ném bom chính của địch! Đèn chiếu đang quét rực sáng bầu trời phía Bắc!" },
            { at: 110, who: "SỞ CHỈ HUY", text: "Tiểu đoàn 93 vừa bắn rơi tại chỗ 1 chiếc B-52 ở Yên Viên! Tiểu đoàn ta tiếp tục tiêu diệt tốp tiếp theo!" },
            { at: 145, who: "TRẮC THỦ", text: "Nhiễu lấn át kênh phương vị! Đổi tần số bám chắc dải nhiễu bản thân B-52!" },
            { at: 180, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Tổ nạp đạn khẩn trương lắp quả mới lên bệ! Cơ số đạn sẵn sàng, quyết chiến rực lửa!" },
            { at: 220, who: "SỞ CHỈ HUY", text: "Các tiểu đoàn 57, 77, 79 đang liên tiếp lập công! Bầu trời Hà Nội đêm nay rực lửa chiến thắng!" },
            { at: 260, who: "ĐÀI QUAN SÁT", text: "Đội hình B-52 địch bắt đầu hoảng loạn tách tốp tháo chạy! Đuổi đánh tiêu diệt đến cùng!" }
        ],
        lines: {
            clean: "Đã tách được mục tiêu khỏi dải nhiễu — bám chắc!",
            shift: "Địch dò theo tần số của ta! Chuyển ngay tần số dự phòng!",
            kill: "Trúng rồi! Thêm một chiếc B-52 bốc cháy dữ dội!",
            win: "Đêm rực lửa toàn thắng! Lập kỷ lục bắn rơi nhiều B-52 nhất!"
        },
        history: [
            "Đêm 20 rạng sáng 21/12/1972 là <b>\"Đêm rực lửa\"</b> của lưới lửa phòng không Hà Nội: quân dân ta bắn rơi <b>7 chiếc B-52</b> (trong đó có 5 chiếc rơi tại chỗ).",
            "Đặc biệt, lúc 20 giờ 34 phút ngày 20/12, Tiểu đoàn 77 (Tiểu đoàn trưởng Đinh Thế Văn) bắn rơi tại chỗ 1 chiếc B-52 rơi tại xã Vạn Thắng (Ba Vì). Rạng sáng 21/12, Tiểu đoàn 57 (Tiểu đoàn trưởng Nguyễn Văn Phiệt) lập kỳ tích bắn rơi 2 chiếc B-52 chỉ trong 10 phút, mở đầu từ 5h09.",
            "Trận đánh này bẻ gãy hoàn toàn chiến thuật dùng dải kim loại chaff che chắn của không quân Mỹ, chứng minh tài trí thao lược của bộ đội tên lửa Việt Nam."
        ]
    },
    {
        id: "m4",
        story: "Đêm 21 rạng sáng 22 tháng 12 năm 1972. Bão nhiễu điện tử của không quân Mỹ tiếp tục bao trùm bầu trời Hà Nội. Tại trận địa Đại Đồng, xã Đại Mạch (Đông Anh), Tiểu đoàn trưởng Nguyễn Văn Phiệt cùng kíp chiến đấu Tiểu đoàn 57 kiên cường bám bắt mục tiêu, quyết tâm đánh bại những thủ đoạn gây nhiễu của đối phương.",
        date: "21.12.1972",
        dateLabel: "Đêm 21/12/1972",
        clock: [21, 30],
        title: "Vạch nhiễu tìm thù",
        unit: "Tiểu đoàn 57 · Trung đoàn 261",
        place: "Trận địa Đại Đồng (Đại Mạch, Đông Anh)",
        mode: "SAM2",
        camera: "DECK",
        briefing: [
            "Sau những tổn thất trong các đêm trước, không quân Mỹ tiếp tục sử dụng hệ thống gây nhiễu điện tử nhằm che giấu đội hình B-52. Những dải nhiễu chồng lấn khiến việc phân biệt mục tiêu thật với tín hiệu giả trên màn hiện sóng trở nên vô cùng khó khăn.",
            "Tại trận địa thôn Đại Đồng, xã Đại Mạch (Đông Anh, Hà Nội), Tiểu đoàn 57 do Nguyễn Văn Phiệt chỉ huy tập trung phân tích dải nhiễu, xác định mục tiêu B-52 và hiệp đồng chặt chẽ giữa các thành phần trong kíp chiến đấu.",
            "Rạng sáng 22/12, lúc 3 giờ 42 phút, Tiểu đoàn 57 phóng hai quả tên lửa, bắn rơi một máy bay B-52. Chiếc máy bay rơi tại khu vực Chợ Bến, Hòa Bình, góp phần lập nên chiến công của lực lượng phòng không trong đêm chiến đấu ác liệt."
        ],
        forces: "<b>24 lần chiếc B-52</b> và <b>36 lần chiếc máy bay chiến thuật hộ tống</b>; ngoài ra, <b>18 lần chiếc F-111</b> hoạt động xen kẽ ở độ cao thấp. Theo tài liệu tổng kết chiến dịch của Việt Nam.",
        kills: 3, ammo: 9, timeLimit: 285, speed: 1.05,
        waves: [3, 25, 50, 75, 100],
        jam: { "power": 6.5, "barrage": 0.13, "retune": 20, "lookThrough": 1.9, "chaff": true, "startFreq": 2950 },
        controls: CONTROLS_SAM2,
        radio: [
            { at: 1, who: "SỞ CHỈ HUY", text: "Tiểu đoàn 57 vào cấp 1! Địch mở đợt tập kích từ hướng Tây Bắc và Bắc, bão nhiễu rất nặng!" },
            { at: 10, who: "TRẮC THỦ", text: "Nhiễu râu tôm ngập tràn hai màn hiện sóng phương vị và góc tà! Đang xoay đổi phân cực ăng-ten!" },
            { at: 25, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Bình tĩnh đo dải nhiễu! Tìm khe hở giữa các đỉnh nhiễu của địch!" },
            { at: 55, who: "ĐÀI RADAR 291", text: "Tốp B-52 số hiệu 318 đang tiến vào cự ly 30 km, tốc độ 900 km/h hướng về Đại Đồng!" },
            { at: 90, who: "SỞ CHỈ HUY", text: "Khóa chắc tâm dải nhiễu! Chờ tín hiệu vượt ngưỡng rồi phóng 2 quả liên tiếp!" },
            { at: 135, who: "TRẮC THỦ", text: "Đã bắt được vệt sáng phản xạ B-52! Tín hiệu đè bão nhiễu rất rõ!" },
            { at: 180, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Phóng đạn! Quả 1 vút lên, quả 2 xuất kích theo sau!" },
            { at: 225, who: "ĐÀI QUAN SÁT", text: "Một đám cháy khổng lồ bùng lên trên bầu trời Đông Anh! B-52 đã đền tội!" },
            { at: 260, who: "SỞ CHỈ HUY", text: "Tiểu đoàn 57 lập công xuất sắc! Giữ vững trận địa đón đánh đợt tiếp theo!" }
        ],
        lines: {
            clean: "Đã vạch được nhiễu, bắt trúng tâm B-52! Phóng đạn!",
            shift: "Địch cơ động nhảy tần nhiễu! Đổi tần số bám đuổi!",
            kill: "Trúng rồi! Xác B-52 bốc cháy ngùn ngụt rơi tại chỗ!",
            win: "Tiểu đoàn 57 đã bắn rơi B-52, bảo vệ bình yên trận địa Đại Đồng – Đông Anh!"
        },
        history: [
            "Đêm 21 rạng sáng 22/12/1972, kíp chiến đấu Tiểu đoàn 57 dưới sự chỉ huy của Tiểu đoàn trưởng Nguyễn Văn Phiệt đã lập chiến công bắn rơi <b>3 chiếc B-52</b>.",
            "Đồng chí Nguyễn Văn Phiệt sau này được phong tặng danh hiệu Anh hùng Lực lượng Vũ trang Nhân dân, trở thành Trung tướng, Phó Tư lệnh Quân chủng PK-KQ.",
            "Cùng đêm đó, quân dân ta còn bắn rơi 1 máy bay cánh cụp cánh xòe F-111 hiện đại bậc nhất của Mỹ tại khu vực Hà Tây."
        ]
    },
    {
        id: "m5",
        story: "Rạng sáng 22 tháng 12 năm 1972, B-52 Mỹ ném bom Bệnh viện Bạch Mai, làm sập nhiều khu nhà và vùi lấp những người đang trú ẩn. Giữa ngày kỷ niệm 28 năm thành lập Quân đội nhân dân Việt Nam, nỗi đau của Thủ đô càng thôi thúc quân và dân Hà Nội kiên cường chiến đấu, quyết tâm bảo vệ đồng bào.",
        date: "22.12.1972",
        dateLabel: "Đêm 22/12/1972",
        clock: [3, 45],
        title: "Bệnh viện Bạch Mai căm thù",
        unit: "Tiểu đoàn 78 · Trung đoàn 257",
        place: "Trận địa Thanh Liệt – Bảo vệ nội thành Đống Đa, Bạch Mai",
        mode: "SAM2",
        camera: "DECK",
        briefing: [
            "Rạng sáng 22/12, các tốp B-52 tập kích khu vực Hà Nội. Bệnh viện Bạch Mai trúng bom, nhiều khu nhà điều trị, phòng làm việc và khu hầm trú ẩn bị phá hủy hoặc vùi lấp. Nhiều cán bộ y tế, nhân viên và sinh viên y khoa hy sinh trong thảm họa.",
            "Theo tường thuật lịch sử phía Việt Nam, trong đợt tập kích rạng sáng, Mỹ sử dụng 24 chiếc B-52 cùng 36 máy bay chiến thuật; 18 lượt F-111 hoạt động xen kẽ ở độ cao thấp nhằm đánh phá các mục tiêu đã trinh sát.",
            "Trước những đợt không kích và thủ đoạn gây nhiễu điện tử, các đơn vị phòng không Hà Nội tiếp tục bám sát trận địa, phối hợp phát hiện, phân biệt mục tiêu thật và đánh trả đội hình tập kích. Những trận đánh ác liệt trong ngày 22/12 tiếp tục thể hiện tinh thần chiến đấu kiên cường của quân và dân Thủ đô."
        ],
        forces: "Theo bảng thống kê phía Mỹ, có <b>30 phi vụ B-52</b> cùng các phi vụ máy bay chiến thuật yểm trợ, chế áp phòng không và rải kim loại gây nhiễu (chaff).",
        kills: 3, ammo: 9, timeLimit: 280, speed: 1.05,
        waves: [3, 22, 45, 70, 95],
        jam: { "power": 6.8, "barrage": 0.14, "retune": 20, "lookThrough": 1.8, "chaff": true, "startFreq": 3010 },
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
            shift: "Địch đổi tần số hòng thoát thân! Đổi tần số truy kích!",
            kill: "B-52 trúng đạn bốc cháy rừng rực! Trả thù cho Bạch Mai!",
            win: "Tiểu đoàn 78 giáng đòn trừng phạt đích đáng xuống lũ cướp trời!"
        },
        history: [
            "Vụ ném bom tàn bạo rạng sáng 22/12/1972 đã phá hủy khu bệnh phòng Bệnh viện Bạch Mai, làm 28 bác sĩ, y tá và nhân viên y tế hy sinh, nhiều bệnh nhân bị thương vong.",
            "Tội ác dã man này khiến dư luận toàn thế giới phẫn nộ, làn sóng biểu tình phản đối Tổng thống Nixon bùng nổ dữ dội trên khắp các thủ đô phương Tây.",
            "Trong đêm 22 rạng sáng 23/12, các lực lượng phòng không Hà Nội đánh trả quyết liệt các tốp cường kích F-111 và F-4, bắn rơi 1 máy bay cánh cụp cánh xòe F-111 tại bến phà Khuyến Lương (3 chiếc B-52 bị tiêu diệt rạng sáng 22/12 đã được tính trong đợt tác chiến đêm 21/12). Lưới lửa tầm thấp và tầm cao tiếp tục siết chặt bảo vệ Thủ đô."
        ]
    },
    {
        id: "m6",
        story: "Rạng sáng 23 tháng 12 năm 1972. Sau những tổn thất trong các đêm trước, không quân Mỹ tiếp tục tập kích Hải Phòng bằng lực lượng B-52 và máy bay chiến thuật yểm trợ. Giữa màn nhiễu điện tử dày đặc, Tiểu đoàn 82, Trung đoàn 238 kiên cường bám trận địa An Lão, quyết tâm bảo vệ bầu trời thành phố cảng.",
        date: "23.12.1972",
        dateLabel: "Đêm 23/12/1972",
        clock: [22, 15],
        title: "Chặn đứng đòn chia cắt",
        unit: "Tiểu đoàn 82 · Trung đoàn 238",
        place: "Trận địa An Lão (Hải Phòng) – Bảo vệ thành phố cảng",
        mode: "SAM2",
        camera: "DECK",
        briefing: [
            "Rạng sáng 23/12, không quân Mỹ huy động 24 lần chiếc B-52 cùng 30 lần chiếc máy bay chiến thuật tập kích Hải Phòng. Các trận địa phòng không phải đối mặt với hệ thống gây nhiễu điện tử mạnh, gây nhiều khó khăn cho việc phát hiện và nhận dạng mục tiêu.",
            "Tại trận địa An Lão, Tiểu đoàn 82 thuộc Trung đoàn 238 kiên trì bám sát mục tiêu, vận dụng kinh nghiệm đánh B-52 để tổ chức chiến đấu. Đơn vị đã bắn rơi một máy bay B-52, mở đầu chiến công bắn rơi B-52 của quân dân Hải Phòng trong chiến dịch.",
            "Tiếp đó, Tiểu đoàn 73 thuộc Trung đoàn 285 cũng lập công, bắn rơi thêm một chiếc B-52. Hai chiến công góp phần khẳng định khả năng chiến đấu của lực lượng phòng không bảo vệ thành phố cảng trước các đợt tập kích đường không quy mô lớn."
        ],
        forces: "<b>24 lần chiếc B-52</b> và <b>30 lần chiếc máy bay chiến thuật</b> tham gia đợt tập kích Hải Phòng. Theo tài liệu tổng kết lịch sử phía Việt Nam.",
        kills: 2, ammo: 6, timeLimit: 260, speed: 1.1,
        waves: [3, 24, 52, 85],
        jam: { "power": 7.0, "barrage": 0.14, "retune": 21, "lookThrough": 1.8, "chaff": true, "startFreq": 2975 },
        controls: CONTROLS_SAM2,
        radio: [
            { at: 1, who: "SỞ CHỈ HUY", text: "Địch đổi hướng đánh vào kho xăng dầu Đức Giang và ga Giáp Bát! Bảo vệ bằng mọi giá các kho tàng huyết mạch!" },
            { at: 12, who: "TRẮC THỦ", text: "Tốp B-52 bay giãn cách đội hình 3 km! Nhiễu tích cực của B-52 quét rất nhanh trên dải tần 2975 MHz!" },
            { at: 28, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Tiểu đoàn 82 sẵn sàng phần tử đón lõng! Chờ thời cơ địch bay bằng cắt bom!" },
            { at: 60, who: "ĐÀI QUAN SÁT", text: "Cụm đèn chiếu Long Biên quét sáng rực góc trời Gia Lâm! Đã thấy bóng dáng B-52!" },
            { at: 105, who: "SỞ CHỈ HUY", text: "Khóa mục tiêu dẫn đầu tốp 2! Không cho chúng tiếp cận kho dầu Đức Giang!" },
            { at: 150, who: "TRẮC THỦ", text: "Tín hiệu phản xạ rất rõ nét! Chuyển sang chế độ bám tự động!" },
            { at: 195, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Phóng đạn! Tên lửa bay thẳng vào tim mục tiêu!" },
            { at: 235, who: "SỞ CHỈ HUY", text: "Mục tiêu bị tiêu diệt! Kho xăng Đức Giang được bảo vệ an toàn tuyệt đối!" }
        ],
        lines: {
            clean: "Đã bắt chắc B-52 hướng Giáp Bát! Phóng!",
            shift: "Địch chuyển kênh gây nhiễu! Đổi tần số bám mục tiêu!",
            kill: "Trúng rồi! Xác B-52 rơi tại ngoại thành phía Đông!",
            win: "Tiểu đoàn 82 hoàn thành vẻ vang nhiệm vụ bảo vệ mạch máu giao thông Thủ đô!"
        },
        history: [
            "Đêm 23/12/1972, không quân Mỹ dùng 30 lần chiếc B-52 (theo phía Mỹ) ném bom các cơ sở hậu cần trọng yếu, nhưng hệ thống phòng không dày đặc của ta đã bảo vệ an toàn phần lớn kho xăng Đức Giang.",
            "Quân dân miền Bắc bắn rơi <b>4 máy bay địch</b>, trong đó có <b>2 chiếc B-52</b> và 1 tiêm kích F-4.",
            "Tỷ lệ tổn thất cao liên tục khiến các phi công B-52 tại căn cứ Guam và U-Tapao bắt đầu xuất hiện tâm lý hoang mang, phản chiến, từ chối bay xuất kích."
        ]
    },
    {
        id: "m7",
        story: "Đêm 24 tháng 12 năm 1972. Trước thời điểm tạm ngừng ném bom nhân dịp Giáng sinh, không quân Mỹ tiếp tục mở đợt tập kích vào các mục tiêu giao thông và hậu cần ở miền Bắc. Ga Kép, khu vực Thái Nguyên cùng những đầu mối vận tải trọng yếu trở thành mục tiêu đánh phá. Trước giờ tạm ngừng, các lực lượng phòng không vẫn kiên cường bám trận địa, quyết tâm bảo vệ các tuyến chi viện chiến lược.",
        date: "24.12.1972",
        dateLabel: "Đêm 24/12/1972",
        clock: [19, 40],
        title: "Trước giờ ngừng bắn Noel",
        unit: "Tiểu đoàn 71 · Trung đoàn 285",
        place: "Phía Đông Bắc Hà Nội – Ga Kép",
        mode: "SAM2",
        camera: "DECK",
        briefing: [
            "Trong ngày 24/12, máy bay chiến thuật Mỹ đánh phá khu vực Thái Nguyên và Hà Bắc. Đến tối cùng ngày, các tốp B-52 tiếp tục tập kích những đầu mối giao thông quan trọng, trong đó có ga Kép và khu vực Thái Nguyên; các máy bay chiến thuật tham gia yểm trợ, đánh phá những mục tiêu liên quan.",
            "Các đợt không kích nhằm gây gián đoạn mạng lưới giao thông, vận tải và tiếp tế của miền Bắc. Trước sức ép từ những đợt tập kích liên tiếp, lực lượng phòng không vẫn duy trì chiến đấu, phối hợp phát hiện mục tiêu và tổ chức đánh trả từ các trận địa.",
            "Đến 24 giờ ngày 24/12, không quân Mỹ tạm ngừng ném bom miền Bắc nhân dịp Giáng sinh. Khoảng lặng này kéo dài 36 giờ theo kế hoạch của Mỹ, trước khi chiến dịch tập kích được nối lại ngày 26/12/1972."
        ],
        forces: "<b>30 lần chiếc B-52</b> theo tài liệu phía Mỹ, cùng các máy bay chiến thuật yểm trợ. Tài liệu tổng kết phía Việt Nam ghi <b>33 lần chiếc B-52</b> trong đêm. Hai số liệu được dẫn theo các nguồn thống kê khác nhau.",
        kills: 2, ammo: 6, timeLimit: 255, speed: 1.1,
        waves: [3, 26, 56, 88],
        jam: { "power": 7.2, "barrage": 0.15, "retune": 22, "lookThrough": 1.7, "chaff": true, "startFreq": 3030 },
        controls: CONTROLS_SAM2,
        radio: [
            { at: 1, who: "SỞ CHỈ HUY", text: "Toàn đơn vị sẵn sàng! Địch ném bom dồn dập trước thời khắc tạm ngừng ném bom Noel!" },
            { at: 12, who: "TRẮC THỦ", text: "Tốp B-52 tiến vào từ hướng Đông Bắc qua ga Kép cự ly 40 km! Bão nhiễu rải chaff rất rộng!" },
            { at: 30, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Giữ vững trận địa! Địch muốn tạo áp lực tâm lý trước Giáng sinh. Quyết không cho chúng lọt lưới!" },
            { at: 65, who: "ĐÀI RADAR 291", text: "Phát hiện tốp B-52 thứ hai đang bay chúc mũi xuống độ cao 8.500m!" },
            { at: 110, who: "TRẮC THỦ", text: "Đã bắt được tín hiệu trung tâm! Đổi tần số tránh nhiễu thành công!" },
            { at: 155, who: "SĨ QUAN ĐIỀU KHIỂN", text: "Phóng đạn! Cả hai quả đạn mang theo lời thề chiến thắng vút lên trời xanh!" },
            { at: 200, who: "SỞ CHỈ HUY", text: "B-52 bốc cháy dữ dội trên bầu trời ga Kép! Đòn trừng phạt đanh thép trước giờ Noel!" },
            { at: 235, who: "ĐÀI QUAN SÁT", text: "Đúng 24h, địch buộc phải ngừng ném bom. Chiến công xuất sắc của toàn mặt trận!" }
        ],
        lines: {
            clean: "Đã khóa mục tiêu hướng Đông Bắc! Phóng!",
            shift: "Địch tăng công suất gây nhiễu! Chuyển ngay tần số dự phòng!",
            kill: "Trúng đạn rồi! B-52 rơi tại chỗ trên bầu trời phía Bắc!",
            win: "Tiểu đoàn 71 giáng đòn sấm sét khép lại giai đoạn 1 của chiến dịch!"
        },
        history: [
            "Đêm 24/12/1972, quân dân miền Bắc bắn rơi thêm <b>1 chiếc B-52</b> và các máy bay chiến thuật trước khi lệnh tạm ngừng ném bom có hiệu lực.",
            "Sau 7 ngày đêm chiến đấu liên tục, quân dân ta đã bắn rơi tổng cộng <b>53 máy bay Mỹ, trong đó có 18 chiếc B-52</b>, giáng một đòn chí mạng vào lực lượng răn đe hạt nhân chiến lược của Lầu Năm Góc.",
            "Đúng 24 giờ ngày 24/12, Tổng thống Nixon buộc phải ra lệnh tạm ngừng ném bom 36 giờ lấy cớ nghỉ lễ Noel, nhưng thực chất là để củng cố lại lực lượng đang suy sụp nghiêm trọng."
        ]
    },
    {
        id: "m8",
        story: "Ngày 25 tháng 12 năm 1972, ngày lễ Giáng sinh. Từ 0 giờ, không quân Mỹ tạm ngừng ném bom miền Bắc trong khoảng 36 giờ. Bộ Tư lệnh Quân chủng Phòng không - Không quân nhận định địch sẽ trở lại đánh phá ác liệt hơn. Trong khoảng lặng quý giá này, các đơn vị khẩn trương rút kinh nghiệm, củng cố lực lượng và chuẩn bị phương án chiến đấu cho những trận đánh tiếp theo.",
        date: "25.12.1972",
        dateLabel: "Ngày 25/12/1972",
        clock: [14, 0],
        title: "Thời khắc quý hơn vàng",
        unit: "Tiểu đoàn 77 & Trung đoàn 257",
        place: "Ngoại thành Hà Nội – Cơ động trận địa",
        mode: "SAM2",
        camera: "DECK",
        briefing: [
            "Ngày 25/12 là khoảng lặng chiến lược giữa chiến dịch Linebacker II. Bộ Tư lệnh Quân chủng Phòng không - Không quân tổ chức hội nghị rút kinh nghiệm giai đoạn đầu, đồng thời khẩn trương triển khai các phương án chuẩn bị chiến đấu. Từ 19 giờ, các đơn vị tên lửa được lệnh sẵn sàng chiến đấu 100%.",
            "Việc tạm ngừng ném bom không đồng nghĩa hoạt động trinh sát chấm dứt. Theo một báo cáo quân sự Mỹ, trong ngày 25/12 có 18 phi vụ trinh sát đường không, gồm 2 phi vụ SR-71 và 4 phi vụ máy bay trinh sát không người lái.",
            "Các đơn vị ra-đa phải phân biệt chính xác mục tiêu thật, giả, kịp thời thông báo B-52 và chú ý các máy bay hoạt động ở độ cao thấp. Pháo phòng không bố trí đón đánh F-111, đồng thời bảo vệ các trận địa tên lửa. Toàn bộ lực lượng duy trì cảnh giác, giữ bí mật bố trí và sẵn sàng đối phó khi các đợt tập kích được nối lại."
        ],
        forces: "Tạm ngừng ném bom miền Bắc; hoạt động trinh sát đường không vẫn tiếp diễn. Tài liệu phía Mỹ ghi nhận <b>18 phi vụ trinh sát</b>, trong đó có <b>2 phi vụ SR-71</b> và <b>4 phi vụ máy bay không người lái</b>. Theo báo cáo quân sự Mỹ.",
        kills: 1, ammo: 4, timeLimit: 220, speed: 1.15,
        waves: [3, 35, 75],
        jam: { "power": 6.0, "barrage": 0.1, "retune": 18, "lookThrough": 2.0, "chaff": false, "startFreq": 2940 },
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
            shift: "Mục tiêu đổi góc lượn! Đổi tần số bám chắc!",
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
        story: "Đêm 26 tháng 12 năm 1972, đêm quyết chiến ác liệt nhất của Chiến dịch Linebacker II. Không quân Mỹ mở cuộc tập kích quy mô lớn vào Hà Nội, Hải Phòng và Thái Nguyên. Khoảng 22 giờ 40, bom B-52 trút xuống phố Khâm Thiên và nhiều khu dân cư, gây nên những mất mát đau thương cho nhân dân Thủ đô. Trước đòn tập kích dữ dội, các lực lượng phòng không Hà Nội kiên cường chiến đấu, bảo vệ bầu trời thành phố.",
        date: "26.12.1972",
        dateLabel: "Đêm 26/12/1972",
        clock: [22, 5],
        title: "Khâm Thiên – Đòn trả lời đanh thép",
        unit: "Trung đoàn 261 & Trung đoàn 257",
        place: "Nội thành Hà Nội – Phố Khâm Thiên – Định Công",
        mode: "SAM2",
        camera: "DECK",
        briefing: [
            "Từ 22 giờ 05 phút ngày 26/12, không quân Mỹ mở đợt tập kích quy mô lớn, đánh phá đồng thời các mục tiêu tại Hà Nội, Hải Phòng và Thái Nguyên. Theo thống kê phía Việt Nam, địch sử dụng 105 lần chiếc B-52 cùng 110 lần chiếc máy bay chiến thuật yểm hộ. Phía Mỹ ghi nhận 120 chiếc B-52 tham gia đợt tập kích.",
            "Khoảng 22 giờ 40, bom B-52 rải thảm xuống nhiều khu vực nội, ngoại thành Hà Nội, đặc biệt là phố Khâm Thiên và khu vực lân cận. Trận bom đã khiến 287 người thiệt mạng, 290 người bị thương theo số liệu công bố tại Đài tưởng niệm Khâm Thiên; nhiều ngôi nhà và công trình dân sinh bị phá hủy.",
            "Trên khắp các trận địa, bộ đội tên lửa, pháo cao xạ và lực lượng phòng không ba thứ quân phối hợp chiến đấu quyết liệt. Trong hơn một giờ giao chiến, lực lượng phòng không Hà Nội, Hải Phòng và Thái Nguyên bắn rơi 8 máy bay B-52 cùng nhiều máy bay chiến thuật; riêng Hà Nội bắn rơi 5 chiếc B-52, trong đó 4 chiếc rơi tại chỗ."
        ],
        forces: "<b>105 lần chiếc B-52</b> và <b>110 lần chiếc máy bay chiến thuật</b> theo thống kê phía Việt Nam. Tài liệu phía Mỹ ghi nhận <b>120 chiếc B-52</b> và <b>114 máy bay chiến thuật</b>.",
        kills: 7, ammo: 18, timeLimit: 320, speed: 1.15,
        waves: [3, 12, 24, 40, 58, 76, 95, 115],
        jam: { "power": 8.0, "barrage": 0.16, "retune": 25, "lookThrough": 1.6, "chaff": true, "startFreq": 2930 },
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
            shift: "Địch cuống cuồng nhảy tần số! Đổi tần số truy đuổi!",
            kill: "B-52 bốc cháy như đuốc rơi xuống Định Công! Khâm Thiên đã trả thù!",
            win: "Đêm quyết chiến toàn thắng! Đập tan đòn tập kích lớn nhất của Lầu Năm Góc!"
        },
        history: [
            "Đêm 26/12/1972 là cuộc tập kích hủy diệt lớn nhất trong toàn bộ chiến dịch: bom B-52 tàn sát phố Khâm Thiên làm <b>287 người chết, 290 người bị thương</b>, phá hủy hoàn toàn gần 2.000 ngôi nhà.",
            "Trong đêm quyết chiến lịch sử này, quân dân miền Bắc lập chiến công vang dội: bắn rơi <b>8 chiếc B-52</b> (4 chiếc rơi tại chỗ), cùng 10 máy bay chiến thuật khác.",
            "Đòn giáng trả mãnh liệt trong đêm 26/12 đã làm phá sản hoàn toàn toan tính quân sự của Tổng thống Nixon, đẩy không quân Mỹ vào thế thất bại không thể đảo ngược."
        ]
    },
    {
        id: "m10",
        story: "Đêm 27 tháng 12 năm 1972. Phi công Phạm Tuân lái chiếc MiG-21 số hiệu 5121, cất cánh từ sân bay Yên Bái. Được sở chỉ huy mặt đất dẫn đường, ông vượt qua đội hình F-4 hộ tống, tiếp cận B-52 trên vùng trời Sơn La và phóng hai tên lửa K-13. Chiếc B-52 bốc cháy, đánh dấu chiến công đầu tiên của Không quân Việt Nam bắn rơi pháo đài bay B-52 trong Chiến dịch Hà Nội – Điện Biên Phủ trên không.",
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
            "Tối 27/12, không quân Mỹ tiếp tục tập kích Hà Nội bằng lực lượng B-52 được máy bay chiến thuật yểm hộ. Theo biên niên sử của Bộ Tư lệnh Lăng, trong khoảng 19 giờ đến 22 giờ, Mỹ huy động 36 lần chiếc B-52, cùng 66 lần chiếc máy bay chiến thuật và 17 lần chiếc F-111 hoạt động xen kẽ.",
            "Lúc 22 giờ 20 phút, phi công Phạm Tuân được lệnh xuất kích bằng chiếc MiG-21 số hiệu 5121 từ sân bay Yên Bái. Dưới sự dẫn đường của sở chỉ huy và ra-đa mặt đất, ông tiếp cận đội hình B-52, tránh các máy bay F-4 hộ tống và áp sát mục tiêu.",
            "Khi còn cách B-52 khoảng 2–3 km, Phạm Tuân điều chỉnh đường ngắm và phóng hai tên lửa K-13. Một chiếc B-52 bốc cháy trên bầu trời khu vực Mộc Châu – Sơn La. Ông nhanh chóng thoát ly khỏi khu vực chiến đấu và trở về an toàn. Chiến công này đánh dấu lần đầu tiên Không quân Việt Nam bắn rơi B-52 trong chiến dịch 12 ngày đêm."
        ],
        forces: "<b>36 lần chiếc B-52</b>, <b>66 lần chiếc máy bay chiến thuật yểm hộ</b> và <b>17 lần chiếc F-111</b> hoạt động xen kẽ trong khung giờ 19–22 giờ, theo biên niên sử của Bộ Tư lệnh Lăng.",
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
        story: "Đêm 28 tháng 12 năm 1972. Từ sân bay dã chiến Cẩm Thủy, phi công Vũ Xuân Thiều cất cánh trên chiếc MiG-21 theo lệnh Sở chỉ huy, vòng ra phía sau đội hình B-52 và truy kích đến vùng trời Sơn La. Trong đêm tối và màn nhiễu điện tử, ông tiếp cận mục tiêu ở cự ly gần, phóng hai tên lửa K-13. Chiến công và sự hy sinh của người phi công trẻ trở thành biểu tượng của tinh thần quyết chiến bảo vệ bầu trời Tổ quốc.",
        date: "28.12.1972",
        dateLabel: "Đêm 28/12/1972",
        clock: [21, 48],
        clockDisplay: "21:41 – 21:48",
        title: "Vũ Xuân Thiều – Quả tên lửa thứ ba",
        unit: "Phi công Vũ Xuân Thiều · Trung đoàn không quân 927",
        place: "Vùng trời Cẩm Thủy – Yên Châu",
        mode: "MIG21",
        camera: "COCKPIT",
        pilot: "5046",
        briefing: [
            "Từ 20 giờ đến 22 giờ ngày 28/12, không quân Mỹ sử dụng khoảng 60 lần chiếc B-52 đánh phá các khu vực Đông Anh, Đa Phúc, Cầu Đuống, Yên Viên và Gia Lâm. Các trận địa phòng không Hà Nội tiếp tục chiến đấu trong điều kiện địch sử dụng nhiều thủ đoạn gây nhiễu điện tử.",
            "Lúc 21 giờ 41 phút, phi công Vũ Xuân Thiều nhận lệnh xuất kích từ sân bay dã chiến Cẩm Thủy, Thanh Hóa. Được Sở chỉ huy dẫn đường, ông vòng ra phía sau đội hình B-52 và truy kích đến vùng trời Sơn La. Khi phát hiện mục tiêu ở cự ly gần, ông xin phép công kích và phóng hai tên lửa K-13.",
            "Theo tường thuật lịch sử phổ biến của Việt Nam, hai tên lửa đầu làm B-52 bị thương nhưng chưa rơi; Vũ Xuân Thiều tiếp tục công kích và hy sinh trong trận đánh. Câu chuyện ông biến chiếc MiG-21 thành “quả tên lửa thứ ba” được lưu truyền như biểu tượng của tinh thần quyết tử. Tuy nhiên, chi tiết về cách chiếc B-52 bị tiêu diệt vẫn có những cách diễn giải khác nhau trong các tài liệu."
        ],
        forces: "Khoảng <b>60 lần chiếc B-52</b> đánh phá khu vực Đông Anh, Đa Phúc, Cầu Đuống, Yên Viên và Gia Lâm trong khung giờ 20–22 giờ.",
        kills: 1, ammo: 2, timeLimit: 180, speed: 1.2,
        waves: [4, 50],
        jam: null,
        controls: CONTROLS_MIG21,
        radio: [
            { at: 1, who: "SỞ CHỈ HUY", text: "5046, nghe rõ! Bạn đã cất cánh từ sân bay dã chiến Cẩm Thủy! Hướng bay 330 độ về phía Yên Châu!" },
            { at: 12, who: "5046", text: "5046 nghe rõ! Trần mây dày, tôi đang bay xuyên mây lên độ cao 10.500m!" },
            { at: 25, who: "SỞ CHỈ HUY", text: "Chú ý tiêm kích F-4 địch đang bay kèm bảo vệ! Tiếp cận mục tiêu từ phía sau bán cầu!" },
            { at: 45, who: "5046", text: "Đã phát hiện B-52! Vệt khói động cơ và đèn hàng hải của địch đang ở ngay phía trước!" },
            { at: 70, who: "SỞ CHỈ HUY", text: "5046, bật tăng lực áp sát! Cự ly phóng tối ưu 2 km, bắn xong cơ động thoát ly ngay!" },
            { at: 100, who: "5046", text: "Đèn đỏ ЗАХВАТ đã sáng! Tôi đã phóng cả 2 quả đạn K-13! Đạn trúng cánh B-52 nhưng nó vẫn cố bay!" },
            { at: 130, who: "5046", text: "Cự ly quá gần, chỉ còn vài trăm mét! Tôi quyết tâm tiêu diệt nó! Xin chào Sở chỉ huy!" },
            { at: 155, who: "SỞ CHỈ HUY", text: "5046! 5046 nghe rõ trả lời!... Pháo đài bay B-52 đã nổ tung rực sáng bầu trời Tây Bắc!" }
        ],
        lines: {
            clean: "Đèn đỏ ЗАХВАТ rực sáng — bám chắc mục tiêu! Phóng K-13!",
            shift: "Mục tiêu cơ động né tránh! Tăng hết ga áp sát!",
            kill: "B-52 nổ tung rực sáng! Chiến công anh dũng tột bậc của Anh hùng Vũ Xuân Thiều!",
            win: "Chiếc MiG-21MF số hiệu 5046 đã trở thành quả tên lửa thứ ba bất tử!"
        },
        history: [
            "Lúc 21 giờ 41 phút đêm 28/12/1972, Thượng úy phi công <b>Vũ Xuân Thiều</b> (Trung đoàn 927) lái tiêm kích MiG-21MF số hiệu 5046 xuất kích từ sân bay Cẩm Thủy; đến 21 giờ 48 phút anh tiếp cận và dũng cảm bắn hạ 1 chiếc B-52 trên vùng trời Yên Châu (Sơn La).",
            "Sau khi phóng 2 quả tên lửa K-13 ở cự ly quá gần, chiếc B-52 bốc cháy dữ dội nhưng chưa rơi hẳn, Vũ Xuân Thiều đã lao thẳng chiếc MiG-21 của mình vào pháo đài bay địch, anh dũng hy sinh vì bầu trời Tổ quốc.",
            "Hành động anh hùng của Vũ Xuân Thiều được vinh danh là biểu tượng sáng ngời của ý chí quyết tử cho Tổ quốc quyết sinh, biến chiếc máy bay thành \"quả tên lửa thứ ba\" tiêu diệt kẻ thù."
        ]
    },
    {
        id: "m12",
        story: "Đêm 29 tháng 12 năm 1972, đêm cuối cùng của Chiến dịch Linebacker II. Sau 11 ngày tập kích với những tổn thất nặng nề, không quân Mỹ chuyển hướng đánh phá các mục tiêu ở Thái Nguyên, Lạng Sơn và Vĩnh Phú, thay vì tiếp tục tập trung lực lượng vào Hà Nội. Trên các trận địa phòng không, cán bộ, chiến sĩ vẫn kiên cường chiến đấu đến những giờ phút cuối cùng, khép lại 12 ngày đêm lịch sử.",
        date: "29.12.1972",
        dateLabel: "Đêm 29/12/1972",
        clock: [23, 16],
        title: "Trận đánh cuối cùng – Toàn thắng Điện Biên Phủ trên không",
        unit: "Tiểu đoàn 79 (Trung đoàn 257) & Tiểu đoàn 72 (Trung đoàn 285)",
        place: "Trận địa Kim Anh – Đa Phúc – Thái Nguyên",
        mode: "SAM2",
        camera: "DECK",
        briefing: [
            "Ban ngày 29/12, Mỹ sử dụng 36 lần chiếc máy bay chiến thuật đánh phá nhà máy điện Cao Ngạn, khu vực Đồng Hỷ và cây số 4 Bắc Thái Nguyên. Đến 23 giờ 16 phút, địch huy động 60 lần chiếc B-52 tập kích ba khu vực trọng điểm: khu Gang thép Thái Nguyên và Trại Cau, Đồng Mỏ (Lạng Sơn), cùng khu vực Kim Anh (Vĩnh Phú).",
            "Trong đợt tập kích ban đêm, 70 lần chiếc máy bay chiến thuật hoạt động xen kẽ, đánh phá các sân bay Thọ Xuân, Yên Bái, Hòa Lạc, Kép và các khu vực Kim Anh, Đông Anh, ngoại vi Hải Phòng và Quảng Ninh.",
            "Trước đợt tập kích cuối cùng của chiến dịch, các đơn vị phòng không tiếp tục duy trì cảnh giác, phối hợp phát hiện mục tiêu và tổ chức đánh trả. Các đơn vị phòng không vòng ngoài bắn rơi hai máy bay, trong đó có một B-52 và một F-4. Những trận đánh này khép lại 12 ngày đêm chiến đấu bảo vệ Hà Nội và miền Bắc."
        ],
        forces: "<b>60 lần chiếc B-52</b> cùng <b>70 lần chiếc máy bay chiến thuật</b> đánh phá các mục tiêu tại Thái Nguyên, Lạng Sơn, Vĩnh Phú và các khu vực lân cận.",
        kills: 2, ammo: 6, timeLimit: 260, speed: 1.2,
        waves: [3, 28, 55, 80],
        jam: { "power": 8.5, "barrage": 0.16, "retune": 26, "lookThrough": 1.6, "chaff": true, "startFreq": 3075 },
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
            shift: "Địch lại dò ra tần số! Chuyển ngay tần số dự phòng!",
            kill: "Trúng! B-52 bốc cháy dữ dội!",
            win: "Tiểu đoàn 79 đã bắn rơi B-52 trong đêm cuối cùng — Toàn thắng chiến dịch Điện Biên Phủ trên không!"
        },
        history: [
            "<b>23 giờ 16 phút đêm 29/12/1972</b>, Tiểu đoàn tên lửa 79, Trung đoàn 257, bắn rơi chiếc B-52 cuối cùng của chiến dịch. Đến <b>23 giờ 29 phút</b>, Tiểu đoàn 72, Trung đoàn 285, phóng quả tên lửa cuối cùng, khép lại 12 ngày đêm chiến đấu lịch sử.",
            "<b>7 giờ sáng ngày 30/12/1972</b>, Tổng thống Mỹ Richard Nixon buộc phải tuyên bố ngừng ném bom từ vĩ tuyến 20 trở ra và đề nghị nối lại đàm phán Paris.",
            "Sau 12 ngày đêm, quân và dân miền Bắc tuyên bố bắn rơi <b>81 máy bay Mỹ, trong đó có 34 chiếc B-52 và 5 chiếc F-111</b>. Ngày <b>27/1/1973</b>, Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký kết."
        ]
    }
];

// ---- Campaign state ----
let gameState = 'MENU';           // MENU | BRIEFING | PLAYING | ENDING | DEBRIEF | HANGAR
let gamePaused = false;
let activeMission = null, activeMissionIdx = 0;
let missionKills = 0, missionAmmo = 0, missionShots = 0, missionTime = 0;
let missionJamFreq = 76, missionJamTimer = 0, missionCleanAnnounced = false;
let missionRadioIdx = 0, missionEndTimer = 0, missionWon = false;
let lastFireTime = 0;

