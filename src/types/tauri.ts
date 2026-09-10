export interface SendRequestArgs {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeout_seconds?: number;
}

export interface SendResponse {
  status: number;
  headers: Record<string, string>;
  body: ResponseBody;
  time_ms: number;
  ttfb_ms: number;
  size_bytes: number;
}

export type ResponseBody =
  | { type: "Json"; value: unknown }
  | { type: "Text"; value: string }
  | { type: "Empty" };
