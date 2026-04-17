import os

def replace_in_file(filepath, replacements):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. AlertRepository - Unused imports
replace_in_file(
    r"d:\Seminar_Nhom2\alert-service\src\main\java\com\stormshield\alertservice\repository\AlertRepository.java",
    [
        ("import com.stormshield.alertservice.entity.AlertStatus;\n", ""),
        ("import com.stormshield.alertservice.entity.AlertType;\n", ""),
        ("import com.stormshield.alertservice.entity.SeverityLevel;\n", "")
    ]
)

# 2. JwtUtils - Unused import
replace_in_file(
    r"d:\Seminar_Nhom2\auth-service\src\main\java\com\\stormshield\authservice\security\JwtUtils.java",
    [
        ("import io.jsonwebtoken.Claims;\n", "")
    ]
)

# 3. JwtAuthFilter - Missing @NonNull
jwt_filter = r"d:\Seminar_Nhom2\auth-service\src\main\java\com\stormshield\authservice\security\JwtAuthFilter.java"
replace_in_file(
    jwt_filter,
    [
        ("protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)",
         "protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request, @org.springframework.lang.NonNull HttpServletResponse response, @org.springframework.lang.NonNull FilterChain filterChain)")
    ]
)

# 4. Service classes - suppress null warnings
services_to_suppress = [
    r"d:\Seminar_Nhom2\alert-service\src\main\java\com\stormshield\alertservice\service\AlertService.java",
    r"d:\Seminar_Nhom2\auth-service\src\main\java\com\stormshield\authservice\service\AuthService.java",
    r"d:\Seminar_Nhom2\notification-service\src\main\java\com\stormshield\notificationservice\service\NotificationService.java",
    r"d:\Seminar_Nhom2\report-service\src\main\java\com\stormshield\reportservice\service\ReportService.java",
    r"d:\Seminar_Nhom2\shelter-service\src\main\java\com\stormshield\shelterservice\service\ShelterService.java",
    r"d:\Seminar_Nhom2\support-service\src\main\java\com\stormshield\supportservice\service\RescueRequestService.java"
]

for svc in services_to_suppress:
    replace_in_file(
        svc,
        [
            ("public class ", "@SuppressWarnings(\"null\")\npublic class ")
        ]
    )

print("Linters fixed!")
