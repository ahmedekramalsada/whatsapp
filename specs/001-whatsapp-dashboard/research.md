# Research: Premium WhatsApp Dashboard Enhancements

## Decision 1: Authentication & Multi-User Support
- **Decision**: Implement **NextAuth.js** with a Prisma adapter.
- **Rationale**: Standard for Next.js, supports multiple providers (credentials, Google, etc.), and integrates directly with our existing Prisma DB.
- **Alternatives**: Custom JWT (complex), Clerk (external dependency).

## Decision 2: WhatsApp Templates UI
- **Decision**: Fetch templates from Meta API on-demand and cache in Redis.
- **Rationale**: Allows agents to send the first message (outside 24h window) using approved templates. We need a UI modal to fill template variables before sending.
- **Task**: Research `GET /{whatsapp-business-account-id}/message_templates`.

## Decision 3: Advanced Media & Interactive Messages
- **Decision**: Support Button/List messages via specifically formatted JSON button components in `ChatInput`.
- **Rationale**: Essential for professional workflows (e.g., "Confirm Order", "Support Menu").
- **Task**: Implement message type handlers in `backend/src/services/whatsapp.ts`.

## Decision 4: Analytics & Visualizations
- **Decision**: Use **Tremor** or **Recharts** for the analytics dashboard.
- **Rationale**: Tremor is built on Tailwind and provides a very "Premium/Modern" look out of the box.
- **Metrics**: Message count, Active conversations, Average Response Time (ART).

## Decision 5: AI Auto-Reply (Agent Assist)
- **Decision**: Integrate **Gemini 1.5 Flash** for "Suggested Replies".
- **Rationale**: Fast, cheap, and allows the agent to "one-click" a draft reply based on conversation history.
- **Task**: Create an `ai_service` in the backend.

## Decision 6: Testing Strategy
- **Decision**: Use **Jest** for backend/logic tests and **Playwright** for the chat UI flow.
- **Rationale**: Industry standard for Next.js full-stack apps.
