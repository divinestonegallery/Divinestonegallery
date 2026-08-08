# Deployment runbook

This project deploys the storefront, customer area, staff area and `/api/v1` backend as one Cloudflare Sites application. Do not deploy the frontend and backend separately.

## 1. Prepare environments

Use three isolated environments where possible:

- local: `.env.local`, local D1 simulation and provider test credentials;
- staging: separate D1/R2 resources and provider test modes;
- production: production D1/R2 resources and live provider credentials.

Copy `.env.example` to `.env.local` for local release validation. Fill the legal business identity, final return/damage windows, provider credentials, approved template identifiers and a random notification-worker secret of at least 32 characters. `.env.local` is ignored by Git and must never be committed.

Store production secrets in the hosting environment, not in source code. Only public configuration, such as the Clerk publishable key and public site origin, may use `NEXT_PUBLIC_` variables.

## 2. Configure hosted resources

The hosting manifest must provide:

- D1 database binding: `DB`
- R2 bucket binding: `MEDIA`

Apply every reviewed SQL migration in `drizzle/` to the target D1 database in journal order before serving the new application build. The Sites packaging workflow includes this directory with the deployment archive. Back up production data before later schema changes and document a restore test.

## 3. Configure provider callbacks

Use `https://divinestonegallery.com` as the final origin and configure:

- Clerk webhook: `https://divinestonegallery.com/api/v1/webhooks/clerk`
- Razorpay webhook: `https://divinestonegallery.com/api/v1/webhooks/payments/razorpay`
- Notification worker: authenticated `POST https://divinestonegallery.com/api/v1/internal/notifications/process`

The notification endpoint is not a public webhook. Invoke it from a scheduled job using `Authorization: Bearer <NOTIFICATION_WORKER_SECRET>`.

Verify the Resend sending domain, create the required MSG91 DLT flows, and obtain approved Meta utility-template identifiers for every name present in both template-map variables. WhatsApp messages are queued only for customers with a verified phone and recorded transactional opt-in.

## 4. Run the fail-closed checks

```bash
npm ci
npm run deploy:check
npm run release:verify
```

The first command installs the locked dependency set. The readiness check validates configuration shape without printing secret values. The release command repeats that gate, builds the production bundle, runs all automated tests and runs lint. Any failure stops the release.

## 5. Connect the domain

Attach `divinestonegallery.com` to the production project, set the DNS records requested by the host, and require HTTPS. Confirm that canonical URLs, `robots.txt` and `sitemap.xml` use the final domain. Keep any staging hostname out of search indexes.

## 6. Production smoke test

Before public traffic, use internal recipients and a low-value controlled catalogue item to verify:

1. account creation and phone/email verification;
2. wishlist, cart and automatic shipping quote;
3. Razorpay test/live transition, bank transfer and staff-approved COD;
4. inventory reservation and duplicate-checkout protection;
5. custom commission quote, advance, milestone and customer approval;
6. email and SMS delivery, plus WhatsApp opt-in, delivery and withdrawal;
7. staff access, notification retries, order history and private media access;
8. mobile checkout, keyboard navigation and customer support links.

Complete every business, compliance, monitoring and recovery item in [launch-readiness.md](launch-readiness.md) before making the site public.
