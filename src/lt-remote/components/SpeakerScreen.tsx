import type { ReactElement } from "react";
import { useSlideRequest } from "../hooks/useSlideRequest";
import { useWakeLock } from "../hooks/useWakeLock";
import { Direction } from "../types/signal";
import { ArrowScreen } from "./ArrowScreen";

const CAPTION_BY_PENDING = {
  [Direction.Forward]: "次のスライドへ進む指示を\n送信しました",
  [Direction.Back]: "前のスライドへ戻る指示を\n送信しました",
} as const satisfies Record<Direction, string>;

const IDLE_CAPTION = "左をタップで戻る\n右をタップで進む";

/**
 * 登壇者用の画面。画面を左右に分け、左半分をタップすると前のスライドへ戻る指示を、
 * 右半分をタップすると次のスライドへ進む指示を操作者へ送る。
 * 指示は操作者がスライドを送って取り消すまで表示し続ける。
 */
export const SpeakerScreen = (): ReactElement => {
  useWakeLock();
  const { pending, status, handlers } = useSlideRequest();

  return (
    <ArrowScreen
      activeDirection={pending}
      split
      roleLabel="登壇者"
      caption={pending === null ? IDLE_CAPTION : CAPTION_BY_PENDING[pending]}
      status={status}
      {...handlers}
    />
  );
};
