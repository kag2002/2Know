# Kế Hoạch Áp Dụng Phase 2: Engine Thu Thập Dữ Liệu & Question Analytics Modal

*Mục tiêu: Theo dõi chính xác hành vi làm bài của học sinh để sinh ra Analytics Câu hỏi giống Modal của QuizLM (Mức độ xung đột: Tiền ẩn).*

## Lỗ Hổng Hiện Tại (Đã Fix trong Plan)
Học sinh treo máy 1 tiếng -> Thời gian hiển thị ở Analytics hiển thị 3600 giây (Sai lệch nặng data chung).

## 1. Thiết kế trình tự áp dụng
- **Yêu cầu Tiên Quyết:** Chờ Phase 0 hoàn tất (Có Auto-Grading thật).
- **Bước 1 (Database Migration)**: Cập nhật struct `model.TestResult`. Thêm trường `QuestionTimes map[string]int` (jsonb).
- **Bước 2 (Backend - Sanity Check)**: API Endpoint `GET /api/analytics/questions/:id` sẽ tự động hủy (bỏ qua không tính) những Record nào có `time_taken_second > 300` (5 phút cho 1 câu trắc nghiệm), coi như nhiễu data.
- **Bước 3 (Frontend - Modal UI)**: Clone Component `QuestionAnalyticsModal.tsx`, gọi API pop-up.

## 2. Quản trị Rủi ro
- Endpoint Thống kê phải parse JSONB từ hàng ngàn bản ghi TestResult, cần Index Database cẩn thận ở cột Status = `completed` để tránh Full-search ngốn RAM.
