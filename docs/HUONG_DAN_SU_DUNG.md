# 📘 Hướng Dẫn Sử Dụng — 2Know Assessment Platform

> **Phiên bản**: Demo v1.0 | **Cập nhật**: 07/04/2026  
> **Truy cập**: [https://2-know.vercel.app](https://2-know.vercel.app)

---

## 📋 Mục Lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Đăng nhập / Đăng ký](#2-đăng-nhập--đăng-ký)
3. [Tổng quan Dashboard](#3-tổng-quan-dashboard)
4. [Quản lý Bài kiểm tra (Quizzes)](#4-quản-lý-bài-kiểm-tra)
5. [Tạo Bài kiểm tra mới](#5-tạo-bài-kiểm-tra-mới)
6. [Ngân hàng Câu hỏi](#6-ngân-hàng-câu-hỏi)
7. [Chia sẻ & Giao bài cho Học sinh](#7-chia-sẻ--giao-bài-cho-học-sinh)
8. [Học sinh làm bài (Public Test)](#8-học-sinh-làm-bài)
9. [Chấm điểm & Kết quả](#9-chấm-điểm--kết-quả)
10. [Live Leaderboard (Bảng xếp hạng)](#10-live-leaderboard)
11. [Quản lý Lớp học](#11-quản-lý-lớp-học)
12. [Quản lý Học sinh](#12-quản-lý-học-sinh)
13. [Ghi chú (Notes — Infinite Canvas)](#13-ghi-chú-notes)
14. [Tags](#14-tags)
15. [Rubrics (Ma trận chấm điểm)](#15-rubrics)
16. [OMR — Phiếu trắc nghiệm](#16-omr--phiếu-trắc-nghiệm)
17. [Chia sẻ Links](#17-chia-sẻ-links)
18. [Báo cáo & Thống kê](#18-báo-cáo--thống-kê)
19. [Vòng quay May mắn](#19-vòng-quay-may-mắn)
20. [Cài đặt](#20-cài-đặt)
21. [Lưu ý khi dùng bản Demo](#21-lưu-ý-khi-dùng-bản-demo)

---

## 1. Giới thiệu

**2Know** là nền tảng kiểm tra & đánh giá trực tuyến dành cho giáo viên và học sinh. Giáo viên có thể tạo bài kiểm tra, giao bài, chấm điểm, và theo dõi kết quả — tất cả trên một giao diện web duy nhất.

### Tính năng nổi bật:
- ✅ Tạo bài kiểm tra đa dạng (trắc nghiệm, tự luận, nhiều đáp án)
- ✅ Học sinh làm bài trực tuyến qua link chia sẻ
- ✅ Chấm điểm tự động (trắc nghiệm) + Chấm thủ công (tự luận)
- ✅ Bảng xếp hạng thời gian thực (Live Leaderboard)
- ✅ Quản lý lớp học + học sinh
- ✅ Ngân hàng câu hỏi tái sử dụng
- ✅ Ghi chú Infinite Canvas
- ✅ Vòng quay may mắn (mini game)
- ✅ Hỗ trợ Dark Mode + Đa ngôn ngữ (Tiếng Việt, English, Italiano)

---

## 2. Đăng nhập / Đăng ký

### Tài khoản Demo sẵn có:
| Email | Mật khẩu |
|-------|----------|
| `demo@2know.edu.vn` | `demo123` |

### Hoặc tạo tài khoản mới:
1. Mở [https://2-know.vercel.app/register](https://2-know.vercel.app/register)
2. Nhập **Email**, **Mật khẩu**, **Họ tên**
3. Nhấn **Đăng ký**
4. Đăng nhập bằng tài khoản vừa tạo

> 💡 **Mẹo**: Mỗi tài khoản có dữ liệu riêng biệt, không ảnh hưởng lẫn nhau.

---

## 3. Tổng quan Dashboard

Sau khi đăng nhập, bạn sẽ thấy trang **Tổng quan** với:

- **4 thẻ thống kê**: Tổng bài kiểm tra, Tổng bài nộp, Điểm trung bình, Câu hỏi
- **Dòng hoạt động**: Lịch sử hoạt động gần đây (ai nộp bài, khi nào)
- **Biểu đồ phân bổ điểm**: Biểu đồ tròn hiển thị tỉ lệ Giỏi / Khá / Trung bình / Yếu

### Thao tác:
- Nhấn **"Tải lại"** để refresh dữ liệu
- Nhấn **"+ Tạo mới"** để tạo bài kiểm tra nhanh

---

## 4. Quản lý Bài kiểm tra

📍 **Menu**: Sidebar → **Bài kiểm tra**

Trang này liệt kê tất cả bài kiểm tra bạn đã tạo.

### Các thao tác:
| Thao tác | Cách làm |
|----------|----------|
| **Tạo mới** | Nhấn nút **"+ Tạo bài kiểm tra"** |
| **Xem chi tiết** | Nhấn vào tên bài kiểm tra |
| **Chỉnh sửa** | Nhấn icon bút chì hoặc vào chi tiết → Sửa |
| **Xoá** | Nhấn icon thùng rác → Xác nhận |
| **Tìm kiếm** | Dùng ô tìm kiếm trên đầu trang |

### Trạng thái bài kiểm tra:
- 🟡 **Draft (Nháp)**: Chưa xuất bản, học sinh chưa thấy
- 🟢 **Published (Đã xuất bản)**: Học sinh có thể truy cập và làm bài

---

## 5. Tạo Bài kiểm tra mới

📍 **Menu**: Sidebar → **Bài kiểm tra** → **"+ Tạo bài kiểm tra"**

Trình tạo bài kiểm tra có **9 bước** dạng Wizard:

### Bước 1 — Loại bài
Chọn một trong 3 loại:
- 🎯 **Thi**: Một lần làm, có chấm điểm
- 📚 **Luyện tập**: Nhiều lần làm lại với phản hồi
- 📋 **Khảo sát**: Ẩn danh, không chấm điểm

Hoặc dùng **Preset nhanh**:
- 🔒 **Thi nghiêm ngặt**: Fullscreen + Chặn copy + 1 lần làm
- 📤 **Nộp bài tập**: Không giới hạn

### Bước 2 — Cài đặt chung
- **Tên bài kiểm tra** *(bắt buộc)*
- **Mô tả / Hướng dẫn**
- **Môn học** (Toán, Văn, Anh, Lý, Khác)
- **Cấp độ** (Tiểu học, THCS, THPT, Đại học)

### Bước 3 — Người tham gia
- **Công khai**: Ai có link cũng làm được
- **Chỉ định lớp**: Chỉ học sinh trong lớp mới làm được

### Bước 4 — Câu hỏi ⭐
Đây là bước quan trọng nhất! Thêm câu hỏi bằng cách:
1. Nhấn **"+ Thêm câu hỏi"**
2. Chọn loại: **Trắc nghiệm** / **Nhiều đáp án** / **Tự luận**
3. Nhập nội dung câu hỏi
4. Nếu trắc nghiệm: Nhập 4 đáp án A, B, C, D → Tick đáp án đúng
5. Đặt **điểm số** cho mỗi câu
6. Kéo thả để sắp xếp thứ tự

### Bước 5 — Cấu hình OMR
- Chọn mẫu phiếu tô (nếu thi trên giấy)
- Chọn bố cục: 4 đáp án (A-D) hoặc Đúng/Sai

### Bước 6 — Thời gian
- **Thời gian làm bài** (phút) — bỏ trống = không giới hạn
- **Số lần làm lại tối đa**
- **Thời gian mở/đóng bài thi** (tùy chọn)

### Bước 7 — Thang điểm
- Bật/tắt: **Hiển thị kết quả ngay sau thi**
- Bật/tắt: **Trừ điểm khi sai**

### Bước 8 — Chống gian lận
- ✅ **Chế độ toàn màn hình**: Phát hiện khi thoát tab
- ✅ **Chống sao chép**: Vô hiệu chuột phải + Ctrl+C/V
- 🔒 **AI Camera** (tính năng Pro — chưa khả dụng)

### Bước 9 — Xuất bản
- Xem QR Code và link chia sẻ
- Nhấn **"Xuất bản"** để công khai bài kiểm tra
- Hoặc **"Lưu nháp"** để chỉnh sửa sau

---

## 6. Ngân hàng Câu hỏi

📍 **Menu**: Sidebar → **Ngân hàng câu hỏi**

Tất cả câu hỏi bạn đã tạo đều được lưu vào ngân hàng chung. Bạn có thể:

- **Xem** tất cả câu hỏi đã tạo
- **Tìm kiếm** theo nội dung
- **Sửa / Xoá** câu hỏi
- **Tái sử dụng** câu hỏi khi tạo bài kiểm tra mới

---

## 7. Chia sẻ & Giao bài cho Học sinh

Sau khi xuất bản bài kiểm tra, bạn có thể chia sẻ bằng 2 cách:

### Cách 1: Link trực tiếp
```
https://2-know.vercel.app/test/{quiz-id}
```
Mở link → Học sinh nhập tên → Làm bài → Nộp bài

### Cách 2: QR Code
- Vào trang chi tiết bài kiểm tra
- QR Code tự động được tạo
- Học sinh quét QR trên điện thoại → Vào làm bài

### Cách 3: Trang Chia sẻ (Sharing)
📍 **Menu**: Sidebar → **Chia sẻ**
- Tạo link chia sẻ có mã riêng (VD: `2K-AB1C2D`)
- Quản lý tất cả link đã tạo

---

## 8. Học sinh làm bài

> ⚡ **Học sinh KHÔNG cần đăng ký tài khoản**

### Quy trình:
1. Mở link bài kiểm tra (do giáo viên gửi)
2. Nhập **Họ tên** và chọn **Lớp** (nếu có)
3. Đọc thông tin bài thi (thời gian, số câu, hướng dẫn)
4. Nhấn **"Bắt đầu làm bài"**
5. Trả lời từng câu hỏi:
   - **Trắc nghiệm**: Click vào đáp án
   - **Nhiều đáp án**: Tick nhiều đáp án đúng
   - **Tự luận**: Gõ câu trả lời vào ô text
6. Nhấn **"Nộp bài"**
7. Xem kết quả ngay (nếu giáo viên bật tính năng này)

### Lưu ý cho học sinh:
- ⏱ Nếu có giới hạn thời gian → bộ đếm sẽ hiện phía trên
- 🖥 Nếu bật chế độ Fullscreen → không được thoát tab
- 📋 Nếu bật chống sao chép → không dùng được chuột phải

---

## 9. Chấm điểm & Kết quả

📍 **Menu**: Sidebar → **Chấm điểm**

### Chấm tự động (Trắc nghiệm):
- Câu trắc nghiệm được chấm **tự động ngay khi nộp**
- Điểm = số câu đúng × điểm mỗi câu

### Chấm thủ công (Tự luận):
1. Vào trang **Chấm điểm** → Xem danh sách bài chờ chấm
2. Mở bài làm của học sinh
3. Đọc câu trả lời → Nhập **điểm** cho mỗi câu tự luận
4. Nhấn **"Chấm xong"**

### Xem kết quả:
- Vào bài kiểm tra cụ thể → Tab **"Kết quả"**
- Xem danh sách tất cả bài nộp
- Xem **phân tích câu hỏi** (câu nào sai nhiều nhất)

---

## 10. Live Leaderboard

📍 **Menu**: Vào bài kiểm tra → **"Live"**

Bảng xếp hạng **thời gian thực** — cập nhật ngay khi học sinh nộp bài!

### Cách dùng:
1. Mở trang Live Leaderboard trên màn chiếu / TV
2. Gửi link bài kiểm tra cho học sinh
3. Khi học sinh nộp bài → Bảng xếp hạng tự động cập nhật
4. Xếp hạng theo: **Điểm cao → Thời gian ngắn** (nếu hòa điểm)

### Giao diện:
- 🥇 Top 1: Nền vàng
- 🥈 Top 2: Nền bạc
- 🥉 Top 3: Nền đồng
- Hiển thị: Tên, Điểm, Số câu đúng, Thời gian

> 💡 **Mẹo**: Rất phù hợp để chiếu lên TV trong lớp học, tạo không khí thi đấu!

---

## 11. Quản lý Lớp học

📍 **Menu**: Sidebar → **Lớp học**

### Tạo lớp mới:
1. Nhấn **"+ Tạo lớp"**
2. Nhập: Tên lớp, Môn học, Mô tả
3. Nhấn **"Tạo"**

### Trong trang chi tiết lớp:
- **Tab Học sinh**: Xem danh sách, thêm học sinh mới
- **Tab Tài liệu**: Upload/Quản lý tài liệu cho lớp
- **Tab Bảng điểm (Gradebook)**: Xem tổng hợp điểm tất cả bài kiểm tra
- **Tab Phân tích**: Xem analytics chi tiết

### Thao tác:
| Thao tác | Cách làm |
|----------|----------|
| Sửa thông tin lớp | Nhấn icon bút chì |
| Xoá lớp | Nhấn icon thùng rác |
| Thêm học sinh | Vào chi tiết → Tab Học sinh → "+ Thêm" |

---

## 12. Quản lý Học sinh

📍 **Menu**: Sidebar → **Học sinh**

Danh bạ học sinh toàn cục (không phụ thuộc lớp).

### Tạo học sinh:
1. Nhấn **"+ Thêm học sinh"**
2. Nhập: Họ tên, Email, Mã số, Lớp
3. Nhấn **"Tạo"**

### Xem hồ sơ học sinh:
- Click vào tên → Xem **lịch sử làm bài** + **mức độ nắm bắt kiến thức (Mastery)**

---

## 13. Ghi chú (Notes — Infinite Canvas)

📍 **Menu**: Sidebar → **Ghi chú**

Không gian Infinite Canvas cho giáo viên ghi chú, lên kế hoạch bài giảng.

### Thao tác:
- **Tạo ghi chú**: Nhấn "+" hoặc double-click vào canvas
- **Di chuyển**: Kéo thả ghi chú
- **Ghim**: Ghim ghi chú quan trọng lên đầu
- **Sửa nội dung**: Click vào ghi chú để chỉnh sửa
- **Xoá**: Click icon xoá

---

## 14. Tags

📍 **Menu**: Sidebar → **Nhãn**

Tạo và quản lý nhãn (tag) để tổ chức ghi chú.

- **Tạo nhãn**: Nhấn "+ Tạo nhãn" → Nhập tên + chọn màu
- **Sửa nhãn**: Click vào nhãn → Đổi tên/màu
- **Xoá nhãn**: Nhấn icon thùng rác

---

## 15. Rubrics (Ma trận chấm điểm)

📍 **Menu**: Sidebar → **Rubrics**

Tạo rubrics / thang đánh giá chi tiết cho bài tự luận.

- **Tạo rubric**: Nhấn "+ Tạo rubric"
- **Cấu hình tiêu chí**: Thêm các tiêu chí đánh giá + mức điểm
- **Sửa / Xoá**: Quản lý danh sách rubrics

---

## 16. OMR — Phiếu trắc nghiệm

📍 **Menu**: Sidebar → **OMR**

Quản lý phiếu trắc nghiệm giấy (Optical Mark Recognition).

### Tạo batch OMR:
1. Nhấn **"+ Tạo Batch"**
2. Chọn bài kiểm tra liên kết
3. Cấu hình số phiên bản đề
4. **Tạo phiên bản**: Hệ thống tự động xáo trộn thứ tự câu hỏi
5. In phiếu cho học sinh

---

## 17. Chia sẻ Links

📍 **Menu**: Sidebar → **Chia sẻ**

Quản lý tất cả link chia sẻ bài kiểm tra.

- **Tạo link**: Nhấn "+ Tạo link" → Chọn bài kiểm tra
- Mỗi link có **mã riêng** (VD: `2K-XY7Z9A`)
- **Sửa / Xoá** link khi cần

---

## 18. Báo cáo & Thống kê

📍 **Menu**: Sidebar → **Báo cáo**

Xem thống kê tổng hợp và **xuất CSV** dữ liệu điểm.

---

## 19. Vòng quay May mắn

📍 **Menu**: Sidebar → **Công cụ** → **Vòng quay**

Mini game cho lớp học:
- Nhập danh sách tên/mục
- Quay ngẫu nhiên
- Phù hợp cho: gọi tên học sinh, chọn nhóm, mini game

---

## 20. Cài đặt

📍 **Menu**: Sidebar → **Cài đặt**

- **Hồ sơ**: Đổi tên hiển thị
- **Mật khẩu**: Đổi mật khẩu
- **Giao diện**: Dark Mode / Light Mode
- **Ngôn ngữ**: Tiếng Việt / English / Italiano

---

## 21. Lưu ý khi dùng bản Demo

> ⚠️ **Đây là bản demo miễn phí** — có một số giới hạn:

| Giới hạn | Chi tiết |
|----------|----------|
| **Server ngủ** | Backend tự tắt sau 15 phút không dùng. Lần truy cập đầu chờ ~30 giây |
| **Database pause** | Supabase free pause sau 1 tuần không hoạt động |
| **Không có email** | Không gửi email thông báo/quên mật khẩu |
| **Dữ liệu demo** | Dữ liệu có thể bị xoá bất cứ lúc nào |

### Mẹo khi bị chậm lần đầu:
Nếu trang web hiện lỗi kết nối, hãy **đợi 30 giây rồi refresh** — server đang khởi động lại.

---

## 📞 Liên hệ

Nếu gặp lỗi hoặc cần hỗ trợ, liên hệ người phát triển.

---

*Tài liệu này được tạo tự động cho 2Know Assessment Platform — Demo v1.0*
