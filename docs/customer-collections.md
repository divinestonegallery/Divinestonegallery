# Customer Collections

Divine Stone Gallery uses two customer collections:

- the wishlist stores works a customer wants to compare or revisit;
- the enquiry bag stores quote-intent works that should be discussed together.

## Signed-out behavior

Signed-out visitors can use both collections without interruption. Product IDs are stored in the current browser under the existing `dsg-saved-works` and `dsg-enquiry-bag` keys. This state is temporary and private to that browser profile.

## Sign-in migration

After Clerk confirms a signed-in session, the collection provider sends both local lists to `POST /api/v1/me/collections/migrate` with the Clerk bearer token. The server:

1. derives the customer from the verified token;
2. accepts no browser-supplied customer ID;
3. limits the combined migration to 100 distinct products;
4. ignores products that are inactive or have no active variant;
5. inserts missing wishlist and quote-cart rows without replacing existing account data;
6. returns the complete account collections.

The browser clears local lists only after a successful response. A failed or interrupted request keeps them intact so the merge can be retried safely. Repeating the request is idempotent.

## Signed-in behavior

Once migration succeeds, PostgreSQL becomes authoritative. Add, remove and clear actions use protected `/api/v1/me/wishlist` and `/api/v1/me/cart` routes. The interface updates optimistically, then reconciles with the server response; failures trigger a fresh account read. Returning to a visible browser tab also refreshes both collections, allowing changes made on another signed-in device to appear.

The enquiry bag does not reserve inventory and does not create an order. It records quote intent only. Availability, price, GST, packing and shipping must be revalidated in the later checkout or quotation workflow.
