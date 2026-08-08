# Production launch readiness

Step 11 completed the local security, performance, SEO, accessibility and regression pass. Step 12 must not publish the store until the following business and provider information is confirmed.

The automated release gate is `npm run deploy:check`. After completing `.env.local`, run `npm run release:verify`; publication must remain blocked while either command fails.

## Business and legal identity

- Final legal business or proprietor name.
- Complete geographic business address and customer-care hours.
- Grievance officer name, designation, email and phone for the website.
- GSTIN and invoice identity once registration is issued.
- Final ready-made cancellation, return, refund, replacement and warranty timelines.
- Final custom-commission cancellation and change-cost rules.

The privacy notice and website terms now describe the implemented service, but the above identity and policy details require business confirmation and professional India-focused legal review before launch. The official [Consumer Protection (E-Commerce) Rules](https://consumeraffairs.nic.in/sites/default/files/E%20commerce%20rules_0.pdf) cover goods sold through an electronic network, and the privacy workflow must be aligned with the [Digital Personal Data Protection Act](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf) and [DPDP Rules](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa) in force at launch.

## Customer consent

- Verify the implemented account control records affirmative WhatsApp transactional-message opt-in before enabling Meta delivery.
- Verify the same account control withdraws permission immediately and records the event.
- Do not reuse transactional consent for marketing.
- Keep email, SMS and WhatsApp template language limited to the approved service purpose.

## Providers and edge protection

- Add live Clerk, Razorpay, Shiprocket, Resend, MSG91 and Meta credentials only through hosted secrets.
- Verify webhook signatures using the live provider dashboards and rotate every test secret before launch.
- Configure Cloudflare rate limits for authentication, checkout, shipping quotes, uploads and provider webhooks.
- Configure monitoring, error alerts, database backups and a tested restore procedure.
- Configure the notification worker schedule only after message templates and consent controls are approved.

## Launch validation

- Connect `divinestonegallery.com`, enforce HTTPS and verify canonical, sitemap and robots URLs on the real hostname.
- Place one low-value test-mode order for online payment, bank transfer and COD.
- Test one custom commission from submission through milestone approval.
- Verify email, SMS and WhatsApp messages only with internal test recipients first.
- Test mobile keyboard navigation, screen-reader labels, image loading and checkout on the production hostname.
