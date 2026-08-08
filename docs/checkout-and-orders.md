# Checkout and Orders

## Current scope

Step 6 added the secure transaction boundary. Step 7 now connects live Shiprocket surface rates and short-lived PostgreSQL shipping quotes. The application still deliberately refuses to invent shipping prices or silently choose an online payment gateway.

The nine seeded products still have unknown commercial data. Staff must enter price before GST, GST rate, packed weight, packed length, packed width, packed height and available stock in `/admin/products`. Until every selected variant is complete, checkout identifies the exact missing fields and cannot request a live rate or place an order.

## Trusted calculations

The server loads active cart rows and current product variants from PostgreSQL. It rejects inactive, made-to-order, quote-only, incomplete or out-of-stock variants. Subtotal and GST are calculated in integer paise. Cart fingerprints include variant, quantity, commercial fields, dimensions, weight and variant update time so a changed product invalidates an older shipping quote.

The browser supplies only the selected payment method, shipping-quote ID, delivery/billing addresses and an optional note. It never supplies trusted price, GST, shipping or total values.

## Order placement

`POST /api/v1/orders` requires a unique `Idempotency-Key`. The key is stored with a hash of normalized checkout input:

- retrying the identical request returns the original order;
- reusing the key for different input returns `IDEMPOTENCY_CONFLICT`;
- concurrent duplicates are stopped by a unique PostgreSQL index;
- failed batches do not leave an order, payment or stock mutation behind.

A valid order also requires an active, unexpired shipping quote owned by the customer. The quote must match destination postcode, cart fingerprint, subtotal, GST, chargeable weight and final total. The quote is consumed within the same PostgreSQL batch as:

1. order and immutable item snapshots;
2. stock decrement;
3. converted unique-piece reservation records;
4. pending payment record;
5. immediate email, SMS and WhatsApp notification jobs for available verified contact channels;
6. enquiry-bag clearing.

The existing non-negative stock database constraint aborts the entire batch if concurrent orders would make stock negative.

## Payment behavior

- Bank transfer creates a placed order with a pending manual payment.
- Cash on Delivery requires a verified account phone and an eligible variant, then creates an `approval_pending` order for staff review.
- Online payment returns `ONLINE_PROVIDER_REQUIRED` until Razorpay Test Mode credentials are configured. Once configured, the server creates an exact-amount Razorpay Order, verifies the checkout signature and fetched payment, and processes raw-body signed webhooks idempotently.

## Shipping quotes

Each sculpture unit is treated as an individually protected package. Shiprocket receives only the fields needed for serviceability and rating: origin and destination postcode, surface mode, COD/prepaid choice, weight, packed dimensions and declared value. Common couriers are presented cheapest first; if no common service exists, the engine can compose a protected multi-parcel option from the cheapest serviceable courier per parcel. If any parcel has no suitable service, checkout returns a manual protected-freight path instead of a false price.

Every displayed option is stored in PostgreSQL for 30 minutes with its cart fingerprint, payment method, rate snapshot and per-package details. Selecting it does not reserve stock. The order transaction revalidates it before consuming it.
