# Ảnh AI cho game — prompt dùng với Microsoft Copilot

Game tự nạp các file dưới đây nếu chúng có trong thư mục `assets/`. Thiếu file nào thì game vẫn chạy với đồ họa thủ tục (vẽ bằng code), nên bạn có thể thêm dần từng ảnh.

**Quan trọng:** ảnh chỉ nạp được khi mở game qua `start-game.bat` (địa chỉ `http://127.0.0.1:8137/...`). Nếu bấm đúp mở thẳng file `.html`, trình duyệt sẽ chặn WebGL đọc ảnh. Riêng ảnh màn hình mở đầu vẫn hiện được trong trường hợp này.

Cách làm:
1. Vào https://copilot.microsoft.com, dán prompt (giữ nguyên tiếng Anh để ra ảnh sát ý hơn).
2. Tải ảnh về, **đổi tên đúng như cột "Tên file"** rồi chép vào `assets/`.
3. Tải lại trang game. Mở Console (F12) sẽ thấy dòng `[assets] Đã nạp: ...`.

| Tên file | Dùng cho | Khung hình |
|---|---|---|
| `loading_screen.jpg` | Màn hình mở đầu | 16:9 |
| `sky_night_panorama.jpg` | Bầu trời 360° | càng rộng càng tốt (lý tưởng 2:1) |
| `skyline_hanoi_1972.png` | Dải chân trời phố Hà Nội phía xa | rất rộng (≥ 3:1), **nền xanh lá #00FF00** |
| `smoke_puff.png` | Khói phóng tên lửa, khói đuôi đạn, khói B-52 cháy | 1:1, **nền đen tuyền** |
| `fire_flare.png` | Lõi lửa, chớp nổ, đèn pha | 1:1, **nền đen tuyền** |
| `crate_s75.jpg` | Hòm đạn gỗ "S-75 DVINA" | 2:1 |
| `sandbag.jpg` | Tường bao cát công sự | 1:1, lặp liền mạch |
| `ground_concrete_wet.jpg` | Bệ bê tông ướt dưới bệ phóng | 1:1, lặp liền mạch |

---

## 1. `loading_screen.jpg` — màn hình mở đầu

```
Cinematic night scene, Hanoi December 1972, a Soviet S-75 Dvina (SA-2) surface-to-air missile launching from its launcher in a sandbagged revetment, bright orange rocket exhaust and billowing smoke lit from below, more SA-2 missiles on transport trailers in the foreground, a dozen anti-aircraft searchlight beams crossing a stormy cloudy sky, light rain, distant city lights and a twin-spired Gothic cathedral on the horizon, a B-52 bomber silhouette high in the beams, photorealistic, dramatic teal and orange color grade, wide 16:9, no text, no logo, no watermark
```

Không để chữ trong ảnh: game tự vẽ tiêu đề lên trên. Nên để phần trời tối ở nửa trên và cảnh chính ở giữa, vì nửa dưới sẽ bị phủ một dải tối để đặt chữ.

## 2. `sky_night_panorama.jpg` — bầu trời 360°

```
Seamless 360-degree equirectangular panorama of a stormy night sky, heavy dark rain clouds with soft volumetric texture, faint warm orange glow from a burning city along the entire horizon line, very dark navy blue zenith, no ground details except a thin black horizon band at the very bottom, no aircraft, no searchlights, no moon, no text, photorealistic, wide panoramic 2:1 aspect ratio, left and right edges must tile seamlessly
```

Đường chân trời nên nằm đúng giữa ảnh theo chiều dọc. Nếu ảnh ra quá sáng, chỉnh `uPanoGain` trong code (mặc định `0.9`) xuống khoảng `0.6`.

## 3. `skyline_hanoi_1972.png` — dải chân trời thành phố

```
Very wide panoramic silhouette of 1970s Hanoi city skyline at night seen from far away: low French colonial buildings, traditional curved tile roofs, a twin-spired Gothic cathedral, a long steel truss bridge over a river, scattered small warm lit windows, a few distant fires with smoke, dark blue-black buildings, isolated on a solid pure green #00FF00 background above the rooftops, flat even green with no gradient, no sky, no text, ultra wide 4:1 aspect ratio
```

Game tự xóa nền xanh lá. Nếu Copilot không ra được nền xanh phẳng, hãy bỏ qua ảnh này.

## 4. `smoke_puff.png` — cụm khói

```
A single isolated puff of thick billowing white-grey smoke, cauliflower-shaped volumetric cloud, soft lighting, centered, fully contained inside the frame with empty space around it, on a solid pure black background, no fire, no text, square 1:1
```

Nền phải **đen tuyền**: game lấy độ sáng làm độ trong suốt, chỗ đen sẽ trong suốt hoàn toàn.

## 5. `fire_flare.png` — lõi lửa / chớp nổ

```
A single isolated bright fireball explosion core, white-hot center fading to yellow then deep orange at the edges, soft glowing flames, centered, fully contained inside the frame, on a solid pure black background, no smoke, no debris, no text, square 1:1
```

## 6. `crate_s75.jpg` — hòm đạn

```
Flat front-facing texture of an old Soviet military wooden ammunition crate side panel, olive drab green paint, worn and scratched planks, metal corner brackets, white stenciled text "S-75 DVINA - SAM-2" in the center, orthographic view, evenly lit, no perspective, no background, fills the entire frame, 2:1 aspect
```

## 7. `sandbag.jpg` — bao cát

```
Seamless tileable texture of stacked military burlap sandbags, coarse jute fabric weave, muddy wet brown-khaki color, top-down orthographic, even flat lighting, no shadows from a single direction, fills the whole frame, square 1:1
```

## 8. `ground_concrete_wet.jpg` — nền bê tông ướt

```
Seamless tileable texture of a dark wet cracked concrete military pad at night, rain puddles, oil stains, tire marks, scattered gravel, top-down orthographic, even flat lighting, fills the whole frame, square 1:1
```

---

### Mẹo

- Copilot thường cho ảnh 1024×1024 hoặc 1792×1024. Ảnh bầu trời và dải chân trời nên phóng to lên khoảng 4096 px chiều ngang (ví dụ dùng tính năng Upscale của Paint hoặc Photos trên Windows) để đỡ mờ.
- Nếu ảnh có chữ ký hoặc watermark, cắt bỏ trước khi dùng.
- Đổi ảnh xong chỉ cần tải lại trang (Ctrl+F5).
