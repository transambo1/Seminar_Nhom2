# StormShield Data Entities Report

Based on the scan of the backend microservices, here are the actual data entities implemented in the StormShield codebase. Configuration, DTOs, and utility classes have been ignored to focus purely on the core domain models.

## Entity Breakdown

| Service | Entity | Main Fields | Purpose |
|---------|--------|-------------|---------|
| **auth-service** | `User` | `id`, `fullName`, `phoneNumber`, `email`, `role`, `status` | Represents an authenticated user (citizen, responder, or admin) in the system and stores their identity credentials. |
| **alert-service** | `Alert` | `id`, `title`, `description`, `alertType`, `severityLevel`, `affectedArea`, `latitude`, `longitude`, `startTime`, `endTime`, `issuedBy`, `status` | Represents an official emergency broadcast, weather warning, or evacuation notice issued to the public. |
| **alert-service** | `IncidentReport` | `id`, `userId`, `title`, `description`, `incidentType`, `severityLevel`, `latitude`, `longitude`, `imageUrl`, `status`, `createdAlertId` | Represents a crowdsourced or citizen-submitted report of an incident or hazard, which can be reviewed and turned into an official `Alert`. |
| **shelter-service** | `Shelter` | `id`, `name`, `address`, `latitude`, `longitude`, `capacity`, `currentOccupancy`, `status`, `contactPhone`, `managedBy` | Represents a physical location designated as a safe zone or shelter, tracking its availability and current occupancy. |
| **support-service** | `RescueRequest` | `id`, `userId`, `requestType`, `description`, `numberOfPeople`, `latitude`, `longitude`, `priorityLevel`, `status`, `assignedTeamId` | Represents a distress signal or request for assistance (rescue, medical, supplies) from a citizen during an emergency. |
| **notification-service** | `Notification` | `id`, `recipientUserId`, `title`, `message`, `type`, `status`, `relatedEntityType`, `relatedEntityId`, `readAt` | Represents an internal or push notification sent to a specific user to inform them about an event, alert, or request update. |

---

## Core Data Summary

StormShield's data architecture reflects a highly decentralized, domain-driven design tailored for emergency management:
- **Identity & Access:** The `User` entity is the central actor across the system. Instead of tightly coupling microservices, most entities (like `IncidentReport`, `RescueRequest`, and `Notification`) reference the user by a loosely coupled `userId` or `recipientUserId`.
- **Geospatial Focus:** Almost all operational entities (`Alert`, `IncidentReport`, `Shelter`, `RescueRequest`, `Notification`) store geospatial coordinates (`latitude`, `longitude`), which is essential for a map-based disaster response platform.
- **Alerting vs Reporting:** The domain strictly separates citizen-reported incidents (`IncidentReport`) from verified, system-wide emergencies (`Alert`), establishing an approval/review pipeline.
- **Event-Driven Interactions:** The `Notification` entity tracks `relatedEntityType` and `relatedEntityId` to link back to core events (e.g., when a `RescueRequest` changes status, a related `Notification` is triggered), enabling asynchronous communication.
