# ⚠️ Giới Hạn & Hạn Chế — 2Know Demo

> **Phiên bản**: Demo v1.0 (Free Tier)  
> **Cập nhật**: 07/04/2026

---

## 1. Giới hạn Hạ tầng (Infrastructure)

| Hạng mục | Giới hạn | Ghi chú |
|----------|----------|---------|
| **Backend (Render Free)** | Server tự ngủ sau **15 phút** không hoạt động | Lần truy cập đầu phải chờ 30s khởi động lại (cold start) |
| **Database (Supabase Free)** | Tự **tạm dừng sau 7 ngày** không hoạt động | Cần vào Supabase dashboard để resume thủ công |
| **Database dung lượng** | Tối đa **500 MB** | Đủ cho hàng chục ngàn bài kiểm tra |
| **Frontend (Vercel Free)** | **100 GB** bandwidth/tháng | Dư sức cho demo |
| **Backend RAM** | **512 MB** (Render Free) | Đủ cho ~50 người dùng đồng thời |
| **Request body** | Tối đa **5 MB** mỗi request | Không upload file lớn được |

---

## 2. Giới hạn Rate Limit (Chống spam)

| Hành động | Giới hạn | Thời gian reset |
|-----------|----------|-----------------|
| **API chung** | 100 requests | 1 phút |
| **Đăng nhập / Đăng ký** | 5 lần | 1 phút |
| **Nộp bài** | 10 lần | 1 phút |
| **AI Generate** | 3 lần | 1 phút |

→ Nếu vượt quá sẽ nhận lỗi "Too many requests", đợi 1 phút là được.

---

## 3. Giới hạn Tính năng

### ✅ Tính năng Đã Hoạt Động
| Tính năng | Trạng thái | Chi tiết |
|-----------|-----------|----------|
| Đăng ký / Đăng nhập | ✅ Hoàn chỉnh | JWT Auth, bcrypt |
| Tạo bài kiểm tra (Wizard) | ✅ Hoàn chỉnh | 9 bước, 3 loại câu hỏi |
| Học sinh làm bài online | ✅ Hoàn chỉnh | Không cần tài khoản |
| Chấm tự động (trắc nghiệm) | ✅ Hoàn chỉnh | Chấm ngay khi nộp |
| Chấm thủ công (tự luận) | ✅ Hoàn chỉnh | Giáo viên chấm từ Dashboard |
| Quản lý Lớp học | ✅ Hoàn chỉnh | CRUD + Gradebook |
| Quản lý Học sinh | ✅ Hoàn chỉnh | CRUD + Lịch sử + Mastery |
| Live Leaderboard | ✅ Hoàn chỉnh | WebSocket thời gian thực |
| Ngân hàng câu hỏi | ✅ Hoàn chỉnh | Dùng chung, polymorphic JSONB |
| Chia sẻ Links | ✅ Hoàn chỉnh | Mã chia sẻ tự động |
| Ghi chú (Infinite Canvas) | ✅ Hoàn chỉnh | Kéo thả, ghim, Block Editor |
| Tags | ✅ Hoàn chỉnh | CRUD nhãn |
| Rubrics | ✅ Hoàn chỉnh | CRUD thang đánh giá |
| OMR Batches | ✅ Hoàn chỉnh | Tạo đề + xáo trộn |
| Báo cáo + Xuất CSV | ✅ Hoàn chỉnh | Dashboard analytics |
| Dark Mode | ✅ Hoàn chỉnh | Tự động + Thủ công |
| Đa ngôn ngữ | ✅ Hoàn chỉnh | Tiếng Việt, English, Italiano |
| Vòng quay may mắn | ✅ Hoàn chỉnh | Mini game lớp học |
| QR Code chia sẻ | ✅ Hoàn chỉnh | Tự động generate |
| Chống gian lận | ✅ Cơ bản | Fullscreen + Chặn copy/paste |

