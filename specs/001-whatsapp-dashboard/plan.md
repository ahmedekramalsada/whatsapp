# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The goal is to evolve the current WhatsApp dashboard from a basic messaging tool into a professional-grade, "best-in-class" communication hub. This involves adding enterprise features like authentication, template management, advanced analytics, and AI-assisted responses, while maintaining the "Premium Aesthetics" defined in the Constitution.

## Technical Context

**Language/Version**: Node.js 20, TypeScript 5, Next.js 14+ (App Router)
**Primary Dependencies**: Prisma, Socket.io, BullMQ, Tailwind CSS, Shadcn UI
**Storage**: PostgreSQL (Messages, Users, Conversations), Redis (Queues)
**Testing**: NEEDS CLARIFICATION (Plan to add Jest/Playwright)
**Target Platform**: Linux/Docker (Deployable to K3s)
**Project Type**: Web Application (Monorepo-style with Docker Compose)
**Performance Goals**: Instant Socket.io broadcasts (<50ms), Queue processing < 2s
**Constraints**: 24-hour Meta messaging rule, high webhook volume resilience
**Scale/Scope**: Support for thousands of messages per day across multiple agents

## Constitution Check

*GATE: Must pass before Phase 0 research. Recheck after Phase 1 design.*

- [x] **Principle I (Best Practices)**: Use App Router, Prisma, and BullMQ. (Pass)
- [x] **Principle II (Persistence)**: Decisions documented in `project_notes.md`. (Pass)
- [x] **Principle III (Documentation)**: README to be updated after build. (Pass)
- [x] **Principle IV (Git)**: Workflow includes sync pause. (Pass)
- [x] **Principle V (Aesthetics)**: Shadcn UI and premium design required. (Pass)


## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

## Proposed Implementation Phases

### Phase 1: Interactive Messaging & Templates
- [ ] Implement `GET /api/messages/templates` to fetch approved Meta templates.
- [ ] Add Template selection UI in `ChatInput`.
- [ ] Support "Button" and "List" message types in both backend and frontend.
- [ ] Add read receipts (Webhook `read` status update logic).

### Phase 2: Contact Management & Labels
- [ ] Create `Contact` table and sync existing users.
- [ ] Add "Contact Details" sidebar in the chat window.
- [ ] Implement Contact Search and Labeling (e.g. "VIP", "New Customer").

### Phase 3: Premium Aesthetics & DX
- [ ] Implement "Dark Mode" toggle.
- [ ] Add desktop "Push Notifications" (Service Worker).
- [ ] Integrate **Tremor** dashboard for daily message analytics.

## Verification Plan

### Automated Tests
- `npm run test:backend`: Test Meta API integration mock.
- `npm run test:e2e`: Playwright tests for "New Message -> UI update" flow.

### Manual Verification
- Send a template message to a user after 24h of inactivity.
- Verify status changes (Pending -> Sent -> Read) visually.
- Verify AI suggestions appear correctly in the input field.
