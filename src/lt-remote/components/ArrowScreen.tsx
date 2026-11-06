import type { HTMLAttributes, ReactElement } from "react";
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

/**
 * 全画面の矢印表示。次のスライドへ進む指示が出ている間は赤地に矢印が右へ進む動きになる。
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
    className={`relative flex h-dvh w-full touch-none flex-col items-center justify-center select-none [-webkit-touch-callout:none] ${
      active ? "bg-deep-red text-ivory" : "bg-ivory text-ink"
    }`}
    {...pointerHandlers}
  >
    <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top))] text-sm tracking-widest">
      <span>{roleLabel}</span>
      <span className="flex items-center gap-2" data-status={status}>
        <span
          className={`h-3 w-3 rounded-full ${
            status === ConnectionStatus.Connected ? "bg-leaf" : "animate-pulse bg-rose-taupe"
          }`}
        />
        {status === ConnectionStatus.Connected ? "接続中" : "接続しています"}
      </span>
    </header>

    <svg
      viewBox="0 0 200 120"
      className={`w-[70vmin] ${active ? "text-ivory [animation:lt-remote-advance_0.7s_ease-in-out_infinite]" : "text-blush"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="14"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 60H170" />
      <path d="M120 15L175 60L120 105" />
    </svg>

    <p className="mt-10 px-8 text-center text-2xl font-bold tracking-widest sm:text-4xl">
      {caption}
    </p>

    {qr === undefined ? null : (
      <figure className="absolute right-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-2 rounded-xl bg-ivory p-3 text-xs text-ink">
        <img src={qr.src} alt={qr.caption} className="h-28 w-28" />
        <figcaption>{qr.caption}</figcaption>
      </figure>
    )}
  </main>
);
