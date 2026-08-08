# Custom-moorti commissions

Step 9 implements the private commission journey for customers and full-access gallery staff.

## Customer flow

1. A signed-in customer submits the deity, approximate height, placement, finish, timeline, delivery postcode and written requirements from `/custom-murti`.
2. Up to five reference JPEG, PNG or WebP images can be stored privately in S3-compatible storage. PostgreSQL stores their ownership and metadata.
3. The request appears at `/account/commissions` and receives a permanent `DSG-C-...` reference.
4. The customer can see the gallery quotation, separately decided advance, balance, expected completion date and every production milestone.
5. A submitted milestone can be approved or returned with a required change note. Both decisions are authenticated and audited.

## Staff flow

Full-access staff use `/admin/commissions` to:

- review every request and private reference image;
- set the price before GST, GST amount, shipping amount, advance and expected completion date individually;
- move the commission through consultation, quotation, advance, production, shipping and completion states;
- define the major milestones for the work;
- submit 1–6 progress images and a gallery note for customer approval.

Submitting a milestone queues email, SMS and WhatsApp notifications for every verified customer contact available. The delivery worker now sends them through Resend, MSG91 and the official Meta WhatsApp Cloud API once the corresponding credentials and approved templates are configured.

## Security rules

- Customer endpoints always filter by the authenticated local user ID.
- Staff endpoints require an active `staff_members` row.
- Private media is served only after customer ownership or staff access is checked.
- Image signatures are inspected; the filename and browser MIME type are not trusted.
- S3-compatible storage objects are removed if their PostgreSQL metadata transaction fails.
- Financial values use integer paise and the server calculates the balance.
- Milestones can be decided only while in `submitted` state, preventing duplicate approvals.
