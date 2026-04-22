# StormShield

Monorepo for StormShield MVP.

## Architecture

This project is built using a Spring Boot microservice architecture. 
The current running services are:

* **Infrastructure:**
  * `discovery-service` (Eureka Server)
  * `gateway-service` (API Gateway)
  * `mysql-db` (Database layer)

* **Business Microservices:**
  * `auth-service`
  * `shelter-service`
  * `alert-service`
  * `support-service`
  * `notification-service`

*Note: The `report-service` has been removed. Its core operations and statistics have been aggregated into `alert-service` and `support-service` to adhere to simpler deployment patterns.*