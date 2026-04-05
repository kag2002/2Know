# Kế Hoạch Áp Dụng Phase 0: Vá Lỗ Hổng Nền Tảng (Core Grading Engine)

*Mục tiêu: Đưa dữ liệu hệ thống về trạng thái chân thực 100%, làm tiền đề để sinh ra Chart Analytics (Mức độ xung đột: Cốt Lõi).*

## Lỗ Hổng Hiện Tại
Chức năng `SubmitTest` trong `result_service.go` hiện tại đang thiết kế điểm chấm tự động là `isCorrect = true // Mocked`. Nếu không vá cái này, 100% biểu đồ Analytics sẽ màu xanh, mất hoàn toàn giá trị của dự án. Học sinh có nhắm mắt chọn bừa cũng ra đáp án ĐÚNG.

## 1. Thiết kế trình tự áp dụng
- **Bước 1 (Backend - Auto Grading Strategy)**: Xóa code Mocked trong hàm `SubmitTest`. Thiết lập thuật toán dò đúng/sai khắt khe: Unmarshal `Answers` của học sinh, lấy `QuestionID` đem đối chiếu với `Metadata.Options` của gốc đề bài. Nếu Option học sinh chọn có cờ `isCorrect == true` thì mới cộng ++điểm.
- **Bước 2 (Frontend - Anti AFK / Outlier tracking)**: Trên màn hình `TestTaking`, xây đắp một global listener bắt sự kiện `visibilitychange`. Nếu tab bị ẩn (học sinh bỏ đi uống nước) thì Timer của câu hỏi hiện tại bị ngắt (Pause) để không làm sai lệch "Thời gian làm bài Trung Bình" bên trang Analytics.

## 2. Quản trị Rủi ro
- Việc sửa Backend cốt lõi đụng trực tiếp tới quá trình Nộp Bài. Bắt buộc viết test và thử nghiệm cẩn thận.
