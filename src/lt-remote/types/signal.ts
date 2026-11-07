/**
 * 端末の間で送る信号の種類。
 * Request は登壇者がスライド送りを頼む信号、Clear は操作者が送り終えて依頼を取り消す信号。
 */
export const SignalKind = {
  Request: "request",
  Clear: "clear",
} as const;

export type SignalKind = (typeof SignalKind)[keyof typeof SignalKind];

/**
 * スライドを送る向き。
 */
export const Direction = {
  Forward: "forward",
  Back: "back",
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

/**
 * スライド送りの依頼と、その取り消しを表す信号。
 * senderId と seq は依頼した登壇者の端末と依頼ごとの番号で、取り消しの信号も取り消す依頼の値をそのまま持つ。
 */
export type Signal = {
  kind: SignalKind;
  direction: Direction;
  senderId: string;
  seq: number;
};

/**
 * 通信路の接続状態。
 */
export const ConnectionStatus = {
  Connecting: "connecting",
  Connected: "connected",
} as const;

export type ConnectionStatus = (typeof ConnectionStatus)[keyof typeof ConnectionStatus];
