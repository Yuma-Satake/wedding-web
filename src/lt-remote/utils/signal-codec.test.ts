import { describe, expect, it } from "vitest";
import { Direction, SignalKind } from "../types/signal";
import { decodeSignal, encodeSignal, isClearedRequest, shouldReplaceRequest } from "./signal-codec";

const request = (senderId: string, seq: number) => ({
  kind: SignalKind.Request,
  direction: Direction.Forward,
  senderId,
  seq,
});

describe("signal-codec", () => {
  it("encodes and decodes a signal for each kind and direction", () => {
    Object.values(SignalKind).forEach((kind) => {
      Object.values(Direction).forEach((direction) => {
        const signal = { kind, direction, senderId: "abc123", seq: 42 };
        expect(decodeSignal(encodeSignal(signal))).toEqual(signal);
      });
    });
  });

  it("rejects malformed payloads", () => {
    expect(decodeSignal("")).toBeNull();
    expect(decodeSignal("request:forward:abc")).toBeNull();
    expect(decodeSignal("request:abc:1")).toBeNull();
    expect(decodeSignal("jump:forward:abc:1")).toBeNull();
    expect(decodeSignal("request:sideways:abc:1")).toBeNull();
    expect(decodeSignal("request:forward:abc:x")).toBeNull();
    expect(decodeSignal("request:forward:abc:1:extra")).toBeNull();
  });

  it("treats requests up to the cleared seq of the same sender as cleared", () => {
    const cleared = { abc: 10 };
    expect(isClearedRequest(cleared, request("abc", 10))).toBe(true);
    expect(isClearedRequest(cleared, request("abc", 9))).toBe(true);
    expect(isClearedRequest(cleared, request("abc", 11))).toBe(false);
    expect(isClearedRequest(cleared, request("other", 1))).toBe(false);
  });

  it("replaces the current request unless the new one is older from the same sender", () => {
    expect(shouldReplaceRequest(null, request("abc", 1))).toBe(true);
    expect(shouldReplaceRequest(request("abc", 10), request("abc", 10))).toBe(true);
    expect(shouldReplaceRequest(request("abc", 10), request("abc", 11))).toBe(true);
    expect(shouldReplaceRequest(request("abc", 10), request("abc", 9))).toBe(false);
    expect(shouldReplaceRequest(request("abc", 10), request("other", 1))).toBe(true);
  });
});
