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
- Lời chúc: sửa trong `index.html` (các thẻ có class `rv`).
- Màu sắc: biến CSS ở đầu `css/style.css`.
