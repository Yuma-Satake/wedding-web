import { DurableObject } from "cloudflare:workers";

type Env = {
  SIGNAL_ROOM: DurableObjectNamespace<SignalRoom>;
};

const ROOM_NAME = "main";

const ALLOWED_ORIGINS: readonly string[] = [
  "https://wedding.yuma-satake.com",
  "http://localhost:4321",
];

const isAllowedOrigin = (origin: string | null): boolean =>
  origin !== null && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".vercel.app"));

/**
 * 接続した全端末の間で、受け取った信号をそのまま中継する単一の部屋。
 * Durable Object を使うことで、別々の接続が同じインスタンスに集まる。
 */
export class SignalRoom extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // 生存確認の ping には、Durable Object を起こさずに pong を返す
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
  }

  override fetch(): Response {
    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  override webSocketMessage(sender: WebSocket, message: string | ArrayBuffer): void {
    if (typeof message !== "string") return;
    this.ctx
      .getWebSockets()
      .filter((socket) => socket !== sender)
      .forEach((socket) => socket.send(message));
  }

  override webSocketClose(socket: WebSocket, code: number): void {
    socket.close(code);
  }
}

export default {
  fetch(request: Request, env: Env): Response | Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/ws") return new Response("Not Found", { status: 404 });
    if (request.headers.get("Upgrade") !== "websocket")
      return new Response("Expected WebSocket", { status: 426 });
    if (!isAllowedOrigin(request.headers.get("Origin")))
      return new Response("Forbidden", { status: 403 });

    const room = env.SIGNAL_ROOM.get(env.SIGNAL_ROOM.idFromName(ROOM_NAME));
    return room.fetch(request);
  },
} satisfies ExportedHandler<Env>;
