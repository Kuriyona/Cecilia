const pickDetail = (body: unknown): string | undefined => {
  if (typeof body !== "object" || body === null) return undefined;
  if ("msg" in body && typeof body.msg === "string" && body.msg.length > 0) {
    return body.msg;
  }
  if (
    "message" in body &&
    typeof body.message === "string" &&
    body.message.length > 0
  ) {
    return body.message;
  }
  return undefined;
};

export class NeteaseApiError extends Error {
  readonly code: number;
  readonly uri: string;
  readonly status: number;
  readonly body: unknown;

  constructor(uri: string, code: number, status: number, body: unknown) {
    const detail = pickDetail(body);
    super(`${uri} 请求失败: code ${code}${detail ? ` ${detail}` : ""}`);
    this.name = "NeteaseApiError";
    this.code = code;
    this.uri = uri;
    this.status = status;
    this.body = body;
  }
}
