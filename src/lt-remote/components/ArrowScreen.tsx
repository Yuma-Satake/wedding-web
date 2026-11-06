import type { CSSProperties, HTMLAttributes, ReactElement } from "react";
import { ConnectionStatus } from "../types/signal";

type ArrowScreenProps = {
  active: boolean;
  roleLabel: string;
  caption: string;
  status: ConnectionStatus;
} & Pick<
  HTMLAttributes<HTMLElement>,
  "onPointerDown" | "onPointerUp" | "onPointerCancel" | "onContextMenu"
>;

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
 * 全画面の矢印表示。画面全体を埋める山形が右へ流れ、次のスライドへ進む指示が出ている間は赤地で流れ続ける。
 */
export const ArrowScreen = ({
  active,
  roleLabel,
  caption,
  status,
  ...pointerHandlers
}: ArrowScreenProps): ReactElement => (
  <main
    data-active={active}
    className={`relative flex h-dvh w-full touch-none flex-col items-center justify-center overflow-hidden select-none [-webkit-touch-callout:none] ${
      active ? "bg-[#1d4ed8]" : "bg-[#f1f6ff]"
    }`}
    {...pointerHandlers}
  >
    <div
      aria-hidden="true"
      className={`absolute inset-0 ${active ? "[animation:lt-remote-flow_0.9s_linear_infinite]" : ""}`}
      style={chevronLayerStyle(active)}
    />

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
      className={`relative z-10 mx-6 rounded-3xl bg-[#f1f6ff] px-8 py-6 text-center text-3xl font-bold tracking-widest sm:text-5xl ${
        active ? "text-[#1d4ed8]" : "text-slate-900"
      }`}
    >
      {caption}
    </p>
  </main>
);
