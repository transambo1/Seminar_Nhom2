import os

base_dir = r"d:\Seminar_Nhom2"
services = [
    "auth-service",
    "shelter-service",
    "alert-service",
    "support-service",
    "notification-service"
]

for s in services:
    db_name = "stormshield_" + s.split('-')[0]
    
    props = f"""server.port=808{services.index(s)+1}
spring.application.name={s}

eureka.client.service-url.defaultZone=http://discovery-service:8761/eureka/

spring.datasource.url=jdbc:mysql://mysql-db:3306/{db_name}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
"""
    # Fix port numbering which was hardcoded
    # auth: 8081, shelter: 8082, alert: 8083, report: 8084, support: 8085, notification: 8086
    port_mapping = {
        "auth-service": 8081,
        "shelter-service": 8082,
        "alert-service": 8083,
        "support-service": 8085,
        "notification-service": 8086
    }
    
    props = f"""server.port={port_mapping[s]}
spring.application.name={s}

eureka.client.service-url.defaultZone=http://discovery-service:8761/eureka/

spring.datasource.url=jdbc:mysql://mysql-db:3306/{db_name}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
"""
    
    path = os.path.join(base_dir, s, "src", "main", "resources", "application.properties")
    with open(path, "w", encoding="utf-8") as f:
        f.write(props)

# Now fix docker-compose.yml
compose = """networks:
  stormshield-net:
    driver: bridge

services:
  # ----------------------------------------
  # INFRASTRUCTURE DATABASES
  # ----------------------------------------
  mysql-db:
    image: mysql:8.0
    container_name: stormshield-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
    ports:
      - "3307:3306"
    networks:
      - stormshield-net
    command: --default-authentication-plugin=mysql_native_password
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-proot"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ----------------------------------------
  # DISCOVERY & REGISTRY REGION
  # ----------------------------------------
  discovery-service:
    build: ./backend/discovery-service
    container_name: discovery-service
    ports:
      - "8761:8761"
    networks:
      - stormshield-net
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8761/actuator/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ----------------------------------------
  # API GATEWAY
  # ----------------------------------------
  gateway-service:
    build: ./backend/gateway-service
    container_name: gateway-service
    ports:
      - "8080:8080"
    networks:
      - stormshield-net
    depends_on:
      - discovery-service

  # ----------------------------------------
  # BUSINESS MICROSERVICES
  # ----------------------------------------
  auth-service:
    build: ./backend/auth-service
    container_name: auth-service
    ports:
      - "8081:8081"
    networks:
      - stormshield-net
    depends_on:
      mysql-db:
        condition: service_healthy

  shelter-service:
    build: ./backend/shelter-service
    container_name: shelter-service
    ports:
      - "8082:8082"
    networks:
      - stormshield-net
    depends_on:
      mysql-db:
        condition: service_healthy

  alert-service:
    build: ./backend/alert-service
    container_name: alert-service
    ports:
      - "8083:8083"
    networks:
      - stormshield-net
    depends_on:
      mysql-db:
        condition: service_healthy

  support-service:
    build: ./backend/support-service
    container_name: support-service
    ports:
      - "8085:8085"
    networks:
      - stormshield-net
    depends_on:
      mysql-db:
        condition: service_healthy

  notification-service:
    build: ./backend/notification-service
    container_name: notification-service
    ports:
      - "8086:8086"
    networks:
      - stormshield-net
    depends_on:
      mysql-db:
        condition: service_healthy

volumes:
  db-data:
"""
with open(os.path.join(base_dir, "docker-compose.yml"), "w", encoding="utf-8") as f:
    f.write(compose)

print("Properties and Docker Compose patched successfully")
