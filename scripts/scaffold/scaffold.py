import os

# Define the structure and contents
services = [
    "discovery-service",
    "gateway-service",
    "auth-service",
    "shelter-service",
    "alert-service",
    "support-service",
    "notification-service"
]

def create_file(path, content):
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# Root level layout
create_file("README.md", "# StormShield\n\nMonorepo for StormShield MVP")
docker_compose = """version: '3.8'
services:
  discovery-service:
    build: ./backend/discovery-service
    ports:
      - "8761:8761"
  gateway-service:
    build: ./backend/gateway-service
    ports:
      - "8080:8080"
"""
create_file("docker-compose.yml", docker_compose)

root_pom = """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.stormshield</groupId>
    <artifactId>stormshield-parent</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    
    <modules>
""" + "".join([f"        <module>{s}</module>\n" for s in services]) + """    </modules>
</project>
"""
create_file("pom.xml", root_pom)

frontend_package = """{
  "name": "stormshield-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}"""
create_file("frontend-react/package.json", frontend_package)
create_file("frontend-react/src/App.js", "import React from 'react';\n\nfunction App() {\n  return <div>StormShield Frontend</div>;\n}\n\nexport default App;\n")
create_file("frontend-react/src/index.js", "import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\n\nReactDOM.render(<App />, document.getElementById('root'));\n")
create_file("frontend-react/public/index.html", "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>StormShield</title>\n</head>\n<body>\n  <div id=\"root\"></div>\n</body>\n</html>\n")

base_port = 8081

for service in services:
    port = 8761 if service == "discovery-service" else (8080 if service == "gateway-service" else base_port)
    if service != "discovery-service" and service != "gateway-service":
        base_port += 1
        
    pkg = service.replace("-", "")
    pkg_path = f"{service}/src/main/java/com/stormshield/{pkg}"
    
    # Generate basic packages
    for sub in ["controller", "service", "repository", "entity", "dto", "config", "exception"]:
        os.makedirs(f"{pkg_path}/{sub}", exist_ok=True)
        # Add a gitkeep so folders persist
        create_file(f"{pkg_path}/{sub}/.gitkeep", "")
        
    # main app class
    app_class = f"""package com.stormshield.{pkg};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class {pkg.capitalize()}Application {{

    public static void main(String[] args) {{
        SpringApplication.run({pkg.capitalize()}Application.class, args);
    }}
}}
"""
    create_file(f"{pkg_path}/{pkg.capitalize()}Application.java", app_class)
    
    # application properties
    app_props = f"""server.port={port}
spring.application.name={service}
"""
    create_file(f"{service}/src/main/resources/application.properties", app_props)
    
    # pom.xml
    service_pom = f"""<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
    </parent>
    <groupId>com.stormshield</groupId>
    <artifactId>{service}</artifactId>
    <version>1.0.0-SNAPSHOT</version>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
</project>
"""
    create_file(f"{service}/pom.xml", service_pom)
    
    # Dockerfile
    dockerfile = f"""FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app/app.jar"]
"""
    create_file(f"{service}/Dockerfile", dockerfile)

print("Scaffolding complete.")
