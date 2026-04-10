# WhatsApp Dashboard System – Full Technical Specification

## 1. Objective

Build a full-stack WhatsApp chat dashboard that allows:
- Receiving messages from WhatsApp (via Meta API Webhooks)
- Sending messages to users
- Managing conversations
- Real-time chat interface
- Storing all chat history

## 2. System Architecture

Components:
1. WhatsApp Cloud API (Meta)
2. Backend API Server
3. Database
4. Real-time Server
5. Frontend Dashboard
6. Queue System (for async jobs)

Flow:
- User sends message → WhatsApp → Webhook → Backend
- Backend processes → stores in DB → emits via WebSocket
- Frontend receives → displays instantly
- Agent replies → Frontend → Backend → WhatsApp API

## 3. Tech Stack

Backend: Node.js, Express.js
Frontend: Next.js (or React), Tailwind CSS
Database: PostgreSQL
Real-time: Socket.io
Queue: Redis + BullMQ
DevOps: Docker, Kubernetes (k3s), NGINX Ingress, cert-manager (SSL)

## 4. Backend Requirements

### 4.1 Environment Variables
```
PORT=3000
VERIFY_TOKEN=your_verify_token
WHATSAPP_TOKEN=your_permanent_token
PHONE_NUMBER_ID=your_phone_number_id
DB_URL=postgres_connection_string
REDIS_URL=redis_connection_string
```

### 4.2 API Endpoints

**Webhook Verification**
`GET /webhook`
- Validate: `hub.mode`, `hub.verify_token`
- Return: `hub.challenge` if valid, `403` if invalid

**Webhook Receiver**
`POST /webhook`
- Parse incoming JSON
- Extract: sender phone number, message text, message type (text, image, etc.)
- Actions: Store message in database, Create conversation if not exists, Emit message via WebSocket

**Send Message API**
`POST /messages/send`
Request:
```json
{
  "to": "phone_number",
  "message": "text"
}
```
Actions: Check 24-hour rule, Send via WhatsApp API, Save message in DB (from_me = true)

## 5. Database Schema

- **Users Table**: id (PK), phone_number (unique), name (nullable), created_at
- **Conversations Table**: id (PK), user_id (FK), last_message_at, status (open/closed), created_at
- **Messages Table**: id (PK), conversation_id (FK), from_me (boolean), message_text (text), media_url (nullable), timestamp, status (sent/delivered/read)

## 6. Real-Time System

WebSocket events: `connection`, `new_message`, `message_sent`
Behavior: Emit to all clients on new message. Update UI instantly on send.

## 7. WhatsApp API Integration
Endpoint: `POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages`
Headers: `Authorization: Bearer WHATSAPP_TOKEN`, `Content-Type: application/json`

## 8. 24-Hour Messaging Rule
- If last incoming message < 24 hours: Allow free text messages
- Else: Only allow template messages (Logic: Compare current time with last_message_at)

## 9. Media Handling
When media received: Extract media_id, Call Meta API to get media URL, Download immediately, Store locally/object storage, Save URL in DB.

## 10. Queue System
Purpose: Handle message sending, Retry failed requests, Apply rate limiting
Jobs: `send_message`, `download_media`

## 11. Frontend Requirements
- **Chat List Page**: List all conversations (phone number, last message, timestamp)
- **Chat Window**: Display messages, Input field + send button
- **State Management**: Store conversations, Store active chat, Update in real-time via WebSocket

## 12. DevOps Setup
- Dockerfile for backend & frontend
- Docker Compose: backend, frontend, postgres, redis
- k3s Resources: Deployment (backend), Deployment (frontend), Service, Ingress, cert-manager SSL

## 13. CI/CD Pipeline
1. Build Docker images 2. Push to Docker Hub 3. Deploy to k3s cluster

## 14. Security
HTTPS only, env variables for secrets, validate webhook requests, API rate limiting.

## 15. Logging & Monitoring
Centralized logs, Prometheus Metrics, Grafana Dashboard.

## 16. Optional Enhancements
Message status tracking, Multi-agent, Chat tagging, AI auto-reply, Notifications.

## 17. Delivery Requirements
Dockerized, run locally via Compose, deployable to Kubernetes, real-time messaging, persist chat history, support WhatsApp Cloud API.
