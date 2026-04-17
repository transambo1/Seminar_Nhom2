import os

base_dir = r"d:\Seminar_Nhom2"
services = [
    "gateway-service",
    "auth-service",
    "shelter-service",
    "alert-service",
    "report-service",
    "support-service",
    "notification-service"
]

for s in services:
    path = os.path.join(base_dir, s, "src", "main", "resources", "application.properties")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        new_content = content.replace("http://localhost:8761/eureka/", "http://discovery-service:8761/eureka/")
        
        if new_content != content:
            with open(path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Fixed {s}")
        else:
            print(f"{s} already correct")
    else:
        print(f"File not found: {path}")

