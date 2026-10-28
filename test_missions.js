
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
            'Click / <b>Space</b>: phóng K-13 · Esc: tạm dừng'
        ];

        const MISSIONS = [
            {
                id: 'm1',
                story: 'Hà Nội, đêm 18 tháng 12 năm 1972. Đàm phán Pa-ri bế tắc, Tổng thống Ních-xơn tung những pháo đài bay B-52 vào đánh phá Thủ đô. Tiểu đoàn tên lửa 59 vào cấp một. Đồng chí trắc thủ, cả Hà Nội đang trông vào các anh.',
                date: '18.12.1972',
                dateLabel: 'Đêm 18/12/1972',
                clock: [19, 55],
                title: 'Đêm mở màn',
                unit: 'Tiểu đoàn tên lửa 59 · Trung đoàn 261',
                place: 'Trận địa SAM-2 ngoại thành phía Bắc Hà Nội',
                mode: 'SAM2',
                camera: 'DECK',
                briefing: [
                    'Đàm phán Paris bế tắc. Ngày 18/12/1972, Tổng thống Mỹ Richard Nixon ra lệnh mở chiến dịch tập kích đường không chiến lược <b>Linebacker II</b>: dùng B-52 ném bom rải thảm Hà Nội, Hải Phòng để ép Việt Nam ký hiệp định theo điều kiện của Mỹ.',
                    'B-52 bay theo <b>tốp 3 chiếc</b>. Mỗi chiếc mang máy gây nhiễu tích cực, cả tốp cùng phát nhiễu che cho nhau. Ở xa, tín hiệu phản xạ từ máy bay yếu hơn nhiễu rất nhiều; khi B-52 vào gần, tín hiệu mạnh lên nhanh hơn nhiễu và dần "xuyên" qua được.',
                    'Bạn là trắc thủ của Tiểu đoàn 59. Theo <b>"Cẩm nang bìa đỏ"</b> về cách đánh B-52: phát sóng ngắn, đổi tần số tránh nhiễu, bám chắc mục tiêu rồi mới phóng.'
                ],
                forces: 'phía Việt Nam ghi nhận <b>90 lần chiếc B-52</b> ném bom Hà Nội trong 3 đợt; phía Mỹ ghi <b>129 lần chiếc</b> B-52 xuất kích cả đêm.',
                kills: 1, ammo: 6, timeLimit: 265, speed: 1.0,
                waves: [3, 12, 55, 100],   // 3 đợt: đợt đầu 2 tốp, sau đó mỗi đợt 1 tốp
                jam: { power: 5, barrage: 0.10, retune: 14, lookThrough: 2.2, chaff: false, startFreq: 2960 },
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: 'SỞ CHỈ HUY', text: 'Toàn tiểu đoàn vào cấp 1! Địch mở chiến dịch Linebacker II, tốp B-52 đang tiến vào từ hướng Tây Bắc cự ly 50 km!' },
                    { at: 7, who: 'LOA PHÒNG KHÔNG', text: 'Đồng bào chú ý! Máy bay địch cách Hà Nội 50 km! Nhân dân khẩn trương xuống hầm trú ẩn!' },
                    { at: 16, who: 'TRẮC THỦ', text: 'Màn hiện sóng SNR-75 toàn bão nhiễu! Kéo thanh tần số hoặc bấm Q / E để đưa vạch phát ra khỏi đỉnh nhiễu đỏ!' },
                    { at: 28, who: 'SĨ QUAN ĐIỀU KHIỂN', text: 'Tốp B-52 số 1 đã vào cự ly 35 km! Chờ tín hiệu phản xạ ổn định. Ba bệ phóng tên lửa đã sẵn sàng!' },
                    { at: 42, who: 'HƯỚNG DẪN', text: 'Giữ vòng ngắm trên B-52 khoảng 2 giây để BÁM. Khi có tín hiệu sóng sạch, bấm Chuột hoặc Space để phóng!' },
                    { at: 65, who: 'ĐÀI RADAR 291', text: 'Báo cáo: Tốp B-52 thứ hai xuất hiện ở cự ly 45 km, trần bay 10.000m hướng về phía Đông Anh!' },
                    { at: 95, who: 'ĐÀI QUAN SÁT', text: 'Đèn chiếu phòng không sân bay Nội Bài đã bắt được vệt khói mục tiêu! Pháo 100mm đang bắn đón chặn đường bay!' },
                    { at: 130, who: 'SỞ CHỈ HUY', text: 'Đợt tập kích thứ ba đang tiến vào! Giữ vững trận địa, quyết tâm bắn rơi tại chỗ pháo đài bay của địch!' },
                    { at: 170, who: 'TRẮC THỦ', text: 'Máy gây nhiễu cơ động đổi tần số! Nhảy tần số Q / E liên tục để duy trì cánh sóng bám mục tiêu!' },
                    { at: 210, who: 'SỞ CHỈ HUY', text: 'Hơn 50 vạn đồng bào nội thành đang dõi theo trận địa ta! Khóa chặt mục tiêu, phóng đạn tiêu diệt!' }
                ],
                lines: {
                    clean: 'Đã bám chắc mục tiêu! Phóng — bấm chuột hoặc Space.',
                    shift: 'Máy gây nhiễu đã dò ra tần số của ta! Nhảy tần (Q / E)!',
                    kill: 'Mục tiêu bốc cháy! B-52 rơi tại chỗ trên cánh đồng Phù Lỗ!',
                    win: 'Báo cáo Sở chỉ huy: Tiểu đoàn 59 đã bắn rơi B-52 đầu tiên!'
                },
                history: [
                    'Khoảng <b>20 giờ 13 phút</b> đêm 18/12/1972 (một số tài liệu ghi 20 giờ 18 phút), Tiểu đoàn 59 (Trung đoàn tên lửa 261) phóng 2 quả đạn, bắn rơi chiếc B-52 đầu tiên của chiến dịch. Xác máy bay rơi trên cánh đồng Phù Lỗ – Đông Anh, ngoại thành phía Bắc Hà Nội.',
                    'Cùng đêm, Tiểu đoàn 52 (Trung đoàn 267) bắn trúng một chiếc B-52 khác. Chiếc này bị thương, gượng bay được và phải hạ cánh xuống sân bay Đà Nẵng.',
                    'Phía Mỹ thừa nhận mất 3 chiếc B-52 trong đêm mở màn (tính cả rạng sáng 19/12). Trước đó hơn 50 vạn người dân nội thành Hà Nội đã được sơ tán.'
                ]
            },
            {
                id: 'm2',
                story: 'Đêm 20 tháng 12. Sau hai đêm bị bắn rơi, địch vẫn đưa nhiều tốp B-52 vào Hà Nội, có máy bay rải nhiễu tiêu cực mở đường. Bộ đội tên lửa đã rút kinh nghiệm: bám chắc rồi mới phóng. Đêm nay bầu trời Hà Nội sẽ rực lửa.',
                date: '20.12.1972',
                dateLabel: 'Đêm 20/12/1972',
                clock: [20, 0],
                title: 'Đêm rực lửa',
                unit: 'Bộ đội tên lửa phòng không Hà Nội',
                place: 'Hướng ga Yên Viên – Gia Lâm – Đông Anh',
                mode: 'SAM2',
                camera: 'DECK',
                briefing: [
                    'Sau hai đêm đầu, các đơn vị tên lửa rút kinh nghiệm: B-52 bay theo những đường bay cố định. Trắc thủ chuyển sang bám vào <b>dải nhiễu</b> do chính máy bay phát ra và chỉ phát sóng ngắn để tránh tên lửa chống radar Shrike.',
                    'Đêm 20/12, địch tiếp tục đánh vào ga Yên Viên, Gia Lâm, Đông Anh. Đi trước các tốp B-52, tiêm kích F-4 rải <b>dải kim loại (chaff)</b> tạo hành lang nhiễu tiêu cực: radar thấy hàng loạt mục tiêu giả, cổng bám bị kéo lệch khỏi máy bay thật.',
                    'Khi đạn đi vào hành lang chaff, hãy tự lái đạn bám vào B-52 thật trong camera theo đạn.'
                ],
                forces: 'phía Việt Nam ghi <b>78 lần chiếc B-52</b> (từ 19 giờ) cùng hơn 100 lần máy bay chiến thuật; phía Mỹ ghi khoảng <b>99 lần chiếc B-52</b>.',
                kills: 3, ammo: 9, timeLimit: 295, speed: 1.0,
                waves: [3, 24, 45, 66, 87, 108],
                jam: { power: 6, barrage: 0.12, retune: 18, lookThrough: 2.0, chaff: true, startFreq: 3040 },
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: 'SỞ CHỈ HUY', text: 'Báo động toàn mặt trận! Đêm nay địch đưa gần 100 lần chiếc B-52 đánh phá ga Yên Viên, Gia Lâm và Đông Anh!' },
                    { at: 8, who: 'LOA PHÒNG KHÔNG', text: 'Còi báo động rú vang toàn thành phố! Hỏa lực cao xạ các cửa ô đồng loạt sẵn sàng chiến đấu!' },
                    { at: 16, who: 'TRẮC THỦ', text: 'F-4 đang rải dải kim loại chaff tạo hành lang nhiễu tiêu cực! Màn hiện sóng xuất hiện vô số mục tiêu giả li ti!' },
                    { at: 28, who: 'SĨ QUAN ĐIỀU KHIỂN', text: 'Kinh nghiệm Cẩm nang đỏ: Bám vào tâm dải nhiễu do máy gây nhiễu tích cực của B-52 phát ra! Không bám vào chaff!' },
                    { at: 48, who: 'HƯỚNG DẪN', text: 'Khi đạn bay qua hành lang chaff, hãy tự dùng chuột lái đạn bám vào thân B-52 thật trong camera theo đạn!' },
                    { at: 75, who: 'ĐÀI QUAN SÁT GIA LÂM', text: 'Cầu Đuống, ga Yên Viên đang là hướng ném bom chính của địch! Đèn chiếu đang quét rực sáng bầu trời phía Bắc!' },
                    { at: 110, who: 'SỞ CHỈ HUY', text: 'Tiểu đoàn 93 vừa bắn rơi tại chỗ 1 chiếc B-52 ở Yên Viên! Tiểu đoàn ta tiếp tục tiêu diệt tốp tiếp theo!' },
                    { at: 145, who: 'TRẮC THỦ', text: 'Nhiễu lấn át kênh phương vị! Nhảy tần số Q / E để bám chắc dải nhiễu bản thân B-52!' },
                    { at: 180, who: 'SĨ QUAN ĐIỀU KHIỂN', text: 'Tổ nạp đạn khẩn trương lắp quả mới lên bệ! Cơ số đạn sẵn sàng, quyết chiến rực lửa!' },
                    { at: 220, who: 'SỞ CHỈ HUY', text: 'Các tiểu đoàn 57, 77, 79 đang liên tiếp lập công! Bầu trời Hà Nội đêm nay rực lửa chiến thắng!' },
                    { at: 260, who: 'ĐÀI QUAN SÁT', text: 'Đội hình B-52 địch bắt đầu hoảng loạn tách tốp tháo chạy! Đuổi đánh tiêu diệt đến cùng!' }
                ],
                lines: {
                    clean: 'Đã tách được mục tiêu khỏi dải nhiễu — bám chắc!',
                    shift: 'Địch dò theo tần số của ta! Nhảy tần (Q / E)!',
                    kill: 'Trúng rồi! Thêm một chiếc B-52 bốc cháy dữ dội!',
                    win: 'Bầu trời Yên Viên rực lửa — các tốp B-52 tan vỡ hoàn toàn!'
                },
                history: [
                    'Khoảng 20 giờ 05 phút, Tiểu đoàn 93 (Trung đoàn 261) bắn rơi tại chỗ một chiếc B-52 ở khu vực ga Yên Viên; 20 giờ 34 phút, Tiểu đoàn 77 (Trung đoàn 257) hạ thêm một chiếc ở ngoại thành.',
                    'Rạng sáng 21/12, từ 5 giờ 02 đến 5 giờ 11 phút, các Tiểu đoàn 57, 77, 79 bắn rơi <b>4 chiếc B-52 trong 9 phút</b>. Cả đêm, bộ đội tên lửa bắn rơi <b>7 chiếc B-52</b> (5 chiếc rơi tại chỗ), dùng 35 quả đạn (số liệu phía Việt Nam).',
                    'Phía Mỹ thừa nhận mất 6 chiếc B-52 trong đêm này, tổn thất cao nhất của họ trong một đêm. Sau đó Mỹ buộc phải thay đổi chiến thuật bay.'
                ]
            },
            {
                id: 'm3',
                story: 'Đêm 26 tháng 12. Sau những ngày tạm ngừng dịp Nô-en, địch dồn hơn một trăm lần chiếc B-52 đánh đồng loạt nhiều hướng. Phố Khâm Thiên bị rải thảm, hàng trăm đồng bào thương vong. Mối thù này phải trả bằng những chiếc B-52 rơi trên bầu trời Thủ đô.',
                date: '26.12.1972',
                dateLabel: 'Đêm 26/12/1972',
                clock: [22, 5],
                title: 'Khâm Thiên – đòn trả lời',
                unit: 'Lưới lửa phòng không Hà Nội',
                place: 'Vùng trời nội thành Hà Nội',
                mode: 'SAM2',
                camera: 'DECK',
                briefing: [
                    'Ngày 22/12, bom Mỹ đánh trúng <b>Bệnh viện Bạch Mai</b>. Sau khi tạm ngừng ném bom dịp Giáng sinh, tối 26/12 Mỹ mở đợt tập kích lớn nhất của cả chiến dịch, đánh đồng loạt vào Hà Nội, Hải Phòng, Thái Nguyên trong khoảng 15 phút.',
                    'Phố <b>Khâm Thiên</b> bị ném bom rải thảm, hàng trăm người dân thường thiệt mạng.',
                    'Hai làn sóng lớn, mỗi làn 4 tốp vào gần như cùng lúc. Nhiễu dò tần số rất nhanh. Phải chia đạn hợp lý và nạp đạn đúng lúc.'
                ],
                forces: 'từ 22 giờ 05: <b>105 lần chiếc B-52</b> (66 đánh Hà Nội, 21 Thái Nguyên, 18 Hải Phòng) cùng 110 lần máy bay hộ tống (số liệu phía Việt Nam). Phía Mỹ ghi <b>120 lần chiếc B-52</b>.',
                kills: 4, ammo: 12, timeLimit: 315, speed: 1.1,
                waves: [3, 8, 13, 18, 75, 80, 85, 90],
                jam: { power: 7, barrage: 0.14, retune: 22, lookThrough: 1.8, chaff: true, startFreq: 2930 },
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: 'SỞ CHỈ HUY', text: 'Địch mở cuộc tập kích ồ ạt hơn 100 lần chiếc B-52 từ nhiều hướng! Đánh đồng loạt vào trung tâm Hà Nội!' },
                    { at: 10, who: 'LOA PHÒNG KHÔNG', text: 'Đồng bào nội thành chú ý! Máy bay địch ném bom rải thảm! Hỏa lực phòng không toàn thành phố bắn trả quyết liệt!' },
                    { at: 24, who: 'ĐÀI QUAN SÁT', text: 'Bom rải thảm trúng phố Khâm Thiên và Bệnh viện Bạch Mai! Lửa cháy ngút trời... Nhà đổ, dân thường thương vong!' },
                    { at: 38, who: 'SỞ CHỈ HUY', text: 'Khâm Thiên đang gào thét trong lửa đạn! Các đồng chí, nén đau thương thành sức mạnh! Bắn rơi B-52 trả thù cho đồng bào!' },
                    { at: 65, who: 'TRẮC THỦ', text: 'Làn sóng B-52 thứ hai đang ập vào! Mật độ nhiễu cực dày, máy gây nhiễu ALQ dò tần số liên tục!' },
                    { at: 95, who: 'SĨ QUAN ĐIỀU KHIỂN', text: 'Tập trung hỏa lực vào tốp B-52 hướng Kim Anh - Định Công! Khóa mục tiêu, bám chắc phương pháp Ba điểm!' },
                    { at: 135, who: 'ĐÀI QUAN SÁT', text: 'Hàng chục luồng đèn chiếu đang giao nhau trên bầu trời Hoàn Kiếm! Lưới lửa cao xạ 100mm đan kín các tầng mây!' },
                    { at: 180, who: 'SỞ CHỈ HUY', text: 'Quân dân Thủ đô đang bắn cháy liên tiếp B-52! Hà Nội không bao giờ khuất phục trước bom đạn đế quốc!' },
                    { at: 230, who: 'TRẮC THỦ', text: 'Đạn trên bệ đã sẵn sàng! Quyết không cho một chiếc B-52 nào tự do trút bom xuống thành phố!' },
                    { at: 280, who: 'SỞ CHỈ HUY', text: 'Địch đã tan vỡ kế hoạch ép ta đầu hàng! Toàn tiểu đoàn kiên quyết tiêu diệt nốt những tốp còn lại!' }
                ],
                lines: {
                    clean: 'Tín hiệu đã thắng nhiễu — bám chắc, phóng!',
                    shift: 'Nhiễu đuổi theo tần số! Nhảy tần ngay (Q / E)!',
                    kill: 'B-52 trúng đạn, bốc cháy sáng rực bầu trời Hà Nội!',
                    win: 'Đòn trả lời đanh thép của Thủ đô — đội hình B-52 tan tác!'
                },
                history: [
                    'Đêm 26/12/1972, phố Khâm Thiên bị san phẳng, <b>287 người dân thiệt mạng</b> (số liệu phía Việt Nam). Tượng đài "Căm thù" trên phố Khâm Thiên ngày nay tưởng niệm các nạn nhân.',
                    'Theo số liệu phía Việt Nam, quân dân miền Bắc bắn rơi <b>8 chiếc B-52</b> trong đêm này, riêng Hà Nội 5 chiếc (4 chiếc rơi tại chỗ, một chiếc rơi ở Định Công, Thanh Trì). Phía Mỹ thừa nhận mất 2 chiếc.'
                ]
            },
            {
                id: 'm4',
                story: 'Đêm 27 tháng 12. Phi công Phạm Tuân lái chiếc Mích 21 số hiệu 5121 cất cánh, vượt qua tiêm kích hộ tống, lặng lẽ tiếp cận tốp B-52 trên bầu trời Mộc Châu. Hai quả tên lửa, một cơ hội duy nhất.',
                date: '27.12.1972',
                dateLabel: 'Đêm 27/12/1972',
                clock: [22, 28],
                title: 'Phạm Tuân trên bầu trời Mộc Châu',
                unit: 'Phi công Phạm Tuân · Trung đoàn không quân 921',
                place: 'Vùng trời Mộc Châu (Sơn La)',
                mode: 'MIG21',
                camera: 'COCKPIT',
                briefing: [
                    'Không quân nhân dân Việt Nam nhiều lần tìm cách đánh B-52 bằng tiêm kích, nhưng B-52 luôn có nhiều tốp F-4 hộ tống và mạng lưới cảnh báo dày đặc.',
                    '22 giờ 20 phút đêm 27/12, phi công <b>Phạm Tuân</b> cất cánh từ sân bay Yên Bái, bay thấp để tránh radar địch, rồi vọt lên tiếp cận một tốp B-52 trên vùng trời Mộc Châu.',
                    'Tên lửa tầm nhiệt <b>K-13</b> chỉ "nhìn thấy" luồng phụt nóng của động cơ khi ở phía sau mục tiêu. Bạn có <b>2 quả</b>. Coi chừng pháo đuôi của B-52 khi áp quá gần.'
                ],
                forces: 'phía Việt Nam ghi <b>36 lần chiếc B-52</b> từ 19 đến 22 giờ, 66 lần máy bay yểm hộ và 17 lần F-111; phía Mỹ ghi <b>60 lần chiếc B-52</b>. Phạm Tuân tiếp cận <b>một tốp 3 chiếc</b>.',
                kills: 1, ammo: 2, timeLimit: 180, speed: 1.0,
                waves: [0],
                jam: null,
                controls: CONTROLS_MIG21,
                radio: [
                    { at: 1, who: 'SỞ CHỈ HUY', text: '5121, nghe rõ! Bạn đã cất cánh an toàn từ sân bay dã chiến Yên Bái, duy trì bay thấp dưới 500m giữ bí mật.' },
                    { at: 10, who: 'SỞ CHỈ HUY', text: '5121, vọt lên độ cao 10.000m! Bật radar, hướng bay 210 độ qua Mộc Châu, tốp B-52 cự ly 15 km phía trước!' },
                    { at: 22, who: '5121', text: '5121 nghe rõ! Tôi đã phát hiện luồng phụt sáng của B-52 trên nền trời đêm. Tốp F-4 yểm hộ đang ở phía ngoài!' },
                    { at: 38, who: 'SỞ CHỈ HUY', text: 'Vượt qua rào cản F-4! Chuột là cần lái: W tăng ga (trên 85% bật tăng lực). Tiếp cận góc đuôi ±35 độ, cự ly 1 đến 5 km!' },
                    { at: 58, who: '5121', text: 'Đang tăng lực bám đuổi! Cự ly đang rút ngắn. Đưa mục tiêu vào vòng ngắm ASP-PFD, chờ đèn ZAKHVAT bắt mục tiêu!' },
                    { at: 85, who: 'SỞ CHỈ HUY', text: 'Cẩn thận pháo đuôi 20mm tự động của B-52! Khi đèn ЗАХВАТ sáng và có tiếng rít gầm đầu dò, phóng K-13 ngay!' },
                    { at: 115, who: 'SỞ CHỈ HUY', text: '5121, tốp B-52 sắp đến điểm cắt bom! Bạn chỉ có 2 quả tên lửa tầm nhiệt, bắn chắc thắng chắc!' },
                    { at: 145, who: 'SỞ CHỈ HUY', text: 'Thời gian tiếp cận sắp hết! Kiên quyết công kích rồi thoát ly về sân bay hạ cánh an toàn!' }
                ],
                lines: {
                    kill: 'B-52 bùng cháy thành quả cầu lửa! Thoát ly ngay!',
                    win: '5121 đã bắn rơi B-52 — kỳ tích Không quân nhân dân Việt Nam!'
                },
                history: [
                    'Đêm 27/12/1972, phi công <b>Phạm Tuân</b> phóng 2 quả tên lửa bắn rơi một chiếc B-52 rồi hạ cánh an toàn. Việt Nam ghi nhận đây là lần đầu tiên không quân ta bắn rơi B-52 trong chiến dịch.',
                    'Cùng đêm, tên lửa phòng không bắn rơi thêm nhiều chiếc; một chiếc rơi xuống làng Ngọc Hà, xác cắm xuống <b>hồ Hữu Tiệp</b> (Ba Đình), nay là di tích lịch sử. Phía Việt Nam ghi 5 chiếc B-52 bị bắn rơi ngày đêm 27/12.',
                    'Đêm 28/12, phi công <b>Vũ Xuân Thiều</b> bắn cháy một B-52 trên vùng trời Sơn La và hy sinh sau trận đánh.',
                    'Năm 1980, Phạm Tuân trở thành người Việt Nam và người châu Á đầu tiên bay vào vũ trụ.'
                ]
            },
            {
                id: 'm5',
                story: 'Đêm 29 tháng 12, đêm cuối cùng của chiến dịch. Mười hai ngày đêm, Hà Nội đứng vững dưới mưa bom. Tiểu đoàn tên lửa 79 chờ những tốp B-52 cuối cùng. Hãy khép lại trận Điện Biên Phủ trên không.',
                date: '29.12.1972',
                dateLabel: 'Đêm 29/12/1972',
                clock: [23, 16],
                title: 'Đêm cuối cùng',
                unit: 'Tiểu đoàn tên lửa 79',
                place: 'Trận địa bảo vệ Hà Nội, hướng Kim Anh',
                mode: 'SAM2',
                camera: 'DECK',
                briefing: [
                    'Sau 11 ngày đêm, lực lượng B-52 của Mỹ tổn thất nặng nề. Đêm 29/12 là đêm cuối cùng của chiến dịch: B-52 đánh khu gang thép Thái Nguyên, Đồng Mỏ (Lạng Sơn) và sân bay Kim Anh.',
                    'Kho đạn đã vơi sau nhiều đêm chiến đấu liên tục: tiểu đoàn chỉ còn <b>4 quả đạn</b>. Mỗi quả đều quý — đánh chắc, tiết kiệm.',
                    'Địch đã học được cách dò tần số rất nhanh và rải chaff dày. Đây là trận quyết định.'
                ],
                forces: 'từ 23 giờ 16 phút: <b>60 lần chiếc B-52</b> (30 đánh gang thép Thái Nguyên – Trại Cau, 18 Đồng Mỏ, 12 Kim Anh). Hai phía cùng ghi 60 lần chiếc.',
                kills: 1, ammo: 4, timeLimit: 260, speed: 1.2,
                waves: [3, 28, 53, 78],
                jam: { power: 8, barrage: 0.15, retune: 26, lookThrough: 1.6, chaff: true, startFreq: 3075 },
                controls: CONTROLS_SAM2,
                radio: [
                    { at: 1, who: 'SỞ CHỈ HUY', text: 'Toàn tiểu đoàn vào vị trí! Đêm nay là trận quyết chiến chiến lược. Mỹ tung lực lượng B-52 cuối cùng đánh Kim Anh, Thái Nguyên, Lạng Sơn!' },
                    { at: 10, who: 'TRẮC THỦ', text: 'Kho đạn đã vơi sau 11 ngày đêm chiến đấu ròng rã! Tiểu đoàn chỉ còn đúng 4 quả đạn V-750 trên bệ!' },
                    { at: 24, who: 'SĨ QUAN ĐIỀU KHIỂN', text: 'Mỗi quả đạn là mồ hôi nước mắt của đồng bào công binh, hậu cần! Không được bắn phí một quả nào! Bám thật chắc mới phóng!' },
                    { at: 45, who: 'ĐÀI RADAR 291', text: 'Tốp B-52 thứ hai bay vào hướng Kim Anh! Nhiễu cực mạnh, địch thay đổi tần số liên tục!' },
                    { at: 75, who: 'ĐÀI QUAN SÁT', text: 'Bộ đội phòng không và Không quân đang hiệp đồng chặt chẽ. Cả nước đang dõi theo từng phút giây của Hà Nội!' },
                    { at: 110, who: 'SỞ CHỈ HUY', text: 'Đợt tập kích thứ ba của địch! Giữ vững trận địa, bình tĩnh vạch nhiễu tìm thù!' },
                    { at: 155, who: 'TRẮC THỦ', text: 'Tín hiệu phản xạ của B-52 đã hiện rõ trên màn hiện sóng SNR-75! Sẵn sàng hỏa lực!' },
                    { at: 195, who: 'SỞ CHỈ HUY', text: 'Cơ số đạn sắp hết, các tốp B-52 cuối cùng đang hoảng hốt tìm đường thoát ly! Giáng đòn sấm sét cuối cùng!' },
                    { at: 235, who: 'SĨ QUAN ĐIỀU KHIỂN', text: 'Khóa mục tiêu! Bắn rơi B-52, khép lại 12 ngày đêm Điện Biên Phủ trên không!' }
                ],
                lines: {
                    clean: 'Bám chắc rồi! Cự ly phóng tối ưu!',
                    shift: 'Địch lại dò ra tần số! Nhảy tần (Q / E)!',
                    kill: 'Trúng! B-52 bốc cháy dữ dội!',
                    win: 'Tiểu đoàn 79 đã bắn rơi B-52 trong đêm cuối cùng — Toàn thắng chiến dịch Điện Biên Phủ trên không!'
                },
                history: [
                    'Đêm 29/12, Tiểu đoàn tên lửa 79 bắn rơi <b>1 chiếc B-52 và 1 chiếc F-4</b>, trận đánh khép lại chiến dịch. <b>7 giờ sáng 30/12/1972</b>, Mỹ tuyên bố ngừng ném bom miền Bắc từ vĩ tuyến 20 trở ra.',
                    'Theo số liệu phía Việt Nam, sau 12 ngày đêm quân dân miền Bắc bắn rơi <b>81 máy bay, trong đó có 34 chiếc B-52</b> (riêng Hà Nội 25 chiếc). Phía Mỹ công bố con số thấp hơn: 15 chiếc B-52 bị bắn rơi (một số nguồn ghi 16, tính cả chiếc bị thương rơi sau đó).',
                    'Ngày 8/1/1973 đàm phán Paris được nối lại. Ngày <b>27/1/1973</b>, Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký kết. Thắng lợi này được gọi là trận <b>"Điện Biên Phủ trên không"</b>.'
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
