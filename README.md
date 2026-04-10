# WhatsApp Management Platform v2 (Professional)

A high-performance, professional-grade WhatsApp chat dashboard designed for teams. Built on top of Meta's Cloud API, this platform provides real-time engagement, customer relationship management (CRM), and deep performance analytics.

## 🌟 Premium Features
- **Professional CRM-lite**: Track customer names, labels, and internal team notes in a persistent sidebar.
- **Advanced Messaging**: Full support for Meta Message Templates (bypassing the 24h window) and interactive media (Images, Video, Documents).
- **Real-time Analytics**: Beautiful data visualization using Tremor, tracking delivery success rates and messaging volume trends.
- **WhatsApp UI Experience**: Native-feeling chat window with high-fidelity status indicators (Sent, Delivered, Read receipts).
- **Dark Mode First**: Premium aesthetic with full light/dark mode support and smooth transitions.
- **Optimistic UI**: Messages appear instantly in the dashboard with real-time status updates via WebSockets.

## 🛠 Technology Stack
- **Backend:** Node.js 20, Express, Prisma (PostgreSQL), Socket.IO, BullMQ (Redis).
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Tremor Charts, Lucide Icons.
- **Infrastructure:** Docker Compose, Nginx Ingress ready.

## 🚀 Quick Start
1. **Environment Config**: Populate `.env` with your Meta credentials (`WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`, `WABA_ID`).
2. **Launch Services**:
   ```bash
   docker-compose up -d --build
   ```
3. **Database Sync**:
   ```bash
   docker-compose exec backend npx prisma db push
   ```

## 📈 Roadmap & Development
- [x] Phase 1: Real-time Webhook Ingestion & Persistence.
- [x] Phase 2: Interactive Templates & Media Support.
- [x] Phase 3: CRM-lite (Contacts & Labels).
- [x] Phase 4: Analytics & UX Polish.
- [ ] Phase 5: Auth & Multi-agent support (Upcoming).

---
> *Developed with excellence, adhering to the project's Core Principles and Constitution.*
