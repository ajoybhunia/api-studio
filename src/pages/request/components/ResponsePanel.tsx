import type { ResponseRecord } from "@/stores/responseStore";
import type { ResponseBody } from "@/types/tauri";
import { cn } from "@/lib/cn";

interface ResponsePanelProps {
  record?: ResponseRecord;
  className?: string;
}

function formatBody(body: ResponseBody): string {
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

export function ResponsePanel({ record, className }: ResponsePanelProps) {
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
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {formatBody(response.body)}
          </pre>
        </div>
      </div>
    );
  }

  return null;
}
