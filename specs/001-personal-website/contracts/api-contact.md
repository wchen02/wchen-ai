# Contact Form API Contract

## Overview

The personal website relies on a single external API endpoint built as a Cloudflare Pages Function. This API receives contact form submissions from the frontend, validates them (including a honeypot field), applies rate limiting, and forwards the payload to an external webhook/email service.

## Endpoint

**POST** `/api/contact`

## Request

**Content-Type**: `application/json`

### Body Schema

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `name` | `string` | Yes | The sender's name | Min 1 character |
| `email` | `string` | Yes | The sender's email address | Must be a valid email format |
| `message` | `string` | Yes | The body of the message | Min 10 characters |
| `_honey` | `string` | Yes | Honeypot field to catch bots | **Must be an empty string** (`""`) |

### Example Request

```json
{
  "name": "Jane Founder",
  "email": "jane@example.com",
  "message": "I saw your latest project on agents and would love to collaborate.",
  "_honey": ""
}
```

## Response

### Success Response

**Status**: `200 OK`

```json
{
  "success": true,
  "message": "Thanks for reaching out! I'll get back to you soon."
}
```

### Error Responses

#### 1. Validation Error (e.g., missing required fields, invalid email)

**Status**: `400 Bad Request`

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

#### 2. Bot Detected (Honeypot field was filled out)

**Status**: `400 Bad Request` (or intentionally `200 OK` to trick bots)

```json
{
  "success": false,
  "error": "Invalid submission"
}
```

#### 3. Rate Limit Exceeded

**Status**: `429 Too Many Requests`

```json
{
  "success": false,
  "error": "Too many requests. Please try again later."
}
```

#### 4. Server Error (Failed to forward email)

**Status**: `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Failed to send message. Please try again later."
}
```

## Security & Implementation Notes

1. **No PII Storage**: The Cloudflare Worker MUST NOT store the `name`, `email`, or `message` payloads in KV, D1, or logs. It must act strictly as a proxy/forwarder.
2. **Rate Limiting**: Implementation should utilize Cloudflare's standard rate-limiting features or a lightweight IP-based blocklist in KV to prevent spam floods.
3. **CORS**: Ensure the endpoint only accepts `POST` requests originating from the website's domain (`wchen.ai`).