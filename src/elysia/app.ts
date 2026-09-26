import { cors, type CORSConfig } from "@elysiajs/cors";
import { Elysia, type AnyElysia } from "elysia";
import { timingSafeEqual } from "node:crypto";
import { registerRoutes } from "./routes";

export interface AuthOptions {
  /** 静态 token；请求需带 `Authorization: Bearer <token>`。 */
  token: string;
}

export interface CeciliaAppOptions {
  /** 透传给 @elysiajs/cors；不传则完全不启用 CORS。 */
  cors?: CORSConfig;
  /** 不传则全部路由公开。 */
  auth?: AuthOptions;
}

/** scheme 大小写不敏感，比较用 timingSafeEqual（长度不等直接 false）。 */
const isAuthorized = (request: Request, token: string): boolean => {
  const header = request.headers.get("authorization");
  if (header === null) return false;
  const [scheme, value, ...rest] = header.split(" ");
  if (rest.length > 0 || scheme?.toLowerCase() !== "bearer" || value === undefined) {
    return false;
  }
  const expected = Buffer.from(token, "utf8");
  const actual = Buffer.from(value, "utf8");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

/** 中间件风格插件：挂在实例上后，后续注册的路由都要先过鉴权。 */
const withAuth =
  (options: AuthOptions) =>
  (app: AnyElysia): AnyElysia =>
    app.onBeforeHandle(({ request, set }) => {
      if (isAuthorized(request, options.token)) return;
      set.status = 401;
      return { code: 401, message: "Unauthorized" };
    });

/**
 * 把 37 个 Cecilia 函数各注册成一条 GET 路由，返回可直接 `.use()` 或 `.listen()` 的 Elysia 实例。
 * CORS 先注册（预检早于鉴权短路），再鉴权，最后才是路由。
 */
export const createApp = (options?: CeciliaAppOptions): AnyElysia => {
  let app: AnyElysia = new Elysia();
  if (options?.cors !== undefined) {
    app = app.use(cors(options.cors));
  }
  if (options?.auth !== undefined) {
    app = withAuth(options.auth)(app);
  }
  return registerRoutes(app);
};
