# Kế Hoạch Áp Dụng Phase 1: OMR Tích Hợp Hybrid PDF

*Mục tiêu: Đưa tính năng in chung OMR và Đề kiểm tra vào ngay trong phiên bản hiện tại (Mức độ xung đột: Cực Rất Thấp).*

## Lỗ Hổng Hiện Tại (Đã Fix trong Plan)
Trải Text câu hỏi lên tờ PDF chứa OMR Bubble sẽ đùn đẩy cấu trúc DOM/PDF, làm méo tọa độ của 4 ô Vuông Nhận Phân Tích (QR Anchors góc) -> Camera thầy cô sẽ bị mù, không quét được bài.

## 1. Thiết kế trình tự áp dụng
- **Bước 1 (Backend/Frontend - PDF Generation Rules)**: Khi bấm "Tạo OMR Tích hợp", trang đầu tiên của PDF (Trang 1) **tuyệt đối khóa cứng Layout**, chỉ chứa Bubble Sheet và QR Anchor. 
- Toàn bộ nội dung Text Câu Mỏi sẽ bị đùn hết sang Page 2 trở đi.
- Sử dụng `@react-pdf/renderer` nhiều trang (Multi-page Pagination) để thiết lập thẻ `<Page break>` rõ ràng.

## 2. Quản trị Rủi ro (Xung đột hệ thống)
- Chức năng an toàn tuyệt đối, hệ thống chấm điểm OMR Scanner bằng OpenCV bên dưới rễ không bị ảnh hưởng do trang OMR Matrix lúc nào cũng nằm y nguyên như cũ tại trang 1.
