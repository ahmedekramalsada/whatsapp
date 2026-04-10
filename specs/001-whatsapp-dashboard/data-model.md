# Phase 1: Data Model

## PostgreSQL (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DB_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String         @id @default(uuid())
  phone_number String         @unique
  name         String?
  created_at   DateTime       @default(now())
  
  conversations Conversation[]
}

model Conversation {
  id              String    @id @default(uuid())
  user_id         String
  last_message_at DateTime
  status          String    @default("open") // "open", "closed"
  created_at      DateTime  @default(now())
  
  user            User      @relation(fields: [user_id], references: [id])
  messages        Message[]
}

model Message {
  id               String       @id @default(uuid())
  conversation_id  String
  from_me          Boolean      @default(false)
  message_text     String?
  media_url        String?
  timestamp        DateTime     @default(now())
  status           String       @default("sent") // "sent", "delivered", "read"
  
  conversation     Conversation @relation(fields: [conversation_id], references: [id])
}
```

## Validation Rules
- `phone_number` must be uniquely constrained to prevent duplicate User entries when a single number contacts the webhook multiple times.
- If `media_url` is null, it signifies a standard text message. If it is populated, `message_text` may be null (an image without caption) or populated (an image with caption).
- `last_message_at` inside `Conversation` dictates the 24-hour enforcement window.
