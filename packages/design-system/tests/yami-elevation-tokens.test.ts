import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("generated/tokens.css", "utf8");
const source = JSON.parse(readFileSync("tokens/semantic/elevation.tokens.json", "utf8"));
const catalog = JSON.parse(readFileSync("generated/tokens.json", "utf8"));
const expected = [
  ["100-canvas", "0px 1px 2px -1px rgba(0, 0, 0, 0.04)"],
  ["200-raised-surface", "0px 2px 4px -2px rgba(0, 0, 0, 0.08)"],
  ["300-tooltip", "0px 4px 8px -4px rgba(0, 0, 0, 0.12)"],
  ["400-menu-panel", "0px 4px 12px -6px rgba(0, 0, 0, 0.16)"],
  ["500-modal-window", "0px 8px 16px -8px rgba(0, 0, 0, 0.24)"],
];

describe("Figma elevation effects", () => {
  it.each(expected)("preserves %s as a composite shadow and valid CSS", (name, value) => {
    expect(source.elevation[name].$type).toBe("shadow");
    expect(source.elevation[name].$value).toHaveProperty("blur");
    expect(css).toContain(`--elevation-${name}: ${value};`);
    const record = catalog.tokens.find((token: { id: string }) => token.id === `elevation.${name}`);
    expect(record.type).toBe("shadow");
    expect(record.values).toEqual([expect.objectContaining({ contextId: "root", cssValue: value })]);
  });
});
