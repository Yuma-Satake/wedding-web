import type { CSSProperties, HTMLAttributes, ReactElement } from "react";
import { ConnectionStatus, Direction } from "../types/signal";

type ArrowScreenProps = {
  activeDirection: Direction | null;
  split?: boolean;
  roleLabel: string;
  caption: string;
  status: ConnectionStatus;
} & Pick<
  HTMLAttributes<HTMLElement>,
  "onPointerDown" | "onPointerUp" | "onPointerCancel" | "onContextMenu"
>;

type Lane = {
  direction: Direction;
  positionClassName: string;
};

const SPLIT_LANES: readonly Lane[] = [
  { direction: Direction.Back, positionClassName: "left-0 w-1/2" },
  { direction: Direction.Forward, positionClassName: "right-0 w-1/2" },
];

const createChevronTile = (fill: string): string =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" preserveAspectRatio="none"><polygon points="0,0 24,0 56,50 24,100 0,100 32,50" fill="${fill}"/></svg>`,
  )}")`;

const ACTIVE_TILE = createChevronTile("#f1f6ff");
const IDLE_TILE = createChevronTile("#dbe8ff");

const chevronLayerStyle = (active: boolean): CSSProperties => ({
  backgroundImage: active ? ACTIVE_TILE : IDLE_TILE,
  backgroundSize: "60dvh 100dvh",
  backgroundRepeat: "repeat-x",
});

/**
 * 全画面の矢印表示。画面全体を埋める山形が進む向きへ流れ、スライドを送る指示が出ている間は濃い青地で流れ続ける。
 * 戻る向きは山形を左右反転して左へ流す。split のときは画面を左右に分け、左を戻る・右を進むの領域として表示する。
 */
export const ArrowScreen = ({
  activeDirection,
  split = false,
  roleLabel,
  caption,
  status,
  ...pointerHandlers
}: ArrowScreenProps): ReactElement => {
  const lanes: readonly Lane[] = split
    ? SPLIT_LANES
    : [{ direction: activeDirection ?? Direction.Forward, positionClassName: "inset-x-0" }];

  return (
    <main
      data-active={activeDirection !== null}
      className="relative flex h-dvh w-full touch-none flex-col items-center justify-center overflow-hidden bg-[#f1f6ff] select-none [-webkit-touch-callout:none]"
      {...pointerHandlers}
    >
      {lanes.map((lane) => {
        const laneActive = activeDirection === lane.direction;
        return (
          <div
            key={lane.direction}
            data-direction={lane.direction}
            data-active={laneActive}
            aria-hidden="true"
            className={`absolute inset-y-0 overflow-hidden ${lane.positionClassName} ${
              laneActive ? "bg-[#1d4ed8]" : "bg-[#f1f6ff]"
            }`}
          >
            <div
              className={`absolute inset-0 ${lane.direction === Direction.Back ? "scale-x-[-1]" : ""} ${
                laneActive ? "[animation:lt-remote-flow_0.9s_linear_infinite]" : ""
              }`}
              style={chevronLayerStyle(laneActive)}
            />
          </div>
        );
      })}

      {split && (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2 z-[5] w-px bg-[#1d4ed8]/30"
        />
      )}

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-sm tracking-widest">
        <span className="rounded-full bg-[#f1f6ff] px-4 py-1.5 text-slate-900">{roleLabel}</span>
        <span
          className="flex items-center gap-2 rounded-full bg-[#f1f6ff] px-4 py-1.5 text-slate-900"
          data-status={status}
        >
          <span
            className={`h-3 w-3 rounded-full ${
              status === ConnectionStatus.Connected ? "bg-leaf" : "animate-pulse bg-slate-400"
            }`}
          />
          {status === ConnectionStatus.Connected ? "接続済み" : "接続を試みています"}
        </span>
      </header>

      <p
        className={`pointer-events-none relative z-10 mx-6 rounded-3xl whitespace-pre-line bg-[#f1f6ff] px-8 py-6 text-center text-3xl font-bold tracking-widest sm:text-5xl ${
          activeDirection !== null ? "text-[#1d4ed8]" : "text-slate-900"
        }`}
      >
        {caption}
      </p>
    </main>
  );
};
