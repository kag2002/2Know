# Kế Hoạch Áp Dụng Phase 3: Bảng Hệ Thống Mastery & Hồ Sơ Học Sinh Cấp Cao

*Mục tiêu: Mang trải nghiệm phân tích Profile toàn diện với biểu đồ Trending và thẻ Master. (Mức độ rủi ro: Cao - Về Tracking Data Scale).*

## Lỗ Hổng Hiện Tại (Đã Fix trong Plan)
Lỗ hổng Farm Điểm/Cày Cuốc: Nếu sinh viên làm lại 1 bài test 20 lần, hệ thống Mastery sẽ lấy SUM() cả 20 bài, ghi nhận bạn ấy đã cọ xát 200 câu hỏi thay vì 10 câu -> Tỷ lệ Mastery bị Skew (nhân bản lên sai lệch).

## 1. Thiết kế trình tự áp dụng
- **Bước 1 (Backend - Deduplicate Aggregation)**: Khi Worker quét Data nửa đêm để xây dựng SQL Cached Table `Student_Mastery_Stats`, bắt buộc sử dụng Query **`DISTINCT ON (quiz_id) ... ORDER BY score DESC`** hoặc `MAX(score) GROUP BY quiz_id` để lọc duy nhất bài thi điểm cao nhất của mã môn đó.
- **Bước 2 (Backend - API Restful)**: `/api/students/:id/mastery` -> Pull logic từ Cache Map.
- **Bước 3 (Frontend - Pages)**: Viết Screen bự `[student_id]/profile.tsx`. Render Recharts.

## 2. Quản trị Rủi ro
- Cron-job Bulk Update có thể bị Crash giữa chừng nếu Timeout hoặc Data to ra 1 triệu record. Cần Batch Processing (Chunk 10,000 dòng đổ lại một lần). Khuyên dùng Background Queues như RabbitMQ.
