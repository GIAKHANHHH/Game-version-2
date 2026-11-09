# Đấu giá kiến thức – Tây Tiến

Game chạy trực tiếp trên trình duyệt bằng **HTML, CSS và JavaScript**, phù hợp để đăng lên **GitHub Pages**. Không cần Python, VS Code hoặc cài thư viện để chơi.

## 1. Có gì trong game?

- 6 đội, mỗi đội bắt đầu với 100 điểm.
- 5 câu hỏi trắc nghiệm về bài thơ *Tây Tiến*.
- Mức cược 10, 20 hoặc 30 điểm; đội không đủ điểm có thể chọn bỏ cược (0 điểm); mức cược được hiển thị công khai trên màn chiếu.
- Ban tổ chức nhập đáp án A/B/C/D cho từng đội trên màn hình điều khiển riêng. Đáp án không xuất hiện trên màn chiếu trước khi công bố.
- Trả lời đúng: cộng điểm cược. Trả lời sai: trừ điểm cược (không để điểm âm).
- Nếu sau 5 câu có từ 2 đội trở lên bằng điểm cao nhất, game mở đúng 1 câu Gala tự luận trong 15 giây. Ban tổ chức tự đánh giá và chọn đội thắng; game không tự chấm.
- Nếu chỉ có một đội đứng đầu, không mở Gala.
- Công bố đủ giải Nhất đến giải Sáu, không có đồng giải. Nếu các đội ngoài giải Nhất bằng điểm, thứ tự tên đội A → F là quy tắc phụ để sắp thứ hạng duy nhất.

## 2. Chạy thử trên máy tính

1. Giải nén file ZIP.
2. Mở `index.html` bằng Chrome hoặc Edge.
3. Trang đầu là màn hình điều khiển của ban tổ chức.
4. Nhấn **Mở màn chiếu** để mở cửa sổ trình chiếu riêng.

Lưu ý: Điều khiển và màn chiếu cần được mở từ cùng một địa chỉ / cùng trình duyệt để đồng bộ dữ liệu. Game lưu tiến trình trong bộ nhớ trình duyệt của máy đang điều khiển.

## 3. Đưa lên GitHub Pages

1. Đăng nhập GitHub và tạo repository mới, ví dụ `dau-gia-kien-thuc`.
2. Chọn repository đó → **Add file → Upload files**.
3. Tải lên 3 file: `index.html`, `style.css`, `app.js`.
4. Nhấn **Commit changes**.
5. Vào **Settings → Pages**.
6. Trong **Build and deployment**, chọn:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
7. Nhấn **Save** và chờ GitHub Pages tạo website.
8. Mở đường dẫn GitHub Pages mà GitHub cung cấp.

## 4. Cách dùng khi trình chiếu

1. Mở website GitHub Pages trên laptop của ban tổ chức.
2. Nhấn **Mở màn chiếu**. Trình duyệt có thể hỏi cho phép cửa sổ bật lên; hãy cho phép.
3. Nếu có máy chiếu / màn hình thứ hai, chọn chế độ Windows **Extend (Mở rộng)**.
4. Kéo cửa sổ màn chiếu sang màn hình máy chiếu, nhấn **Toàn màn hình**.
5. Giữ cửa sổ điều khiển trên laptop.
6. Ban tổ chức nhập đáp án ở laptop; chỉ màn chiếu công khai câu hỏi, mức cược và kết quả đã công bố.

**Quan trọng:** Không dùng chế độ Duplicate nếu cần giữ bảng điều khiển riêng tư, vì Duplicate sẽ chiếu y hệt màn hình laptop. Cần dùng Extend.

## 5. Quy trình một câu hỏi

1. Chọn mức cược cho 6 đội.
2. Nhấn **Khóa mức cược**.
3. Các đội ghi đáp án lên bảng và giơ lên cùng lúc.
4. Ban tổ chức nhập đáp án từng đội trên laptop.
5. Khi đủ 6 đội, nhấn **Công bố kết quả câu này**.
6. Nhấn **Sang câu tiếp theo**.

## 6. Lưu ý

- Nên dùng Chrome hoặc Edge bản mới.
- Cần internet khi mở website GitHub Pages. Sau khi trang đã tải xong, phần điều khiển và đồng bộ giữa hai cửa sổ dùng cùng trình duyệt trên máy đó.
- Không mở bản điều khiển trên nhiều máy tính khác nhau vì dữ liệu không được đồng bộ qua mạng.
- Nên chạy thử toàn bộ 5 câu trước buổi chơi thật.
