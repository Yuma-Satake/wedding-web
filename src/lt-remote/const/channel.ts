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
 * 取り消されるまで、登壇者の端末が依頼を送り直す間隔（ミリ秒）。
 * 接続が一時的に切れた・操作者が後から画面を開いた場合でも依頼が届くようにするためのもの。
 */
export const RESEND_INTERVAL_MS = 1000;
