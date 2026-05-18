# StormShield Backend API Endpoints

This document outlines all the real API endpoints currently implemented in the StormShield microservices backend project.

## Gateway Configuration
The `gateway-service` runs on port `8080` by default. It routes incoming requests to the appropriate microservices based on the URL path.
It does **not** strip prefixes, so the frontend URL directly matches the controller's `@RequestMapping`.

**Base Frontend URL:** `http://localhost:8080`


---

## 1. Auth Service
**Controller:** `AuthController.java`  
**Base Path:** `/api/v1/auth`

| Method | Full Path | Required Role / Auth | Request Body | Response DTO | Description |
|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | None | `RegisterRequest` | `AuthResponse` | Register a new user |
| `POST` | `/api/v1/auth/login` | None | `LoginRequest` | `AuthResponse` | Authenticate user and get JWT |
| `GET`  | `/api/v1/auth/me` | Authenticated | *None* | `UserResponse` | Get current logged-in user info |
| `POST` | `/api/v1/auth/internal/accounts` | Admin only | `InternalAccountCreateRequest` | `UserResponse` | Create internal accounts (RESCUE, ADMIN) |
| `POST` | `/api/v1/auth/admin/rescue-accounts` | Admin only | `CreateRescueAccountRequest` | `UserResponse` | Create rescue accounts |
| `POST` | `/api/v1/auth/admin/admin-accounts` | Admin only | `CreateRescueAccountRequest` | `UserResponse` | Create admin accounts |

---

## 2. Alert Service
### Emergency Alerts
**Controller:** `AlertController.java`  
**Base Path:** `/api/v1/alerts`

| Method | Full Path | Request Body / Params | Response DTO | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/alerts` | `AlertCreateRequest` | `AlertResponse` | Create a new alert |
| `GET`  | `/api/v1/alerts` | *Params:* `status`, `type`, `severity` | `List<AlertResponse>` | Get all alerts with optional filtering |
| `GET`  | `/api/v1/alerts/{id}` | *None* | `AlertResponse` | Get alert details by ID |
| `PATCH`| `/api/v1/alerts/{id}/status` | `AlertStatusUpdateRequest` | `AlertResponse` | Update alert status |
| `GET`  | `/api/v1/alerts/active` | *None* | `List<AlertResponse>` | Get currently active and valid alerts |
| `GET`  | `/api/v1/alerts/statistics` | *None* | `AlertStatisticsResponse` | Get overall alert statistics |
| `POST` | `/api/v1/alerts/filter` | `AlertFilterRequest` | `List<AlertResponse>` | Advanced filter with sorting and distance calculation |

### Incident Reports
**Controller:** `IncidentReportController.java`  
**Base Path:** `/api/v1/incident-reports`

| Method | Full Path | Request Body | Response DTO | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/incident-reports` | `IncidentReportCreateRequest` | `IncidentReportResponse` | Submit a new incident report |
| `GET`  | `/api/v1/incident-reports` | *None* | `List<IncidentReportResponse>` | Get all incident reports |
| `GET`  | `/api/v1/incident-reports/pending` | *None* | `List<IncidentReportResponse>` | Get pending incident reports |
| `GET`  | `/api/v1/incident-reports/{id}` | *None* | `IncidentReportResponse` | Get report details by ID |
| `PUT`  | `/api/v1/incident-reports/{id}/review` | `IncidentReportReviewRequest` | `IncidentReportResponse` | Review and approve/reject an incident report |

---

## 3. Shelter Service
**Controller:** `ShelterController.java`  
**Base Path:** `/api/v1/shelters`

