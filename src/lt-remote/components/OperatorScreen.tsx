import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { useTransport } from "../hooks/useTransport";
import { useWakeLock } from "../hooks/useWakeLock";
import type { Transport } from "../services/transport";
import { Direction, SignalKind, type Signal } from "../types/signal";
import { isClearedRequest, shouldReplaceRequest } from "../utils/signal-codec";
import { ArrowScreen } from "./ArrowScreen";

const CAPTION_BY_REQUEST = {
  [Direction.Forward]: "登壇者が次のスライドへ\n進めようとしています\n送ったら画面をタップ",
  [Direction.Back]: "登壇者が前のスライドへ\n戻そうとしています\n送ったら画面をタップ",
} as const satisfies Record<Direction, string>;

const withCleared = (
  clearedSeqBySender: Readonly<Record<string, number>>,
  signal: Signal,
): Record<string, number> => ({
  ...clearedSeqBySender,
  [signal.senderId]: Math.max(clearedSeqBySender[signal.senderId] ?? -Infinity, signal.seq),
});

/**
 * 機材操作者用の画面。登壇者からスライド送りの依頼が届くと、その向きの矢印を表示し続ける。
 * スライドを送った後に画面をタップすると依頼を取り消し、登壇者の画面の表示も消す。
 */
export const OperatorScreen = (): ReactElement => {
  useWakeLock();
  const [request, setRequest] = useState<Signal | null>(null);
  const clearedSeqBySender = useRef<Record<string, number>>({});
  const transportRef = useRef<Transport | null>(null);

  const handleSignal = useCallback((signal: Signal): void => {
    if (signal.kind === SignalKind.Clear) {
      // 別の操作者の端末で取り消された場合も表示を消す
      clearedSeqBySender.current = withCleared(clearedSeqBySender.current, signal);
      setRequest((previous) =>
        previous !== null && isClearedRequest(clearedSeqBySender.current, previous)
          ? null
          : previous,
      );
      return;
    }
    if (isClearedRequest(clearedSeqBySender.current, signal)) {
      // 取り消しが届かず登壇者が送り直してきた場合は、取り消しを伝え直す
      transportRef.current?.publish({ ...signal, kind: SignalKind.Clear });
      return;
    }
    setRequest((previous) => (shouldReplaceRequest(previous, signal) ? signal : previous));
  }, []);

  const { transport, status } = useTransport(handleSignal);

  useEffect(() => {
    transportRef.current = transport;
  }, [transport]);

  const clearRequest = (): void => {
    if (request === null) return;
    clearedSeqBySender.current = withCleared(clearedSeqBySender.current, request);
    transport?.publish({ ...request, kind: SignalKind.Clear });
    setRequest(null);
  };

  return (
    <ArrowScreen
      activeDirection={request?.direction ?? null}
      roleLabel="機材操作者"
      caption={request === null ? "待機中" : CAPTION_BY_REQUEST[request.direction]}
      status={status}
      onClick={clearRequest}
    />
  );
};
