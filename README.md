# Website tri ân cô Minh Hiếu – 20/11

HTML/CSS/JS thuần, không cần backend, chạy được trên GitHub Pages.

## Cấu trúc & nơi đặt ảnh
```text
20-11/
├── index.html
├── css/style.css
├── js/script.js
├── assets/images/   ← ảnh kỷ niệm: anh1.jpg, anh2.jpg, ... anh10.jpg
├── assets/music/    ← nhạc nền (tùy chọn): background.mp3
└── README.md
```
- Chưa có ảnh: web hiển thị các khung mẫu (công thức hóa học) bay lên, không lỗi.
- Có ảnh: đặt vào `assets/images/` đúng tên như trên. Ảnh nào thiếu sẽ tự bị bỏ qua.
- Thêm ảnh/đổi tên: mở `js/script.js`, sửa mảng `IMAGES` ở dòng đầu (trình duyệt không tự đọc được danh sách thư mục, nên cần khai báo tên file).
- Nên dùng ảnh JPG đã thu nhỏ (khoảng 800px, dưới 300KB) để web mượt trên điện thoại.
- Không có `background.mp3` thì nút nhạc tự ẩn. Nhạc chỉ phát sau khi bấm mở quà hoặc bấm nút ♪.
- Tên file phân biệt hoa/thường trên GitHub Pages: `anh1.jpg` khác `Anh1.JPG`.

## Chạy thử trên máy
- Cách nhanh: nhấp đúp `index.html`.
- Cách chuẩn: trong thư mục `20-11`, chạy `python -m http.server 8000` rồi mở http://localhost:8000 (hoặc dùng tiện ích Live Server của VS Code).

## Đưa lên GitHub Pages
1. Tạo repository mới trên github.com (ví dụ `20-11`, để Public).
2. Trong thư mục dự án chạy:
   ```bash
   git init
   git add .
   git commit -m "Website 20/11"
   git branch -M main
   git remote add origin https://github.com/<tên-tài-khoản>/20-11.git
   git push -u origin main
   ```
   (Hoặc kéo thả toàn bộ file vào repository bằng nút *Add file → Upload files*.)
3. Vào **Settings → Pages**, mục *Source* chọn **Deploy from a branch**, nhánh **main**, thư mục **/ (root)**, bấm **Save**.
4. Sau 1–2 phút, link có dạng `https://<tên-tài-khoản>.github.io/20-11/` — gửi link này cho cô.

## Tùy chỉnh
- Lời chúc trong thiệp: sửa trong `index.html` (các thẻ có class `rv`).
- Lời chúc từ các bạn (nút "Lời chúc từ các bạn"): sửa danh sách trong `js/wishes.js` (mỗi dòng gồm `name` và `text`). Khi đưa lên GitHub nhớ upload cả file này.
- Màu sắc: biến CSS ở đầu `css/style.css`.

## Dùng nhiều ảnh (khuyên dùng)
1. Chép toàn bộ ảnh vào `assets/images/` (tên file gì cũng được; hỗ trợ jpg, png, webp, gif).
2. Nhấp đúp `cap-nhat-anh.bat` (Windows). File này tự ghi danh sách ảnh vào `js/images.js`.
3. Mở lại `index.html`, nhấn Ctrl+F5. Mỗi lần thêm/xóa ảnh, chạy lại bước 2.
4. Khi đưa lên GitHub, nhớ upload cả `js/images.js`.
5. Thu nhỏ ảnh trước (khoảng 1000px, dưới 300KB/ảnh), nếu không web sẽ rất nặng.
- Nút bí mật "🔒 Bí mật – cô đừng mở nhé!" (dưới nút mở thiệp ở màn hình đầu): mở phòng bánh sinh nhật, phát nhạc Happy Birthday, thổi nến thì có khói, pháo hoa, pháo giấy, bóng bay và các lời chúc trong `js/wishes.js` lần lượt nổi lên màn hình. Ngày sinh nhật (30/11) đặt trong hàm `cakeDays` ở `js/script.js`; số nến và màu nến ở mảng `CANDLES`, `CCOL`. Nhạc Happy Birthday tự tạo bằng code (mảng `HB`), không cần file nhạc.