| Method | Full Path | Request Body / Params | Response DTO | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/shelters` | `ShelterCreateRequest` | `ShelterResponse` | Create a new shelter |
| `PUT`  | `/api/v1/shelters/{id}` | `ShelterCreateRequest` | `ShelterResponse` | Update shelter information |
| `GET`  | `/api/v1/shelters` | *Params:* `status` | `List<ShelterResponse>` | Get all shelters, option to filter by status |
| `GET`  | `/api/v1/shelters/{id}` | *None* | `ShelterResponse` | Get shelter details by ID |
| `PATCH`| `/api/v1/shelters/{id}/occupancy` | `OccupancyUpdateRequest` | `ShelterResponse` | Update occupancy for a shelter |
| `GET`  | `/api/v1/shelters/nearby` | *Params:* `latitude`, `longitude`, `limit` | `List<ShelterResponse>` | Find nearby shelters using coordinates |

---

## 4. Support Service
**Controller:** `RescueRequestController.java`  
**Base Path:** `/api/v1/support-requests`

| Method | Full Path | Request Body / Params / Headers | Response DTO | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/support-requests` | `SupportCreateRequest` | `RescueRequestResponse` | Create new rescue/support request |
| `GET`  | `/api/v1/support-requests/my` | *Header:* `X-User-Id` | `List<RescueRequestResponse>` | Get current user's own requests |
| `GET`  | `/api/v1/support-requests/{id}` | *None* | `RescueRequestResponse` | Get request detail |
| `GET`  | `/api/v1/support-requests` | *Params:* `status`, `priorityLevel`, `requestType` | `List<RescueRequestResponse>` | Admin/rescuer gets all requests with optional filters |
| `GET`  | `/api/v1/support-requests/filter` | `SupportRequestFilterRequest`, *Header:* `X-User-Id` | `List<RescueRequestResponse>` | Advanced filter with scope, sorting, and distance calculation |
| `GET`  | `/api/v1/support-requests/status/{status}` | *None* | `List<RescueRequestResponse>` | Get requests by specific status |
| `PATCH`| `/api/v1/support-requests/{id}/assign` | `SupportAssignRequest` | `RescueRequestResponse` | Assign request to team/rescuer |
| `PATCH`| `/api/v1/support-requests/{id}/status` | `SupportStatusUpdateRequest` | `RescueRequestResponse` | Update request status |
| `GET`  | `/api/v1/support-requests/statistics` | *None* | `SupportStatisticsResponse` | Get overall support requests statistics |

---

## 5. Notification Service
**Controller:** `NotificationController.java`  
**Base Path:** `/api/v1/notifications`

| Method | Full Path | Request Body / Params | Response DTO | Description |
|---|---|---|---|---|
| `GET`  | `/api/v1/notifications/stream` | *Params:* `userId` | `SseEmitter` | SSE Connection for real-time notifications |
| `POST` | `/api/v1/notifications` | `NotificationCreateRequest` | `NotificationResponse` | Create notification |
| `GET`  | `/api/v1/notifications/my` | *Params:* `userId` | `List<NotificationResponse>` | Get current user's notifications |
| `GET`  | `/api/v1/notifications/user/{userId}` | *None* | `List<NotificationResponse>` | Get notifications by user ID |
| `GET`  | `/api/v1/notifications/user/{userId}/unread` | *None* | `List<NotificationResponse>` | Get unread notifications by user ID |
| `GET`  | `/api/v1/notifications/unread-count` | *Params:* `userId` | `UnreadCountResponse` | Get unread count via query param |
| `GET`  | `/api/v1/notifications/user/{userId}/unread-count` | *None* | `UnreadCountResponse` | Get unread count via path param |
| `PATCH`| `/api/v1/notifications/{id}/read` | *None* | `Void` | Mark as read |
| `PUT`  | `/api/v1/notifications/{id}/read` | *None* | `Void` | Mark as read |
| `PATCH`| `/api/v1/notifications/read-all` | *Params:* `userId` | `Void` | Mark all as read |
| `PUT`  | `/api/v1/notifications/user/{userId}/read-all` | *None* | `Void` | Mark all as read |
| `DELETE`|`/api/v1/notifications/{id}` | *None* | `Void` | Delete notification |
| `POST` | `/api/v1/notifications/check-nearby-alerts` | `NearbyAlertCheckRequest` | `NearbyAlertCheckResponse` | Check nearby alerts |
| `POST` | `/api/v1/notifications/support-status` | `SupportStatusNotificationRequest` | `NotificationResponse` | Create support status notification |
| `POST` | `/api/v1/notifications/incident-review` | `IncidentReviewNotificationRequest` | `NotificationResponse` | Create incident review notification |

