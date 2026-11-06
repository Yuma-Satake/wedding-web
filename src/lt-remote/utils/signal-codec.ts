import { Direction, SignalKind, type Signal } from "../types/signal";

const SEPARATOR = ":";

const isSignalKind = (value: string): value is SignalKind =>
  Object.values<string>(SignalKind).includes(value);

const isDirection = (value: string): value is Direction =>
  Object.values<string>(Direction).includes(value);

/**
 * 信号をブローカーへ送る文字列に変換する。
 */
export const encodeSignal = (signal: Signal): string =>
  [signal.kind, signal.direction, signal.senderId, String(signal.seq)].join(SEPARATOR);

/**
 * ブローカーから受け取った文字列を信号に変換する。形式が合わない場合は null を返す。
 */
export const decodeSignal = (raw: string): Signal | null => {
  const [kind, direction, senderId, seqText, ...rest] = raw.split(SEPARATOR);
  if (rest.length > 0 || kind === undefined || direction === undefined) return null;
  if (senderId === undefined || seqText === undefined) return null;
  if (senderId === "" || seqText === "") return null;
  if (!isSignalKind(kind) || !isDirection(direction)) return null;
  const seq = Number(seqText);
  if (!Number.isFinite(seq)) return null;
  return { kind, direction, senderId, seq };
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
