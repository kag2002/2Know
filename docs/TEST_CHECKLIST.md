# ✅ Checklist Test — 2Know Demo

> **Link**: [https://2-know.vercel.app](https://2-know.vercel.app)  
> **Tài khoản demo**: `demo@2know.edu.vn` / `demo123`  
> **Ngày test**: ___/___/2026 | **Người test**: _______________

---

## Hướng dẫn

- Đánh dấu ✅ nếu tính năng hoạt động đúng
- Đánh dấu ❌ nếu bị lỗi → ghi chú mô tả lỗi bên cạnh
- Đánh dấu ⏭ nếu bỏ qua (không test)
- Nếu lần đầu mở web bị lỗi → **đợi 30 giây rồi refresh** (server đang khởi động)

---

## 1. Đăng nhập & Đăng ký

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 1.1 | Mở [https://2-know.vercel.app](https://2-know.vercel.app) → Tự chuyển sang trang Login | ☐ | |
| 1.2 | Đăng nhập bằng `demo@2know.edu.vn` / `demo123` → Vào được Dashboard | ☐ | |
| 1.3 | Đăng xuất (nút logout góc dưới trái sidebar) → Quay về Login | ☐ | |
| 1.4 | Mở [/register](https://2-know.vercel.app/register) → Tạo tài khoản mới → Đăng nhập thành công | ☐ | |
| 1.5 | Đăng nhập sai mật khẩu → Hiện thông báo lỗi | ☐ | |

---

## 2. Dashboard tổng quan

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 2.1 | Trang Overview load đúng, hiển thị 4 thẻ thống kê | ☐ | |
| 2.2 | Biểu đồ phân bổ điểm (Pie chart) hiển thị đúng | ☐ | |
| 2.3 | Nhấn "Tải lại" → Dữ liệu refresh | ☐ | |
| 2.4 | Nhấn "+ Tạo mới" → Chuyển sang trang tạo bài kiểm tra | ☐ | |

---

## 3. Tạo Bài kiểm tra (Wizard 9 bước)

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 3.1 | Sidebar → Bài kiểm tra → "+ Tạo bài kiểm tra" | ☐ | |
| 3.2 | **Bước 1**: Chọn loại "Thi" → highlight đúng | ☐ | |
| 3.3 | **Bước 1**: Nhấn preset "Thi nghiêm ngặt" → cấu hình đổi | ☐ | |
| 3.4 | **Bước 2**: Nhập tên "Bài test Demo", chọn Môn Toán, Lớp THPT | ☐ | |
| 3.5 | **Bước 3**: Chọn "Công khai" | ☐ | |
| 3.6 | **Bước 4**: Thêm 3 câu trắc nghiệm, mỗi câu 4 đáp án, tick đáp án đúng | ☐ | |
| 3.7 | **Bước 4**: Thêm 1 câu tự luận | ☐ | |
| 3.8 | **Bước 4**: Kéo thả sắp xếp thứ tự câu hỏi | ☐ | |
| 3.9 | **Bước 6**: Nhập thời gian 15 phút | ☐ | |
| 3.10 | **Bước 9**: Nhấn "Xuất bản" → thông báo thành công → quay về danh sách | ☐ | |
| 3.11 | Nhấn "Lưu nháp" → Bài kiểm tra status = Draft | ☐ | |

---

## 4. Danh sách Bài kiểm tra

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 4.1 | Trang danh sách hiện đúng bài vừa tạo | ☐ | |
| 4.2 | Tìm kiếm "Demo" → Lọc đúng bài | ☐ | |
| 4.3 | Nhấn vào bài → Xem chi tiết (câu hỏi, trạng thái) | ☐ | |
| 4.4 | Chỉnh sửa bài kiểm tra → Thay đổi tên → Lưu thành công | ☐ | |
| 4.5 | Xoá bài kiểm tra → Xác nhận → Bài biến mất khỏi danh sách | ☐ | |

---

## 5. Học sinh làm bài (Public Test) ⭐

> **Quan trọng**: Test này nên mở ở trình duyệt ẩn danh (Incognito) hoặc trình duyệt khác

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 5.1 | Copy link bài kiểm tra đã published → Mở ở trình duyệt ẩn danh | ☐ | |
| 5.2 | Trang hiển thị đúng thông tin bài (tên, số câu, thời gian) | ☐ | |
| 5.3 | Nhập tên "Học sinh Test" → Nhấn "Bắt đầu" | ☐ | |
| 5.4 | Trả lời các câu trắc nghiệm (click chọn đáp án) | ☐ | |
| 5.5 | Trả lời câu tự luận (gõ văn bản) | ☐ | |
| 5.6 | Nhấn "Nộp bài" → Hiện trang kết quả (điểm, câu đúng/sai) | ☐ | |
| 5.7 | Điểm tính đúng (so với đáp án đã đặt) | ☐ | |

---

## 6. Chấm điểm

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 6.1 | Sidebar → Chấm điểm → Hiện bài cần chấm (câu tự luận) | ☐ | |
| 6.2 | Mở bài → Xem câu trả lời tự luận | ☐ | |
| 6.3 | Nhập điểm cho câu tự luận → Nhấn "Chấm" → Thành công | ☐ | |

---

## 7. Xem Kết quả & Analytics

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 7.1 | Vào bài kiểm tra → Tab kết quả → Hiện danh sách bài nộp | ☐ | |
| 7.2 | Hiện đúng điểm, tên, thời gian làm bài | ☐ | |
| 7.3 | Xem phân tích câu hỏi (câu nào sai nhiều nhất) | ☐ | |

---

## 8. Live Leaderboard

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 8.1 | Vào bài kiểm tra → Tab "Live" → Hiện bảng xếp hạng | ☐ | |
| 8.2 | Mở bài test ở trình duyệt khác → Nộp bài → Leaderboard tự cập nhật | ☐ | |
| 8.3 | Hiển thị đúng: Xếp hạng, Điểm, Số câu đúng, Thời gian | ☐ | |

---

## 9. Quản lý Lớp học

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 9.1 | Sidebar → Lớp học → Hiện danh sách (hoặc trống) | ☐ | |
| 9.2 | "+ Tạo lớp" → Nhập "Lớp 12A1", Môn "Toán" → Tạo thành công | ☐ | |
| 9.3 | Vào chi tiết lớp → Thêm học sinh vào lớp | ☐ | |
| 9.4 | Xem Bảng điểm (Gradebook) | ☐ | |
| 9.5 | Thêm tài liệu vào lớp | ☐ | |
| 9.6 | Sửa thông tin lớp → Lưu thành công | ☐ | |
| 9.7 | Xoá lớp → Xác nhận → Lớp biến mất | ☐ | |

---

## 10. Quản lý Học sinh

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 10.1 | Sidebar → Học sinh → Hiện danh sách | ☐ | |
| 10.2 | "+ Thêm học sinh" → Nhập thông tin → Tạo thành công | ☐ | |
| 10.3 | Vào chi tiết → Xem lịch sử làm bài | ☐ | |
| 10.4 | Sửa thông tin học sinh → Lưu | ☐ | |
| 10.5 | Xoá học sinh → Xác nhận | ☐ | |

---

## 11. Ngân hàng Câu hỏi

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 11.1 | Sidebar → Ngân hàng câu hỏi → Hiện danh sách | ☐ | |
| 11.2 | Tạo câu hỏi mới trực tiếp | ☐ | |
| 11.3 | Sửa câu hỏi → Lưu | ☐ | |
| 11.4 | Xoá câu hỏi | ☐ | |

---

## 12. Ghi chú (Notes)

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 12.1 | Sidebar → Ghi chú → Hiện Canvas | ☐ | |
| 12.2 | Tạo ghi chú mới → Nhập nội dung | ☐ | |
| 12.3 | Kéo thả ghi chú trên canvas | ☐ | |
| 12.4 | Ghim ghi chú | ☐ | |
| 12.5 | Xoá ghi chú | ☐ | |

---

## 13. Tags (Nhãn)

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 13.1 | Sidebar → Nhãn → Hiện danh sách | ☐ | |
| 13.2 | Tạo nhãn mới → Chọn màu | ☐ | |
| 13.3 | Sửa nhãn → Lưu | ☐ | |
| 13.4 | Xoá nhãn | ☐ | |

---

## 14. Rubrics

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 14.1 | Sidebar → Rubrics → Hiện danh sách | ☐ | |
| 14.2 | Tạo rubric mới → Thêm tiêu chí | ☐ | |
| 14.3 | Sửa rubric → Lưu | ☐ | |
| 14.4 | Xoá rubric | ☐ | |

---

## 15. OMR

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 15.1 | Sidebar → OMR → Hiện danh sách batch | ☐ | |
| 15.2 | Tạo batch mới → Chọn bài kiểm tra | ☐ | |
| 15.3 | Tạo phiên bản đề → Thành công | ☐ | |

---

## 16. Chia sẻ Links

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 16.1 | Sidebar → Chia sẻ → Hiện danh sách | ☐ | |
| 16.2 | Tạo link mới → Link có mã riêng | ☐ | |
| 16.3 | Sửa / Xoá link | ☐ | |

---

## 17. Báo cáo

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 17.1 | Sidebar → Báo cáo → Hiện thống kê | ☐ | |
| 17.2 | Xuất CSV → File tải về máy | ☐ | |

---

## 18. Vòng quay May mắn

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 18.1 | Sidebar → Công cụ → Vòng quay | ☐ | |
| 18.2 | Nhập danh sách tên → Quay → Hiện kết quả ngẫu nhiên | ☐ | |

---

## 19. Cài đặt

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 19.1 | Sidebar → Cài đặt → Hiện trang settings | ☐ | |
| 19.2 | Đổi tên hiển thị → Lưu → Sidebar hiện tên mới | ☐ | |
| 19.3 | Đổi mật khẩu → Đăng xuất → Đăng nhập lại bằng mật khẩu mới | ☐ | |
| 19.4 | Chuyển Dark Mode ↔ Light Mode | ☐ | |
| 19.5 | Đổi ngôn ngữ (Tiếng Việt → English → Italiano) | ☐ | |

---

## 20. UI/UX Tổng thể

| # | Test case | Kết quả | Ghi chú |
|---|-----------|---------|---------|
| 20.1 | Sidebar navigation hoạt động mượt | ☐ | |
| 20.2 | Responsive trên điện thoại (mở trên mobile browser) | ☐ | |
| 20.3 | Dark Mode hiển thị đẹp, không bị lỗi màu | ☐ | |
| 20.4 | Thông báo toast (success/error) hiện đúng | ☐ | |
| 20.5 | Command Palette (Ctrl+K hoặc Cmd+K) hoạt động | ☐ | |

---

## 📝 Nhận xét chung

### Điểm tốt:
> _Ghi nhận xét ở đây..._

### Điểm cần cải thiện:
> _Ghi nhận xét ở đây..._

### Lỗi nghiêm trọng (nếu có):
> _Ghi mô tả lỗi, bước tái hiện..._

---

**Cảm ơn bạn đã test! 🙏**
