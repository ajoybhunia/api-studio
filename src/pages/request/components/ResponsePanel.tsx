import { Highlight, themes } from "prism-react-renderer";
import type { ResponseRecord } from "@/stores/responseStore";
import type { ResponseBody } from "@/types/tauri";
import type { ResponseTab, ResponseBodyMode } from "../requestStore";
import { useThemeStore } from "@/stores/themeStore";
import { cn } from "@/lib/cn";

interface ResponsePanelProps {
  record?: ResponseRecord;
  activeResponseTab?: ResponseTab;
  responseBodyMode?: ResponseBodyMode;
  onActiveResponseTabChange?: (tab: ResponseTab) => void;
  onResponseBodyModeChange?: (mode: ResponseBodyMode) => void;
  className?: string;
}

function formatBodyPretty(body: ResponseBody): string {
  switch (body.type) {
    case "Json":
      return JSON.stringify(body.value, null, 2);
    case "Text":
      return body.value;
    case "Empty":
      return "";
    default:
      return "";
  }
}

function formatBodyRaw(body: ResponseBody): string {
  switch (body.type) {
    case "Json":
      return JSON.stringify(body.value);
    case "Text":
      return body.value;
    case "Empty":
      return "";
    default:
      return "";
  }
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-green-500";
  if (status >= 300 && status < 400) return "text-blue-500";
  if (status >= 400 && status < 500) return "text-yellow-500";
  if (status >= 500) return "text-red-500";
  return "text-muted-foreground";
}

function getErrorIcon(kind: string | undefined): string {
  switch (kind) {
    case "timeout":
      return "⏱";
    case "connection":
      return "🔌";
    case "invalid_url":
      return "⚠";
    case "tls":
      return "🔒";
    default:
      return "❌";
  }
}

function formatKind(kind: string | undefined): string {
  return (kind ?? "unknown").replace(/_/g, " ");
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getEmptyBodyMessage(status: number): string {
  if (status === 204) return "204 No Content — no body expected";
  if (status === 304) return "304 Not Modified — no body";
  return "Empty response body";
}

function SyntaxHighlightedBody({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const theme = useThemeStore((s) => s.theme);
  const prismTheme = theme === "dark" ? themes.vsDark : themes.vsLight;
  return (
    <Highlight theme={prismTheme} code={code} language={language}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre className="overflow-hidden whitespace-pre-wrap break-words p-4 font-mono text-sm">
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

function HeadersTable({ headers }: { headers: Record<string, string> }) {
  const entries = Object.entries(headers);
  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
        No response headers
      </div>
    );
  }
  return (
    <div className="overflow-auto p-4">
      {entries.map(([key, value]) => (
        <div key={key} className="flex border-b border-border py-2">
          <span className="w-48 shrink-0 font-mono text-sm font-medium">
            {key}
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ResponsePanel({
  record,
  activeResponseTab = "body",
  responseBodyMode = "pretty",
  onActiveResponseTabChange,
  onResponseBodyModeChange,
  className,
}: ResponsePanelProps) {
  if (!record) {
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center text-muted-foreground",
          className,
        )}
      >
        Send a request to see the response
      </div>
    );
  }

  if (record.isLoading) {
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center text-muted-foreground",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Sending request...</span>
        </div>
      </div>
    );
  }

  if (record.error) {
    return (
      <div className={cn("flex h-full flex-col p-4", className)}>
        <div className="mb-4 flex items-center gap-2 text-red-500">
          <span className="text-lg">{getErrorIcon(record.error.kind)}</span>
          <span className="font-medium capitalize">
            {formatKind(record.error.kind)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{record.error.message}</p>
      </div>
    );
  }

  if (record.response) {
    const { response } = record;
    const isJson = response.body.type === "Json";
    const formattedBody =
      responseBodyMode === "pretty"
        ? formatBodyPretty(response.body)
        : formatBodyRaw(response.body);

    return (
      <div className={cn("flex h-full flex-col", className)}>
        <div className="flex items-center gap-4 border-b border-border p-2">
          <span
            className={cn(
              "font-mono font-bold",
              getStatusColor(response.status),
            )}
          >
            {response.status}
          </span>
          <span className="text-xs text-muted-foreground">
            {response.time_ms}ms
          </span>
          <span className="text-xs text-muted-foreground">
            TTFB {response.ttfb_ms}ms
          </span>
          <span className="text-xs text-muted-foreground">
            {formatSize(response.size_bytes)}
          </span>
        </div>
        <div className="flex border-b border-border">
          <button
            onClick={() => onActiveResponseTabChange?.("body")}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              activeResponseTab === "body"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Body
          </button>
          <button
            onClick={() => onActiveResponseTabChange?.("headers")}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              activeResponseTab === "headers"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Headers
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {activeResponseTab === "body" ? (
            <>
              {response.body.type === "Empty" ? (
                <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
                  {getEmptyBodyMessage(response.status)}
                </div>
              ) : responseBodyMode === "pretty" && isJson ? (
                <SyntaxHighlightedBody code={formattedBody} language="json" />
              ) : (
                <pre className="overflow-hidden whitespace-pre-wrap break-words p-4 font-mono text-sm">
                  {formattedBody}
                </pre>
              )}
            </>
          ) : (
            <HeadersTable headers={response.headers} />
          )}
        </div>
        {activeResponseTab === "body" && response.body.type !== "Empty" && (
          <div className="border-t border-border px-4 py-2">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={responseBodyMode === "pretty"}
                onChange={(e) =>
                  onResponseBodyModeChange?.(
                    e.target.checked ? "pretty" : "raw",
                  )
                }
                className="h-4 w-4 accent-accent"
              />
              Pretty
            </label>
          </div>
        )}
      </div>
    );
  }

  return null;
}
