import { createCipheriv, createDecipheriv, createHash } from "node:crypto";
import { EAPI_KEY, EAPI_SEP } from "./constants";

export const eapiEncrypt = (uri: string, data: object): string => {
  const text = JSON.stringify(data);
  const digest = createHash("md5")
    .update(`nobody${uri}use${text}md5forencrypt`, "utf8")
    .digest("hex");
  const cipher = createCipheriv("aes-128-ecb", EAPI_KEY, null);
  const plain = `${uri}${EAPI_SEP}${text}${EAPI_SEP}${digest}`;
  return Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]).toString(
    "hex",
  );
};

export interface EapiPayload {
  uri: string;
  data: unknown;
  digest: string;
}

export const eapiDecrypt = (hex: string): EapiPayload => {
  const decipher = createDecipheriv("aes-128-ecb", EAPI_KEY, null);
  const plain = Buffer.concat([
    decipher.update(Buffer.from(hex, "hex")),
    decipher.final(),
  ]).toString("utf8");
  const parts = plain.split(EAPI_SEP);
  if (parts.length !== 3) {
    throw new Error(`eapi 密文格式异常: ${parts.length} 段`);
  }
  const [uri, text, digest] = parts as [string, string, string];
  return { uri, data: JSON.parse(text), digest };
};
