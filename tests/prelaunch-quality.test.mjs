import assert from "node:assert/strict";
import test from "node:test";

import { serializeJsonLd } from "../apps/frontend/src/components/site/serialize-json-ld.ts";
import { declaredBodyExceeds, readTextWithinLimit } from "../apps/backend/src/modules/security/request-limits.ts";

test("escapes markup-significant characters in structured data", () => {
  const value = serializeJsonLd({ description: "</script><script>alert(1)</script>" });
  assert.doesNotMatch(value, /<\/script>/i);
  assert.match(value, /\\u003c\/script>/i);
});

test("rejects declared and actual request bodies above the limit", async () => {
  const declared = new Request("https://example.test", { method: "POST", headers: { "content-length": "101" }, body: "tiny" });
  assert.equal(declaredBodyExceeds(declared, 100), true);

  const actual = new Request("https://example.test", { method: "POST", body: "123456" });
  assert.equal(await readTextWithinLimit(actual, 5), null);

  const accepted = new Request("https://example.test", { method: "POST", body: "12345" });
  assert.equal(await readTextWithinLimit(accepted, 5), "12345");
});
