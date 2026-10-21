import assert from "node:assert/strict";
import { buildVCard } from "./vcard.ts";

const value = buildVCard({ firstName: "Ada", lastName: "Lovelace", phone: "+1 555", note: "one\rtwo\r\nthree" });
assert.ok(value.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n"));
assert.ok(value.includes("FN:Ada Lovelace\r\n"));
assert.ok(value.includes("NOTE:one\\ntwo\\nthree\r\n"));
assert.ok(value.endsWith("END:VCARD"));
assert.equal(value.includes("\n\n"), false);
assert.throws(() => buildVCard({}), /name or phone/i);
console.log("vcard tests: passed");
