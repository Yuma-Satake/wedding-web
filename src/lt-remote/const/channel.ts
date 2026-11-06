/**
 * 信号を中継する WebSocket のURL。開発中はローカルの Worker に接続する。
 */
export const SIGNAL_SOCKET_URL: string = import.meta.env.DEV
  ? "ws://localhost:8787/ws"
  : "wss://lt-remote-ws.yuma-satake.com/ws";

/**
 * 切断後に再接続を試みるまでの時間（ミリ秒）。
 */
export const RECONNECT_DELAY_MS = 1000;

/**
 * 通信路の生存確認を送る間隔（ミリ秒）。
 */
export const PING_INTERVAL_MS = 15000;

/**
 * 生存確認の応答を待つ時間（ミリ秒）。超えた場合は切断とみなして再接続する。
 */
export const PONG_TIMEOUT_MS = 5000;

/**
 * 長押しと判定するまでの時間（ミリ秒）。
 */
export const HOLD_THRESHOLD_MS = 300;

/**
 * 長押し中に「押している」状態を再送する間隔（ミリ秒）。
 */
export const HEARTBEAT_INTERVAL_MS = 400;

/**
 * 登壇者側の通信が途絶えたとみなして操作者側の表示を消すまでの時間（ミリ秒）。
 */
export const STALE_TIMEOUT_MS = 1500;
