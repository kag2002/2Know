# Phân Tích Chức Năng: Đề Thi Tích Hợp OMR Scanner

## 1. Mô tả tổng quan
(Dựa trên ảnh 3: "QuizLM OMR Demo PDF")
File PDF tích hợp 2 thành phần trên cùng một trang: Cấu trúc form thông tin sinh viên + QR Code Matrix chuyên dùng cho máy chấm Cam/Scanner OMR ở nửa trên. Nửa phần dưới là toàn bộ câu hỏi văn bản (Text Questions) và đáp án văn bản của Đề kiểm tra.

## 2. Góc nhìn Frontend (FE)
- **UI / Trình tạo (Generator)**:
  - Công cụ PDF Rendering: Để tạo file kiểu này bên Browser, cần các tool mạnh xử lý Break-page (sang trang mới) tự động khi khối text câu hỏi vượt quá độ dài khổ A4. Thư viện phù hợp: `@react-pdf/renderer` hoặc `pdfmake`.
  - UX View: Trang Dashboard cần cung cấp trình Preview trước PDF (bằng React-PDF viewer) để Giáo viên ngắm tỷ lệ in trước khi xuất file. Cần nút cấu hình "Ghép đề và phiếu trả lời chung".
- **In ấn PDF Flow**: Client side gọi API sinh ra PDF stream hoặc BE trả trực tiếp URL file rồi FE mở new tab in.

## 3. Góc nhìn Backend (BE)
- **API Endpoint Mẫu**: `GET /api/v1/omr/export-hybrid/:quiz_id?format=pdf`
- **Generative Engine Core**:
  - Không thể dùng DOM to PDF đơn giản vì chất lượng OMR marker (4 góc vuông nhận diện) và QR Code sẽ bị nhoè. Cần viết bằng Golang PDF Engine (`github.com/go-pdf/fpdf` hoặc `maroto`) để đảm bảo chất lượng DPI (300dpi) cao nhất cho QR Matrix.
  - Layout Generator: Nửa trên cứng (Fixed Canvas Box) vẽ Box, Form Điền, Bảng QR Dots (A B C D bubbles). Nửa dưới (Dynamic Text Container) có vòng lặp for duyệt `quiz.Questions`. Tính toán Word-wrap xuống dòng an toàn.
  - Xử lý Ảnh trong Đề Thi: Nếu Backend lưu ảnh câu hỏi vào S3 bucket, quá trình sinh PDF BE sẽ phải load buffer ảnh đó stream thẳng vào tọa độ bản in PDF.
  - Quản lý Version (Shuffling): Áp dụng luôn được luồng mã `Versions` đã có, gen ra Header `Exam Code` khớp với `QR Code`.
