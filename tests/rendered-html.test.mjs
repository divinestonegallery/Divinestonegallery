import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/", init = {}) {
  const baseUrl = process.env.TEST_BASE_URL;
  if (!baseUrl) throw new Error("TEST_BASE_URL is required for rendered route tests");
  return fetch(`${baseUrl}${pathname}`, {
    ...init,
    redirect: "manual",
    headers: { accept: "text/html", ...init.headers },
  });
}

test("server-renders the Divine Stone Gallery homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Divine Stone Gallery/i);
  assert.match(html, /Sacred forms/i);
  assert.match(html, /Fourth-generation master moortikars/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|codex-preview/i);
  assert.match(html, /href=["']\/account["']/i);
  assert.match(html, /href=["']\/wishlist["']/i);
  assert.match(html, /href=["']\/cart["']/i);
  assert.match(html, /href=["']#main-content["']/i);
  assert.match(html, /<main[^>]+id=["']main-content["']/i);
  assert.match(html, /rel=["']canonical["']/i);
  assert.equal(html.match(/<title>(.*?)<\/title>/i)?.[1], "Divine Stone Gallery | Hand-Carved Marble Moorties");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
  assert.equal(response.headers.get("cross-origin-opener-policy"), "same-origin-allow-popups");
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'self'/i);
});

test("renders every customer-facing route", async () => {
  const routes = [
    "/shop",
    "/products/radha-krishna-39-inch-marble",
    "/custom-murti",
    "/our-story",
    "/artisans",
    "/guides",
    "/guides/materials",
    "/contact",
    "/faq",
    "/shipping",
    "/privacy",
    "/terms",
    "/returns",
    "/account/orders",
    "/sign-in",
    "/sign-up",
    "/wishlist",
    "/cart",
    "/checkout",
    "/track-order",
  ];

  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 200, `${route} should render successfully`);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i, `${route} should return HTML`);
  }

  const protectedRoutes = [
    "/account",
    "/account/commissions",
    "/account/commissions/DSG-C-DEMO",
    "/admin/products",
    "/admin/commissions",
    "/admin/notifications",
  ];

  for (const route of protectedRoutes) {
    const response = await render(route);
    assert.ok([200, 307].includes(response.status), `${route} should render locally or redirect securely when authentication is configured`);
    if (response.status === 307) {
      assert.match(response.headers.get("location") ?? "", /^\/sign-in(?:\?|$)/, `${route} should redirect to sign-in`);
    } else {
      assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i, `${route} should return HTML`);
    }
  }
});

test("serves the public catalogue API with products and active filter options", async () => {
  const response = await render("/api/v1/products");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^application\/json\b/i);
  const payload = await response.json();
  assert.ok(payload.data.length >= 9);
  assert.equal(payload.meta.total, payload.data.length);
  assert.ok(payload.data.every((product) => product.id && product.slug && product.deity));
  assert.ok(payload.meta.deities.includes("Hanuman Ji"));
  assert.ok(payload.meta.categories.includes("Deity Idol"));
});

test("protects account collection APIs from anonymous access", async () => {
  const routes = [
    "/api/v1/me/collections",
    "/api/v1/me/wishlist",
    "/api/v1/me/cart",
    "/api/v1/checkout",
    "/api/v1/orders",
    "/api/v1/commissions",
  ];

  for (const route of routes) {
    const response = await render(route);
    assert.equal(response.status, 401, `${route} should require sign-in`);
    assert.match(response.headers.get("content-type") ?? "", /^application\/json\b/i);
    const payload = await response.json();
    assert.equal(payload.error.code, "AUTH_REQUIRED");
  }

  const shipping = await render("/api/v1/shipping/rates", { method: "POST" });
  assert.equal(shipping.status, 401, "shipping rates should require sign-in");
  assert.equal((await shipping.json()).error.code, "AUTH_REQUIRED");

  const paymentVerification = await render("/api/v1/payments/razorpay/verify", { method: "POST" });
  assert.equal(paymentVerification.status, 401, "payment verification should require sign-in");
  assert.equal((await paymentVerification.json()).error.code, "AUTH_REQUIRED");

  const accountPreference = await render("/api/v1/me", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ whatsappTransactionalUpdates: true }) });
  assert.equal(accountPreference.status, 401, "communication preferences should require sign-in");
  assert.equal((await accountPreference.json()).error.code, "AUTH_REQUIRED");

  const staffCommissions = await render("/api/v1/admin/commissions");
  assert.equal(staffCommissions.status, 401, "commission administration should require staff sign-in");

  const staffNotifications = await render("/api/v1/admin/notifications");
  assert.equal(staffNotifications.status, 401, "notification administration should require staff sign-in");
});

test("redirects duplicate routes to their canonical pages", async () => {
  const redirects = [
    ["/craftsmanship", "/artisans"],
    ["/damage-protection", "/shipping#damage-protection"],
  ];

  for (const [source, destination] of redirects) {
    const response = await render(source);
    assert.ok([307, 308].includes(response.status), `${source} should redirect`);
    assert.equal(new URL(response.headers.get("location"), "http://localhost").pathname + new URL(response.headers.get("location"), "http://localhost").hash, destination);
  }
});

test("serves robots and sitemap metadata routes", async () => {
  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  const robotsText = await robots.text();
  assert.match(robotsText, /User-Agent:\s*\*/i);
  assert.match(robotsText, /Disallow:\s*\/checkout/i);

  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  assert.match(xml, /<urlset/i);
  assert.match(xml, /\/products\/radha-krishna-39-inch-marble/i);
  assert.doesNotMatch(xml, /<lastmod>/i);
});
