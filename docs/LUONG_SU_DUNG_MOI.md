# 🚀 Bắt Đầu Với 2Know — Luồng Sử Dụng Cho Người Mới

> **Dành cho**: Giáo viên lần đầu sử dụng 2Know, đã có danh sách học sinh và tài liệu giảng dạy.  
> **Thời gian setup**: ~20 phút  
> **Link truy cập**: [https://2-know.vercel.app](https://2-know.vercel.app)

---

## 🗺 Tổng quan luồng sử dụng

```
Đăng ký tài khoản
      ↓
Tạo Lớp học → Thêm Học sinh → Thêm Tài liệu
      ↓
Tạo Bài kiểm tra → Thêm Câu hỏi → Xuất bản
      ↓
Gửi link cho Học sinh → Học sinh làm bài
      ↓
Chấm điểm (nếu có tự luận) → Xem kết quả & Thống kê
```

---

## Bước 1: Đăng ký tài khoản (2 phút)

1. Mở trình duyệt → Truy cập [https://2-know.vercel.app/register](https://2-know.vercel.app/register)
2. Nhập thông tin:
   - **Email**: Email cá nhân của bạn (VD: `nguyen.van.a@gmail.com`)
   - **Mật khẩu**: Tối thiểu 6 ký tự
   - **Họ tên**: Tên hiển thị (VD: `Nguyễn Văn A`)
3. Nhấn **"Đăng ký"**
4. Hệ thống tự động đăng nhập → Bạn sẽ thấy trang **Tổng quan (Dashboard)**

> 💡 Nếu trang hiện lỗi kết nối lần đầu → **đợi 30 giây rồi refresh** (server demo cần khởi động)

---

## Bước 2: Tạo Lớp học (3 phút)

> 📍 **Đường dẫn**: Sidebar trái → **Lớp học** → **"+ Tạo lớp"**

### 2.1 Tạo lớp đầu tiên
1. Nhấn **"+ Tạo lớp"**
2. Điền thông tin:
   - **Tên lớp**: `Lớp 12A1` (hoặc tên lớp bạn đang dạy)
   - **Môn học**: `Toán học`
   - **Mô tả**: `Lớp Toán nâng cao, học kỳ 2` *(tùy chọn)*
3. Nhấn **"Tạo"** ✅

### 2.2 Tạo thêm lớp (nếu cần)
- Lặp lại quy trình trên cho mỗi lớp bạn dạy
- VD: `Lớp 12A2 — Vật lý`, `Lớp 11B — Tiếng Anh`

---

## Bước 3: Thêm Học sinh vào lớp (5 phút)

> 📍 **Đường dẫn**: Sidebar → **Lớp học** → Click vào lớp vừa tạo

### 3.1 Thêm từng học sinh
1. Trong trang chi tiết lớp, tìm mục **Học sinh**
2. Nhấn **"+ Thêm học sinh"**
3. Điền thông tin:
   - **Họ tên**: `Trần Thị B`
   - **Mã số (SBD/MSSV)**: `001` *(bắt buộc, dùng để nhận diện)*
   - **Email**: *(tùy chọn)*
   - **Số điện thoại**: *(tùy chọn)*
4. Nhấn **"Thêm"**
5. Lặp lại cho tất cả học sinh trong lớp

### 3.2 Xem danh sách tổng
- Sidebar → **Học sinh** để xem toàn bộ học sinh bạn đã tạo (không phân biệt lớp)
- Click vào tên học sinh → Xem hồ sơ, lịch sử làm bài

---

## Bước 4: Thêm Tài liệu cho lớp (3 phút)

> 📍 **Đường dẫn**: Sidebar → **Lớp học** → Click vào lớp → Tab **Tài liệu**

### 4.1 Thêm tài liệu
1. Nhấn **"+ Thêm tài liệu"**
2. Điền:
   - **Tiêu đề**: `Chương 1 — Đại số tổ hợp`
   - **Mô tả**: `Slide bài giảng tuần 1-2`
   - **Link**: Paste link Google Drive, YouTube, hoặc website
   - **Loại**: `Tài liệu` / `Video` / `Link`
3. Nhấn **"Tạo"**

> ⚠️ **Lưu ý**: 2Know lưu **link tài liệu** (Google Drive, YouTube, v.v.), không upload file trực tiếp. Hãy upload file lên Google Drive trước rồi dán link vào đây.

---

## Bước 5: Tạo Bài kiểm tra đầu tiên (5 phút) ⭐

> 📍 **Đường dẫn**: Sidebar → **Bài kiểm tra** → **"+ Tạo bài kiểm tra"**

### 5.1 Cấu hình nhanh
Trình tạo có 9 bước, nhưng bạn chỉ cần điền **3 bước quan trọng**:

#### Bước 1 — Chọn loại
- 🎯 Chọn **"Thi"** nếu muốn chấm điểm nghiêm túc
- 📚 Chọn **"Luyện tập"** nếu cho học sinh ôn tập

#### Bước 2 — Thông tin chung
- **Tên bài**: `Kiểm tra 15 phút — Chương 1`
- **Môn**: Chọn môn phù hợp
- **Cấp độ**: Chọn cấp

#### Bước 4 — Thêm câu hỏi (quan trọng nhất!)
1. Nhấn **"+ Thêm câu hỏi"**
2. **Câu trắc nghiệm**:
   - Nhập đề: `1 + 1 = ?`
   - Nhập 4 đáp án: `1`, `2`, `3`, `4`
   - ✅ Tick vào đáp án đúng (`2`)
   - Điểm: `10`
3. **Câu tự luận**:
   - Chọn loại "Tự luận"
   - Nhập đề: `Giải phương trình: x² - 5x + 6 = 0`
   - Điểm: `20`
4. Thêm bao nhiêu câu tùy ý

### 5.2 Xuất bản
- Nhấn **"Tiếp"** đến bước 9
- Nhấn **"Xuất bản"**
- ✅ Bài kiểm tra đã sẵn sàng cho học sinh!

---

## Bước 6: Gửi bài kiểm tra cho Học sinh (1 phút)

### Cách lấy link chia sẻ:
1. Vào **Bài kiểm tra** → Click vào bài vừa tạo
2. Sao chép **link chia sẻ** dạng:
   ```
   https://2-know.vercel.app/test/{quiz-id}
   ```
3. Gửi link qua **Zalo, Messenger, Email, hoặc nhóm lớp**

### Cách khác — QR Code:
- Trong trang chi tiết bài kiểm tra có QR Code sẵn
- Chụp MH / chiếu lên TV để học sinh quét

> 💡 **Học sinh KHÔNG cần tài khoản**. Mở link → Nhập tên → Làm bài → Nộp bài.

---

## Bước 7: Học sinh làm bài

> **Phía học sinh** (chia sẻ hướng dẫn này cho các em):

1. Mở link giáo viên gửi trên **điện thoại** hoặc **máy tính**
2. Nhập **Họ tên** của mình
3. Đọc thông tin bài (thời gian, số câu)
4. Nhấn **"Bắt đầu làm bài"**
5. Trả lời từng câu:
   - Trắc nghiệm → Click vào đáp án
   - Tự luận → Gõ câu trả lời
6. Nhấn **"Nộp bài"**
7. Xem điểm ngay (nếu giáo viên cho phép)

---

## Bước 8: Chấm điểm & Xem kết quả (2 phút)

### Câu trắc nghiệm → Tự động chấm ✅
Không cần làm gì — hệ thống chấm ngay khi học sinh nộp.

### Câu tự luận → Chấm thủ công
1. Sidebar → **Chấm điểm** → Xem danh sách bài chờ
2. Mở bài → Đọc câu trả lời → Nhập điểm → **"Chấm"**

### Xem kết quả & Thống kê
- Sidebar → **Bài kiểm tra** → Click bài → Tab **Kết quả**
- Xem: Điểm từng em, thời gian làm, câu nào sai nhiều nhất
- Sidebar → **Báo cáo** → **Xuất CSV** để lưu file Excel

### Xem bảng điểm tổng hợp
- Sidebar → **Lớp học** → Click lớp → Tab **Bảng điểm (Gradebook)**
- Xem tổng hợp điểm tất cả bài kiểm tra của lớp

---

## Bước 9: Tổ chức & Khám phá thêm

Bạn đã hoàn thành luồng cơ bản! Dưới đây là các tính năng bổ sung:

| Tính năng | Đường dẫn | Mô tả |
|-----------|-----------|-------|
| **Ghi chú** | Sidebar → Ghi chú | Không gian canvas ghi chú cá nhân |
| **Nhãn** | Sidebar → Nhãn | Tổ chức ghi chú bằng tag màu |
| **Ngân hàng câu hỏi** | Sidebar → Ngân hàng câu hỏi | Tái sử dụng câu hỏi cho nhiều bài |
| **Rubrics** | Sidebar → Rubrics | Tạo thang chấm điểm tự luận |
| **OMR** | Sidebar → OMR | Quản lý phiếu trắc nghiệm giấy |
| **Vòng quay** | Sidebar → Công cụ → Vòng quay | Mini game gọi tên ngẫu nhiên |
| **Live Leaderboard** | Bài kiểm tra → Live | Bảng xếp hạng thời gian thực |
| **Dark Mode** | Sidebar → Cài đặt | Giao diện tối |
| **Đa ngôn ngữ** | Sidebar → Cài đặt | Chuyển đổi Tiếng Việt / English |

---

## 📐 Sơ đồ quan hệ dữ liệu

```
Giáo viên (Bạn)
├── Lớp học
│   ├── Học sinh (danh sách)
│   └── Tài liệu (links Google Drive, YouTube)
├── Bài kiểm tra
│   ├── Câu hỏi (trắc nghiệm, tự luận)
│   ├── Kết quả (bài nộp của học sinh)
│   └── Live Leaderboard
├── Ngân hàng câu hỏi (câu hỏi dùng chung)
├── Ghi chú cá nhân
│   └── Nhãn (tags)
├── Rubrics (thang chấm điểm)
└── OMR (phiếu trắc nghiệm giấy)
```

---

## ❓ Câu hỏi thường gặp

### Q: Học sinh có cần tạo tài khoản không?
**Không.** Học sinh chỉ cần mở link và nhập tên để làm bài.

### Q: Tôi có thể tạo bao nhiêu bài kiểm tra?
**Không giới hạn** số lượng bài kiểm tra, câu hỏi, hoặc lớp học.

### Q: Dữ liệu có an toàn không?
Mỗi tài khoản giáo viên có dữ liệu **hoàn toàn riêng biệt**. Không ai xem được dữ liệu của bạn.

### Q: Trang web bị chậm / lỗi kết nối?
Do bản demo dùng server miễn phí — server "ngủ" sau 15 phút không dùng. **Đợi 30 giây rồi refresh** là được.

### Q: Tôi muốn xem bài kiểm tra như học sinh thấy?
Mở link bài kiểm tra ở **trình duyệt ẩn danh** (Ctrl+Shift+N) để thử làm bài.

---

*Chúc bạn sử dụng 2Know hiệu quả! 🎉*
