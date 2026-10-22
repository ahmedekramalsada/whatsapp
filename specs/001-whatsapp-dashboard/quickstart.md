# Quickstart Developer Guide

## Prerequisites
- Docker & Docker Compose
- Node.js v20 (if running locally outside compose)

## Environment Setup
1. Copy `.env.example` to `.env` in both `backend` and `frontend` folders.
2. Fill your local values:
   ```
   # Meta Platform Values
   VERIFY_TOKEN=local_dev_token
   WHATSAPP_TOKEN=your_test_whatsapp_token
   PHONE_NUMBER_ID=your_test_phone_id
   
   # Infrastructure (these match the docker-compose network bindings)
   DB_URL=postgresql://postgres:postgres@postgres:5432/whatsapp
   REDIS_URL=redis://redis:6379
   ```

## Running the Application
The entire application is completely containerized.

```bash
# From the root of the workspace:
docker-compose up -d --build
```

This commands spins up:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API (Express) on port 3000
- Frontend App (Next.js) on port 3001

## Database Operations
Before usage, apply the schema to the database:
```bash
docker-compose exec backend npx prisma db push
# or
docker-compose exec backend npx prisma migrate dev
```

## Testing Webhooks Locally
Because Meta requires a public SSL secured endpoint to send webhooks, you MUST run a tunnel to your local backend container:
```bash
ngrok http 3000
```
Then supply the ngrok URL to your Meta App Dashboard under WhatsApp Configuration -> Webhooks.
