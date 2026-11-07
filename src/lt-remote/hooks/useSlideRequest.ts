import { useCallback, useEffect, useState, type PointerEvent } from "react";
import { RESEND_INTERVAL_MS } from "../const/channel";
import { SignalKind, type ConnectionStatus, type Direction, type Signal } from "../types/signal";
import { detectDirection } from "../utils/direction";
import { useTransport } from "./useTransport";

type PendingRequest = {
  direction: Direction;
  seq: number;
};

type UseSlideRequestResult = {
  pending: Direction | null;
  status: ConnectionStatus;
  handlers: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onContextMenu: (event: PointerEvent<HTMLElement>) => void;
  };
};

const createSenderId = (): string => crypto.randomUUID().slice(0, 8);

/**
 * 画面のタップでスライド送りを依頼する。タップした位置が左右どちらの半分かに応じた向きを持たせる。
 * 依頼は操作者が取り消すまで残り、その間は一定間隔で送り直す。
 * 送り直すのは、接続が一時的に切れた場合や操作者が後から画面を開いた場合でも依頼が届くようにするため。
 */
export const useSlideRequest = (): UseSlideRequestResult => {
  const [senderId] = useState(createSenderId);
  const [pending, setPending] = useState<PendingRequest | null>(null);

  const handleSignal = useCallback(
    (signal: Signal): void => {
      if (signal.kind !== SignalKind.Clear || signal.senderId !== senderId) return;
      setPending((previous) => (previous !== null && previous.seq <= signal.seq ? null : previous));
    },
    [senderId],
  );

  const { transport, status } = useTransport(handleSignal);

  useEffect(() => {
    if (pending === null || transport === null) return;
    const send = (): void => transport.publish({ kind: SignalKind.Request, senderId, ...pending });

    send();
    const interval = setInterval(send, RESEND_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pending, transport, senderId]);

  useEffect(() => {
    // iOS の Safari はタップをシステムのジェスチャ（ダブルタップでの拡大・メニュー）に取られることがあるため止める
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

  return {
    pending: pending?.direction ?? null,
    status,
    handlers: {
      onPointerDown: (event) => {
        const { left, width } = event.currentTarget.getBoundingClientRect();
        setPending({
          direction: detectDirection(event.clientX, left, width),
          seq: Date.now(),
        });
      },
      onContextMenu: (event) => event.preventDefault(),
    },
  };
};
