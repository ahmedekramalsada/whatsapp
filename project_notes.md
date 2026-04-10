# WhatsApp Dashboard - Project Notes & Important Ideas

This file serves as a persistent memory bank for the project. Both the user and AI can refer back to it to understand the latest state and best practices in use.

## Architecture Decisions
- Backend: Express + Socket.io + PostgreSQL
- Queue: BullMQ + Redis for stable event processing (sending messages, parsing media)
- ORM: Prisma ORM (chosen for optimal database type safety and migrations)
- Frontend: Next.js + Tailwind CSS with shadcn/ui for premium design.

## Best Practices Noted
- Always maintain the 24-hour rule: WhatsApp API prohibits free-form text 24 hours after the last user-initiated message. The backend queue will validate timestamps before firing API shots.
- Use Docker Compose locally. Keeps all services unified.
- Centralize webhook logic: Do not overcomplicate the webhook endpoint. Just parse data and push complex handling off to a queue to prevent 500s or webhook timeouts from Meta.

## Commit Guidelines (For Git)
- Always propose meaningful commit messages after every major change.
- Keep commits isolated to functional improvements (e.g. `feat(backend): setup prisma schema and pg pool`)

## Current Status
- Setup phase initialized.
- Waiting on user approval of the `implementation_plan.md`.