### 🚧 Tính năng Chưa Có / Hạn Chế
| Tính năng | Trạng thái | Chi tiết |
|-----------|-----------|----------|
| Upload file đính kèm | ❌ Chưa có | Chỉ lưu link (Google Drive, YouTube) |
| Gửi email thông báo | ❌ Chưa có | Không gửi email khi giao bài / quên mật khẩu |
| Import học sinh từ Excel | ❌ Chưa có | Phải thêm thủ công từng học sinh |
| AI tạo câu hỏi tự động | ⚠️ Giới hạn | Cần API key AI (chưa được cấu hình trong demo) |
| AI Camera chống gian lận | ❌ Chưa có | Label "PRO" trong UI |
| Báo cáo nâng cao | ⚠️ Cơ bản | Chỉ có phân tích đơn giản + xuất CSV |
| Mobile app | ❌ Chưa có | Chỉ có web (responsive mobile browser) |
| Quên mật khẩu | ❌ Chưa có | Không có flow reset password qua email |
| Xáo trộn thứ tự câu hỏi online | ❌ Chưa có | Chỉ xáo trộn trong OMR (giấy) |
| Giới hạn thời gian mở/đóng bài thi | ⚠️ UI có, backend chưa enforce | Có UI nhập ngày giờ nhưng chưa block thực |
| Nhóm đề thi (nhiều version) online | ❌ Chưa có | Chỉ hỗ trợ qua OMR batch |

---

## 4. Giới hạn Dữ liệu (Validation)

| Trường | Giới hạn | 
|--------|----------|
| Tên bài kiểm tra | 3–255 ký tự |
| Mô tả bài kiểm tra | Tối đa 2,000 ký tự |
| Tên lớp | 2–255 ký tự |
| Môn học | Tối đa 100 ký tự |
| Cấp độ | Tối đa 50 ký tự |
| Email | Phải đúng định dạng email |
| Mã học sinh (SBD) | Tối đa 50 ký tự, không trùng trong cùng lớp |
| Số câu hỏi / bài | Không giới hạn (khuyến nghị ≤ 200) |
| Số lớp / giáo viên | Không giới hạn |
| Số học sinh / lớp | Không giới hạn |
| Số bài kiểm tra | Không giới hạn |
| Mật khẩu | Tối thiểu 6 ký tự (khuyến nghị) |

---

## 5. Giới hạn Bảo mật

| Hạng mục | Chi tiết |
|----------|----------|
| **Multi-tenancy** | ✅ Mỗi giáo viên chỉ thấy dữ liệu của mình |
| **XSS** | ✅ Đã sanitize input (bluemonday) |
| **CORS** | ✅ Chỉ cho phép frontend domain |
| **JWT hết hạn** | Token hết hạn sau **24 giờ** → phải đăng nhập lại |
| **HTTPS** | ✅ Bắt buộc trên Vercel + Render |
| **DDOS** | ⚠️ Chỉ có rate limiting cơ bản, không có WAF/Cloudflare |
| **2FA** | ❌ Chưa có xác thực 2 bước |
| **Audit log** | ❌ Chưa có log theo dõi thao tác admin |

---

## 6. Giới hạn WebSocket (Live Leaderboard)

| Hạng mục | Chi tiết |
|----------|----------|
| **Render Free** | Có thể ngắt WebSocket sau 5 phút idle |
| **Ping/Pong** | Client gửi ping mỗi 15 giây để giữ kết nối |
| **Số kết nối đồng thời** | ~50 (giới hạn RAM 512MB) |
| **Reconnect** | ❌ Chưa có auto-reconnect (nếu mất kết nối phải refresh) |

---

## 7. Giới hạn Hiệu năng

| Hạng mục | Giới hạn hợp lý |
|----------|-----------------|
| **Người dùng đồng thời** | ~30–50 (Render Free 512MB) |
| **Học sinh cùng lúc làm bài** | ~100 (bài test public nhẹ) |
| **Database connections** | Pool: max 100, idle 10 |
| **Response time (warm)** | < 200ms cho hầu hết API |
| **Response time (cold start)** | 20–40 giây (lần đầu sau khi server ngủ) |

---

## 8. Tóm tắt nhanh — Cái gì ĐƯỢC và KHÔNG ĐƯỢC

### ✅ ĐƯỢC
- Tạo không giới hạn bài kiểm tra, lớp, học sinh
- Chấm điểm tự động trắc nghiệm
- Chia sẻ link + QR cho học sinh
- Xem analytics và xuất CSV
- Dùng Dark Mode + Đổi ngôn ngữ
- Nhiều giáo viên dùng chung (mỗi người tạo tài khoản riêng)

### ❌ KHÔNG ĐƯỢC
- Upload file đính kèm (dùng link Google Drive thay thế)
- Gửi email thông báo
- Import danh sách học sinh từ Excel
- Reset mật khẩu qua email
- Dùng offline

---

*Tài liệu này phản ánh giới hạn của phiên bản Demo v1.0 trên Free Tier hosting. Nhiều giới hạn sẽ được gỡ bỏ khi nâng cấp lên production.*
