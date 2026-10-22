# Task List: WhatsApp Dashboard v2 Enhancements

## Implementation Strategy
We will implement the enhanced features using an **Optimistic & Incremental** approach. Phase 1 focuses on professional-grade messaging (Templates & Interactive messages), Phase 2 builds the CRM-lite features (Contacts), and Phase 3 polishes the UI with Analytics and UX.

## Dependencies
- US1 (Templates) MUST be completed first to enable P2P messaging outside the 24h window.
- US2 (Contacts) depends on US1 message history to populate user data.
- US3 (Aesthetics) is cross-cutting but depends on US1/US2 data for analytics.

---

## Phase 1: Setup & Foundational
- [ ] T001 Update `prisma/schema.prisma` with new `Contact` model and `Message` type enums
- [ ] T002 [P] Sync Prisma client: `docker-compose exec backend npx prisma generate`
- [ ] T003 Execute migration: `docker-compose exec backend npx prisma db push`
- [ ] T004 Install new frontend dependencies: `lucide-react`, `tremor` (or charts lib)

## Phase 2: User Story 1 - Interactive Messaging & Templates [US1]
**Goal**: Allow sending approved templates and interactive buttons.
- [ ] T005 [P] [US1] Create template fetcher service in `backend/src/services/templates.ts`
- [ ] T006 [US1] Implement `GET /api/messages/templates` endpoint in `backend/src/api/messages.ts`
- [ ] T007 [P] [US1] Create `TemplateSelector` component in `frontend/src/components/chat/TemplateSelector.tsx`
- [ ] T008 [US1] Add Template selection logic to `ChatInput.tsx`
- [ ] T009 [US1] Implement `POST /api/messages/templates/send` to handle template payloads in `backend/src/api/messages.ts`
- [ ] T010 [US1] Update `ChatWindow.tsx` to render "Interactive" message types (Buttons/Lists)
- [ ] T011 [US1] Implement read-receipt webhook logic in `backend/src/api/webhooks.ts`

## Phase 3: User Story 2 - Contact Management [US2]
**Goal**: Save contacts and manage customer data.
- [ ] T012 [P] [US2] Create contact management API in `backend/src/api/contacts.ts`
- [ ] T013 [US2] Implement `ContactSidebar` component for chat window in `frontend/src/components/chat/ContactSidebar.tsx`
- [ ] T014 [US2] Add "Save Contact" and "Edit Labels" logic to the UI
- [ ] T015 [US2] [P] Implement contact search bar in `ChatList.tsx`

## Phase 4: User Story 3 - Premium Aesthetics & Analytics [US3]
**Goal**: Professional UI with dark mode and analytics.
- [ ] T016 [P] [US3] Create `Analytics` view using Tremor in `frontend/src/app/analytics/page.tsx`
- [ ] T017 [US3] Implement `GET /api/analytics` endpoint in `backend/src/api/messages.ts` (aggregating data)
- [ ] T018 [US3] [P] Implement "Dark Mode" theme toggle in `frontend/src/app/layout.tsx`
- [ ] T019 [US3] Add basic "Push Notification" support via browser API in `frontend/src/lib/notifications.ts`

## Phase 5: Polish & Deployment
- [ ] T020 [P] Update `README.md` with new features and environment variables
- [ ] T021 Final verification of 24-hour rule vs Templates with real numbers
- [ ] T022 Clean up debug logs and prepare for Git push
