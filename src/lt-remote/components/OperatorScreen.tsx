import { useCallback, useEffect, useState, type ReactElement } from "react";
import { STALE_TIMEOUT_MS } from "../const/channel";
import { useTransport } from "../hooks/useTransport";
import { useWakeLock } from "../hooks/useWakeLock";
import { SignalKind, type Signal } from "../types/signal";
import { shouldAcceptSignal } from "../utils/signal-codec";
import { ArrowScreen } from "./ArrowScreen";

type OperatorProps = {
  speakerQrSrc: string;
};

type ReceivedState = {
  pressed: boolean;
  latestSeqBySender: Readonly<Record<string, number>>;
};

const initialState: ReceivedState = { pressed: false, latestSeqBySender: {} };

/**
 * 機材操作者用の画面。登壇者が次のスライドへ進む指示を送っている間、矢印を表示する。
 * 登壇者の端末が通信を失って「離した」信号が届かない場合に備え、一定時間信号が途絶えたら表示を消す。
 */
export const OperatorScreen = ({ speakerQrSrc }: OperatorProps): ReactElement => {
  useWakeLock();
  const [received, setReceived] = useState<ReceivedState>(initialState);

  const handleSignal = useCallback((signal: Signal): void => {
    setReceived((previous) =>
      shouldAcceptSignal(previous.latestSeqBySender, signal)
        ? {
            pressed: signal.kind === SignalKind.Press,
            latestSeqBySender: { ...previous.latestSeqBySender, [signal.senderId]: signal.seq },
          }
        : previous,
    );
  }, []);

  const { status } = useTransport(handleSignal);

  useEffect(() => {
    if (!received.pressed) return;
    const timer = setTimeout(
      () => setReceived((previous) => ({ ...previous, pressed: false })),
      STALE_TIMEOUT_MS,
    );
    return () => clearTimeout(timer);
  }, [received]);

  return (
    <ArrowScreen
      active={received.pressed}
      roleLabel="機材操作者"
      caption={received.pressed ? "登壇者が次のスライドへ進めようとしています" : "待機中"}
      status={status}
      qr={{ src: speakerQrSrc, caption: "登壇者用" }}
    />
  );
};
