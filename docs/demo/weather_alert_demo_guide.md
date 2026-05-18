# StormShield: Hướng dẫn trình diễn Cảnh báo Thời tiết (Demo Guide)

Tài liệu này hướng dẫn các bước để trình diễn tính năng **Cảnh báo Nguy cơ Thiên tai Tự động** một cách ổn định và thuyết phục.

## 1. Chuẩn bị (Configuration)

Trước khi bắt đầu buổi trình diễn, hãy đảm bảo các cấu hình sau được thiết lập trong `alert-service/src/main/resources/application.properties`:

- `weather.demo-mode=true` (Kích hoạt chế độ giả lập)
- `weather.demo-scenario=CENTRAL_STORM` (Chọn kịch bản: Bão miền Trung)

## 2. Kịch bản Trình diễn (Execution Flow)

### Bước 1: Đăng nhập với quyền Admin
- **Email**: `admin@stormshield.com`
- **Password**: `admin123`
- Truy cập vào menu **"Theo dõi nguy cơ thiên tai"** trong Sidebar.

### Bước 2: Kích hoạt quét thời tiết (Trigger)
- Tại trang "Theo dõi nguy cơ thiên tai", nhấn nút **"Kích hoạt quét Demo"**.
- Hệ thống sẽ thực hiện quét toàn quốc (63 tỉnh thành) theo kịch bản giả lập đã chọn.
- Nhấn nút **"Làm mới"** để thấy danh sách các cảnh báo vừa được tạo ra.

### Bước 3: Kiểm tra Dashboard Admin
- Quan sát các thẻ thống kê (Summary Cards):
    - Tổng số cảnh báo tăng lên.
    - Số tỉnh bị ảnh hưởng (các tỉnh Miền Trung trong kịch bản `CENTRAL_STORM`).
- Lọc theo mức độ **CRITICAL** hoặc **HIGH** để xem các nguy cơ bão.

### Bước 4: Kiểm tra trên Bản đồ (Emergency Map)
- Nhấn nút **"Bản đồ"** trên một thẻ cảnh báo bất kỳ.
- Hệ thống sẽ chuyển sang Bản đồ cứu hộ và tự động focus vào vị trí cảnh báo.
- Quan sát biểu tượng **Đám mây xanh (☁)** trên bản đồ - đây là dấu hiệu của cảnh báo tự động.
- Click vào Marker để xem thông tin chi tiết: "NGUY CƠ THỜI TIẾT", mô tả rủi ro, và thời gian hết hiệu lực.

### Bước 5: So sánh với Báo cáo Hiện trường (Citizen Reports)
- (Tùy chọn) Gửi một báo cáo sự cố từ tài khoản Citizen tại cùng khu vực.
- Cho thấy sự khác biệt giữa Marker **Dấu chấm than đỏ (!)** (Xác minh hiện trường) và Marker **Đám mây xanh (☁)** (Nguy cơ tự động).

## 3. Các kịch bản có sẵn

| Mã kịch bản | Mô tả | Khu vực ảnh hưởng |
|---|---|---|
| `CENTRAL_STORM` | Bão mạnh, mưa cực lớn (90km/h, 120mm) | Các tỉnh Miền Trung |
| `NORTHERN_HEAVY_RAIN` | Mưa lớn kéo dài (50mm) | Các tỉnh Miền Bắc |

## 4. Xác nhận kỹ thuật
- **API Trigger**: `POST http://localhost:8081/api/v1/weather/test/scan/full`
- **Database**: Dữ liệu được lưu vào bảng `alerts` với `source = 'WEATHER'`.
- **Deduplication**: Chạy quét nhiều lần sẽ không tạo trùng lặp, hệ thống sẽ tự động cập nhật (refresh) thời gian hết hiệu lực của cảnh báo hiện có.
