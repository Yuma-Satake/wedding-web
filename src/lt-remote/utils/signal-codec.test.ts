import { describe, expect, it } from "vitest";
import { SignalKind } from "../types/signal";
import { decodeSignal, encodeSignal, shouldAcceptSignal } from "./signal-codec";

describe("signal-codec", () => {
  it("encodes and decodes a signal", () => {
    const signal = { kind: SignalKind.Press, senderId: "abc123", seq: 42 };
    expect(decodeSignal(encodeSignal(signal))).toEqual(signal);
  });

  it("rejects malformed payloads", () => {
    expect(decodeSignal("")).toBeNull();
    expect(decodeSignal("press:abc")).toBeNull();
    expect(decodeSignal("jump:abc:1")).toBeNull();
    expect(decodeSignal("press:abc:x")).toBeNull();
    expect(decodeSignal("press:abc:1:extra")).toBeNull();
  });

  it("drops signals older than the latest from the same sender", () => {
    const latest = { abc: 10 };
    expect(shouldAcceptSignal(latest, { kind: SignalKind.Press, senderId: "abc", seq: 9 })).toBe(
      false,
    );
    expect(shouldAcceptSignal(latest, { kind: SignalKind.Release, senderId: "abc", seq: 11 })).toBe(
      true,
    );
    expect(shouldAcceptSignal(latest, { kind: SignalKind.Press, senderId: "other", seq: 1 })).toBe(
      true,
    );
  });
});
