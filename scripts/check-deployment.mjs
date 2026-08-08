import { existsSync, readFileSync } from "node:fs";

const failures = [];
const templateKeys = [
  "order_placed",
  "payment_captured",
  "commission_submitted",
  "commission_quote_ready",
  "commission_status_updated",
  "commission_milestone_ready",
];

function value(key) {
  return process.env[key]?.trim() || "";
}

function required(key, minimumLength = 1) {
  const present = value(key).length >= minimumLength;
  if (!present) failures.push(`${key} is missing or incomplete`);
  return present;
}

function templateMap(key) {
  try {
    const parsed = JSON.parse(value(key));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || templateKeys.some((name) => typeof parsed[name] !== "string" || !parsed[name].trim())) throw new Error();
  } catch {
    failures.push(`${key} must contain every approved notification template`);
  }
}

for (const key of [
  "BUSINESS_NAME", "BUSINESS_EMAIL", "BUSINESS_PHONE_E164", "BUSINESS_COUNTRY_CODE", "BUSINESS_CURRENCY",
  "BUSINESS_GSTIN",
  "GRIEVANCE_OFFICER_NAME", "GRIEVANCE_EMAIL", "GRIEVANCE_PHONE_E164",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY", "CLERK_WEBHOOK_SIGNING_SECRET", "INITIAL_ADMIN_EMAILS",
  "SHIPROCKET_PICKUP_POSTCODE", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET",
  "RESEND_API_KEY", "RESEND_FROM_EMAIL", "RESEND_REPLY_TO", "MSG91_AUTH_KEY", "MSG91_SENDER_ID",
  "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_GRAPH_API_VERSION",
]) required(key);

required("NOTIFICATION_WORKER_SECRET", 32);
required("BUSINESS_LEGAL_NAME", 2);
required("BUSINESS_ADDRESS", 12);
required("CUSTOMER_CARE_HOURS", 3);

try {
  const siteUrl = new URL(value("NEXT_PUBLIC_SITE_URL"));
  if (siteUrl.protocol !== "https:" || siteUrl.hostname !== "divinestonegallery.com" || siteUrl.pathname !== "/") throw new Error();
} catch {
  failures.push("NEXT_PUBLIC_SITE_URL must be https://divinestonegallery.com");
}

if (!value("SHIPROCKET_API_TOKEN") && !(value("SHIPROCKET_API_EMAIL") && value("SHIPROCKET_API_PASSWORD"))) {
  failures.push("Configure either SHIPROCKET_API_TOKEN or the Shiprocket API email and password");
}
if (value("BUSINESS_GSTIN") && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value("BUSINESS_GSTIN").toUpperCase())) failures.push("BUSINESS_GSTIN is not structurally valid");
if (value("BUSINESS_PHONE_E164") && !/^\+[1-9]\d{7,14}$/.test(value("BUSINESS_PHONE_E164"))) failures.push("BUSINESS_PHONE_E164 must use international +country-code format");
if (value("GRIEVANCE_PHONE_E164") && !/^\+[1-9]\d{7,14}$/.test(value("GRIEVANCE_PHONE_E164"))) failures.push("GRIEVANCE_PHONE_E164 must use international +country-code format");
if (value("SHIPROCKET_PICKUP_POSTCODE") && !/^[1-9]\d{5}$/.test(value("SHIPROCKET_PICKUP_POSTCODE"))) failures.push("SHIPROCKET_PICKUP_POSTCODE must be a valid Indian postcode");
if (value("WHATSAPP_GRAPH_API_VERSION") && !/^v\d+\.\d+$/.test(value("WHATSAPP_GRAPH_API_VERSION"))) failures.push("WHATSAPP_GRAPH_API_VERSION must be explicit, such as vNN.N");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
for (const key of ["BUSINESS_EMAIL", "GRIEVANCE_EMAIL", "RESEND_REPLY_TO"]) {
  if (value(key) && !emailPattern.test(value(key))) failures.push(`${key} must be a valid email address`);
}
if (value("BUSINESS_COUNTRY_CODE") && value("BUSINESS_COUNTRY_CODE") !== "IN") failures.push("BUSINESS_COUNTRY_CODE must be IN for this release");
if (value("BUSINESS_CURRENCY") && value("BUSINESS_CURRENCY") !== "INR") failures.push("BUSINESS_CURRENCY must be INR for this release");
if (value("WHATSAPP_TEMPLATE_LANGUAGE") !== "en") failures.push("WHATSAPP_TEMPLATE_LANGUAGE must be en for the English launch");

for (const [key, maximum] of [["READY_MADE_RETURN_WINDOW_DAYS", 30], ["DAMAGE_REPORT_WINDOW_HOURS", 168]]) {
  const number = Number(value(key));
  if (!Number.isInteger(number) || number < 1 || number > maximum) failures.push(`${key} must be between 1 and ${maximum}`);
}

templateMap("MSG91_SMS_TEMPLATE_MAP_JSON");
templateMap("WHATSAPP_TEMPLATE_MAP_JSON");

try {
  const hosting = JSON.parse(readFileSync(".openai/hosting.json", "utf8"));
  if (!hosting.project_id || hosting.d1 !== "DB" || hosting.r2 !== "MEDIA") throw new Error();
} catch {
  failures.push(".openai/hosting.json must declare the project, DB and MEDIA bindings");
}
if (!existsSync("drizzle/meta/_journal.json")) failures.push("Database migration journal is missing");

if (failures.length) {
  console.error("Deployment readiness check failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("\nAdd the real values to .env.local or hosted environment settings; never commit secret values.");
  process.exit(1);
}

console.log("Deployment configuration is complete. Run the full release verification before publishing.");
