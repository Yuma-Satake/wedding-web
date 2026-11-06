import { useCallback, useEffect, useState, type ReactElement } from "react";
import { STALE_TIMEOUT_MS } from "../const/channel";
import { useTransport } from "../hooks/useTransport";
import { useWakeLock } from "../hooks/useWakeLock";
import { Direction, SignalKind, type Signal } from "../types/signal";
import { shouldAcceptSignal } from "../utils/signal-codec";
import { ArrowScreen } from "./ArrowScreen";

type ReceivedState = {
  pressed: Direction | null;
  latestSeqBySender: Readonly<Record<string, number>>;
};

const initialState: ReceivedState = { pressed: null, latestSeqBySender: {} };

const CAPTION_BY_PRESSED = {
  [Direction.Forward]: "登壇者が次のスライドへ進めようとしています",
  [Direction.Back]: "登壇者が前のスライドへ戻そうとしています",
} as const satisfies Record<Direction, string>;

/**
 * 機材操作者用の画面。登壇者がスライドを送る指示を出している間、その向きの矢印を表示する。
 * 登壇者の端末が通信を失って「離した」信号が届かない場合に備え、一定時間信号が途絶えたら表示を消す。
 */
export const OperatorScreen = (): ReactElement => {
  useWakeLock();
  const [received, setReceived] = useState<ReceivedState>(initialState);

  const handleSignal = useCallback((signal: Signal): void => {
    setReceived((previous) =>
      shouldAcceptSignal(previous.latestSeqBySender, signal)
        ? {
            pressed: signal.kind === SignalKind.Press ? signal.direction : null,
            latestSeqBySender: { ...previous.latestSeqBySender, [signal.senderId]: signal.seq },
          }
        : previous,
    );
  }, []);

  const { status } = useTransport(handleSignal);

  useEffect(() => {
    if (received.pressed === null) return;
    const timer = setTimeout(
      () => setReceived((previous) => ({ ...previous, pressed: null })),
      STALE_TIMEOUT_MS,
    );
    return () => clearTimeout(timer);
  }, [received]);

  return (
    <ArrowScreen
      activeDirection={received.pressed}
      roleLabel="機材操作者"
      caption={received.pressed === null ? "待機中" : CAPTION_BY_PRESSED[received.pressed]}
      status={status}
    />
  );
};
