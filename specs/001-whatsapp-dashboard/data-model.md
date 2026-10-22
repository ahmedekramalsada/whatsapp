# Data Model: Premium WhatsApp Dashboard

## New Entities

### User (Existing, but adding Auth)
- `email`: String (Unique)
- `image`: String (Profile pic)
- `role`: Enum (ADMIN, AGENT)

### Contact [NEW]
- `id`: UUID (PK)
- `phone_number`: String (Unique)
- `name`: String
- `labels`: String[] (e.g., "VIP", "Lead")
- `notes`: Text
- `created_at`: DateTime

### Message (Updating)
- `status`: Enum (PENDING, SENT, DELIVERED, READ, FAILED)
- `type`: Enum (TEXT, IMAGE, DOCUMENT, AUDIO, VIDEO, BUTTON_RESPONSE, LIST_RESPONSE, TEMPLATE)
- `template_name`: String (Nullable)
- `metadata`: JSON (For buttons/interactive info)

### AutomationRule [NEW]
- `id`: UUID (PK)
- `name`: String
- `trigger`: String (e.g., "KEYWORD")
- `action`: String (e.g., "AUTO_REPLY", "ASSIGN_TAG")
- `enabled`: Boolean

## Relationships
- `User` 1:N `Conversation` (Assignment)
- `Contact` 1:1 `Conversation` (The user we are chatting with)
- `Conversation` 1:N `Message`
