import assert from "node:assert/strict";
import test from "node:test";

import { isNotificationTemplateKey, renderNotification } from "../apps/backend/src/modules/messaging/templates.ts";
import { normalizeIndianMobile } from "../apps/backend/src/modules/messaging/providers/msg91.ts";
import { normalizeWhatsAppRecipient } from "../apps/backend/src/modules/messaging/providers/meta-whatsapp.ts";

test("normalizes Indian SMS recipients", () => {
  assert.equal(normalizeIndianMobile("+91 98765 43210"), "919876543210");
  assert.equal(normalizeIndianMobile("9876543210"), "919876543210");
  assert.equal(normalizeIndianMobile("12345"), null);
});

test("normalizes WhatsApp recipients without inventing a country code", () => {
  assert.equal(normalizeWhatsAppRecipient("+91 98765 43210"), "919876543210");
  assert.equal(normalizeWhatsAppRecipient("0123456789"), null);
  assert.equal(normalizeWhatsAppRecipient("short"), null);
});

test("recognizes only supported notification template keys", () => {
  assert.equal(isNotificationTemplateKey("commission_milestone_ready"), true);
  assert.equal(isNotificationTemplateKey("password_reset"), false);
});

test("renders escaped customer notification content", () => {
  const rendered = renderNotification({
    templateKey: "commission_quote_ready",
    reference: "DSG-C-<123>",
    status: "quote_ready",
    amountPaise: 125000,
    currency: "INR",
    link: "https://divinestonegallery.com/account/commissions/DSG-C-123?x=1&y=2",
  });

  assert.match(rendered.subject, /quotation/i);
  assert.match(rendered.text, /DSG-C-<123>/);
  assert.match(rendered.html, /DSG-C-&lt;123&gt;/);
  assert.doesNotMatch(rendered.html, /DSG-C-<123>/);
  assert.match(rendered.html, /x=1&amp;y=2/);
  assert.match(rendered.text, /quote ready/);
});
