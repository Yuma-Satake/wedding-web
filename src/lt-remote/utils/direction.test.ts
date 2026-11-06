import { describe, expect, it } from "vitest";
import { Direction } from "../types/signal";
import { detectDirection } from "./direction";

describe("detectDirection", () => {
  it("returns back for the left half and forward for the right half", () => {
    expect(detectDirection(10, 0, 400)).toBe(Direction.Back);
    expect(detectDirection(199, 0, 400)).toBe(Direction.Back);
    expect(detectDirection(200, 0, 400)).toBe(Direction.Forward);
    expect(detectDirection(390, 0, 400)).toBe(Direction.Forward);
  });

  it("accounts for the left offset of the element", () => {
    expect(detectDirection(150, 100, 200)).toBe(Direction.Back);
    expect(detectDirection(250, 100, 200)).toBe(Direction.Forward);
  });
});
