# Divine Stone Gallery — API Contract Outline

All production endpoints are server routes under `/api/v1`. JSON error responses use a stable shape:

```json
{
  "error": {
    "code": "STABLE_MACHINE_CODE",
    "message": "Safe user-facing message",
    "requestId": "request-id"
  }
}
```

Write endpoints accept an `Idempotency-Key` header where duplicate submission could create money, inventory or messaging side effects.

## Public catalog

- `GET /products` — filter by category, deity, size, availability and sales mode.
- `GET /products/:slug` — product, active variants, media and approved reviews.
- `GET /media/:id` — stream an approved public product image from R2.
- `GET /categories`
- `GET /deities`
- `POST /shipping/rates` — authenticated Shiprocket surface rates from the exact cart, pickup/delivery postcodes, payment mode and each work's packed dimensions, weight and value. Successful options are stored as 30-minute D1 quotes.

## Authentication and account

- `GET /sign-in/*` — Clerk-hosted sign-in flow inside the gallery website.
- `GET /sign-up/*` — Clerk-hosted registration flow inside the gallery website.
- `POST /auth/sync` — verify the Clerk session and prepare the D1 customer record.
- `GET /me`
- `PATCH /me` — currently updates the optional transactional WhatsApp preference and writes an auditable consent event.
- `GET|POST /me/addresses`
- `PATCH|DELETE /me/addresses/:id`

Clerk handles phone OTP, email/password, Google OAuth, reset flows and logout. Gallery APIs verify the signed Clerk token server-side and never accept a user ID supplied by the browser.

## Wishlist and cart

- `GET /me/collections` — return the account's wishlist and enquiry-bag product IDs.
- `POST /me/collections/migrate` — idempotently merge at most 100 device-local product IDs after sign-in.
- `GET|PUT|DELETE /me/wishlist`
- `DELETE /me/wishlist/items/:productId`
- `GET|POST|DELETE /me/cart` — read, add to or clear the quote-intent enquiry bag.
- `DELETE /me/cart/items/:productId`

Wishlist and enquiry-bag endpoints infer ownership exclusively from the verified Clerk token. Product additions are accepted only for active products with an active variant. Device-local collections are retained if migration fails, merged idempotently after sign-in, and cleared from the device only after D1 confirms the merge. D1 is then authoritative, and the client refreshes account collections when the tab becomes active.

## Quotes and checkout

- `POST /quotes`
- `GET /quotes/:quoteNumber`
- `POST /quotes/:quoteNumber/accept`
- `GET /checkout` — server-calculated item, price, GST, dimension, weight, stock and COD readiness.
- `POST /checkout/validate` — compatibility alias for the authenticated shipping-rate and payment-eligibility check.
- `POST /orders` — place an order from a current server-issued shipping quote; requires `Idempotency-Key`.
- `GET /orders` — list only the authenticated customer's orders.
- `GET /orders/:orderNumber` — load an owned order and immutable item snapshots.
- `POST /orders/:orderNumber/bank-transfer-proof`
- `POST /orders/:orderNumber/cancel-request`
- `GET /orders/:orderNumber/invoices`
- `POST /orders/:orderNumber/return-request`

Order creation always recalculates product price, GST and stock on the server, then compares them with an unexpired server-issued shipping quote belonging to the same customer and exact cart fingerprint. The request references IDs, addresses and customer choices; it never supplies authoritative totals. Stock decrements, order/item creation, shipping-quote consumption, payment creation, notification queuing and enquiry-bag clearing run in one D1 batch. The database stock check and unique idempotency index abort the whole batch on a race or repeated conflicting submission.

Bank-transfer, COD and Razorpay online orders are supported by the transaction service. COD additionally requires a Clerk-verified phone, an eligible Shiprocket rate and enters `approval_pending`. Online order creation fails closed with `ONLINE_PROVIDER_REQUIRED` until Razorpay is configured. Final placement accepts only an active quote matching customer, cart fingerprint, destination, payment method, subtotal, GST, chargeable weight and total. Online creation also returns a Razorpay payment session; `POST /api/v1/payments/razorpay/verify` authenticates the customer callback and `POST /api/v1/webhooks/payments/razorpay` consumes signed, idempotent provider events.

## Custom commissions

- `POST /commissions`
- `GET /commissions`
- `GET /commissions/:commissionNumber`
- `POST /commissions/:commissionNumber/media`
- `POST /commissions/:commissionNumber/milestones/:id/approve`
- `POST /commissions/:commissionNumber/milestones/:id/request-changes`

These endpoints are implemented. Commission submissions require an account, reference and milestone media remain private in R2, quotation amounts use integer paise, and milestone decisions are ownership-checked and audited. Staff management is available at `/admin/commissions`.

## Reviews

- `POST /orders/:orderNumber/items/:itemId/review`
- `GET /products/:slug/reviews`

Only the purchaser can review an order item, once. New reviews remain pending until staff approval.

## Staff administration

All `/admin` routes require an active `staff_members` record.

- `GET|POST /admin/products`
- `GET|PATCH /admin/products/:id`
- `POST /admin/products/:id/media`
- `POST /admin/products/:id/variants`
- `PATCH /admin/variants/:id`
- `GET|PATCH /admin/orders/:id`
- `POST /admin/orders/:id/cod-decision`
- `GET|PATCH /admin/quotes/:id`
- `GET|PATCH /admin/commissions/:id`
- `POST /admin/commissions/:id/milestones`
- `POST /admin/commissions/:id/milestones/:milestoneId/submit`
- `GET|POST /admin/shipments`
- `GET|POST /admin/payments/:id/actions`
- `GET|POST /admin/returns/:id/actions`
- `GET /admin/tax-documents/:id`
- `GET|POST /admin/reviews/:id/moderation`
- `GET /admin/audit-logs`
- `GET|POST /admin/notifications` — inspect provider readiness and queue totals, or manually process a bounded batch.

## Internal workers

- `POST /internal/notifications/process` — process a bounded notification batch using the server-only worker bearer secret.

## Provider webhooks

- `POST /webhooks/payments/:provider`
- `POST /webhooks/shipping/:provider`
- `POST /webhooks/messaging/:provider` — planned for provider delivery-receipt reconciliation.

Implemented payment webhook bodies are read raw for signature validation. Their processing is idempotent and acknowledges duplicate valid events without repeating state changes. Messaging delivery receipts remain planned; until then, notification `sent` means the provider accepted the message request, not that the recipient device confirmed delivery.
