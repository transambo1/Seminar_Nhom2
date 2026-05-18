# StormShield Project Guidelines

## Overview
StormShield is a Disaster Alert and Support System.
It is built with a Spring Boot microservices architecture on the backend, and uses both React (web) and React Native/Expo (mobile) for the frontend.

## Microservices
- `discovery-service`
- `gateway-service`
- `auth-service`
- `alert-service`
- `shelter-service`
- `support-service`
- `notification-service`

## Frontend
- `frontend-react`
- `frontend-mobile` (CRITICAL: Must be preserved at all times)

## Roles
The system has the following roles:
- `CITIZEN`
- `RESCUE`
- `RESCUE_LEADER`
- `ADMIN`

## Rules for Agents
1. **Audit First:** Before modifying the code, scan the source code (controllers, entities, enums, UI files) to ensure you understand existing schemas and endpoints.
2. **Do Not Hallucinate Endpoints/Fields:** Only use existing APIs or data models. If something is missing, explicitly point it out or implement it fully.
3. **Do Not Modify Enums/Fields Blindly:** Verify backend enums (`RequestStatus`, `AlertStatus`, `UserRole`, etc.) before making UI checks.
4. **Agent Reports:** If you generate a report (.md, .csv) analyzing the project, place it inside the `docs/agent-reports/`, `docs/testing/`, or `docs/architecture/` folder instead of the root directory.
5. **Preserve `frontend-mobile`:** Never delete, archive, or rename the `frontend-mobile` directory unless directly instructed by the human user.
