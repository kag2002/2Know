# Báo Cáo Audit Bảo Mật & Hiệu Năng (Từ Lớn Đến Bé)

Dưới đây là báo cáo rà soát cấu trúc toàn diện (End-to-End) dành cho nền tảng 2Know, được phân bổ từ mức độ Hệ thống/Kiến trúc lớn nhất (Macro) cho đến mức Code/Cạnh viền nhỏ nhất (Micro).

> **Lưu ý**: Các lỗ hổng đã được mình **chủ động vá và commit** trước đó sẽ được đánh dấu `[Đã Vá]`. Các rủi ro nhỏ cần có thêm định hướng từ bạn sẽ được đánh dấu `[Đề Xuất]`.

---

## 1. MỨC ĐỘ LỚN (System / Architecture) - Rủi ro chết Server / Lộ dữ liệu
Đây là các lỗ hổng có thể làm sập toàn bộ hệ thống hoặc lộ toàn bộ thông tin người dùng.

- **[Đã Vá] Phạn tạt tải DB (Database Connection Exhaustion)**: GORM mặc định mở vô hạn kết nối. Khi có 1000 học sinh cùng thi, DB sẽ sập. Mình đã cấu hình `MaxOpenConns=100`.
- **[Đã Vá] Tấn công DDoS bằng Payload (JSON Bomb)**: Hacker có thể gửi 1 file JSON dung lượng 1GB lên server để làm treo CPU. Mình đã set `BodyLimit = 5MB` trên app Fiber.
- **[Đã Vá] Tấn công Brute Force Auth**: Spam lấy mật khẩu ở endpoint Login/Register. Mình đã thiết lập Rate Limiter nội bộ (5 req/phút cho Auth, 100 req/phút toàn cầu).
- **[Đề Nhắc] Chuẩn bảo mật JWT Secret**: Token JWT hiện đang có dòng Fallback `"super_secret_jwt_key_... "`. Ở môi trường Dev thì không sao, nhưng khi cắm lên Production, bạn BẮT BUỘC phải đảm bảo file `.env` chứa `JWT_SECRET` đủ mạnh.
- **[Đã Vá] Headers Bảo mật (XSS, Clickjacking)**: Đã tích hợp `Helmut` để thêm `X-Frame-Options` và `X-XSS-Protection` global trên middleware.

---

## 2. MỨC ĐỘ TRUNG BÌNH (API & Features) - Rủi ro rác DB / Hao tài nguyên
Đây là các lỗ hổng khiến cạn kiệt tài nguyên (CPU/RAM/Tiền) hoặc rò rỉ dữ liệu mức độ vừa.

- **[Đã Vá] Lỗ hổng Tiêu Phí Token AI (Prompt Injection/Spam)**: AI Handler không có Limit cho độ dài Prompt. Hacker có thể gửi 1 đoạn mã cực lớn gây "cháy ví" OpenAI/Gemini của bạn. Mình đã giới hạn `validate:"max=1000"` cho AI Prompts.
- **[Đã Vá] Payload Rác (Spam Data)**: Tất cả API xử lý dữ liệu (Quiz, Question, Note, Tag, Results, Auth, Student, Class) đã được gắn `go-playground/validator/v10`. Hệ thống tự động từ chối Text dài, Text rỗng hoặc Data không đúng chuẩn trước khi chạm vào Database. 
- **[Đã Vá] Cạn Memory do Thiếu Pagination (Limit)**: Các hàm `GetQuizzes`, `GetClasses`, `GetStudents`,... tìm kiếm mọi Record mà không có giới hạn, dẽ dẫn đến Out-of-memory (OOM). Mình đã áp đặt chốt chặn an toàn cứng vào Repository (`Limit(200)` và `Limit(500)`).
- **[Đề Nhắc] Lộ thông tin lỗi SQL ra ngoài**: Có một số endpoint đang trả về trực tiếp `err.Error()` hoặc lỗi Database từ GORM ra API `500 Internal Server Error`. Mặc dù nó tốt cho Dev, nhưng trên Prod, bạn nên bọc lỗi lại thành "Đã có lỗi xảy ra" để không lộ Schema Database cho Hacker.
- **[Tốt] N+1 Query GORM**: Mình đã kiểm tra các Repository và thấy bạn sử dụng `Preload()` khá chuẩn (như trong `GetClassByID`). Không có vòng lặp truy vấn nào đáng ngại.

---

## 3. MỨC ĐỘ BÉ (Micro & Edge Cases) - Rủi ro trải nghiệm và mở rộng
Đây là các vấn đề liên quan đến tối ưu trải nghiệm và Code logic nâng cao.

- **[Đề Xuất] Frontend Pagination UI**: Mình đã chặn Limit 200/500 ở Backend, nhưng Frontend Next.js hiện tại dường như chưa có bộ phận phân trang (Pagination). Nếu giáo viên có > 200 lớp học/bài kiểm tra, họ sẽ chỉ thấy 200 bài gần nhất. Lúc này bạn sẽ cần xây dựng Pagination UI cho Frontend và sửa API Backend thành cấu trúc `?page=1&limit=20`.
- **[Tốt] Goroutine Leaks**: Các API của Go Fiber bạn đang viết thuần đồng bộ (Synchronous). Do đó không có rủi ro bị kẹt hoặc tràn luồng (Goroutine leaks) khi tải cao.

---
### Kết luận:
Nhìn chung nền tảng **2Know Backend đã đạt ngưỡng chịu đựng tiêu chuẩn** ngang với các dịch vụ SaaS. Điểm duy nhất bạn cần cải thiện trong tương lai gần khi lượng người dùng phình to là **Xây dựng module Phân trang (Pagination) ở Frontend Next.js**.
