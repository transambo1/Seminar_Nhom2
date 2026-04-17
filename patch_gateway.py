import os

base_dir = r"d:\Seminar_Nhom2\gateway-service"

pom_content = """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/>
    </parent>
    <groupId>com.stormshield</groupId>
    <artifactId>gateway-service</artifactId>
    <version>1.0.0-SNAPSHOT</version>

    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2023.0.0</spring-cloud.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
"""

os.makedirs(base_dir, exist_ok=True)
with open(os.path.join(base_dir, "pom.xml"), "w", encoding="utf-8") as f:
    f.write(pom_content)

props_content = """server.port=8080
spring.application.name=gateway-service

eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# Dynamic Routing to Microservices via Eureka (lb:// denotes LoadBalancer lookup by service-name)
spring.cloud.gateway.routes[0].id=auth-service
spring.cloud.gateway.routes[0].uri=lb://auth-service
spring.cloud.gateway.routes[0].predicates[0]=Path=/api/v1/auth/**

spring.cloud.gateway.routes[1].id=shelter-service
spring.cloud.gateway.routes[1].uri=lb://shelter-service
spring.cloud.gateway.routes[1].predicates[0]=Path=/api/v1/shelters/**

spring.cloud.gateway.routes[2].id=alert-service
spring.cloud.gateway.routes[2].uri=lb://alert-service
spring.cloud.gateway.routes[2].predicates[0]=Path=/api/v1/alerts/**

spring.cloud.gateway.routes[3].id=report-service
spring.cloud.gateway.routes[3].uri=lb://report-service
spring.cloud.gateway.routes[3].predicates[0]=Path=/api/v1/reports/**

spring.cloud.gateway.routes[4].id=support-service
spring.cloud.gateway.routes[4].uri=lb://support-service
spring.cloud.gateway.routes[4].predicates[0]=Path=/api/v1/support-requests/**

spring.cloud.gateway.routes[5].id=notification-service
spring.cloud.gateway.routes[5].uri=lb://notification-service
spring.cloud.gateway.routes[5].predicates[0]=Path=/api/v1/notifications/**

# Global CORS Configuration so React (localhost:3000) can access API without browser errors
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowedOrigins=*
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowedMethods=*
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowedHeaders=*
"""

props_path = os.path.join(base_dir, "src", "main", "resources", "application.properties")
os.makedirs(os.path.dirname(props_path), exist_ok=True)
with open(props_path, "w", encoding="utf-8") as f:
    f.write(props_content)

print("Gateway patched!")
