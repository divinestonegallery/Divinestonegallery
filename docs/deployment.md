# Deployment runbook

The same GitHub repository contains two deployable applications. The storefront, account area and staff console use `apps/frontend`; `/api/v1`, database access and provider integrations use `apps/backend`.

This branch currently validates the separation locally. Do not change the live projects until both new deployment projects have been configured and tested as a preview.

## Shared infrastructure

Create isolated local, staging and production resources:

- PostgreSQL database with a pooled `DATABASE_URL` for serverless deployments;
- ImageKit or a private S3-compatible bucket for uploaded product and commission media;
- separate test/live credentials for Clerk, Razorpay, Shiprocket and messaging providers.

Copy `.env.example` to `.env.local`. Never commit `.env.local` or production secrets. On Vercel, use encrypted ImageKit variables; on AWS, an S3 IAM role remains available as a fallback.

Apply migrations before routing production traffic:

```bash
npm ci
npm run db:migrate
npm run release:verify
```

## Vercel

1. Import the same private GitHub repository as a **backend** project and set its Root Directory to `apps/backend`.
2. Add PostgreSQL, Clerk server, ImageKit, Razorpay, Shiprocket and messaging variables to the backend project. Set `FRONTEND_URL` to the frontend preview or production origin.
3. Import the repository again as a **frontend** project and set its Root Directory to `apps/frontend`.
4. Add `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `BACKEND_API_URL` to the frontend project. `BACKEND_API_URL` must be the backend project origin.
5. Add `CRON_SECRET` with at least 32 random characters to the backend. `apps/backend/vercel.json` invokes the protected notification worker once daily on Vercel Hobby.
6. Deploy both as previews. Verify the backend health route, then the frontend pages, authentication and `/api/v1` proxy before changing production domains.

## AWS

1. Create separate frontend and backend container images from their workspace builds. The previous single-application root `Dockerfile` must not be used for the separated architecture.
2. Use PostgreSQL through RDS/Aurora or another reachable PostgreSQL provider. Use connection pooling or RDS Proxy for serverless traffic.
3. Attach an IAM role limited to the application’s private S3 bucket, or set restricted S3 credentials.
4. Schedule an EventBridge API Destination to call `GET /api/v1/internal/notifications/process` with `Authorization: Bearer <NOTIFICATION_WORKER_SECRET>` every five minutes.
5. Store all secrets in AWS Secrets Manager or the selected container service and expose only the required runtime variables.

## Provider callbacks

After connecting `https://divinestonegallery.com`, configure:

- Clerk: `https://divinestonegallery.com/api/v1/webhooks/clerk`
- Razorpay: `https://divinestonegallery.com/api/v1/webhooks/payments/razorpay`
- Notification worker: authenticated `GET` or `POST https://divinestonegallery.com/api/v1/internal/notifications/process`

Verify the Resend domain, MSG91 DLT flows and Meta utility templates before enabling delivery. WhatsApp is queued only for a verified phone with recorded transactional opt-in.

## Production smoke test

Before public traffic, verify account creation, wishlist/cart migration, automatic Shiprocket rates, Razorpay, bank transfer, staff-approved COD, stock idempotency, custom commissions, private media, all notification channels, mobile checkout and keyboard navigation. Complete [launch-readiness.md](launch-readiness.md) before opening public access.
