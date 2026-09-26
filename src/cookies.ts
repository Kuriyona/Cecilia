import { randomBytes } from "node:crypto";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";

const randomLowercase = (length: number): string => {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)];
  }
  return out;
};

export const cookieToObject = (
  cookie?: string | Record<string, string>,
): Record<string, string> => {
  if (!cookie) return {};
  if (typeof cookie !== "string") return { ...cookie };
  const result: Record<string, string> = {};
  for (const part of cookie.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    if (!key) continue;
    result[key] = part.slice(index + 1).trim();
  }
  return result;
};

export const cookieToString = (cookie: Record<string, string>): string =>
  Object.entries(cookie)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("; ");

export const buildCookieObject = (
  cookie?: string | Record<string, string>,
): Record<string, string> => {
  const input = cookieToObject(cookie);
  const nuid = input._ntes_nuid || randomBytes(32).toString("hex");
  const timestamp = Date.now();
  const defaults: Record<string, string> = {
    _ntes_nuid: nuid,
    _ntes_nnid: `${nuid},${timestamp}`,
    WNMCID: `${randomLowercase(6)}.${timestamp}.01.0`,
    __remember_me: "true",
    ntes_kaola_ad: "1",
    WEVNSM: "1.0.0",
    os: "pc",
    appver: "3.1.17.204416",
    osver: "Microsoft-Windows-10-Professional-build-19045-64bit",
    channel: "netease",
    deviceId: randomBytes(32).toString("hex").toUpperCase(),
  };
  return { ...defaults, ...input };
};
