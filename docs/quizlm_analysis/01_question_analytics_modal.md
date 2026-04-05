# Phân Tích Chức Năng: Modal Chi Tiết & Thống Kê Câu Hỏi

## 1. Mô tả tổng quan
(Dựa trên ảnh 1: Popup Modal khi click vào một câu hỏi cụ thể)
Giao diện này giúp Giáo viên phân tích sâu (Deep Dive) vào một câu hỏi cụ thể trong bài kiểm tra. Nó cung cấp tỷ lệ học sinh chọn từng đáp án, thời gian làm bài trung bình, độ khó hệ thống nhận diện và giải thích chi tiết.

## 2. Góc nhìn Frontend (FE)
- **UI Components**:
  - Modal/Dialog Overlay: Hiển thị nổi lên trên bảng điểm bảng ma trận.
  - Left Panel: Nội dung câu hỏi và danh sách các Option (A, B, C, D). Mỗi Option có thanh Progress Bar thể hiện tỷ lệ % (Distribution), số lượt chọn và thời gian trung bình học sinh dwell (dừng lại) ở câu đó. Đáp án đúng được highlight viền/nền xanh lá (`bg-emerald-50`).
  - Right Panel: Grid Cards. Thống kê "Sai/Đúng" (màu sắc Dynamic: Đỏ nếu sai nhiều, Xanh nếu làm đúng). Card "Thời gian", Card "Độ khó" (text transformation uppercase), Card "Giải thích" và cuối cùng là Card "Thẻ" (Badge list).
  - Nút Footer: Trỏ sang màn hình "Chỉnh sửa câu hỏi".
- **State Flow**: Cần một hook `useQuestionAnalytics(questionId)` để fetching Data theo thời gian thực (tránh load nặng cả bài test khi mới mở màn hình chính). Xử lý loading states (Skeleton) bên trong Modal.

## 3. Góc nhìn Backend (BE)
- **API Endpoint Mẫu**: `GET /api/v1/analytics/quizzes/:quiz_id/questions/:question_id`
- **Data Query**: 
  - Đếm `GROUP BY` đáp án A, B, C, D để xuất ra phân phối (Distribution %) trong bảng chi tiết nộp bài.
  - Tính `AVG(time_spent)` cho câu hỏi hiện tại dựa trên Client Tracking (nếu có đo thời gian từng câu).
  - Tích hợp logic gắn nhãn Tự động: Từ tỷ lệ Đúng/Sai chung của toàn bộ học sinh, thuật toán BE tự map ra nhãn "Độ khó: Nhẹ, Trung Bình, Khó".
- **Database Schema**: 
  Cần 1 table lưu lại `Submissions_Detail` ở mức độ hạt nhân (Câu hỏi - Đáp án đã chọn - Thời gian làm). Nếu hệ thống hiện tại chưa tracking `Time_Spent` per question, BE cần triển khai luồng Websocket ping dội lại mỗi khi user Next câu hỏi.
