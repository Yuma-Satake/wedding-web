import { SignalKind, type Signal } from "../types/signal";

const SEPARATOR = ":";

/**
 * 信号をブローカーへ送る文字列に変換する。
 */
export const encodeSignal = (signal: Signal): string =>
  [signal.kind, signal.senderId, String(signal.seq)].join(SEPARATOR);

/**
 * ブローカーから受け取った文字列を信号に変換する。形式が合わない場合は null を返す。
 */
export const decodeSignal = (raw: string): Signal | null => {
  const [kind, senderId, seqText, ...rest] = raw.split(SEPARATOR);
  if (rest.length > 0 || senderId === undefined || seqText === undefined) return null;
  if (senderId === "" || seqText === "") return null;
  const seq = Number(seqText);
  if (!Number.isFinite(seq)) return null;
  if (kind === SignalKind.Press) return { kind: SignalKind.Press, senderId, seq };
  if (kind === SignalKind.Release) return { kind: SignalKind.Release, senderId, seq };
  return null;
};

/**
 * 受け取った信号を採用するか判定する。
 * 同じ送信元で、すでに採用した連番より古い信号（別ブローカー経由で遅れて届いたもの）は捨てる。
 */
export const shouldAcceptSignal = (
  latestSeqBySender: Readonly<Record<string, number>>,
  signal: Signal,
): boolean => {
  const latest = latestSeqBySender[signal.senderId];
  return latest === undefined || signal.seq >= latest;
};
