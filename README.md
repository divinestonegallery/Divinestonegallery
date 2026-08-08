# Divine Stone Gallery

Provider-neutral full-stack Next.js storefront and operations system for ready-made marble moortis and custom commissions. The public website, customer accounts, staff console and `/api/v1` backend deploy together from one Git repository to Vercel or AWS.

## Stack

- Next.js 16 and React 19 on the Node.js runtime
- PostgreSQL with Drizzle ORM and reviewed SQL migrations
- Private S3-compatible object storage for product and commission media
- Clerk authentication
- Razorpay, Shiprocket, Resend, MSG91 and Meta WhatsApp integrations
- Vercel Cron or AWS EventBridge for retried notification delivery

## Local development

Requires Node.js `>=22.13.0` and PostgreSQL.

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. The frontend and API run in the same Next.js application. Use local/test provider credentials in `.env.local`; never commit that file or place secrets in `NEXT_PUBLIC_` variables.

## Database

`db/schema.ts` is canonical and PostgreSQL migrations live in `drizzle/`.

```bash
npm run db:generate
npm run db:migrate
```

The first migration creates all 34 tables and constraints. The second idempotently seeds the nine launch catalogue products.

## Release verification

Set `DEPLOYMENT_TARGET=vercel` or `DEPLOYMENT_TARGET=aws`, complete `.env.local`, then run:

```bash
npm run deploy:check
npm run release:verify
```

The readiness gate blocks incomplete legal identity, PostgreSQL, S3, authentication, payment, shipping or messaging configuration. The full release command then builds Next.js, starts the production server, tests all routes and providers, and runs lint.

## Deployment

- Vercel detects Next.js and uses `vercel.json` for the notification schedule.
- AWS can run the included production `Dockerfile` on ECS, App Runner or another container service.
- Both targets use `DATABASE_URL` and the same S3-compatible storage interface.
- Configure the Clerk and Razorpay webhook URLs after the final domain is connected.

See the [deployment runbook](docs/deployment.md), [architecture](docs/architecture.md) and [launch checklist](docs/launch-readiness.md).
