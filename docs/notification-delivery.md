# Transactional notification delivery

Step 10 delivers queued order and custom-commission updates through Resend email, MSG91 SMS and the official Meta WhatsApp Cloud API. It remains inactive when provider credentials are blank, so local development cannot accidentally contact customers.

Messages are queued only for contacts whose email address or phone number is verified on the customer's account. WhatsApp additionally requires the customer to enable optional transactional updates from the account page. Every grant and withdrawal is stored as a durable consent event; a verified phone number alone never queues WhatsApp.

## Provider setup

### Resend email

1. Verify `divinestonegallery.com` in Resend and add the requested DNS records.
2. Create a sending-only API key and set `RESEND_API_KEY`.
3. Set `RESEND_FROM_EMAIL` to an address on the verified domain. `RESEND_REPLY_TO` may remain the gallery Gmail address.

Each notification ID is sent as Resend's idempotency key. A retry of the same accepted request therefore does not create another email within Resend's idempotency window.

### MSG91 SMS for India

1. Complete the business and DLT registration required for Indian transactional SMS.
2. Approve the sender ID and one MSG91 Flow for each notification template key in `.env.example`.
3. Each Flow must expose variables named `REFERENCE`, `STATUS`, `AMOUNT` and `LINK`.
4. Put the approved Flow template IDs in `MSG91_SMS_TEMPLATE_MAP_JSON` and set the auth key and sender ID.

### Meta WhatsApp Cloud API

1. Configure Meta Business, a WhatsApp Business Account and the gallery phone number.
2. Create one approved utility template per notification template key.
3. Every template body must contain four positional text variables in this order: reference, status, amount and secure account link.
4. Set the access token, phone-number ID, current Graph API version, language and template-name map.

Use a supported explicit Graph version such as `vNN.N`; the application intentionally has no stale hard-coded default.

## Queue behaviour

- Order and commission transactions only enqueue messages. External provider calls happen after the database transaction succeeds.
- A worker atomically claims at most a bounded batch. A five-minute lease lets another run recover work interrupted during processing.
- Failed requests retry with exponential backoff for at most five attempts, capped at six hours between attempts.
- `sent` means the provider accepted the request and returned a provider message ID. It does not yet mean delivery to the recipient device; signed delivery-receipt webhooks are a later enhancement.
- Resend adds provider-level idempotency. The local atomic claim prevents concurrent duplicate SMS and WhatsApp sends, but a network failure after those providers accept a request can still cause an at-least-once retry.

## Running the worker

Staff can inspect provider readiness, queue totals and manually process a batch at `/admin/notifications`.

For scheduled processing, set a high-entropy `NOTIFICATION_WORKER_SECRET` and invoke:

```text
POST /api/v1/internal/notifications/process
Authorization: Bearer <NOTIFICATION_WORKER_SECRET>
```

Configure a scheduler only after deployment and only after all required templates have been approved. Never put provider credentials or the worker secret in browser-exposed environment variables.
