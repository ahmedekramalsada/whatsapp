# Implementation Plan: 001-whatsapp-dashboard

**Branch**: `001-whatsapp-dashboard` | **Date**: 2026-04-10 | **Spec**: `/specs/001-whatsapp-dashboard/spec.md`
**Input**: Feature specification from `/specs/001-whatsapp-dashboard/spec.md`

## Summary

Build a full-stack WhatsApp chat dashboard to receive Meta API webhooks, manage conversations in real-time, send compliant messages, and present it all through a structured React/Next.js dashboard backed by Node.js, Express, PostgreSQL, and Redis/BullMQ. It will be fully containerized via Docker and deployable to K3s Kubernetes.

## Technical Context

**Language/Version**: TypeScript 5+, Node.js v20+  
**Primary Dependencies**: Next.js App Router, Express.js, Prisma ORM, Socket.IO, BullMQ, Tailwind CSS, shadcn/ui.
**Storage**: PostgreSQL (Relational Data), Redis (Queue & Caching)  
**Testing**: Jest (Backend unit tests), Playwright or Cypress (Frontend E2E, OPTIONAL)  
**Target Platform**: Linux server, K3s cluster, Docker containers
**Project Type**: Full-stack Web Application (Frontend + Webhook API + Background Worker)  
**Performance Goals**: Sub-500ms webhook response time to satisfy Meta requirements, near-instant WebSocket delivery.  
**Constraints**: Deeply strict 24-hour customer service window logic preventing arbitrary notifications.  
**Scale/Scope**: Handling standard WhatsApp SMB workloads; isolated Docker deployment setup.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Best Practice Implementations**: We will utilize Next.js App Router and Prisma ORM.
- [x] **II. Persistence of Knowledge**: Using project_notes.md and local specs.
- [x] **III. Continuous Documentation**: Quickstart will be defined, and README updated.
- [x] **IV. Proactive Commits**: Tracked via `before_*` hook configurations.
- [x] **V. Modern Premium Aesthetics**: Next.js, Tailwind CSS, shadcn/ui.
- [x] **DevOps Requirements**: Full dockerization provided.

## Project Structure

### Documentation (this feature)

```text
specs/001-whatsapp-dashboard/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
└── contracts/           
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── webhooks.ts
│   │   └── messages.ts
│   ├── config/
│   ├── db/
│   │   └── prisma/
│   ├── queues/
│   │   └── bullmq.ts
│   ├── services/
│   │   ├── whatsapp.ts
│   │   └── media.ts
│   └── websocket/
│       └── socket.ts
├── Dockerfile
└── package.json

frontend/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   └── chat/
│   └── lib/
│       └── socket.ts
├── Dockerfile
└── package.json

k8s/
├── backend/
├── frontend/
├── postgres/
├── redis/
└── ingress.yaml

docker-compose.yml
project_notes.md
```

**Structure Decision**: Option 2 (Web application separated frontend and backend + dedicated K8s folder). This ensures distinct containerization and allows separation of webhook processing from React rendering boundaries.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multiple components (Queue worker + API) | Webhooks must respond in under 5 seconds (Meta requirement), necessitating background workers for attachments/complex sending. | Direct synchronous sending blocks API workers and can cause Meta to drop webhooks. |
