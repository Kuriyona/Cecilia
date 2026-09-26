import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eapiDecrypt } from "../src/crypto/eapi";
import { createApp, startServer } from "../src/elysia";
import { search } from "../src/index";

type FetchArgs = [input: string, init: RequestInit];

const mockFetch = vi.fn<(input: string, init: RequestInit) => Promise<Response>>();
const originalFetch = globalThis.fetch;

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status });

const urlOf = (index: number): string => mockFetch.mock.calls[index]?.[0] ?? "";

const formOf = (index: number): URLSearchParams =>
  new URLSearchParams(String(mockFetch.mock.calls[index]?.[1].body));

/** eapi 请求体的明文 payload，同 test/api.test.ts 的辅助。 */
const eapiFormOf = (index: number): Record<string, unknown> => {
  const params = formOf(index).get("params") ?? "";
  return eapiDecrypt(params).data as Record<string, unknown>;
};

/** 极简原始歌曲，字段路径与 docs/probe/v3-song-detail.json 一致。 */
const rawSong = {
  id: 3437729493,
  name: "雪人",
  ar: [{ id: 12487174, name: "HOYO-MiX" }],
  al: { id: 398969728, name: "原神", picUrl: "https://p1.music.126.net/a.jpg" },
  dt: 82300,
  alia: ["Snowman"],
  fee: 0,
  st: 0,
};

const SEARCH_BODY = {
  code: 200,
  result: { songs: [rawSong], songCount: 1, hasMore: false },
};

beforeEach(() => {
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  mockFetch.mockReset();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("createApp 路由", () => {
  it("/search 转发 eapi 请求并原样返回库结果", async () => {
    mockFetch.mockResolvedValueOnce(json(SEARCH_BODY));
    const direct = await search({ keywords: "HoYo-MiX" });

    mockFetch.mockResolvedValueOnce(json(SEARCH_BODY));
    const res = await createApp().handle(
      new Request("http://localhost/search?keywords=HoYo-MiX"),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { total?: number; songs?: unknown[] };
    expect(body).toEqual(JSON.parse(JSON.stringify(direct)));
    expect(body.total).toBe(1);
    expect(body.songs?.length).toBe(1);

    expect(urlOf(1)).toBe("https://interfacepc.music.163.com/eapi/search/get");
    const payload = eapiFormOf(1);
    expect(payload.s).toBe("HoYo-MiX");
    expect(payload.type).toBe(1);
    expect(payload.limit).toBe(30);
    expect(payload.offset).toBe(0);
  });

  it("type 合法值时透传给上游", async () => {
    mockFetch.mockResolvedValueOnce(json(SEARCH_BODY));
    const res = await createApp().handle(
      new Request("http://localhost/search?keywords=x&type=100"),
    );

    expect(res.status).toBe(200);
    expect(eapiFormOf(0).type).toBe(100);
  });

  it("把入站 Cookie 原样转发给上游", async () => {
    mockFetch.mockResolvedValueOnce(json(SEARCH_BODY));
    const res = await createApp().handle(
      new Request("http://localhost/search?keywords=x", {
        headers: { cookie: "MUSIC_U=abc" },
      }),
    );

    expect(res.status).toBe(200);
    expect(eapiFormOf(0).header).toMatchObject({ MUSIC_U: "abc" });
  });

  it("非法 query 与未知路径分别返回 422 / 400 / 404", async () => {
    const app = createApp();

    const badIds = await app.handle(
      new Request("http://localhost/song/detail?ids=abc"),
    );
    expect(badIds.status).toBe(422);

    const badType = await app.handle(
      new Request("http://localhost/search?keywords=x&type=999"),
    );
    expect(badType.status).toBe(400);

    const missing = await app.handle(new Request("http://localhost/nope"));
    expect(missing.status).toBe(404);
  });

  it("枚举型 query 非法值 400，合法值放行", async () => {
    const app = createApp();
    const statusOf = async (path: string): Promise<number> =>
      (await app.handle(new Request(`http://localhost${path}`))).status;

    expect(await statusOf("/playlist/top?order=bad")).toBe(400);
    expect(await statusOf("/artist/songs?id=1&order=bad")).toBe(400);
    expect(await statusOf("/album/sale/board?type=monthly")).toBe(400);
    expect(await statusOf("/album/sale/board?albumType=2")).toBe(400);

    mockFetch.mockResolvedValueOnce(
      json({ code: 200, playlists: [{ id: 1, name: "p" }], total: 1, more: false }),
    );
    const ok = await app.handle(
      new Request("http://localhost/playlist/top?order=hot&cat=全部"),
    );
    expect(ok.status).toBe(200);
    expect(urlOf(0)).toBe("https://music.163.com/weapi/playlist/list");
  });
});

describe("auth", () => {
  const call = (headers?: Record<string, string>) =>
    createApp({ auth: { token: "s3cret" } }).handle(
      new Request("http://localhost/search?keywords=x", { headers }),
    );

  it("缺少或错误 token 返回 401", async () => {
    expect((await call()).status).toBe(401);
    expect((await call({ authorization: "Bearer wrong" })).status).toBe(401);
    expect((await call({ authorization: "s3cret" })).status).toBe(401);
  });

  it("Bearer 大小写不敏感，通过后正常返回", async () => {
    mockFetch.mockResolvedValueOnce(json(SEARCH_BODY));
    const res = await call({ authorization: "bearer s3cret" });

    expect(res.status).toBe(200);
    expect(((await res.json()) as { total?: number }).total).toBe(1);
  });
});

describe("cors", () => {
  const preflight = (origin: string) =>
    createApp({ cors: { origin: ["https://a.example"] } }).handle(
      new Request("http://localhost/search", {
        method: "OPTIONS",
        headers: { origin, "access-control-request-method": "GET" },
      }),
    );

  it("白名单来源的预检返回 204 且回写 allow-origin", async () => {
    const res = await preflight("https://a.example");

    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe(
      "https://a.example",
    );
  });

  it("非白名单来源不带 allow-origin", async () => {
    const res = await preflight("https://b.example");

    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });
});

describe("startServer", () => {
  it("非 Bun 运行时立即抛错", () => {
    // vitest 跑在 Node；若在 Bun 下执行则跳过这条断言。
    if ("Bun" in globalThis) return;
    expect(() => startServer()).toThrow(/Bun/);
  });
});
