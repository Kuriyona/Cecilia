import { createHash, createPublicKey } from "node:crypto";
import { describe, expect, it } from "vitest";
import { WEAPI_PUBLIC_KEY } from "../src/crypto/constants";
import { eapiDecrypt, eapiEncrypt } from "../src/crypto/eapi";
import { weapiDecryptParams, weapiEncrypt } from "../src/crypto/weapi";

describe("eapi", () => {
  it("往返还原 uri/data/digest", () => {
    const uri = "/api/test/endpoint";
    const data = { a: 1, b: "中文", c: [1, 2] };
    const text = JSON.stringify(data);
    const digest = createHash("md5")
      .update(`nobody${uri}use${text}md5forencrypt`)
      .digest("hex");

    expect(eapiDecrypt(eapiEncrypt(uri, data))).toEqual({ uri, data, digest });
  });

  it("同一输入输出稳定，且 hex 长度是 32 的倍数", () => {
    const first = eapiEncrypt("/api/x", { n: 1 });
    expect(eapiEncrypt("/api/x", { n: 1 })).toBe(first);
    expect(first.length % 32).toBe(0);
  });
});

describe("weapi", () => {
  const secretKey = "abcdefghijklmnop";

  it("固定 secretKey 时输出稳定且可还原明文", () => {
    const data = { s: "test", type: 1 };
    const first = weapiEncrypt(data, { secretKey });
    const second = weapiEncrypt(data, { secretKey });

    expect(first.params).toBe(second.params);
    expect(first.encSecKey).toBe(second.encSecKey);
    expect(weapiDecryptParams(first.params, secretKey)).toBe(
      JSON.stringify(data),
    );
  });

  it("encSecKey 是 256 位 hex 且小于模数", () => {
    const { encSecKey } = weapiEncrypt({}, { secretKey });
    const jwk = createPublicKey(WEAPI_PUBLIC_KEY).export({ format: "jwk" });
    const modulus = BigInt(
      `0x${Buffer.from(jwk.n ?? "", "base64url").toString("hex")}`,
    );

    expect(encSecKey).toHaveLength(256);
    expect(BigInt(`0x${encSecKey}`)).toBeLessThan(modulus);
  });

  it("未指定 secretKey 时每次随机", () => {
    expect(weapiEncrypt({}).params).not.toBe(weapiEncrypt({}).params);
  });
});
