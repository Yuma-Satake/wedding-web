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
 * 依頼がすでに取り消されたものか判定する。
 * 送り直しの依頼が取り消しの後に届いた場合に、表示し直さないようにするためのもの。
 */
export const isClearedRequest = (
  clearedSeqBySender: Readonly<Record<string, number>>,
  signal: Signal,
): boolean => {
  const cleared = clearedSeqBySender[signal.senderId];
  return cleared !== undefined && signal.seq <= cleared;
};

/**
 * 表示中の依頼を受け取った依頼で置き換えるか判定する。
 * 同じ登壇者からの古い依頼（遅れて届いたもの）では置き換えない。
 */
export const shouldReplaceRequest = (current: Signal | null, signal: Signal): boolean =>
  current === null || current.senderId !== signal.senderId || signal.seq >= current.seq;
