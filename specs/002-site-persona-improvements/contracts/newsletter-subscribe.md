# Contract: Newsletter Subscribe

**Endpoint**: `POST /api/newsletter`  
**Handler**: `functions/api/newsletter.ts`  
**Pattern**: Same as existing `functions/api/contact.ts`

## Request

```
POST /api/newsletter
Content-Type: application/json
Origin: https://wchen.ai
```

### Body

```json
{
  "email": "reader@example.com",
  "_honey": ""
}
```

### Validation (Zod — `shared/newsletter.ts`)

| Field  | Type   | Rules                       |
|--------|--------|-----------------------------|
| email  | string | Required, valid email format |
| _honey | string | Must be empty (honeypot)    |

## Responses

### 200 OK — Confirmation email sent

```json
{
  "success": true,
  "message": "Check your email to confirm your subscription."
}
```

Note: Same response is returned whether the email is new or already subscribed (to avoid email enumeration).

### 400 Bad Request — Validation failed

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [{ "field": "email", "message": "Invalid email address" }]
}
```

### 400 Bad Request — Honeypot triggered

```json
{
  "success": false,
  "error": "Invalid submission"
}
```

### 403 Forbidden — CORS origin not allowed

```json
{
  "success": false,
  "error": "Forbidden"
}
```

### 500 Internal Server Error — Resend API failure

```json
{
  "success": false,
  "error": "Failed to process subscription. Please try again later."
}
```

## CORS

Same pattern as `/api/contact`:
- Allowed origins: `https://wchen.ai`, `https://www.wchen.ai`, `http://localhost:*`
- Methods: `POST, OPTIONS`
- Headers: `Content-Type`

## Server-Side Flow

1. Validate request body against `NewsletterPayloadSchema`
2. Check honeypot field
3. Generate HMAC token: `sig = HMAC-SHA256(NEWSLETTER_SECRET, email + "|" + timestamp)`
4. Send confirmation email via Resend `POST /emails` with confirmation link
5. Return 200 with neutral message (regardless of whether email already exists)

## Environment Variables

| Variable           | Required | Description                          |
|--------------------|----------|--------------------------------------|
| RESEND_API_KEY     | Yes      | Resend API key (starts with `re_`)   |
| RESEND_SEGMENT_ID  | Yes      | Resend segment ID for newsletter     |
| NEWSLETTER_SECRET  | Yes      | 32+ char secret for HMAC signing     |
| NEWSLETTER_FROM    | No       | From address (default: `Wilson Chen <newsletter@wchen.ai>`) |
