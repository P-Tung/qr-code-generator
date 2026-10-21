export interface VCardInput {
  firstName?: string; lastName?: string; organization?: string; title?: string; phone?: string; email?: string; website?: string; note?: string;
}

const escapeValue = (value: string) => value
  .replace(/\\/g, "\\\\")
  .replace(/;/g, "\\;")
  .replace(/,/g, "\\,")
  .replace(/\r\n|\r|\n/g, "\\n");
const add = (lines: string[], key: string, value?: string) => { const trimmed = value?.trim(); if (trimmed) lines.push(`${key}:${escapeValue(trimmed)}`); };

export function buildVCard(input: VCardInput): string {
  const firstName = input.firstName?.trim() ?? "";
  const lastName = input.lastName?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  if (!firstName && !lastName && !phone) throw new Error("A name or phone number is required");
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || phone;
  lines.push(`FN:${escapeValue(fullName)}`, `N:${escapeValue(lastName)};${escapeValue(firstName)};;;`);
  if (phone) lines.push(`TEL;TYPE=CELL:${escapeValue(phone)}`);
  add(lines, "ORG", input.organization); add(lines, "TITLE", input.title); add(lines, "EMAIL;TYPE=INTERNET", input.email); add(lines, "URL", input.website); add(lines, "NOTE", input.note);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}
