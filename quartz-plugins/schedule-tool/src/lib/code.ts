import type { Block, Day } from "./model";

export const CODE_VERSION = 1;

export interface Payload {
  v: number;
  name: string;
  term: string;
  blocks: Block[];
}

export type DecodeResult =
  | { ok: true; payload: Payload }
  | { ok: false; reason: string };

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\|/g, "\\p");
const unesc = (s: string) => s.replace(/\\p/g, "|").replace(/\\\\/g, "\\");

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeCode(payload: Payload): string {
  const blocks = payload.blocks
    .map((b) => `${b.day}:${b.start}:${b.end}:${b.kind === "course" ? "c" : "x"}`)
    .join(";");
  const raw = `${payload.v}|${esc(payload.name)}|${esc(payload.term)}|${blocks}`;
  return toBase64Url(raw);
}

/**
 * Pull a code out of pasted text that may carry surrounding words.
 *
 * Once codes are shared through a chat app, people paste the whole message
 * ("here's mine: AbC123") rather than the bare string, and a single-line
 * input silently joins any newlines. Taking the longest base64url-looking
 * token recovers the code in both cases.
 */
export function extractCode(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  let best = "";
  for (const token of trimmed.split(/\s+/)) {
    if (/^[A-Za-z0-9_-]+$/.test(token) && token.length > best.length) best = token;
  }
  return best || trimmed;
}

export function decodeCode(text: string): DecodeResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, reason: "That code is empty." };

  let raw: string;
  try {
    raw = fromBase64Url(trimmed);
  } catch {
    return { ok: false, reason: "That does not look like a schedule code." };
  }

  const parts = raw.split("|");
  if (parts.length < 4) {
    return { ok: false, reason: "That does not look like a schedule code." };
  }

  const v = Number(parts[0]);
  if (v !== CODE_VERSION) {
    return {
      ok: false,
      reason: `That code was made by a different version of this tool (v${parts[0]}). Ask for a fresh one.`,
    };
  }

  const name = unesc(parts[1]);
  const term = unesc(parts[2]);
  const blockText = parts.slice(3).join("|");

  const blocks: Block[] = [];
  if (blockText) {
    for (const chunk of blockText.split(";")) {
      const [d, s, e, k] = chunk.split(":");
      const day = Number(d);
      const start = Number(s);
      const end = Number(e);
      if (![day, start, end].every(Number.isInteger)) {
        return { ok: false, reason: "That code is damaged. Ask for a fresh one." };
      }
      if (day < 0 || day > 6 || start < 0 || end > 1440 || end <= start) {
        return { ok: false, reason: "That code is damaged. Ask for a fresh one." };
      }
      blocks.push({
        // left blank on purpose: the importer assigns ids when it creates members,
        // which keeps this module free of any id-generation concern
        memberId: "",
        day: day as Day,
        start,
        end,
        kind: k === "c" ? "course" : "custom",
        source: "imported",
      });
    }
  }

  return { ok: true, payload: { v, name, term, blocks } };
}
