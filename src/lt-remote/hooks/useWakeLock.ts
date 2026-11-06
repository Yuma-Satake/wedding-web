import { useEffect } from "react";

/**
 * 画面がスリープしないよう、表示中は Wake Lock を保持する。
 * タブが背面に回ると解放されるため、前面に戻ったときに取り直す。
 */
export const useWakeLock = (): void => {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;

    const acquire = async (): Promise<WakeLockSentinel | null> => {
      try {
        return await navigator.wakeLock.request("screen");
      } catch (error) {
        console.warn(error instanceof Error ? error.message : "Unknown error");
        return null;
      }
    };

    const sentinelPromise = { current: acquire() };
    const handleVisibility = (): void => {
      if (document.visibilityState !== "visible") return;
      sentinelPromise.current = acquire();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      void sentinelPromise.current.then((sentinel) => sentinel?.release());
    };
  }, []);
};
