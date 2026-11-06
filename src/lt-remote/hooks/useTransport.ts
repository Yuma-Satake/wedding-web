import { useEffect, useState } from "react";
import { connectTransport, type Transport } from "../services/transport";
import { ConnectionStatus, type Signal } from "../types/signal";

type UseTransportResult = {
  transport: Transport | null;
  status: ConnectionStatus;
};

/**
 * 通信路への接続を画面の表示期間に合わせて管理する。
 */
export const useTransport = (onSignal: (signal: Signal) => void): UseTransportResult => {
  const [transport, setTransport] = useState<Transport | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.Connecting);

  useEffect(() => {
    const connected = connectTransport({ onSignal, onStatus: setStatus });
    setTransport(connected);
    return () => {
      connected.close();
      setTransport(null);
    };
  }, [onSignal]);

  return { transport, status };
};
