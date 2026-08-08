# Deployment runbook

The storefront, account area, staff console and `/api/v1` backend deploy together as one standard Next.js application. The same GitHub repository can target Vercel or AWS.

## Shared infrastructure

Create isolated local, staging and production resources:

- PostgreSQL database with a pooled `DATABASE_URL` for serverless deployments;
- private S3-compatible bucket for uploaded product and commission media;
- separate test/live credentials for Clerk, Razorpay, Shiprocket and messaging providers.

Copy `.env.example` to `.env.local`. Never commit `.env.local` or production secrets. On AWS, prefer an IAM role and set `S3_USE_IAM_ROLE=true`; on Vercel, provide restricted S3 credentials through encrypted project environment variables.

Apply migrations before routing production traffic:

```bash
npm ci
npm run db:migrate
npm run release:verify
```

## Vercel

1. Import the private GitHub repository into Vercel.
2. Connect a managed PostgreSQL database and add its pooled `DATABASE_URL`.
3. Add the private S3 bucket variables from `.env.example`.
4. Add `CRON_SECRET` with at least 32 random characters. `vercel.json` invokes the protected notification worker every five minutes.
5. Add all business and provider environment variables to Preview and Production separately.
6. Deploy a preview, run the smoke tests, then promote the validated build.

## AWS

1. Build the included `Dockerfile`, publish the image to Amazon ECR and run it through ECS/Fargate, App Runner or another AWS container service.
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
