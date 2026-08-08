# Clerk activation checklist

The website integration is complete. These dashboard settings activate customer accounts.

## 1. Create the application

1. Create a Clerk application named **Divine Stone Gallery**.
2. Upload the Divine Stone Gallery logo and use the production domain when it is ready.
3. Keep separate Clerk development and production instances.

## 2. Enable sign-in methods

In **User & authentication** enable:

- email address with password and email verification;
- phone number with SMS OTP and verification at sign-up;
- Google as the only social connection for launch.

In Clerk's SMS settings, enable **India** in the country allowlist. Production phone OTP requires a paid Clerk plan. Keep account linking enabled for verified email addresses so Google and email/password do not create duplicate customer accounts.

## 3. Add private environment values

Copy these values from Clerk's API Keys page into the local `.env` file and later into the hosted secret settings:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_JWT_KEY=-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----
```

`CLERK_SECRET_KEY` and `CLERK_JWT_KEY` are server-only. Never prefix them with `NEXT_PUBLIC_` and never commit the local `.env` file.

## 4. Configure customer synchronization

Create a Clerk webhook endpoint:

```text
https://divinestonegallery.com/api/v1/webhooks/clerk
```

Subscribe to:

- `user.created`
- `user.updated`
- `user.deleted`

Copy its signing secret into:

```text
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
```

The endpoint verifies every signature before updating PostgreSQL. A synchronous account preparation request also runs after sign-in, so checkout does not depend on webhook delivery timing.

## 5. Production checks

- Confirm `http://localhost:3000` is allowed for development.
- Add `https://divinestonegallery.com` as the production origin and redirect domain.
- Complete Google's OAuth consent branding with the Divine Stone Gallery name and domain.
- Test email/password, Google, Indian phone OTP, logout, password reset and account linking.
- Test that `/account` redirects anonymous users to `/sign-in` after keys are enabled.
- Send Clerk webhook test events and confirm they succeed before accepting orders.
