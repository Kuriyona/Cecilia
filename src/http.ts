export interface HttpResponse {
  json: unknown;
  setCookies: string[];
  status: number;
  text: string;
}

const getSetCookies = (res: Response): string[] => {
  try {
    return res.headers.getSetCookie();
  } catch {
    return [];
  }
};

export async function postForm(
  url: string,
  body: string,
  headers: Record<string, string>,
  timeout: number,
): Promise<HttpResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
    body,
    signal: AbortSignal.timeout(timeout),
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { json, setCookies: getSetCookies(res), status: res.status, text };
}

export async function getText(
  url: string,
  timeout: number,
  headers: Record<string, string> = {},
): Promise<HttpResponse> {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(timeout) });
  const text = await res.text();
  return { json: undefined, setCookies: getSetCookies(res), status: res.status, text };
}