---

## Consistency & Prefixes Report

All services consistently use the `/api/v1` prefix. There are no duplicated or mismatched prefixes across the project. 
- The Gateway Service directly routes the `/api/v1/...` paths to their respective microservices.
- No `StripPrefix` is used in the `application.properties` for the gateway.
- `NotificationController` defines some identical endpoints mapping using both `PATCH` and `PUT` methods for broad compatibility (e.g., `/{id}/read` and `/read-all`).

---

## Frontend Integration Summary

**Base Gateway URL:** `http://localhost:8080`

### Concise Endpoint List for README.md

```markdown
### Auth
- POST /api/v1/auth/register - Register a new user
- POST /api/v1/auth/login - Authenticate user and get JWT
- GET /api/v1/auth/me - Get current logged-in user info
- POST /api/v1/auth/internal/accounts - Create internal accounts (RESCUE, ADMIN)
- POST /api/v1/auth/admin/rescue-accounts - Create rescue accounts
- POST /api/v1/auth/admin/admin-accounts - Create admin accounts

### Alerts
- POST /api/v1/alerts - Create a new alert
- GET /api/v1/alerts - Get all alerts with optional filtering
- GET /api/v1/alerts/{id} - Get alert details by ID
- PATCH /api/v1/alerts/{id}/status - Update alert status
- GET /api/v1/alerts/active - Get currently active and valid alerts
- GET /api/v1/alerts/statistics - Get overall alert statistics
- POST /api/v1/alerts/filter - Advanced filter with sorting and distance calculation

### Incident Reports
- POST /api/v1/incident-reports - Submit a new incident report
- GET /api/v1/incident-reports - Get all incident reports
- GET /api/v1/incident-reports/pending - Get pending incident reports
- GET /api/v1/incident-reports/{id} - Get report details by ID
- PUT /api/v1/incident-reports/{id}/review - Review and approve/reject an incident report

### Shelters
- POST /api/v1/shelters - Create a new shelter
- PUT /api/v1/shelters/{id} - Update shelter information
- GET /api/v1/shelters - Get all shelters, option to filter by status
- GET /api/v1/shelters/{id} - Get shelter details by ID
- PATCH /api/v1/shelters/{id}/occupancy - Update occupancy for a shelter
- GET /api/v1/shelters/nearby - Find nearby shelters using coordinates

### Support Requests
- POST /api/v1/support-requests - Create new rescue/support request
- GET /api/v1/support-requests/my - Get current user's own requests
- GET /api/v1/support-requests/{id} - Get request detail
- GET /api/v1/support-requests - Admin/rescuer gets all requests with optional filters
- GET /api/v1/support-requests/filter - Advanced filter with scope, sorting, and distance calculation
- GET /api/v1/support-requests/status/{status} - Get requests by specific status
- PATCH /api/v1/support-requests/{id}/assign - Assign request to team/rescuer
- PATCH /api/v1/support-requests/{id}/status - Update request status
- GET /api/v1/support-requests/statistics - Get overall support requests statistics

### Notifications
- GET /api/v1/notifications/stream - SSE Connection for real-time notifications
- POST /api/v1/notifications - Create notification
- GET /api/v1/notifications/my - Get current user's notifications
- GET /api/v1/notifications/user/{userId} - Get notifications by user ID
- GET /api/v1/notifications/user/{userId}/unread - Get unread notifications by user ID
- GET /api/v1/notifications/unread-count - Get unread count via query param
- GET /api/v1/notifications/user/{userId}/unread-count - Get unread count via path param
- PATCH /api/v1/notifications/{id}/read - Mark as read (also available as PUT)
- PATCH /api/v1/notifications/read-all - Mark all as read (also available as PUT)
- DELETE /api/v1/notifications/{id} - Delete notification
- POST /api/v1/notifications/check-nearby-alerts - Check nearby alerts
- POST /api/v1/notifications/support-status - Create support status notification
- POST /api/v1/notifications/incident-review - Create incident review notification
```
