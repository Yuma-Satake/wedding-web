import type { ReactElement } from "react";
import { useHold } from "../hooks/useHold";
import { useTransport } from "../hooks/useTransport";
import { useWakeLock } from "../hooks/useWakeLock";
import { ArrowScreen } from "./ArrowScreen";

const ignoreSignal = (): void => undefined;

/**
 * 登壇者用の画面。長押ししている間、次のスライドへ進む指示を操作者へ送る。
 */
export const SpeakerScreen = (): ReactElement => {
  useWakeLock();
  const { transport, status } = useTransport(ignoreSignal);
  const { holding, handlers } = useHold(transport);

  return (
    <ArrowScreen
      active={holding}
      roleLabel="登壇者"
      caption={holding ? "次のスライドへ進む指示を送信中" : "長押しで次のスライドへ"}
      status={status}
      {...handlers}
    />
  );
};
