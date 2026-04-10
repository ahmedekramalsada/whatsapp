<!--
Sync Impact Report:
- Version change: Initialized to 1.0.0
- List of modified principles: Added 5 custom principles tailored to the user's global rules and architecture.
- Added sections: Architecture Constraints, DevOps & Environment Requirements
- Removed sections: N/A
- Templates requiring updates (✅): No action needed for internal templates as this is the first initialization.
- Follow-up TODOs: Implement the README.md synchronization as per Principle 3 since we just created the project.
-->

# WhatsApp Chat Dashboard Constitution

## Core Principles

### I. Best Practice Implementations
All code and logic MUST reflect the current industry-standard best practices. The technical foundation relies on modern patterns (e.g., Next.js App Router for frontend, Prisma ORM for database, and robust Redis Queues via BullMQ). Where possible, the underlying architecture SHOULD be refined to perform efficiently at scale.

### II. Persistence of Knowledge
Project context, decisions, and architectural references MUST be recorded in a dedicated project-level memory file (e.g., `project_notes.md`) to maintain persistent context across development sessions and ensure the team remains synchronized.

### III. Continuous Documentation
The `README.md` file MUST be meticulously maintained. After any significant architectural change, new feature addition, or configuration modification, the AI MUST update the README appropriately to reflect the current state of the application.

### IV. Proactive Commits and Git Workflow
After every set of meaningful edits or logical milestone completion, the workflow MUST pause to ask the user to push and sync via git. An appropriate and descriptive git commit message MUST be provided automatically to aid in this process.

### V. Modern, Premium Aesthetics
The application MUST NOT simply be a Minimal Viable Product. User interfaces MUST showcase responsive, state-of-the-art design leveraging technologies like Tailwind CSS and Shadcn UI. Design choices should highlight dynamic visual feedback, robust color themes, and engaging typography.

## Architecture Constraints

1. **Strict 24-Hour Rule Compliance**: The webhook processing pipeline and job queue MUST intelligently restrict normal message payload creation outside of the 24-hour customer engagement window, reverting to WhatsApp template rules.
2. **Event-Driven Resilience**: Features communicating with META Cloud API (message routing, media loading) MUST offload the load through a BullMQ queue to avoid disrupting concurrent operations.
3. **Synchronous Broadcasts**: Real-time Socket.io triggers MUST follow database mutation—ensuring clients never see phantom states.

## DevOps & Environment Requirements

- **Absolute Containerization**: The entire ecosystem (Backend, Frontend, Postgres, Redis) MUST be accessible instantly through an updated `docker-compose.yml` for local development.
- **K3s / Kubernetes Preparation**: Core application layers must maintain environment neutrality. Hardcoded variables or static networking addresses MUST NOT be committed to the code to ensure seamless Kubernetes deployment configurations.
- **Secrets Management**: Configuration settings MUST be securely scoped in environment variables using well-documented `.env.example` templates. 

## Governance

This Constitution establishes the baseline for all AI-assisted changes in the repository. Its rules supersede ad-hoc feature requests where there is a direct conflict in quality or principles.
No amendments to the tech stack (e.g., moving away from Postgres, or abandoning real-time UI requirements), structural workflows, or Git sync requirements can be carried out without explicitly updating this document and receiving user feedback.

**Version**: 1.0.0 | **Ratified**: 2026-04-10 | **Last Amended**: 2026-04-10
