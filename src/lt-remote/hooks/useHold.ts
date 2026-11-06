import { useEffect, useState, type PointerEvent } from "react";
import { HEARTBEAT_INTERVAL_MS, HOLD_THRESHOLD_MS } from "../const/channel";
import type { Transport } from "../services/transport";
import { SignalKind, type Direction } from "../types/signal";
import { detectDirection } from "../utils/direction";

type UseHoldResult = {
  holding: Direction | null;
  handlers: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: () => void;
    onPointerCancel: () => void;
    onContextMenu: (event: PointerEvent<HTMLElement>) => void;
  };
};

const createSenderId = (): string => crypto.randomUUID().slice(0, 8);

/**
 * 画面の長押しを検知し、長押し中は「押している」信号を一定間隔で送り続ける。
 * 信号には、触れた位置が左右どちらの半分かに応じた向きを持たせる。
 * 離したとき・タブが背面に回ったとき・ページを離れるときは「離した」信号を送る。
 * 再送は、離した信号が届かなかった場合に受信側が表示を消せるようにするためのもの。
 */
export const useHold = (transport: Transport | null): UseHoldResult => {
  const [senderId] = useState(createSenderId);
  const [touching, setTouching] = useState<Direction | null>(null);
  const [holding, setHolding] = useState<Direction | null>(null);

  useEffect(() => {
    if (touching === null) {
      setHolding(null);
      return;
    }
    const timer = setTimeout(() => setHolding(touching), HOLD_THRESHOLD_MS);
    return () => clearTimeout(timer);
  }, [touching]);

  useEffect(() => {
    if (holding === null || transport === null) return;
    const send = (kind: SignalKind): void =>
      transport.publish({ kind, direction: holding, senderId, seq: Math.round(performance.now()) });

    send(SignalKind.Press);
    const interval = setInterval(() => send(SignalKind.Press), HEARTBEAT_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      send(SignalKind.Release);
    };
  }, [holding, transport, senderId]);

  useEffect(() => {
    // iOS の Safari は長押しをシステムのジェスチャ（拡大鏡・メニュー）に取られ、ポインタ操作が途切れるため止める
    const preventDefault = (event: Event): void => event.preventDefault();
    document.addEventListener("touchstart", preventDefault, { passive: false });
    document.addEventListener("touchmove", preventDefault, { passive: false });
    document.addEventListener("contextmenu", preventDefault);
    return () => {
      document.removeEventListener("touchstart", preventDefault);
      document.removeEventListener("touchmove", preventDefault);
      document.removeEventListener("contextmenu", preventDefault);
    };
  }, []);

  useEffect(() => {
    const release = (): void => setTouching(null);
    const handleVisibility = (): void => {
      if (document.visibilityState !== "visible") release();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", release);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", release);
    };
  }, []);

  return {
    holding,
    handlers: {
      onPointerDown: (event) => {
        const { left, width } = event.currentTarget.getBoundingClientRect();
        setTouching(detectDirection(event.clientX, left, width));
        try {
          // 指が要素の外へ動いても、離したことを検知できるようにする
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch (error) {
          console.warn(error instanceof Error ? error.message : "Unknown error");
        }
      },
      onPointerUp: () => setTouching(null),
      onPointerCancel: () => setTouching(null),
      onContextMenu: (event) => event.preventDefault(),
    },
  };
};
