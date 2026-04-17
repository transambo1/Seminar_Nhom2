# Discovery Service

This is the Eureka Naming/Discovery Server for the StormShield application. It acts as a registry where all other microservices declare themselves.

## How to Run Locally

You can run this service directly through Maven:
```bash
./mvnw spring-boot:run
```

Or you can build and run via Docker:
```bash
mvn clean package -DskipTests
docker build -t stormshield/discovery-service .
docker run -p 8761:8761 stormshield/discovery-service
```
