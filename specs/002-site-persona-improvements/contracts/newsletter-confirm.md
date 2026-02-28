# Contract: Newsletter Confirm

**Endpoint**: `GET /api/newsletter-confirm`  
**Handler**: `functions/api/newsletter-confirm.ts`  
**Pattern**: Stateless HMAC token verification + Resend contact creation

## Request

```
GET /api/newsletter-confirm?email=reader%40example.com&ts=1709078400&sig=abc123...
```

### Query Parameters

| Param | Type   | Required | Description                                   |
|-------|--------|----------|-----------------------------------------------|
| email | string | Yes      | URL-encoded subscriber email                  |
| ts    | string | Yes      | Unix timestamp of token creation              |
| sig   | string | Yes      | HMAC-SHA256 signature                         |

## Responses

### 302 Found — Subscription confirmed

```
Location: /newsletter-confirmed
```

Redirects to static success page after successfully adding contact to Resend.

### 400 Bad Request — Missing or invalid parameters

```
Content-Type: text/html

<html><body><p>Invalid confirmation link. Please try subscribing again.</p></body></html>
```

### 400 Bad Request — Expired token (>24 hours)

```
Content-Type: text/html

<html><body><p>This confirmation link has expired. Please subscribe again.</p></body></html>
```

### 400 Bad Request — Invalid signature

```
Content-Type: text/html

<html><body><p>Invalid confirmation link. Please try subscribing again.</p></body></html>
```

### 500 Internal Server Error — Resend API failure

```
Content-Type: text/html

<html><body><p>Something went wrong. Please try again later.</p></body></html>
```

## Server-Side Flow

1. Extract `email`, `ts`, `sig` from query parameters
2. Validate all three are present and non-empty
3. Check token expiry: `Date.now() / 1000 - parseInt(ts) < 86400` (24h)
4. Recompute HMAC: `expected = HMAC-SHA256(NEWSLETTER_SECRET, email + "|" + ts)`
5. Compare `sig` with `expected` using timing-safe comparison
6. On match: call Resend `POST /contacts` with `{ email, segments: [RESEND_SEGMENT_ID] }`
7. Redirect to `/newsletter-confirmed`

## Notes

- Responses are HTML (not JSON) because this endpoint is hit by clicking a link in an email, not by JavaScript fetch
- The same confirmation link can be clicked multiple times safely — Resend upserts contacts by email
- Timing-safe comparison is used for signature verification to prevent timing attacks
