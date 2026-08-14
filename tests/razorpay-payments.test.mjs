import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  parseRazorpayOrder,
  parseRazorpayPayment,
  validateRemotePayment,
  verifyRazorpayCheckoutSignature,
  verifyRazorpayWebhookSignature,
} from "../apps/backend/src/modules/payments/providers/razorpay.ts";

test("verifies Razorpay checkout signatures against the server order id", async () => {
  const orderId = "order_DSGtest123";
  const paymentId = "pay_DSGtest456";
  const secret = "test_secret_only";
  const signature = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  assert.equal(await verifyRazorpayCheckoutSignature(orderId, paymentId, signature, secret), true);
  assert.equal(await verifyRazorpayCheckoutSignature(orderId, "pay_tampered", signature, secret), false);
});

test("verifies Razorpay webhooks using the untouched raw request body", async () => {
  const body = '{"event":"payment.captured","payload":{"value":1}}';
  const secret = "webhook_secret_only";
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  assert.equal(await verifyRazorpayWebhookSignature(body, signature, secret), true);
  assert.equal(await verifyRazorpayWebhookSignature(`${body}\n`, signature, secret), false);
});

test("accepts only structurally valid Razorpay order and payment entities", () => {
  assert.equal(parseRazorpayOrder({ id: "order_123", amount: 5000, amount_due: 5000, amount_paid: 0, currency: "INR", receipt: "DSG-1", status: "created" })?.amount, 5000);
  assert.equal(parseRazorpayOrder({ id: "bad", amount: 5000 }), null);
  assert.equal(parseRazorpayPayment({ id: "pay_123", order_id: "order_123", amount: 5000, currency: "INR", status: "captured", captured: true, method: "upi" })?.status, "captured");
  assert.equal(parseRazorpayPayment({ id: "pay_123", amount: 50.5, currency: "INR", status: "captured" }), null);
});

test("matches the provider order, integer paise total and INR before confirmation", () => {
  const payment = parseRazorpayPayment({ id: "pay_123", order_id: "order_123", amount: 5000, currency: "INR", status: "captured", captured: true, method: "upi" });
  assert.ok(payment);
  assert.equal(validateRemotePayment(payment, { providerOrderId: "order_123", amountPaise: 5000, currency: "INR" }), true);
  assert.equal(validateRemotePayment(payment, { providerOrderId: "order_123", amountPaise: 4999, currency: "INR" }), false);
  assert.equal(validateRemotePayment(payment, { providerOrderId: "order_other", amountPaise: 5000, currency: "INR" }), false);
});
