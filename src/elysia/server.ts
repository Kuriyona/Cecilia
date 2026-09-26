import type { AnyElysia } from "elysia";
import { createApp, type CeciliaAppOptions } from "./app";

export interface CeciliaServerOptions extends CeciliaAppOptions {
  /** 默认 `process.env.HOST ?? "127.0.0.1"`。 */
  host?: string;
  /** 默认 `process.env.PORT ?? 3000`；非法 PORT 直接抛错。 */
  port?: number;
}

export interface CeciliaServer {
  /** 关闭用 `app.stop()`。 */
  app: AnyElysia;
  /** 形如 `http://127.0.0.1:3000`（取自实际监听地址，`port: 0` 也可用）。 */
  url: string;
}

const readPortEnv = (): number => {
  const raw = process.env.PORT;
  if (raw === undefined || raw === "") return 3000;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`PORT 环境变量非法: ${raw}`);
  }
  return port;
};

/** 同步返回：Bun 的 listen 是同步的，端口占用会同步抛出。 */
export const startServer = (options?: CeciliaServerOptions): CeciliaServer => {
  if (!("Bun" in globalThis)) {
    throw new Error(
      "@kuriyona/cecilia/elysia 的 startServer 需要 Bun 运行时（例如 bun run server.ts）；Node 下请用 createApp() 自备适配器。",
    );
  }
  const port = options?.port ?? readPortEnv();
  const host = options?.host ?? process.env.HOST ?? "127.0.0.1";
  const app = createApp(options);
  app.listen({ hostname: host, port });
  const url = app.server?.url.origin ?? `http://${host}:${port}`;
  return { app, url };
};
