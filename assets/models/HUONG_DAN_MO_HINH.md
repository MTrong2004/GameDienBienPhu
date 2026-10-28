# Mô hình 3D thật (.glb) cho game

Game tự nạp các file dưới đây nếu chúng có trong thư mục `assets/models/`. Thiếu file nào thì game dùng mô hình tự dựng bằng code cho vật đó.

| Tên file | Thay cho | Ghi chú |
|---|---|---|
| `mig21.glb` | Tiêm kích MiG-21 (#5121) | Chỉ máy bay, không kèm đế trưng bày |
| `b52.glb` | Pháo đài bay B-52 | Chỉ máy bay |
| `sa2_missile.glb` | Tên lửa V-750 (SA-2) | **Chỉ quả đạn**, không kèm bệ phóng: game tự đặt đạn lên bệ, giá dự trữ và cho đạn bay |
| `fan_song_radar.glb` | Đài radar SNR-75 "Fan Song" | Cả xe/cabin radar |

Bắt buộc mở game qua `start-game.bat`. Mở thẳng file `.html` thì trình duyệt không cho đọc file `.glb`.

## Lấy mô hình ở đâu

1. **Sketchfab** (https://sketchfab.com): tìm `MiG-21`, `B-52 Stratofortress`, `SA-2 Guideline` / `S-75 V-750 missile`, `SNR-75 Fan Song`.
   - Bật bộ lọc **Downloadable**. Ở phần **License**, chọn **CC BY** hoặc **CC0**.
   - Bấm **Download 3D Model** → chọn định dạng **glTF Binary (.glb)**.
   - CC BY cho phép dùng miễn phí nhưng phải ghi tên tác giả. Hãy chép tên tác giả và đường dẫn vào phần "Ghi công" ở cuối file này.
2. **Fab.com** (kho của Epic, gộp từ Sketchfab cũ): lọc *Free*, định dạng *glTF/GLB*.
3. Tự dựng hoặc chỉnh trong **Blender** (miễn phí): `File → Export → glTF 2.0`, chọn Format **glTF Binary (.glb)**.

### Mô hình miễn phí đã tìm được (cần tự kiểm tra giấy phép trước khi tải)
| Khí tài | Nguồn | Ghi chú |
|---|---|---|
| MiG-21 | https://sketchfab.com/CAHR224 · https://sketchfab.com/citizensnip | Có nhiều mẫu MiG-21; chọn mẫu có nút *Download* và giấy phép CC BY |
| B-52 | Sketchfab, tìm "Boeing B52 StratoFortress" (tác giả erty546453) | Kiểm tra số tam giác, nên dưới ~100k vì có 3–12 chiếc cùng lúc |
| B-52 | https://free3d.com/3d-model/b-52-stratofortress-7068.html · https://free3d.com/3d-model/b-52-stratofortress-7492.html | Giấy phép *Editorial*: chỉ dùng cho mục đích phi thương mại hoặc giáo dục. Định dạng OBJ/3DS, cần mở bằng Blender rồi xuất `.glb` |
| SA-2 / SNR-75 | Chưa tìm thấy bản miễn phí đạt chất lượng | Game dùng mô hình tự dựng |

### Chọn mô hình hợp với game web
- **Dung lượng:** dưới ~15 MB mỗi file và dưới ~150 nghìn tam giác. Sketchfab hiển thị số tam giác (*Triangles*) ở trang mô hình.
- **Đa dạng mẫu:** B-52 xuất hiện 3–4 chiếc cùng lúc. Một mô hình quá nặng sẽ làm game giật.
- **Mô hình quá nặng:** mở bằng Blender, dùng *Decimate modifier* (tỉ lệ 0.3–0.5), rồi export lại. Hoặc dùng https://gltf.report để nén texture.
- **File nén Draco:** vẫn đọc được, game đã kèm bộ giải nén.

## Nếu mô hình bị quay sai hướng

Game cần **mũi máy bay hướng về trục +Z** của file. Riêng `sa2_missile.glb` thì **đầu đạn phải hướng về −Z**, khớp với mô hình đạn tự dựng nằm trên bệ phóng. Phần lớn mô hình glTF đúng sẵn, nhưng nhiều mô hình Sketchfab thì không.

Sửa trong file game, tìm `GLB_MODEL_FILES`:

```js
const GLB_MODEL_FILES = {
    MIG21: { file: 'assets/models/mig21.glb', rotate: [0, 0, 0] },
    B52:   { file: 'assets/models/b52.glb',   rotate: [0, 0, 0] },
    ...
};
```

`rotate` là góc xoay `[X, Y, Z]` tính bằng độ:

| Hiện tượng | Sửa thành |
|---|---|
| Máy bay bay lùi (đuôi đi trước) | `rotate: [0, 180, 0]` |
| Máy bay bay ngang (mũi chỉ sang trái/phải) | `rotate: [0, 90, 0]` hoặc `[0, -90, 0]` |
| Máy bay chúc mũi xuống / dựng đứng | `rotate: [90, 0, 0]` hoặc `[-90, 0, 0]` |
| Bị lộn ngược (bụng lên trời) | thêm `180` vào ô Z, ví dụ `[0, 180, 180]` |

Cách kiểm tra nhanh: vào tab **[3] Xưởng Khí tài 3D**. Mô hình hiển thị ở đó đã qua đúng bước xoay và chỉnh cỡ như trong trận.

Bạn **không cần chỉnh kích thước**. Game tự co giãn để chiều dài mũi–đuôi bằng mô hình cũ và đặt vào đúng vị trí, nên camera buồng lái, khoảng cách trúng đạn và bệ phóng vẫn khớp.

## Thử nhanh không cần đổi tên file

Trong tab **[3] Xưởng Khí tài 3D**:
1. Chọn loại khí tài.
2. Bấm **+ NẠP FILE .GLB / .GLTF TỪ MÁY** và chọn file.

Mô hình sẽ thay ngay trong xưởng và cho các lần xuất hiện sau trên chiến trường (B-52 mới, đạn mới), nhưng **mất khi tải lại trang**. Muốn giữ lâu dài thì đổi tên và chép vào thư mục này.

## Ghi công (bắt buộc với giấy phép CC BY)

<!-- Ví dụ: - b52.glb — "B-52H Stratofortress" của <tác giả>, https://sketchfab.com/..., CC BY 4.0 -->
