# Razorpay online payments

Step 8 adds Razorpay Standard Checkout while retaining bank transfer and Cash on Delivery.

## Configuration

Set these server-side values:

- `RAZORPAY_KEY_ID`: begin with a Razorpay Test Mode key ID.
- `RAZORPAY_KEY_SECRET`: matching Test Mode key secret. Never expose it to the browser.
- `RAZORPAY_WEBHOOK_SECRET`: a separate secret chosen when the webhook is created in Razorpay.

Configure the Razorpay webhook endpoint as:

`https://divinestonegallery.com/api/v1/webhooks/payments/razorpay`

Subscribe to `payment.authorized`, `payment.captured`, `payment.failed`, and `order.paid`. Use the Test Mode webhook and keys until the full payment and refund runbook has been approved.

## Payment flow

1. The server revalidates stock, GST, automatic shipping and the final total.
2. It creates a Razorpay Order for the exact total in integer paise.
3. The gallery order, item snapshots, stock changes, shipment selection and provider order reference are committed together in D1.
4. The browser opens Razorpay Checkout using only the public Key ID and the provider order reference.
5. The authenticated confirmation endpoint verifies the HMAC signature using the server-stored provider order reference, fetches the payment directly from Razorpay, and checks order ID, amount, currency and capture status.
6. Signed webhooks provide the asynchronous source of truth. The raw body is verified before JSON parsing, and `x-razorpay-event-id` prevents duplicate processing.

Captured payments mark the order paid and queue email, SMS and WhatsApp notifications. Failed payments do not automatically release stock; staff must review or cancel the order so inventory is never restored twice.

## Operational notes

- A dismissed checkout reuses the same local order and Razorpay Order through the existing idempotency key.
- Online payment stays unavailable when Razorpay credentials are absent.
- Keep automatic capture enabled in Razorpay. An `authorized` payment remains pending until capture is confirmed.
- Never fulfill from the browser callback alone.
- Before live mode, perform a successful Test Mode payment, a failed payment, a dismissed-and-retried payment, a duplicate webhook replay and a webhook delivered before the browser callback.
