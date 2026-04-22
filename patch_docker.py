import os

base_dir = r"d:\Seminar_Nhom2"
services = {
    "discovery-service": 8761,
    "gateway-service": 8080,
    "auth-service": 8081,
    "shelter-service": 8082,
    "alert-service": 8083,
    "support-service": 8085,
    "notification-service": 8086
}

template = """FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE {port}
ENTRYPOINT ["java","-jar","/app/app.jar"]
"""

for s, p in services.items():
    path = os.path.join(base_dir, s, "Dockerfile")
    with open(path, "w", encoding="utf-8") as f:
        f.write(template.format(port=p))

print("Dockerfiles updated successfully")
