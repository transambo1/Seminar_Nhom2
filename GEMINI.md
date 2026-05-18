# StormShield Project Guidelines

## 1. Project Overview
StormShield is a Disaster Alert and Support System.
It serves as an MVP (Minimum Viable Product) for a university Seminar project.
The goal is to demonstrate a microservices architecture handling automated weather alerts (via external APIs) and field verification through citizen incident reports, as well as orchestrating rescue requests. 
**Note:** This is a demo-level project and is not a production-grade emergency system.

## 2. Architecture
The project is built on a Spring Boot Microservices architecture.
- **`discovery-service` (Port 8761):** Eureka server for service registry and discovery.
- **`gateway-service` (Port 8080):** API Gateway that routes requests (e.g., `/api/v1/auth/**` to `auth-service`) and handles CORS.
- **`auth-service` (Port 8081):** Manages user registration, login (JWT), and role-based access.
- **`shelter-service` (Port 8082):** Manages safe havens, their capacity, and current occupancy.
- **`alert-service` (Port 8083):** Core engine for disaster alerts and incident reports. Handles scanning weather data and approving/rejecting user reports.
- **`support-service` (Port 8085):** Orchestrates rescue teams and support requests (assignment, status updates).
- **`notification-service` (Port 8086):** Manages real-time event broadcasting to users.

### Frontends
- **`frontend-react`:** Web-based interface.
- **`frontend-mobile`:** React Native/Expo mobile app. **(CRITICAL: Must be preserved at all times)**

## 3. Tech Stack
- **Backend Framework:** Spring Boot (Java)
- **Frontend Web:** React
- **Frontend Mobile:** React Native (Expo)
- **Database:** MySQL 8.0 (mapped to port 3307 in Docker)
- **Message Broker:** RabbitMQ (port 5672 / 15672)
- **Realtime Mechanism:** SSE (Server-Sent Events) via `notification-service`.
- **Infrastructure:** Docker and Docker Compose.

## 4. Code Conventions
- **Naming Conventions:** Standard Java/Spring Boot conventions (Controllers, Services, Repositories, Entities, DTOs).
- **Entities & DTOs:** Separate models for DB (Entities) and API communication (DTOs).
- **Enum/Status:** Rely strictly on defined enums. E.g., `RequestStatus` (PENDING, ASSIGNED, IN_PROGRESS, RESOLVED, CANCELLED), `UserRole` (CITIZEN, RESCUE, RESCUE_LEADER, ADMIN).
- **Do not modify enums/field names blindly:** Verify frontend/backend synchronization before changing fields or endpoints.

## 5. Communication Rules
- **Frontend to Backend:** Frontends must call the **Gateway** (port 8080), not individual services directly.
- **Service to Service (Sync):** Use REST via Feign Clients or RestTemplate (routed through Eureka if applicable).
- **Service to Service (Async):** Events (e.g., Alert created, Request assigned) should be published to **RabbitMQ**.
- **Realtime Notifications:** The system uses **SSE** (`/api/v1/notifications/stream`) to push alerts to the frontend. Do not propose WebSocket or Kafka unless explicitly requested to change the architecture.

## 6. Roles and Business Rules
The current source code implements the following roles: `CITIZEN`, `RESCUE`, `RESCUE_LEADER`, `ADMIN`.
- **CITIZEN:** Can register, login, view alerts/shelters, submit incident reports (PENDING status), and send support requests. Cannot approve reports or create official alerts.
- **RESCUE:** Can view assigned support requests, update request status (to IN_PROGRESS, RESOLVED).
- **RESCUE_LEADER:** Can add members to their rescue team and assign requests.
- **ADMIN:** Can create official alerts, approve/reject incident reports (turning them into alerts), create shelters, and manage internal accounts (create rescue/admin accounts).
- **Business Flow (Support Request):** PENDING -> ASSIGNED -> IN_PROGRESS -> RESOLVED / CANCELLED.
- **Business Flow (Incident Report):** PENDING -> APPROVED (creates Alert) / REJECTED.

## 7. Current Progress
- **Implemented:** Microservices routing via Gateway, Eureka registry, JWT authentication, Shelter CRUD, Support Request life cycle, Incident report submission, SSE notifications, Map UI rendering.
- **Errors/Mismatch:** 
  - Frontend `rescueService.js` is missing implementations for `getMissionsByRescueId()` and `getTeamMembers()`, leading to runtime `TypeError`s.
  - Frontend Notification component (`inbox.jsx`) has a fragile fallback that can crash if the user accesses it without a valid session.
- **Priorities for Demo:** Ensure stable API mapping between the mobile frontend and backend services, specifically fixing the missing `rescueService` functions and robust error handling for unauthenticated states.

## 8. Agent Working Rules
1. **Audit First:** Before modifying the code, scan the source code to ensure you understand existing schemas and endpoints.
2. **Do Not Hallucinate Endpoints/Enums:** Only use existing APIs or data models.
3. **Documentation:** Report/audit files (.md, .csv) must be saved into `docs/agent-reports/`, `docs/testing/`, or `docs/architecture/`. Do not create .md files in the root directory (except `README.md`, `GEMINI.md`, `AGENTS.md`).
4. **Preserve `frontend-mobile`:** Never delete, archive, or rename the `frontend-mobile` directory.
5. **No Auto-Committing:** Do not run `git commit`. The user will review and commit manually.

## 9. Testing Rules
- Create test cases based strictly on actual controllers, services, DTOs, and UI.
- Results must be: `Pass`, `Fail`, `Untested`, `N/A`.
- Use `Pass` when the code logic clearly supports it or it has been physically verified.
- Use `Untested` for cases that require runtime execution to confirm integration.
- Test case outputs should follow the project's Google Sheet format.
