import type { ReactElement } from "react";
import { useHold } from "../hooks/useHold";
import { useTransport } from "../hooks/useTransport";
import { useWakeLock } from "../hooks/useWakeLock";
import { Direction } from "../types/signal";
import { ArrowScreen } from "./ArrowScreen";

const ignoreSignal = (): void => undefined;

const CAPTION_BY_HOLDING = {
  [Direction.Forward]: "次のスライドへ進む指示を送信中",
  [Direction.Back]: "前のスライドへ戻る指示を送信中",
} as const satisfies Record<Direction, string>;

const IDLE_CAPTION = "左を長押しで戻る\n右を長押しで進む";

/**
 * 登壇者用の画面。画面を左右に分け、左半分を長押しすると前のスライドへ戻る指示を、
 * 右半分を長押しすると次のスライドへ進む指示を、押している間だけ操作者へ送る。
 */
export const SpeakerScreen = (): ReactElement => {
  useWakeLock();
  const { transport, status } = useTransport(ignoreSignal);
  const { holding, handlers } = useHold(transport);

  return (
    <ArrowScreen
      activeDirection={holding}
      split
      roleLabel="登壇者"
      caption={holding === null ? IDLE_CAPTION : CAPTION_BY_HOLDING[holding]}
      status={status}
      {...handlers}
    />
  );
};
