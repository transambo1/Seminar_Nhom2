import csv
import os

test_cases = [
    # AUTH MODULE
    ["TC-AUTH-01", "Đăng ký Citizen hợp lệ", "1) Gọi API /register với data hợp lệ", "Tạo account thành công, HTTP 200/201", "email: test@gmail.com, role: CITIZEN", "Pass", "", "Happy path"],
    ["TC-AUTH-02", "Đăng ký thiếu email", "1) Gọi API /register không truyền email", "Báo lỗi validation, HTTP 400", "email: null", "Pass", "", "Required field (EP)"],
    ["TC-AUTH-03", "Đăng ký sai định dạng email", "1) Gọi API /register với email sai định dạng", "Báo lỗi validation email, HTTP 400", "email: testgmail.com", "Pass", "", "Validation (EP)"],
    ["TC-AUTH-04", "Đăng ký trùng email", "1) Gọi API /register email đã tồn tại", "Báo lỗi email exist, HTTP 409/400", "email: admin@stormshield.com", "Pass", "", "Business rule (EP)"],
    ["TC-AUTH-05", "Đăng nhập hợp lệ (Citizen)", "1) Gọi API /login với Citizen", "Trả về JWT token, userId, role", "email: user, pass: user123", "Pass", "", "Happy path"],
    ["TC-AUTH-06", "Đăng nhập hợp lệ (Admin)", "1) Gọi API /login với Admin", "Trả về JWT token, role ADMIN", "email: admin@stormshield.com", "Pass", "", "Happy path"],
    ["TC-AUTH-07", "Đăng nhập sai password", "1) Gọi API /login password sai", "HTTP 401 Unauthorized", "pass: wrong", "Pass", "", "Error handling"],
    ["TC-AUTH-08", "Đăng nhập tài khoản không tồn tại", "1) Gọi API /login email không có", "HTTP 401/404", "email: notfound@...", "Pass", "", "Error handling"],
    ["TC-AUTH-09", "Truy cập /me không có token", "1) Gọi API /me không gắn Authorization", "HTTP 401 Unauthorized", "Header missing", "Pass", "", "Security/JWT"],
    ["TC-AUTH-10", "Truy cập /me có token hợp lệ", "1) Gọi API /me kèm JWT", "Trả về thông tin User profile", "Valid Token", "Pass", "", "Happy path"],
    ["TC-AUTH-11", "Token hết hạn", "1) Gọi API với token expired", "HTTP 401", "Expired Token", "Untested", "", "Security/JWT"],
    ["TC-AUTH-12", "Admin tạo tài khoản Rescue", "1) Gọi /admin/rescue-accounts", "Tạo thành công, HTTP 200", "Role: RESCUE", "Pass", "", "Role-based access"],
    ["TC-AUTH-13", "Citizen tạo tài khoản Rescue", "1) Gọi /admin/rescue-accounts bằng JWT Citizen", "HTTP 403 Forbidden", "Token: Citizen", "Pass", "", "Role-based access"],
    ["TC-AUTH-14", "Admin tạo tài khoản Admin", "1) Gọi /admin/admin-accounts", "Tạo thành công", "Role: ADMIN", "Pass", "", "Happy path"],
    ["TC-AUTH-15", "Leader thêm Rescue members", "1) Gọi /leader/rescue-members", "Thêm member thành công", "Role: RESCUE_LEADER", "Pass", "", "Role-based access"],
    ["TC-AUTH-16", "Rescue (thường) thêm member", "1) Gọi /leader/rescue-members bằng JWT Rescue", "HTTP 403 Forbidden", "Token: Rescue", "Pass", "", "Role-based access"],
    ["TC-AUTH-17", "Frontend: Lưu SecureStore sau login", "1) Đăng nhập thành công trên App", "App lưu userToken, userId, userRole", "UI Login", "Pass", "", "UI behavior"],
    ["TC-AUTH-18", "Frontend: Xóa SecureStore khi logout", "1) Click Đăng xuất", "Clear token, redirect về /login", "UI Logout", "Pass", "", "UI behavior"],
    ["TC-AUTH-19", "Lấy user info by ID", "1) Gọi /users/{id}", "Trả về thông tin user", "id: 1", "Pass", "", "Happy path"],
    ["TC-AUTH-20", "Lấy user info by ID không tồn tại", "1) Gọi /users/9999", "HTTP 404 Not Found", "id: 9999", "Pass", "", "Error handling"],

    # ALERT MODULE
    ["TC-ALERT-01", "Lấy danh sách active alerts", "1) Gọi /api/v1/alerts/active", "Trả về mảng Alert có status ACTIVE", "", "Pass", "", "Happy path"],
    ["TC-ALERT-02", "Lấy alert detail", "1) Gọi /api/v1/alerts/{id}", "Trả về chi tiết alert", "id: valid", "Pass", "", "Happy path"],
    ["TC-ALERT-03", "Admin tạo alert mới", "1) POST /alerts với data hợp lệ", "Tạo thành công, HTTP 201", "type: STORM", "Pass", "", "Role-based access"],
    ["TC-ALERT-04", "Citizen tạo alert", "1) POST /alerts dùng token Citizen", "HTTP 403 Forbidden", "", "Pass", "", "Role-based access"],
    ["TC-ALERT-05", "Tạo alert thiếu tọa độ", "1) POST /alerts thiếu lat/long", "Báo lỗi validation", "lat: null", "Pass", "", "Required field (EP)"],
    ["TC-ALERT-06", "Admin update alert status", "1) PATCH /alerts/{id}/status", "Cập nhật thành công EXPIRED", "status: EXPIRED", "Pass", "", "Happy path"],
    ["TC-ALERT-07", "Quét sự kiện OWM/USGS", "1) POST /scan/full", "Trigger scan, lưu DB", "", "Pass", "", "Integration test"],
    ["TC-ALERT-08", "Frontend: Gọi fetchInternalAlerts", "1) Mở map", "Lấy data từ API hiển thị lên mảng marker", "UI Map", "Pass", "", "API mapping"],
    ["TC-ALERT-09", "Frontend: Fallback marker icon", "1) Alert type lạ", "Render icon OTHER mặc định", "type: UNKNOWN", "Pass", "", "UI behavior"],
    ["TC-ALERT-10", "Xóa alert (Admin)", "1) DELETE /alerts/{id}", "Xóa thành công", "id: valid", "Untested", "", "Role-based access"],
    ["TC-ALERT-11", "Lấy alert sai ID format", "1) GET /alerts/abc", "HTTP 400 Bad Request", "id: abc", "Pass", "", "Validation (EP)"],
    ["TC-ALERT-12", "Cập nhật status sang CANCELLED", "1) PATCH status", "Cập nhật db", "status: CANCELLED", "Pass", "", "Business rule (EP)"],
    ["TC-ALERT-13", "Lấy alert đã hết hạn", "1) Có api lọc expired không?", "Không thấy rõ, giả định lấy list all", "", "N/A", "", ""],
    ["TC-ALERT-14", "Validate Severity Level", "1) POST alert với severity sai", "Lỗi enum deserialization", "severity: ABC", "Pass", "", "Validation (EP)"],
    ["TC-ALERT-15", "Tạo alert vượt boundary", "1) lat > 90", "Lỗi validation tọa độ", "lat: 100", "Untested", "", "Boundary value"],

    # INCIDENT REPORT
    ["TC-INCIDENT-01", "Citizen gửi báo cáo hiện trường", "1) POST /incident-reports", "Tạo báo cáo, status PENDING", "type: FLOOD", "Pass", "", "Happy path"],
    ["TC-INCIDENT-02", "Gửi báo cáo thiếu mô tả", "1) POST thiếu description", "Báo lỗi Required", "desc: null", "Pass", "", "Required field (EP)"],
    ["TC-INCIDENT-03", "Admin lấy danh sách PENDING", "1) GET /incident-reports", "Trả về mảng báo cáo chưa duyệt", "", "Pass", "", "Happy path"],
    ["TC-INCIDENT-04", "Admin duyệt báo cáo (Approve)", "1) Gửi action duyệt", "Báo cáo thành APPROVED, tự sinh Alert", "status: APPROVED", "Pass", "", "Integration test"],
    ["TC-INCIDENT-05", "Admin từ chối báo cáo (Reject)", "1) Gửi action từ chối", "Báo cáo thành REJECTED, ko sinh Alert", "status: REJECTED", "Pass", "", "Business rule (EP)"],
    ["TC-INCIDENT-06", "Citizen duyệt báo cáo", "1) Cố gọi API duyệt bằng JWT Citizen", "HTTP 403", "", "Pass", "", "Role-based access"],
    ["TC-INCIDENT-07", "Frontend: Gửi report từ UI", "1) Điền form Report, click Submit", "Gọi đúng API, hiện Alert Success", "UI Form", "Pass", "", "UI behavior"],
    ["TC-INCIDENT-08", "Frontend: Chưa cấp quyền vị trí", "1) Bấm tạo report ko có GPS", "Hiện cảnh báo xin quyền", "GPS: off", "Pass", "", "UI behavior"],
    ["TC-INCIDENT-09", "Cập nhật status báo cáo ko tồn tại", "1) Duyệt ID 9999", "HTTP 404", "id: 9999", "Pass", "", "Error handling"],
    ["TC-INCIDENT-10", "Duyệt báo cáo đã APPROVED", "1) Cố duyệt lại", "Báo lỗi Invalid status / or success depend on rule", "", "Untested", "", "Business rule (EP)"],
    ["TC-INCIDENT-11", "Tạo báo cáo với image URL rỗng", "1) Truyền imageUrl rỗng", "Chấp nhận vì không bắt buộc", "image: null", "Pass", "", "Happy path"],
    ["TC-INCIDENT-12", "Tạo báo cáo sai type Enum", "1) type sai", "HTTP 400", "type: ALIEN", "Pass", "", "Validation (EP)"],
    ["TC-INCIDENT-13", "Notification khi APPROVED", "1) Báo cáo được duyệt", "Bắn notif INCIDENT_REPORT_APPROVED", "", "Pass", "", "Async notification"],
    ["TC-INCIDENT-14", "Notification khi REJECTED", "1) Báo cáo bị từ chối", "Bắn notif INCIDENT_REPORT_REJECTED", "", "Pass", "", "Async notification"],
    ["TC-INCIDENT-15", "Citizen lấy danh sách báo cáo của mình", "1) GET /my-reports", "Trả về list", "", "Untested", "", "Happy path"],

    # SHELTER MODULE
    ["TC-SHELTER-01", "Lấy tất cả shelter", "1) GET /shelters", "Trả về mảng Shelter", "", "Pass", "", "Happy path"],
    ["TC-SHELTER-02", "Lấy shelter theo trạng thái", "1) GET /shelters?status=AVAILABLE", "Trả về list AVAILABLE", "status: AVAILABLE", "Pass", "", "Happy path"],
    ["TC-SHELTER-03", "Admin tạo shelter", "1) POST /shelters", "Tạo thành công, status ACTIVE", "capacity: 100", "Pass", "", "Role-based access"],
    ["TC-SHELTER-04", "Tạo shelter capacity âm", "1) POST capacity = -5", "Lỗi validation", "capacity: -5", "Untested", "", "Boundary value"],
    ["TC-SHELTER-05", "Cập nhật occupancy", "1) PATCH /shelters/{id}/occupancy", "Số người ở tăng lên", "occupancy: 10", "Pass", "", "Happy path"],
    ["TC-SHELTER-06", "Cập nhật occupancy quá capacity", "1) PATCH occupancy > maxCapacity", "Lỗi / hoặc đổi status sang FULL", "occupancy: 200", "Pass", "", "Business rule (EP)"],
    ["TC-SHELTER-07", "Lấy shelter gần đây", "1) GET /shelters/nearby?lat=...&lng=...", "Trả về danh sách sắp xếp theo KC", "lat, lng", "Pass", "", "Integration test"],
    ["TC-SHELTER-08", "Lấy detail shelter", "1) GET /shelters/{id}", "Trả về 1 record", "id: valid", "Pass", "", "Happy path"],
    ["TC-SHELTER-09", "Cập nhật thông tin shelter (Admin)", "1) PUT /shelters/{id}", "Đổi tên, địa chỉ", "", "Pass", "", "Happy path"],
    ["TC-SHELTER-10", "Frontend: Render Marker Shelter", "1) Mở map", "Hiển thị marker nhà trú ẩn màu xanh", "UI Map", "Pass", "", "UI behavior"],
    ["TC-SHELTER-11", "Frontend: Click Shelter Info", "1) Bấm vào Marker", "Hiện Panel số lượng chứa", "", "Pass", "", "UI behavior"],
    ["TC-SHELTER-12", "Shelter FULL", "1) GET shelters", "Shelter FULL hiển thị màu đỏ/khác biệt", "", "Untested", "", "UI behavior"],

    # SUPPORT REQUEST (RESCUE) MODULE
    ["TC-SUPPORT-01", "Citizen tạo rescue request", "1) POST /support-requests", "Trạng thái PENDING", "type: MEDICAL", "Pass", "", "Happy path"],
    ["TC-SUPPORT-02", "Tạo request sai type", "1) POST sai RequestType", "HTTP 400", "type: XXX", "Pass", "", "Validation (EP)"],
    ["TC-SUPPORT-03", "Xem danh sách request (Rescue)", "1) GET /support-requests", "Lấy list PENDING", "", "Pass", "", "Happy path"],
    ["TC-SUPPORT-04", "Xem request theo team", "1) GET /support-requests/team/{id}", "Trả về request đã assign", "teamId: 1", "Pass", "", "Happy path"],
    ["TC-SUPPORT-05", "Lấy request của tôi (Rescue)", "1) GET /support-requests/my", "Trả về request user đó nhận", "header X-User-Id", "Pass", "", "Integration test"],
    ["TC-SUPPORT-06", "Auto Assign", "1) POST /support-requests/{id}/auto-assign", "Thuật toán tìm team, đổi status ASSIGNED", "", "Pass", "", "Business rule (EP)"],
    ["TC-SUPPORT-07", "Thủ công Assign", "1) PATCH /{id}/assign", "Đổi status ASSIGNED, map với Team", "teamId: valid", "Pass", "", "Business rule (EP)"],
    ["TC-SUPPORT-08", "Cập nhật status IN_PROGRESS", "1) PATCH /{id}/status", "Trạng thái đổi", "status: IN_PROGRESS", "Pass", "", "Happy path"],
    ["TC-SUPPORT-09", "Cập nhật status sai luồng", "1) PENDING nhảy thẳng RESOLVED", "Lỗi luồng (hoặc success tùy logic code)", "status: RESOLVED", "Untested", "", "Business rule (EP)"],
    ["TC-SUPPORT-10", "Tạo Team cứu hộ mới (Admin)", "1) POST /rescue-teams", "Tạo Team OK", "LeaderId: 2", "Pass", "", "Happy path"],
    ["TC-SUPPORT-11", "Thêm member vào team", "1) POST /rescue-teams/{id}/members", "Thêm member OK", "userId: 3", "Pass", "", "Happy path"],
    ["TC-SUPPORT-12", "Lấy member của team", "1) GET /rescue-teams/{id}/members", "List members", "teamId: 1", "Pass", "", "Happy path"],
    ["TC-SUPPORT-13", "Xóa member khỏi team", "1) DELETE /{id}/members/{uid}", "Xóa thành công", "uid: 3", "Pass", "", "Happy path"],
    ["TC-SUPPORT-14", "Lấy Team by LeaderId", "1) GET /rescue-teams/leader/{id}", "Trả về team", "leaderId: 2", "Pass", "", "Happy path"],
    ["TC-SUPPORT-15", "Frontend: Màn RescueHome gọi getPendingRequests", "1) Mở tab Nhiệm vụ", "Hiển thị list chờ", "UI Rescue", "Pass", "", "API mapping"],
    ["TC-SUPPORT-16", "Frontend: getMyMissions gọi API my", "1) Load tab", "Gọi API đúng header X-User-Id", "userId lưu trong store", "Pass", "", "Integration test"],
    ["TC-SUPPORT-17", "Frontend: Ấn Tiếp nhận nhiệm vụ", "1) Bấm button", "Alert thông báo, chưa gọi thật updateStatus trong list", "UI", "Fail", "", "UI behavior (Chưa nối API)"],
    ["TC-SUPPORT-18", "Frontend: Gọi hàm getMissionsByRescueId lỗi", "1) Vào màn Rescue Map", "Lỗi TypeError vì hàm ko tồn tại, nhưng có try/catch", "UI Map", "Fail", "", "API mapping (Thiếu function)"],
    ["TC-SUPPORT-19", "Frontend: Gọi hàm getTeamMembers lỗi", "1) Vào màn Rescue Team", "Lỗi TypeError, fallback về mockup data", "UI Team", "Fail", "", "API mapping (Thiếu function)"],
    ["TC-SUPPORT-20", "Frontend: Cập nhật status IN_PROGRESS", "1) Ở màn Rescue Map bấm 'Bắt đầu nhiệm vụ'", "Gọi updateStatus API", "activeMission", "Pass", "", "API mapping"],

    # NOTIFICATION MODULE
    ["TC-NOTI-01", "Kết nối SSE Stream", "1) GET /notifications/stream?userId=x", "SSE kết nối thành công, giữ connection", "userId: 1", "Pass", "", "Async notification"],
    ["TC-NOTI-02", "Lấy danh sách Notification của tôi", "1) GET /notifications/my", "Trả về list sort theo time", "userId: 1", "Pass", "", "Happy path"],
    ["TC-NOTI-03", "Lấy số lượng Unread", "1) GET /unread-count", "Trả về int số lượng", "", "Pass", "", "Happy path"],
    ["TC-NOTI-04", "Mark as Read", "1) PATCH /{id}/read", "Status = READ", "id: valid", "Pass", "", "Happy path"],
    ["TC-NOTI-05", "Mark All as Read", "1) PATCH /read-all", "Tất cả thành READ", "userId: 1", "Pass", "", "Happy path"],
    ["TC-NOTI-06", "Hệ thống tự bắn Notif (Nearby)", "1) Tạo alert mới", "Notif bắn qua SSE tới user gần đó", "", "Untested", "", "Integration test"],
    ["TC-NOTI-07", "Hệ thống tự bắn Notif (Support)", "1) Assign request", "User liên quan nhận đc SSE", "", "Untested", "", "Integration test"],
    ["TC-NOTI-08", "Frontend: Nhận SSE realtime", "1) Có event mới", "UI tự popup Notification", "Event: NEW_ALERT", "Untested", "", "UI behavior"],
    ["TC-NOTI-09", "Frontend: Crash do userId fallback", "1) Mở inbox khi chưa login, SecureStore rỗng", "JSON parse null -> crash", "profileStr: null", "Fail", "", "Error handling (UI)"],
    ["TC-NOTI-10", "Xóa Notification", "1) DELETE /{id}", "Xóa DB", "id: valid", "Pass", "", "Happy path"],

    # MAP & UI (FRONTEND)
    ["TC-UI-01", "Render Map Citizen", "1) Xem map", "Render đúng Google Map / Leaflet", "UI Map", "Pass", "", "UI behavior"],
    ["TC-UI-02", "Map Polyline Rescue", "1) Ca đang chạy", "Vẽ polyline đứt đoạn từ vị trí mình đến đích", "RescueMap", "Pass", "", "UI behavior"],
    ["TC-UI-03", "Điều hướng bằng userRole", "1) Layout gọi userRole?.includes", "Admin hiện tab RescueHome, tắt Dashboard", "Role: ADMIN", "Pass", "", "Role-based access"],
    ["TC-UI-04", "Dynamic tab fallback", "1) userRole = null", "IsLoading block, ko crash", "Null role", "Pass", "", "UI behavior"],
    ["TC-UI-05", "Lọc Severity Bento box", "1) Click Critical", "List feed cập nhật đúng", "Filter: Critical", "Pass", "", "UI behavior"],
    ["TC-UI-06", "Pin alert trên danh sách", "1) Click nút Pin", "Alert nhảy lên đầu list", "Alert card", "Pass", "", "UI behavior"],
    ["TC-UI-07", "Location fallback ở coordStr", "1) Toạ độ null", "Nếu latitude undefined -> NaN -> render lỗi text", "coord: undefined", "Fail", "", "Error handling (UI)"],
    ["TC-UI-08", "Đóng Modal Report", "1) Kéo xuống hoặc bấm ngoài", "Đóng modal an toàn", "Modal", "Pass", "", "UI behavior"],
    ["TC-UI-09", "Hiển thị Badge Inbox", "1) Có 3 thông báo UNREAD", "Tab badge hiện số 3", "Unread: 3", "Pass", "", "UI behavior"],
    ["TC-UI-10", "Hiển thị icon theo NotificationType", "1) Type: NEARBY_ALERT", "Render icon màu đỏ", "NEARBY_ALERT", "Pass", "", "UI behavior"],

    # GATEWAY / INTEGRATION
    ["TC-GATEWAY-01", "Định tuyến /api/v1/auth", "1) Gateway gọi auth", "Trỏ đúng port auth-service", "Gateway route", "Pass", "", "Integration test"],
    ["TC-GATEWAY-02", "Định tuyến /api/v1/alerts", "1) Gateway gọi alert", "Trỏ đúng port alert-service", "Gateway route", "Pass", "", "Integration test"],
    ["TC-GATEWAY-03", "CORS Configuration", "1) Gửi preflight request", "Trả về 200 OK allowed origins", "OPTIONS", "Pass", "", "Integration test"],
    ["TC-GATEWAY-04", "Eureka Service Registration", "1) Khởi động docker-compose", "6 services lên Eureka", "Docker", "Pass", "", "Integration test"],
    ["TC-GATEWAY-05", "Load Balancing Gateway", "1) Có nhiều instance auth", "Gateway phân tải (lb://)", "Multiple instance", "Untested", "", "Integration test"],
    ["TC-GATEWAY-06", "RabbitMQ Publish", "1) Tạo alert", "Đẩy message vào Queue", "RabbitMQ", "Untested", "", "Integration test"],
    ["TC-GATEWAY-07", "RabbitMQ Consume", "1) notification-service consume", "Tạo record Notification DB", "RabbitMQ", "Untested", "", "Integration test"],
    ["TC-GATEWAY-08", "DB Isolation", "1) Check Data source", "Mỗi service có URL DB riêng", "application.yml", "Pass", "", "Integration test"]
]

with open(r'd:\Seminar_Nhom2\StormShield_TestCases.csv', mode='w', encoding='utf-8-sig', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["ID", "Test Case Description", "Test Case Procedure", "Expected Output", "Test data", "Result", "Test data (2)", "Description"])
    for row in test_cases:
        writer.writerow(row)
print("CSV written successfully!")
