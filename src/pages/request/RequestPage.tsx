import { useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useRequestStore } from "./requestStore";
import type { RequestData, KeyValueRow } from "./requestStore";
import { useResponseStore } from "@/stores/responseStore";
import { RequestBar } from "./components/RequestBar";
import { RequestEditor } from "./components/RequestEditor";
import { ResponsePanel } from "./components/ResponsePanel";
import { version } from "../../../package.json";

function buildQueryString(queryParams: RequestData["queryParams"]): string {
  return queryParams
    .filter((p) => p.enabled && p.key.trim())
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join("&");
}

function parseQueryString(url: string): KeyValueRow[] {
  try {
    const parsed = new URL(url);
    const params: KeyValueRow[] = [];
    parsed.searchParams.forEach((value, key) => {
      params.push({
        id: crypto.randomUUID(),
        key,
        value: decodeURIComponent(value),
        enabled: true,
      });
    });
    return params;
  } catch {
    return [];
  }
}

function getBaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const base = parsed.origin + parsed.pathname;
    if (base.endsWith("/") && parsed.pathname !== "/") {
      return base.slice(0, -1);
    }
    if (parsed.pathname === "/" && parsed.search) {
      return parsed.origin;
    }
    return base;
  } catch {
    return url.split("?")[0] || url;
  }
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

  const lastSyncedUrl = useRef<string>("");

  useEffect(() => {
    if (!request || !id) return;

    const url = request.url;
    const hasQueryString = url.includes("?");

    if (!hasQueryString) return;

    const baseUrl = getBaseUrl(url);
    const parsedParams = parseQueryString(url);

    if (parsedParams.length === 0) {
      if (url !== baseUrl) {
        updateRequest(id, { url: baseUrl });
      }
      return;
    }

    const syncKey = `${baseUrl}|${JSON.stringify(parsedParams)}`;
    if (syncKey === lastSyncedUrl.current) return;

    lastSyncedUrl.current = syncKey;

    const existingParams = request.queryParams;
    const merged: KeyValueRow[] = [
      ...existingParams.filter(
        (ep) => !parsedParams.some((pp) => pp.key === ep.key),
      ),
      ...parsedParams,
    ];

    updateRequest(id, { url: baseUrl, queryParams: merged });
  }, [request?.url, request?.queryParams, id, updateRequest]);

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
    } else if (request.body.type === "raw" && !headers["Content-Type"]) {
      headers["Content-Type"] = "text/plain";
    }

    if (!headers["User-Agent"]) {
      const userAgentRow = request.headers.find((h) => h.key === "User-Agent");
      if (!userAgentRow || userAgentRow.enabled) {
        headers["User-Agent"] = `api-studio/${version}`;
      }
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
        <ResponsePanel
          record={responseRecord}
          activeResponseTab={request.activeResponseTab}
          responseBodyMode={request.responseBodyMode}
          onActiveResponseTabChange={(tab) =>
            updateRequest(id, { activeResponseTab: tab })
          }
          onResponseBodyModeChange={(mode) =>
            updateRequest(id, { responseBodyMode: mode })
          }
          className="h-full"
        />
      </div>
    </div>
  );
}
