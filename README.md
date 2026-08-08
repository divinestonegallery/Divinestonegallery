# Divine Stone Gallery

India-first full-stack storefront and operations system for ready-made marble moortis and custom commissions. The public website, customer accounts, staff console and `/api/v1` backend are deployed together as one Vinext application on Cloudflare Sites.

## Included

- Public catalogue, product pages, wishlist, enquiry bag and checkout
- Clerk accounts with customer/staff authorization
- Ready-made orders with GST, shipping, COD, bank transfer and Razorpay
- Shiprocket postcode/parcel rate calculation
- Custom commission quotes, milestones, media and approvals
- Transactional email, SMS and consent-gated WhatsApp delivery
- Staff catalogue, order, commission and notification workflows
- Cloudflare D1 data and R2 media bindings

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The frontend and backend run in the same process; API routes are available under `http://localhost:3000/api/v1`.

Use development/test credentials in `.env.local`. Never commit that file or put secret values in variables beginning with `NEXT_PUBLIC_`.

## Database changes

`db/schema.ts` is the canonical schema and reviewed migrations live in `drizzle/`.

```bash
npm run db:generate
```

The hosting project supplies the D1 binding as `DB` and the R2 binding as `MEDIA`, as declared in `.openai/hosting.json`.

## Release verification

Fill every required production setting shown in `.env.example`, then run:

```bash
npm run deploy:check
npm run release:verify
```

`deploy:check` intentionally blocks publication when legal identity, provider credentials, approved message templates, worker security or hosting bindings are incomplete. `release:verify` runs that gate followed by the full build, automated tests and lint.

Do not publish until both commands pass and the manual checks in [Production launch readiness](docs/launch-readiness.md) are complete.

## Documentation

- [Deployment runbook](docs/deployment.md)
- [Production architecture](docs/architecture.md)
- [API contract](docs/api-contract.md)
- [Clerk setup](docs/clerk-setup.md)
- [Razorpay payments](docs/razorpay-payments.md)
- [Shiprocket shipping](docs/shiprocket-shipping.md)
- [Notification delivery](docs/notification-delivery.md)
- [Production launch readiness](docs/launch-readiness.md)
