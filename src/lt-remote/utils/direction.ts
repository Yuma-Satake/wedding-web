import { Direction } from "../types/signal";

/**
 * 画面を左右に分けたときの、触れた位置が属する側に対応する向きを返す。
 * 左半分は戻る、右半分は進む。
 */
export const detectDirection = (pointerX: number, left: number, width: number): Direction =>
  pointerX < left + width / 2 ? Direction.Back : Direction.Forward;
