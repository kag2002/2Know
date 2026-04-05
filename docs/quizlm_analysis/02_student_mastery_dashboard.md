# Phân Tích Chức Năng: Dashboard Hiệu Suất Học Sinh Cá Nhân

## 1. Mô tả tổng quan
(Dựa trên ảnh 2: Hồ sơ chi tiết Học Sinh - "Mộng Cát")
Một trung tâm dữ liệu thu nhỏ của cá nhân một học sinh. Trang này đo lường "Độ làm chủ" (Mastery) kiến thức theo các phạm vi bài giảng, thẻ (tags), cũng như xu hướng tiến bộ qua thời gian bằng các con số trung bình trực quan.

## 2. Góc nhìn Frontend (FE)
- **UI Components**:
  - Giao diện Header Profile: Mã học sinh (Badge), danh sách Tags điểm mạnh/yếu, `Last active date`.
  - Bộ lọc Dropdown: "Phạm vi bài kiểm tra" -> Cho phép Giáo viên lọc dữ liệu theo 1 khoá học hoặc 1 nhóm bài test cụ thể.
  - Summary Metrics Cards: 4 Card chỉ số quan trọng (Điểm TB lớn, Tổng phần thi, Hiệu suất tốt nhất, Xu hướng mũi tên Lên/Xuống so sánh với 3 bài trước đó).
  - Tiến độ làm chủ (Mastery Trackers): Thanh máu dài `ProgressBar` với nhãn `% tổng mức làm chủ`. Tính tỷ lệ số câu đúng / số câu đã đối mặt.
- **Data Logic**: Đòi hỏi rendering Charts nặng (có thể add Recharts / Chart.js cho xu hướng).

## 3. Góc nhìn Backend (BE)
- **API Endpoint Mẫu**: 
  - `GET /api/v1/analytics/students/:student_id/overview?scope=all`
  - `GET /api/v1/analytics/students/:student_id/mastery`
- **Data Architecture & Aggregation**:
  - Truy xuất tốn kém (Expensive Query): Tính toán Điểm TB của 26 bài kiểm tra tốn thời gian tính toán nếu Scan toàn bộ DB (Full table scan). Cần thiết lập **Materialized Views (PostgreSQL)** hoặc cấu trúc chạy cron-job / Event-driven lưu sẵn vào Cache Table cho mỗi học sinh.
  - Tính Toán Xu Hướng (Trend Analysis): Sử dụng `Window Functions` trong SQL để tính trung bình 3 bài làm gần nhất và so sánh độ chênh lệch delta với lịch sử cũ.
  - Thuật toán Mastery: Track xem với `Tag: Grammar`, học sinh đã encounter bao nhiêu câu, đúng bao nhiêu câu -> Trả về JSON percentage `%`. Mảng này sẽ lớn dần, đòi hỏi cấu trúc JSONB Indexing tốt để group by Tags hiệu quả.
