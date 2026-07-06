import { describe, it, expect } from "vitest";
import { parseFeetInches } from "./feetInches";
import { formatFeetInches } from "../engine/units";

describe("parseFeetInches", () => {
  it("parses feet-inches-fractions", () => {
    expect(parseFeetInches("9' 1-3/4\"")).toBeCloseTo(109.75, 8);
    expect(parseFeetInches("9'1 3/4")).toBeCloseTo(109.75, 8);
    expect(parseFeetInches("9 ft 1 in")).toBeCloseTo(109, 8);
  });
  it("parses bare inches and decimals", () => {
    expect(parseFeetInches("42")).toBe(42);
    expect(parseFeetInches('36"')).toBe(36);
    expect(parseFeetInches("109.75")).toBeCloseTo(109.75, 8);
    expect(parseFeetInches('3/4"')).toBeCloseTo(0.75, 8);
  });
  it("returns null for empty or unparseable input", () => {
    expect(parseFeetInches("")).toBeNull();
    expect(parseFeetInches("   ")).toBeNull();
    expect(parseFeetInches("abc")).toBeNull();
  });
  it("round-trips through the display formatter", () => {
    const inches = parseFeetInches("9' 1-3/4\"")!;
    expect(formatFeetInches(inches)).toBe("9' 1-3/4\"");
  });
});
