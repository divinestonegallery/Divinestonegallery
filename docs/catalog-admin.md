# Catalogue administration

## What Step 4 provides

- Nine existing catalogue products, categories, deities, variants and image metadata are seeded into PostgreSQL.
- `/shop` and product pages read the PostgreSQL catalogue, with the original local catalogue as a read-only development/degraded fallback.
- Public product list/detail APIs expose only active products.
- `/admin/products` is protected by Clerk and the active staff table.
- The owner email in `INITIAL_ADMIN_EMAILS` receives initial full access when that Clerk account synchronizes.
- Staff can create draft products and update visibility, sales mode, featured order, price, GST, weight and stock.
- Staff can select JPEG, PNG and WebP product photos up to 12 MB. The browser optimizes large files for serverless upload, the server verifies the real image signature, and the result is stored in private S3-compatible storage.
- Product and variant changes are written to `audit_logs`.

## Initial catalogue safety

No price, GST rate, stock quantity, packaging dimensions or weight has been invented. The seeded variants remain unavailable for direct checkout until staff enters those fields. The product editor now accepts price before GST, GST percentage, packed weight, packed length, packed width, packed height and stock separately from sculpture dimensions. Product pages continue to offer personal quotation and WhatsApp assistance while any selling field is incomplete.

Before enabling direct purchase for a product, complete:

1. price before GST;
2. GST rate;
3. current stock quantity;
4. unique-piece or repeatable-design inventory type;
5. width, depth and packed weight;
6. COD eligibility;
7. at least one approved product image;
8. final description, SKU and variant name.

## Image handling

Seed images continue to use their existing `/public/catalog` paths. New staff uploads are signature-checked, assigned server-generated object keys and stored in S3-compatible storage. PostgreSQL stores the product relationship, checksum, content type, byte size, alt text and processing state. S3-compatible storage images are served through a public route only when attached to an active product.

## Owner activation

The initial owner allowlist is:

```text
INITIAL_ADMIN_EMAILS=divinestonegallery@gmail.com
```

After Clerk is activated, sign in with this verified email. The synchronous account preparation process creates the active `full_access` staff record. Additional staff invitation controls can be added when the wider admin area is built.
