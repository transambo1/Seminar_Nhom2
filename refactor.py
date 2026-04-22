import os
import shutil

RENAME_MAP = {
    r"alert-service\src\main\java\com\stormshield\alertservice\dto\AlertRequest.java": ("AlertCreateRequest.java", True),
    r"alert-service\src\main\java\com\stormshield\alertservice\dto\AlertStatusRequest.java": ("AlertStatusUpdateRequest.java", True),
    r"alert-service\src\main\java\com\stormshield\alertservice\dto\AlertResponse.java": ("AlertResponse.java", False),
    r"alert-service\src\main\java\com\stormshield\alertservice\dto\AlertStatisticsDto.java": ("AlertStatisticsResponse.java", False),

    r"auth-service\src\main\java\com\stormshield\authservice\dto\LoginRequest.java": ("LoginRequest.java", True),
    r"auth-service\src\main\java\com\stormshield\authservice\dto\RegisterRequest.java": ("RegisterRequest.java", True),
    r"auth-service\src\main\java\com\stormshield\authservice\dto\AuthResponse.java": ("AuthResponse.java", False),
    r"auth-service\src\main\java\com\stormshield\authservice\dto\UserDto.java": ("UserResponse.java", False),

    r"notification-service\src\main\java\com\stormshield\notificationservice\dto\NotificationCreateRequest.java": ("NotificationCreateRequest.java", True),
    r"notification-service\src\main\java\com\stormshield\notificationservice\dto\NotificationResponse.java": ("NotificationResponse.java", False),
    r"notification-service\src\main\java\com\stormshield\notificationservice\dto\UnreadCountResponse.java": ("UnreadCountResponse.java", False),

    r"shelter-service\src\main\java\com\stormshield\shelterservice\dto\ShelterRequest.java": ("ShelterCreateRequest.java", True),
    r"shelter-service\src\main\java\com\stormshield\shelterservice\dto\OccupancyRequest.java": ("OccupancyUpdateRequest.java", True),
    r"shelter-service\src\main\java\com\stormshield\shelterservice\dto\ShelterResponse.java": ("ShelterResponse.java", False),

    r"support-service\src\main\java\com\stormshield\supportservice\dto\SupportRequestAssign.java": ("SupportAssignRequest.java", True),
    r"support-service\src\main\java\com\stormshield\supportservice\dto\SupportRequestCreate.java": ("SupportCreateRequest.java", True),
    r"support-service\src\main\java\com\stormshield\supportservice\dto\SupportRequestStatusUpdate.java": ("SupportStatusUpdateRequest.java", True),
    r"support-service\src\main\java\com\stormshield\supportservice\dto\RescueRequestResponse.java": ("RescueRequestResponse.java", False),
    r"support-service\src\main\java\com\stormshield\supportservice\dto\SupportStatisticsDto.java": ("SupportStatisticsResponse.java", False),
}

CLASS_RENAME_MAP = {
    "AlertRequest": "AlertCreateRequest",
    "AlertStatusRequest": "AlertStatusUpdateRequest",
    "AlertStatisticsDto": "AlertStatisticsResponse",
    "UserDto": "UserResponse",
    "ShelterRequest": "ShelterCreateRequest",
    "OccupancyRequest": "OccupancyUpdateRequest",
    "SupportRequestAssign": "SupportAssignRequest",
    "SupportRequestCreate": "SupportCreateRequest",
    "SupportRequestStatusUpdate": "SupportStatusUpdateRequest",
    "SupportStatisticsDto": "SupportStatisticsResponse"
}

from_package_map = {}

ROOT = 'd:/Seminar_Nhom2'

# Build import mappings
for k, v in RENAME_MAP.items():
    old_suffix = k.split('src\\main\\java\\')[1].replace('\\', '.').replace('.java', '')
    p1 = old_suffix.split('.dto.')[0]
    old_class = old_suffix.split('.')[-1]
    new_class = v[0].replace('.java', '')
    pkg = "request" if v[1] else "response"
    new_suffix = f"{p1}.dto.{pkg}.{new_class}"
    from_package_map[old_suffix] = new_suffix

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        changed = False

        # update package declarations
        fn = filepath.replace('/', '\\')
        for old_path, (new_name, is_req) in RENAME_MAP.items():
            if old_path in fn:
                p_old = "package " + old_path.split('src\\main\\java\\')[1].split('\\dto\\')[0].replace('\\', '.') + ".dto;"
                p_new = "package " + old_path.split('src\\main\\java\\')[1].split('\\dto\\')[0].replace('\\', '.') + (".dto.request;" if is_req else ".dto.response;")
                if p_old in content:
                    content = content.replace(p_old, p_new)
                    changed = True
                break
                
        # update wildcard imports
        if "import com.stormshield." in content and ".dto.*;" in content:
            content = content.replace(".dto.*;", ".dto.request.*;\nimport com.stormshield." + content.split("import com.stormshield.")[1].split(".dto.*;")[0] + ".dto.response.*;")
            changed = True

        # update standard imports
        for old_imp, new_imp in from_package_map.items():
            if old_imp in content:
                content = content.replace(old_imp, new_imp)
                changed = True

        # apply class renames (ensuring we don't accidentally rename subsets)
        for old_c, new_c in CLASS_RENAME_MAP.items():
            if old_c in content:
                content = content.replace(old_c, new_c)
                changed = True
        
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

for r, d, files in os.walk(ROOT):
    for f in files:
        if f.endswith('.java'):
            process_file(os.path.join(r, f))

# Physical file move
for old_path, (new_name, is_req) in RENAME_MAP.items():
    old_full = os.path.join(ROOT, old_path)
    if not os.path.exists(old_full):
        continue
        
    folder = "request" if is_req else "response"
    base_dir = os.path.dirname(old_full)
    new_dir = os.path.join(base_dir, folder)
    os.makedirs(new_dir, exist_ok=True)
    
    new_full = os.path.join(new_dir, new_name)
    shutil.move(old_full, new_full)
    print(f"Moved {old_full} -> {new_full}")

print("REFACTORING COMPLETE")
