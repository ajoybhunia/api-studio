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
  greet: () => Promise.resolve("pong from API Studio backend v0.2.0"),

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

export function tauriMockScript(): string {
  return `
    window.__TAURI_INTERNALS__ = {
      invoke: (cmd, args) => {
        if (cmd === "greet") {
          return Promise.resolve("pong from API Studio backend v0.2.0");
        }
        if (cmd === "send_request") {
          const url = (args?.args || {}).url || "";
          if (url.includes("error")) {
            return Promise.reject({ kind: "timeout", message: "Request timed out" });
          }
          return Promise.resolve({
            status: 200,
            headers: { "content-type": "text/plain" },
            body: { type: "Text", value: "Mock response" },
            time_ms: 42,
          });
        }
        return Promise.reject("Unknown command: " + cmd);
      }
    };
  `;
}

export function tauriMockScriptSlow(): string {
  return `
    window.__TAURI_INTERNALS__ = {
      invoke: (cmd, args) => {
        if (cmd === "greet") {
          return Promise.resolve("pong from API Studio backend v0.2.0");
        }
        if (cmd === "send_request") {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                status: 200,
                headers: { "content-type": "text/plain" },
                body: { type: "Text", value: "Slow response" },
                time_ms: 2000,
              });
            }, 2000);
          });
        }
        return Promise.reject("Unknown command: " + cmd);
      }
    };
  `;
}
