---
description: Rules for Socket.io realtime event handling across portal, realtime server, and mobile.
globs: apps/realtime/**/*,**/socket*.ts,**/socket*.js
alwaysApply: false
---

# REALTIME EVENTS RULES — Royal Suzuky

## Architecture

```
Portal API ──POST /broadcast──▶ Realtime Server ──WebSocket──▶ Mobile App / Portal UI
```

The realtime server is a **standalone Socket.io server** at `apps/realtime/server.js`. It does NOT connect to the database — it simply relays events.

## Event Naming Convention

Events use **colon-separated** naming: `{domain}:{action}`

| Event | Emitted By | Listened By | Description |
|-------|-----------|-------------|-------------|
| `requisition:created` | Portal API | Mobile, Portal UI | New requisition submitted |
| `requisition:status_changed` | Portal API | Mobile, Portal UI | Requisition approved/rejected |
| `requisition:approved` | Realtime | Mobile | Requisition specifically approved |
| `requisition:rejected` | Realtime | Mobile | Requisition specifically rejected |
| `inventory:changed` | Portal API | Portal UI | Inventory quantities updated |
| `inventory:adjusted` | Portal API | Portal UI | Manual inventory adjustment |
| `order:changed` | Portal API | Portal UI, Customer | Order status updated |
| `sale:received` | Portal API | Portal UI | New sale recorded |
| `technician:location:update` | Mobile | Portal UI | Technician GPS location |

## Room System

Clients join rooms on connection:

| Room Pattern | Purpose |
|-------------|---------|
| `job:{jobNo}` | Track specific job updates |
| `dealer:{dealerId}` | All events for a dealer (most common) |
| `user:{userId}` | User-specific notifications |
| `technician:{staffId}` | Technician-specific events |

## Emitting Events from Portal API

```typescript
// In your API route, after a data mutation:
const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL || 'http://localhost:3001';

await fetch(`${REALTIME_URL}/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        event: 'requisition:created',
        data: {
            dealer_id: user.dealerId,    // For dealer room routing
            technician_id: staffId,       // For technician room routing
            // ... event payload
        }
    })
});
```

## IMPORTANT: Event Data Keys for Room Routing

The realtime server routes events to rooms based on these data keys:
- `service_number` or `job_no` → `job:{value}` room
- `dealer_id` or `dealerId` → `dealer:{value}` room
- `user_id` → `user:{value}` room
- `technicianId` or `technician_id` → `technician:{value}` room

**Always include the relevant routing keys in your event data**, or the event won't reach the right clients.

## Listening on Mobile (servicestuff)

```typescript
import { SocketService } from '../services/socket';

const socket = SocketService.getInstance();
socket.on('requisition:status_changed', (data) => {
    // Refresh data
    queryClient.invalidateQueries(['requisitions']);
});
```
