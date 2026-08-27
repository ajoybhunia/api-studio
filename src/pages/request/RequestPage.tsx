import { useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useRequestStore } from "./requestStore";
import type { RequestData } from "./requestStore";
import { useResponseStore } from "@/stores/responseStore";
import { RequestBar } from "./components/RequestBar";
import { RequestEditor } from "./components/RequestEditor";
import { ResponsePanel } from "./components/ResponsePanel";

function buildQueryString(queryParams: RequestData["queryParams"]): string {
  return queryParams
    .filter((p) => p.enabled && p.key.trim())
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join("&");
}

function PreviewUrl({ request }: { request: RequestData }) {
  const queryString = buildQueryString(request.queryParams);

  if (!queryString || !request.url.trim()) return null;

  const separator = request.url.includes("?") ? "&" : "?";
  const previewUrl = `${request.url}${separator}${queryString}`;

  return (
    <div className="flex items-center gap-2 border-b border-border px-2 py-1 text-xs text-muted-foreground">
      <span className="shrink-0 font-medium">Preview:</span>
      <span className="truncate font-mono">{previewUrl}</span>
    </div>
  );
}

export function RequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const request = useRequestStore((s) => (id ? s.requests[id] : undefined));
  const updateRequest = useRequestStore((s) => s.updateRequest);
  const createRequest = useRequestStore((s) => s.createRequest);
  const sendRequest = useResponseStore((s) => s.sendRequest);
  const responseRecord = useResponseStore((s) =>
    id ? s.responses[id] : undefined,
  );

  const isJsonBodyInvalid = useMemo(() => {
    if (!request || request.body.type !== "json") return false;
    if (!request.body.content.trim()) return false;
    try {
      JSON.parse(request.body.content);
      return false;
    } catch {
      return true;
    }
  }, [request]);

  const handleSend = useCallback(() => {
    if (!request || isJsonBodyInvalid) return;

    const queryString = buildQueryString(request.queryParams);
    let finalUrl = request.url;
    if (queryString) {
      const separator = finalUrl.includes("?") ? "&" : "?";
      finalUrl = `${finalUrl}${separator}${queryString}`;
    }

    const headers: Record<string, string> = {};
    for (const h of request.headers) {
      if (h.enabled && h.key.trim()) {
        headers[h.key] = h.value;
      }
    }

    if (request.auth.type === "bearer" && request.auth.token) {
      headers["Authorization"] = `Bearer ${request.auth.token}`;
    } else if (request.auth.type === "basic") {
      const encoded = btoa(`${request.auth.username}:${request.auth.password}`);
      headers["Authorization"] = `Basic ${encoded}`;
    }

    if (request.body.type === "json" && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const body =
      request.body.type !== "none" ? request.body.content : undefined;

    sendRequest(request.id, {
      method: request.method,
      url: finalUrl,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      body,
    });
  }, [request, sendRequest, isJsonBodyInvalid]);

  if (!id || !request) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="text-lg font-medium">No request selected</h2>
        <p className="text-sm text-muted-foreground">
          Create a new request to get started.
        </p>
        <Button
          onClick={() => {
            const newId = createRequest();
            navigate(`/request/${newId}`);
          }}
        >
          New Request
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <RequestBar
        request={request}
        onSend={handleSend}
        onUpdate={(updates) => updateRequest(id, updates)}
      />
      <PreviewUrl request={request} />
      <div className="h-72 shrink-0 overflow-auto border-b border-border">
        <RequestEditor
          request={request}
          onUpdate={(updates) => updateRequest(id, updates)}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <ResponsePanel record={responseRecord} className="h-full" />
      </div>
    </div>
  );
}
