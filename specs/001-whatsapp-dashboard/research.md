# Phase 0: Research & Pattern Selection

## WhatsApp Cloud API Webhook Format
**Decision:** We will use standard payload extraction targeting `entry[0].changes[0].value.messages[0]` and `entry[0].changes[0].value.contacts[0]`.
**Rationale:** Meta's webhook format buries the actual message text deep within an array structure. We need rigorous null-checking or Zod schema validation to ensure the Express backend does not crash on status updates (like `read` or `delivered` receipts) which lack `.messages`.
**Alternatives considered:** Manual extraction vs third-party meta libraries. We chose manual parsing via TypeScript interfaces to avoid bloated black-box dependencies.

## Media Handling Strategy
**Decision:** Store media URLs temporarily / map to object storage.
**Rationale:** When a message contains an image, WhatsApp sends a `media_id`. Getting the media requires calling the Meta Graph API using the token to get the URL, then downloading the URL payload using the access token as a header. This is a multi-step async flow that strictly requires BullMQ to prevent holding up the webhook acknowledgment.
**Alternatives considered:** Direct synchronous downloading (rejected due to Meta's 5-second webhook timeout requirement).

## 24-Hour Rule Implementation
**Decision:** Enforce purely at the database level using Prisma.
**Rationale:** The `Conversations` table tracks `last_message_at`. Before pushing a job to BullMQ for sending, the worker will evaluate `last_message_at > Date.now() - 24 * 60 * 60 * 1000`.
**Alternatives considered:** Enforcing at frontend (can be bypassed) or Enforcing at Redis via TTL keys (too complex to maintain state synchronization with Postgres).

## Frontend Framework Architecture
**Decision:** Next.js 14 App Router + pure React Server Components for layout, with dedicated "Client Boundary" components exclusively for the Socket.IO listener.
**Rationale:** To get the best of state-of-the-art performance and real-time. Socket.io requires `useEffect`, hence `"use client"`. The rest of the dashboard layout (sidebar, contacts fetch) can be gracefully rendered securely.
