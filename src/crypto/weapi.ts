import {
  constants as cryptoConstants,
  createCipheriv,
  createDecipheriv,
  createPublicKey,
  publicEncrypt,
  randomInt,
} from "node:crypto";
import { BASE62, IV, PRESET_KEY, WEAPI_PUBLIC_KEY } from "./constants";

const aes128Cbc = (text: string, key: string, iv: string): string => {
  const cipher = createCipheriv(
    "aes-128-cbc",
    Buffer.from(key, "utf8"),
    Buffer.from(iv, "utf8"),
  );
  return Buffer.concat([cipher.update(text, "utf8"), cipher.final()]).toString(
    "base64",
  );
};

const aes128CbcDecrypt = (payload: string, key: string, iv: string): string => {
  const decipher = createDecipheriv(
    "aes-128-cbc",
    Buffer.from(key, "utf8"),
    Buffer.from(iv, "utf8"),
  );
  return Buffer.concat([
    decipher.update(Buffer.from(payload, "base64")),
    decipher.final(),
  ]).toString("utf8");
};

export const weapiDecryptParams = (
  params: string,
  secretKey: string,
): string => aes128CbcDecrypt(aes128CbcDecrypt(params, secretKey, IV), PRESET_KEY, IV);

const randomSecretKey = (): string => {
  let out = "";
  for (let i = 0; i < 16; i++) out += BASE62[randomInt(BASE62.length)];
  return out;
};

const rsaEncryptNoPadding = (text: string): string => {
  const key = createPublicKey(WEAPI_PUBLIC_KEY);
  const modulusLength = key.asymmetricKeyDetails?.modulusLength;
  const size = modulusLength ? modulusLength / 8 : 128;
  const message = Buffer.from(text, "utf8");
  const padded = Buffer.concat([
    Buffer.alloc(Math.max(0, size - message.length)),
    message,
  ]);
  return publicEncrypt(
    { key, padding: cryptoConstants.RSA_NO_PADDING },
    padded,
  ).toString("hex");
};

export interface WeapiPayload {
  params: string;
  encSecKey: string;
}

export const weapiEncrypt = (
  data: object,
  options?: { secretKey?: string },
): WeapiPayload => {
  const secretKey = options?.secretKey ?? randomSecretKey();
  return {
    params: aes128Cbc(aes128Cbc(JSON.stringify(data), PRESET_KEY, IV), secretKey, IV),
    encSecKey: rsaEncryptNoPadding([...secretKey].reverse().join("")),
  };
};
