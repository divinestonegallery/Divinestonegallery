# Divine Stone Gallery

One Git repository containing two independently buildable Next.js applications:

- `apps/frontend` — public storefront, customer account pages and staff admin UI.
- `apps/backend` — versioned `/api/v1` routes, authorization and business workflows.
- `packages/database` — PostgreSQL connection, Drizzle schema and reviewed migrations.
- `packages/shared` — framework-independent types and safe fallback catalogue data.

The browser always calls `/api/v1`. During local development the frontend proxies that path to the backend at `http://127.0.0.1:3001`, so Clerk cookies and existing frontend requests continue to work without cross-origin browser code.

## Technology

- Next.js 16 and React 19
- PostgreSQL with Drizzle ORM
- Clerk authentication and backend authorization
- ImageKit or S3-compatible media storage
- Razorpay, Shiprocket, Resend, MSG91 and Meta WhatsApp integrations

## Local development

Requires Node.js `>=22.13.0` and PostgreSQL.

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Open:

- Frontend: `http://127.0.0.1:3000`
- Backend health: `http://127.0.0.1:3001/api/health`
- Backend API: `http://127.0.0.1:3001/api/v1`

`npm run dev` starts both applications and loads the root `.env.local`. Use `npm run dev:frontend` or `npm run dev:backend` only when deliberately working on one service and supplying its environment separately.

## Useful commands

```bash
npm run typecheck       # Type-check every workspace
npm run check:boundaries # Prevent frontend/backend dependency leaks
npm run build           # Build backend, then frontend
npm test                # Build and run unit + end-to-end tests
npm run lint            # Lint apps, packages, scripts and tests
npm run db:generate     # Generate a reviewed Drizzle migration
npm run db:migrate      # Apply pending PostgreSQL migrations
```

## Code ownership rules

- Frontend files must not import backend modules or database code.
- Backend files must not import React UI, frontend components or frontend assets.
- Cross-application data shapes belong in `packages/shared`.
- All database access goes through `packages/database` and backend repositories.
- Frontend server components read backend data through `apps/frontend/src/server/backend-api-client.ts`.
- Browser components keep using relative `/api/v1/...` URLs, which the frontend proxy forwards.

See [project structure](docs/project-structure.md), [architecture](docs/architecture.md), [API contract](docs/api-contract.md) and [deployment runbook](docs/deployment.md).
