import type { CSSProperties, HTMLAttributes, ReactElement } from "react";
import { ConnectionStatus } from "../types/signal";

type ArrowScreenProps = {
  active: boolean;
  roleLabel: string;
  caption: string;
  status: ConnectionStatus;
  qr?: { src: string; caption: string };
} & Pick<
  HTMLAttributes<HTMLElement>,
  "onPointerDown" | "onPointerUp" | "onPointerCancel" | "onContextMenu"
>;

const createChevronTile = (fill: string): string =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" preserveAspectRatio="none"><polygon points="0,0 24,0 56,50 24,100 0,100 32,50" fill="${fill}"/></svg>`,
  )}")`;

const ACTIVE_TILE = createChevronTile("#f8f4f0");
const IDLE_TILE = createChevronTile("#f6e0de");

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
  qr,
  ...pointerHandlers
}: ArrowScreenProps): ReactElement => (
  <main
    data-active={active}
    className={`relative flex h-dvh w-full touch-none flex-col items-center justify-center overflow-hidden select-none [-webkit-touch-callout:none] ${
      active ? "bg-deep-red" : "bg-ivory"
    }`}
    {...pointerHandlers}
  >
    <div
      aria-hidden="true"
      className={`absolute inset-0 ${active ? "[animation:lt-remote-flow_0.9s_linear_infinite]" : ""}`}
      style={chevronLayerStyle(active)}
    />

    <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-sm tracking-widest">
      <span className="rounded-full bg-ivory px-4 py-1.5 text-ink">{roleLabel}</span>
      <span
        className="flex items-center gap-2 rounded-full bg-ivory px-4 py-1.5 text-ink"
        data-status={status}
      >
        <span
          className={`h-3 w-3 rounded-full ${
            status === ConnectionStatus.Connected ? "bg-leaf" : "animate-pulse bg-rose-taupe"
          }`}
        />
        {status === ConnectionStatus.Connected ? "接続中" : "接続しています"}
      </span>
    </header>

    <p
      className={`relative z-10 mx-6 rounded-3xl bg-ivory px-8 py-6 text-center text-3xl font-bold tracking-widest sm:text-5xl ${
        active ? "text-deep-red" : "text-ink"
      }`}
    >
      {caption}
    </p>

    {qr === undefined ? null : (
      <figure className="absolute right-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-10 flex flex-col items-center gap-2 rounded-xl bg-ivory p-3 text-xs text-ink">
        <img src={qr.src} alt={qr.caption} className="h-28 w-28" />
        <figcaption>{qr.caption}</figcaption>
      </figure>
    )}
  </main>
);
