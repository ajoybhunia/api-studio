interface MockResponse {
  status: number;
  headers: Record<string, string>;
  body: { type: string; value?: unknown };
  time_ms: number;
}

interface MockError {
  kind: string;
  message: string;
}

type MockHandler = (args: Record<string, unknown>) => Promise<unknown>;

const defaultHandlers: Record<string, MockHandler> = {
  ping: () => Promise.resolve("pong"),

  send_request: (args) => {
    const url = ((args?.args as Record<string, unknown>)?.url as string) || "";
    if (url.includes("error")) {
      const err: MockError = { kind: "timeout", message: "Request timed out" };
      return Promise.reject(err);
    }
    const response: MockResponse = {
      status: 200,
      headers: { "content-type": "text/plain" },
      body: { type: "Text", value: "Mock response" },
      time_ms: 42,
    };
    return Promise.resolve(response);
  },
};

export function createTauriMockScript(
  handlers: Record<string, MockHandler> = {},
): string {
  const allHandlers = { ...defaultHandlers, ...handlers };

  return `
    window.__TAURI_INTERNALS__ = {
      invoke: (cmd, args) => {
        const handler = ${JSON.stringify(Object.keys(allHandlers))}.includes(cmd)
          ? ${JSON.stringify(
            Object.fromEntries(
              Object.entries(allHandlers).map(([k]) => [
                k,
                `__tauri_handler_${k}`,
              ]),
            ),
          )}[cmd]
          : null;
        if (!handler) return Promise.reject("Unknown command: " + cmd);
        return handler(args);
      }
    };
  `;
}

export function tauriMockScript(_version?: string): string {
  return `
    window.__TAURI_INTERNALS__ = {
      invoke: (cmd, args) => {
        if (cmd === "ping") {
          return Promise.resolve("pong");
        }
        if (cmd === "send_request") {
          const url = (args?.args || {}).url || "";
          if (url.includes("error")) {
            return Promise.reject({ kind: "timeout", message: "Request timed out" });
          }
          if (url.includes("json")) {
            return Promise.resolve({
              status: 200,
              headers: { "content-type": "application/json", "x-request-id": "abc123" },
              body: { type: "Json", value: { name: "test", count: 42, active: true } },
              time_ms: 42,
              ttfb_ms: 10,
              size_bytes: 52,
            });
          }
          if (url.includes("no-content")) {
            return Promise.resolve({
              status: 204,
              headers: {},
              body: { type: "Empty" },
              time_ms: 15,
              ttfb_ms: 15,
              size_bytes: 0,
            });
          }
          return Promise.resolve({
            status: 200,
            headers: { "content-type": "text/plain", "x-request-id": "mock123" },
            body: { type: "Text", value: "Mock response" },
            time_ms: 42,
            ttfb_ms: 10,
            size_bytes: 14,
          });
        }
        return Promise.reject("Unknown command: " + cmd);
      }
    };
  `;
}

export function tauriMockScriptSlow(_version?: string): string {
  return `
    window.__TAURI_INTERNALS__ = {
      invoke: (cmd, args) => {
        if (cmd === "ping") {
          return Promise.resolve("pong");
        }
        if (cmd === "send_request") {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                status: 200,
                headers: { "content-type": "text/plain" },
                body: { type: "Text", value: "Slow response" },
                time_ms: 2000,
                ttfb_ms: 1500,
                size_bytes: 14,
              });
            }, 2000);
          });
        }
        return Promise.reject("Unknown command: " + cmd);
      }
    };
  `;
}
