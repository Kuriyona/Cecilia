import { NeteaseApiError } from "../errors";

/** 上游响应缺少预期容器时直接报错，不返回伪造的空结果。 */
export const requireField = <T>(
  value: T | undefined,
  uri: string,
  status: number,
  field: string,
): T => {
  if (value === undefined) {
    throw new NeteaseApiError(uri, -1, status, {
      code: -1,
      msg: `响应缺少 ${field}`,
    });
  }
  return value;
};
