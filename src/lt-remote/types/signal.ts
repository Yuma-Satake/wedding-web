/**
 * 登壇者から操作者へ送る信号の種類。
 */
export const SignalKind = {
  Press: "press",
  Release: "release",
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
 * 登壇者の長押しの状態を表す信号。
 * 端末ごとに送信元を区別し、同じ送信元の中で順序が逆転した信号を捨てるために連番を持つ。
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
