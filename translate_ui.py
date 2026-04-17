import os

def replace_in_file(filepath, replacements):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base = r"d:\Seminar_Nhom2\frontend-react\src"

# Navbar.js
replace_in_file(os.path.join(base, "components", "Navbar.js"), [
    (">Dashboard<", ">Bảng điều khiển<"),
    (">Shelters<", ">Điểm trú ẩn<"),
    (">Alerts<", ">Cảnh báo<"),
    (">My Requests<", ">Yêu cầu của tôi<"),
    (">Notifications<", ">Thông báo<"),
    (">Review Reports<", ">Duyệt báo cáo<"),
    (">Manage Rescues<", ">Quản lý cứu hộ<"),
    (">Logout<", ">Đăng xuất<"),
    (">Login<", ">Đăng nhập<"),
    (">Register<", ">Đăng ký<")
])

# Dashboard.js
replace_in_file(os.path.join(base, "pages", "Dashboard.js"), [
    ("StormShield Dashboard", "Bảng điều khiển StormShield"),
    (">Find Shelter<", ">Tìm điểm trú ẩn<"),
    (">Report Hazard<", ">Báo nguy hiểm<"),
    (">Request Rescue<", ">Yêu cầu hỗ trợ<"),
    ("ACTIVE ALERT:", "CẢNH BÁO MỚI:")
])

# Shelters.js
replace_in_file(os.path.join(base, "pages", "Shelters.js"), [
    ("Emergency Shelters", "Danh sách điểm trú ẩn")
])

# Alerts.js
replace_in_file(os.path.join(base, "pages", "Alerts.js"), [
    ("Active Emergency Alerts", "Danh sách cảnh báo khẩn cấp")
])

# Forms.js
replace_in_file(os.path.join(base, "pages", "Forms.js"), [
    ("Report a Hazard", "Báo cáo Khu vực Nguy hiểm"),
    ("Type<", "Loại nguy hiểm<"),
    ("FLOOD", "Ngập lụt"),
    ("BLOCKED_ROAD", "Tắc đường"),
    ("LANDSLIDE", "Sạt lở"),
    ("Danger Level<", "Mức độ nguy hiểm<"),
    ("HIGH", "Cao"),
    ("CRITICAL", "Đặc biệt nghiêm trọng"),
    ("MEDIUM", "Trung bình"),
    ("Description", "Mô tả chi tiết"),
    ("Submit Report", "Gửi báo cáo"),
    ("Report submitted for review!", "Báo cáo đã được gửi chờ duyệt!"),
    ("Request Emergency Support / Rescue", "Yêu cầu Hỗ trợ / Khẩn cấp"),
    ("RESCUE", "Cứu hộ"),
    ("MEDICAL", "Y tế"),
    ("EVACUATION", "Sơ tán"),
    ("People Needing Help<", "Số người cần giúp<"),
    ("Description / Details<", "Tình trạng chi tiết<"),
    ("Request Support Now", "Gửi yêu cầu hỗ trợ ngay"),
    ("Rescue request dispatched!", "Yêu cầu cứu hộ đã được gửi!")
])

# MySupports.js
replace_in_file(os.path.join(base, "pages", "MySupports.js"), [
    ("My Rescue Requests", "Danh sách yêu cầu của tôi"),
    ("People", "Người")
])

# Notifications.js
replace_in_file(os.path.join(base, "pages", "Notifications.js"), [
    (">Notifications<", ">Thông báo<")
])

# AdminPages.js
replace_in_file(os.path.join(base, "pages", "AdminPages.js"), [
    ("Review Hazard Reports", "Duyệt báo cáo khu vực nguy hiểm"),
    ("Approve to Map", "Duyệt lên bản đồ"),
    ("Reject", "Từ chối"),
    ("Manage Rescue Requests", "Quản lý yêu cầu cứu hộ"),
    ("Assign Team", "Phân công đội"),
    ("Mark In Progress", "Đang xử lý"),
    ("Mark Resolved", "Đã giải quyết"),
    ("People", "Người")
])

# Cards.js
replace_in_file(os.path.join(base, "components", "Cards.js"), [
    ("Capacity:", "Sức chứa:"),
    ("Address:", "Địa chỉ:"),
    ("Area:", "Khu vực:"),
    ("Mark Read", "Đã đọc")
])

# Login / Register
replace_in_file(os.path.join(base, "pages", "Login.js"), [
    ("Login to StormShield", "Đăng nhập StormShield"),
    (">Email<", ">Email<"),
    (">Password<", ">Mật khẩu<"),
    (">Login<", ">Đăng nhập<"),
    ("'Login Failed'", "'Đăng nhập thất bại'")
])

replace_in_file(os.path.join(base, "pages", "Register.js"), [
    (">Register<", ">Đăng ký<"),
    ("Full Name", "Họ và Tên"),
    ("Phone", "Số điện thoại"),
    ("Email", "Email"),
    ("Password", "Mật khẩu"),
    ("Sign Up", "Đăng ký"),
    ("'Success! Please login.'", "'Thành công! Vui lòng đăng nhập.'"),
    ("'Register Failed'", "'Đăng ký thất bại'")
])

print("Translation applied!")
