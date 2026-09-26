import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { request } from "../src/client";
import { eapiDecrypt } from "../src/crypto/eapi";
import { NeteaseApiError } from "../src/errors";

type FetchArgs = [input: string, init: RequestInit];

const mockFetch = vi.fn<(input: string, init: RequestInit) => Promise<Response>>();
const originalFetch = globalThis.fetch;

const respond = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status });

beforeEach(() => {
  // 测试替身：只覆盖本项目使用的 (url, init) 调用形态
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  mockFetch.mockReset();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("request", () => {
  it("eapi：发往 interfacepc 且 params 可解密、Cookie 为 eapi header", async () => {
    mockFetch.mockResolvedValueOnce(respond({ code: 200, ok: true }));

    const result = await request("/api/test/get", { id: 1 }, "eapi");
    const [url, init] = mockFetch.mock.calls[0] as FetchArgs;
    const params = new URLSearchParams(String(init.body)).get("params") ?? "";
    const decrypted = eapiDecrypt(params);

    expect(result.body).toEqual({ code: 200, ok: true });
    expect(url).toBe("https://interfacepc.music.163.com/eapi/test/get");
    expect(decrypted.uri).toBe("/api/test/get");
    expect(decrypted.data).toMatchObject({ id: 1, e_r: false });
    const payload = decrypted.data as { header: Record<string, string> };
    expect(payload.header.requestId).toMatch(/^\d+_\d{4}$/);
    expect(payload.header.os).toBe("pc");
    expect(init.headers).toMatchObject({
      "User-Agent": expect.stringContaining("NeteaseMusic"),
    });
    expect(JSON.stringify(init.headers)).toContain("os=pc");
    expect(JSON.stringify(init.headers)).not.toContain("WNMCID");
  });

  it("weapi：发往 music.163.com/weapi 且带 encSecKey 与 Referer", async () => {
    mockFetch.mockResolvedValueOnce(respond({ code: 200 }));

    await request("/api/test/post", { s: "x" }, "weapi");
    const [url, init] = mockFetch.mock.calls[0] as FetchArgs;
    const form = new URLSearchParams(String(init.body));

    expect(url).toBe("https://music.163.com/weapi/test/post");
    expect(form.get("params")).toBeTruthy();
    expect(form.get("encSecKey")).toHaveLength(256);
    expect(init.headers).toMatchObject({
      Referer: "https://music.163.com",
    });
    expect(JSON.stringify(init.headers)).toContain("WNMCID");
  });

  it("api：明文回退发往 interface.music.163.com", async () => {
    mockFetch.mockResolvedValueOnce(respond({ code: 200 }));

    await request("/api/test/plain", { id: 7 }, "api");
    const [url, init] = mockFetch.mock.calls[0] as FetchArgs;

    expect(url).toBe("https://interface.music.163.com/api/test/plain");
    expect(String(init.body)).toContain("id=7");
  });

  it("realIP 写入 X-Real-IP / X-Forwarded-For", async () => {
    mockFetch.mockResolvedValueOnce(respond({ code: 200 }));

    await request("/api/test/get", {}, "eapi", { realIP: "1.2.3.4" });
    const [, init] = mockFetch.mock.calls[0] as FetchArgs;

    expect(init.headers).toMatchObject({
      "X-Real-IP": "1.2.3.4",
      "X-Forwarded-For": "1.2.3.4",
    });
  });

  it("code 301 抛 NeteaseApiError(301)", async () => {
    mockFetch.mockResolvedValueOnce(respond({ code: 301, msg: "需要登录" }));

    await expect(request("/api/test/get", {}, "eapi")).rejects.toMatchObject({
      name: "NeteaseApiError",
      code: 301,
      uri: "/api/test/get",
      message: expect.stringContaining("需要登录"),
    });
  });

  it("acceptCodes 允许非 200 的成功码", async () => {
    mockFetch.mockResolvedValueOnce(respond({ code: 201, data: [] }));

    const result = await request(
      "/api/test/get",
      {},
      "eapi",
      undefined,
      [200, 201],
    );

    expect(result.body).toEqual({ code: 201, data: [] });
  });

  it("非 JSON 响应抛 NeteaseApiError", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response("<html>blocked</html>", { status: 403 }),
    );

    await expect(
      request("/api/test/get", {}, "eapi"),
    ).rejects.toBeInstanceOf(NeteaseApiError);
  });

  it("网络异常抛 code -1", async () => {
    mockFetch.mockRejectedValueOnce(new Error("boom"));

    await expect(request("/api/test/get", {}, "eapi")).rejects.toMatchObject({
      code: -1,
      message: expect.stringContaining("boom"),
    });
  });
});
