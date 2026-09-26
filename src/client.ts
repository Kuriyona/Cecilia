import { randomInt } from "node:crypto";
import { buildCookieObject, cookieToString } from "./cookies";
import {
  API_DOMAIN,
  EAPI_DOMAIN,
  EAPI_UA,
  WEAPI_DOMAIN,
  WEAPI_UA,
  eapiEncrypt,
  weapiEncrypt,
} from "./crypto";
import { NeteaseApiError } from "./errors";
import { postForm } from "./http";
import { num } from "./utils/num";

export type Crypto = "eapi" | "weapi" | "api";

export interface RequestOptions {
  cookie?: string | Record<string, string>;
  realIP?: string;
  timeout?: number;
  ua?: string;
}

export interface RawResponse {
  status: number;
  body: unknown;
  cookies: string[];
}

const generateRequestId = (): string =>
  `${Date.now()}_${String(randomInt(1000)).padStart(4, "0")}`;

const readCode = (body: unknown): number | undefined => {
  if (typeof body !== "object" || body === null || !("code" in body)) {
    return undefined;
  }
  return num(body.code);
};

export async function request(
  uri: string,
  data: Record<string, unknown>,
  crypto: Crypto,
  options?: RequestOptions,
  acceptCodes: number[] = [200],
): Promise<RawResponse> {
  const timeout = options?.timeout ?? 10_000;
  const cookie = buildCookieObject(options?.cookie);
  const csrf = cookie.__csrf ?? "";
  const payload: Record<string, unknown> = { ...data, e_r: false };
  const headers: Record<string, string> = {};
  let url: string;
  let body: string;

  if (crypto === "eapi") {
    const header: Record<string, string> = {
      osver: cookie.osver ?? "",
      deviceId: cookie.deviceId ?? "",
      os: cookie.os ?? "",
      appver: cookie.appver ?? "",
      versioncode: "140",
      mobilename: "",
      buildver: String(Date.now()).slice(0, 10),
      resolution: "1920x1080",
      __csrf: csrf,
      channel: cookie.channel ?? "",
      requestId: generateRequestId(),
    };
    if (cookie.MUSIC_U) header.MUSIC_U = cookie.MUSIC_U;
    payload.header = header;
    url = EAPI_DOMAIN + uri.replace(/^\/api/, "/eapi");
    headers["User-Agent"] = options?.ua ?? EAPI_UA;
    headers.Cookie = cookieToString(header);
    body = new URLSearchParams({ params: eapiEncrypt(uri, payload) }).toString();
  } else if (crypto === "weapi") {
    payload.csrf_token = csrf;
    url = `${WEAPI_DOMAIN}/weapi/${uri.slice(5)}`;
    headers.Referer = WEAPI_DOMAIN;
    headers["User-Agent"] = options?.ua ?? WEAPI_UA;
    headers.Cookie = cookieToString(cookie);
    body = new URLSearchParams({ ...weapiEncrypt(payload) }).toString();
  } else {
    const form = new URLSearchParams();
    for (const [key, value] of Object.entries(payload)) {
      form.append(key, String(value));
    }
    url = API_DOMAIN + uri;
    headers.Referer = WEAPI_DOMAIN;
    headers["User-Agent"] = options?.ua ?? EAPI_UA;
    headers.Cookie = cookieToString(cookie);
    body = form.toString();
  }

  if (options?.realIP) {
    headers["X-Real-IP"] = options.realIP;
    headers["X-Forwarded-For"] = options.realIP;
  }

  let res;
  try {
    res = await postForm(url, body, headers, timeout);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new NeteaseApiError(uri, -1, 0, { code: -1, msg: message });
  }

  if (res.json === undefined) {
    throw new NeteaseApiError(uri, res.status, res.status, res.text);
  }
  const code = readCode(res.json);
  if (code !== undefined) {
    if (!acceptCodes.includes(code)) {
      throw new NeteaseApiError(uri, code, res.status, res.json);
    }
    return { status: res.status, body: res.json, cookies: res.setCookies };
  }
  if (res.status < 200 || res.status >= 300) {
    throw new NeteaseApiError(uri, res.status, res.status, res.json);
  }
  return { status: res.status, body: res.json, cookies: res.setCookies };
}
