# Shiprocket Shipping Integration

## Activation

Create a dedicated Shiprocket API user with only the required modules. Add its server-only email/password and the gallery pickup postcode to the runtime environment:

- `SHIPROCKET_API_EMAIL`
- `SHIPROCKET_API_PASSWORD`
- `SHIPROCKET_PICKUP_POSTCODE`

`SHIPROCKET_API_TOKEN` is supported for temporary testing, but email/password is preferred because Shiprocket tokens expire and the server can refresh them. No shipping credential is exposed through a `NEXT_PUBLIC_` variable.

## Rate request

The provider adapter authenticates at Shiprocket's external API and caches the bearer token server-side. For each individually packed sculpture it requests surface serviceability with:

- gallery pickup postcode;
- customer delivery postcode;
- COD or prepaid mode;
- packed weight in kilograms;
- packed length, breadth and height in centimetres;
- declared product value including GST.

Provider rates are parsed defensively, converted from rupees to integer paise and filtered for COD support when required. Multiple works are never combined into an invented carton. The system first looks for a courier service common to every parcel; otherwise it produces one multi-carrier surface option from the cheapest serviceable rate for each parcel.

## Safety and fallback

- No product is rated without price, GST, weight, all three packed dimensions and stock.
- Live rate calls have a 12-second timeout.
- A quote belongs to one customer, cart fingerprint, postcode and payment method.
- Quotes expire after 30 minutes and older active quotes are marked expired.
- A no-service response opens the gallery's manual protected-freight path; it never returns a zero or guessed price.
- Final order placement recalculates the cart and verifies every quote total before writing stock, order, payment, shipment and notification records atomically.

Booking, AWB generation, label retrieval and tracking webhooks remain the next Shiprocket operations. They should be activated only after the pickup location name and webhook security token are configured in the Shiprocket account.
