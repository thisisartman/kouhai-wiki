import { describe, it, expect } from "vitest";
import { encodeCode, decodeCode } from "../src/lib/code";
import type { Block } from "../src/lib/model";

const blocks: Block[] = [
  { memberId: "me", day: 0, start: 530, end: 620, kind: "course", source: "manual" },
  { memberId: "me", day: 2, start: 780, end: 870, kind: "custom", source: "manual" },
];

describe("group code", () => {
  it("round-trips a payload without loss", () => {
    const code = encodeCode({ v: 1, name: "Appu", term: "2026 Fall", blocks });
    const result = decodeCode(code);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.name).toBe("Appu");
    expect(result.payload.term).toBe("2026 Fall");
    expect(result.payload.blocks).toHaveLength(2);
    expect(result.payload.blocks[0]).toMatchObject({
      day: 0, start: 530, end: 620, kind: "course",
    });
    expect(result.payload.blocks[1]).toMatchObject({
      day: 2, start: 780, end: 870, kind: "custom",
    });
  });

  it("survives a name containing the field separator", () => {
    const code = encodeCode({ v: 1, name: "A|B", term: "2026 Fall", blocks: [] });
    const result = decodeCode(code);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.name).toBe("A|B");
  });

  it("produces a code short enough to paste in a chat", () => {
    const many: Block[] = Array.from({ length: 12 }, (_, i) => ({
      memberId: "me",
      day: (i % 6) as Block["day"],
      start: 540 + i * 10,
      end: 630 + i * 10,
      kind: "course" as const,
      source: "manual" as const,
    }));
    const code = encodeCode({ v: 1, name: "Apoorv", term: "2026 Fall", blocks: many });
    expect(code.length).toBeLessThan(400);
  });

  it("refuses an unknown version", () => {
    const tampered = Buffer.from("9|Appu|2026 Fall|", "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const res = decodeCode(tampered);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.reason).toMatch(/different version/i);
  });

  it("refuses corrupt input rather than throwing", () => {
    expect(decodeCode("not a real code!!").ok).toBe(false);
    expect(decodeCode("").ok).toBe(false);
  });

  it("refuses a block with impossible times", () => {
    const bad = Buffer.from("1|Appu|2026 Fall|0:900:600:c", "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(decodeCode(bad).ok).toBe(false);
  });

  it("handles a payload with no blocks", () => {
    const code = encodeCode({ v: 1, name: "Empty", term: "2026 Fall", blocks: [] });
    const res = decodeCode(code);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.payload.blocks).toEqual([]);
  });
});
