import { describe, expect, it } from "vitest";
import {
  buildCookieObject,
  cookieToObject,
  cookieToString,
} from "../src/cookies";

describe("cookies", () => {
  it("默认键集合完整", () => {
    const cookie = buildCookieObject();

    for (const key of [
      "_ntes_nuid",
      "_ntes_nnid",
      "WNMCID",
      "__remember_me",
      "ntes_kaola_ad",
      "WEVNSM",
      "os",
      "appver",
      "osver",
      "channel",
      "deviceId",
    ]) {
      expect(cookie[key]).toBeTruthy();
    }
    expect(cookie.os).toBe("pc");
    expect(cookie._ntes_nuid).toHaveLength(64);
    expect(cookie.deviceId).toHaveLength(64);
    expect(cookie.WNMCID).toMatch(/^[a-z]{6}\.\d+\.01\.0$/);
    expect(cookie._ntes_nnid?.startsWith(`${cookie._ntes_nuid},`)).toBe(true);
  });

  it("字符串 cookie 覆盖默认值", () => {
    const cookie = buildCookieObject("MUSIC_U=abc; os=android");

    expect(cookie.MUSIC_U).toBe("abc");
    expect(cookie.os).toBe("android");
    expect(cookie.__remember_me).toBe("true");
  });

  it("对象 cookie 覆盖默认值", () => {
    const cookie = buildCookieObject({ __csrf: "token" });

    expect(cookie.__csrf).toBe("token");
    expect(cookie.os).toBe("pc");
  });

  it("cookieToObject 解析分号分隔的字符串", () => {
    expect(cookieToObject("a=1; b=2")).toEqual({ a: "1", b: "2" });
    expect(cookieToObject()).toEqual({});
  });

  it("cookieToString 做百分号编码", () => {
    expect(cookieToString({ a: "1 2", b: "中" })).toBe(
      "a=1%202; b=%E4%B8%AD",
    );
  });
});
