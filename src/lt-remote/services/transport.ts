import {
  PING_INTERVAL_MS,
  PONG_TIMEOUT_MS,
  RECONNECT_DELAY_MS,
  SIGNAL_SOCKET_URL,
} from "../const/channel";
import { ConnectionStatus, type Signal } from "../types/signal";
import { decodeSignal, encodeSignal } from "../utils/signal-codec";

export type Transport = {
  publish: (signal: Signal) => void;
  close: () => void;
};

type TransportOptions = {
  onSignal: (signal: Signal) => void;
  onStatus: (status: ConnectionStatus) => void;
};

const PING = "ping";
const PONG = "pong";

/**
 * 中継用の WebSocket に接続し、信号の送受信を行う。
 * 切断や応答の途絶を検知したら、閉じられるまで再接続を繰り返す。
 */
export const connectTransport = ({ onSignal, onStatus }: TransportOptions): Transport => {
  const state: { socket: WebSocket | null; closed: boolean } = { socket: null, closed: false };

  const open = (): void => {
    const socket = new WebSocket(SIGNAL_SOCKET_URL);
    state.socket = socket;
    const pong = { receivedAt: Date.now() };
    const pingTimer = setInterval(() => {
      if (socket.readyState !== WebSocket.OPEN) return;
      if (Date.now() - pong.receivedAt > PING_INTERVAL_MS + PONG_TIMEOUT_MS) {
        socket.close();
        return;
      }
      socket.send(PING);
    }, PING_INTERVAL_MS);

    socket.addEventListener("open", () => {
      pong.receivedAt = Date.now();
      onStatus(ConnectionStatus.Connected);
    });
    socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") return;
      if (event.data === PONG) {
        pong.receivedAt = Date.now();
        return;
      }
      const signal = decodeSignal(event.data);
      if (signal !== null) onSignal(signal);
    });
    socket.addEventListener("close", () => {
      clearInterval(pingTimer);
      if (state.closed) return;
      onStatus(ConnectionStatus.Connecting);
      setTimeout(open, RECONNECT_DELAY_MS);
    });
  };

  open();

  return {
    publish: (signal) => {
      if (state.socket?.readyState === WebSocket.OPEN) state.socket.send(encodeSignal(signal));
    },
    close: () => {
      state.closed = true;
      state.socket?.close();
    },
  };
};
