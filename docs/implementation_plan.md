# StormShield MVP - System Architecture Plan

This document outlines the final microservice architecture for the **StormShield** seminar project. The goal is to provide a scalable distributed system that remains achievable within the timeframe of the course.

## 1. Final List of Microservices

The system consists of **seven** core microservices (including infrastructure):

1. **`discovery-service`** (Infrastructure)
2. **`gateway-service`** (Infrastructure)
3. **`auth-service`** (Business)
4. **`shelter-service`** (Business)
5. **`alert-service`** (Business)
6. **`support-service`** (Business)
7. **`notification-service`** (Business)

> [!TIP]
> **Reporting Architecture Change:**
> To streamline the workflow and reduce container overhead, the standalone `report-service` was deprecated. Its statistical functions have been directly integrated into `support-service` and `alert-service`.

---

## 2. Responsibility of Each Microservice

### 🛡️ Infrastructure Services
- **`discovery-service` (Eureka)**: Acts as the service registry. All other services will register themselves here so they can be discovered by name instead of hardcoded IP addresses.
- **`gateway-service` (Spring Cloud Gateway)**: The single entry point for the frontend React App. Handles CORS and route forwarding (`/api/v1/*`).

### 💼 Business Services
- **`auth-service`**: Handles Authentication (Login/Register) and issues capabilities.
- **`shelter-service`**: Manages the spatial details of shelters and safe zones. 
- **`alert-service`**: Responsible for storing emergency alerts and computing hazard statistics. 
- **`support-service`**: Tracks victim rescue/support requests (PENDING, ASSIGNED, RESOLVED). Now also aggregates global request statistics.
- **`notification-service`**: Dispatches notifications dynamically.

---

## 3. Database Selection

- We utilize **MySQL 8.0** databases exclusively for simplified container management during local demos. Each microservice is configured with a logically isolated schema (e.g., `stormshield_auth`, `stormshield_support`).
