import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useRequestStore } from "./requestStore";
import { useResponseStore } from "@/stores/responseStore";
import { RequestBar } from "./components/RequestBar";
import { ResponsePanel } from "./components/ResponsePanel";

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

  const handleSend = useCallback(() => {
    if (!request) return;
    sendRequest(request.id, {
      method: request.method,
      url: request.url,
    });
  }, [request, sendRequest]);

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
    <div className="flex h-full flex-row">
      <div className="flex flex-1 flex-col">
        <RequestBar
          request={request}
          onSend={handleSend}
          onUpdate={(updates) => updateRequest(id, updates)}
        />
      </div>
      <div className="flex flex-1 flex-col border-l border-border">
        <ResponsePanel record={responseRecord} className="flex-1" />
      </div>
    </div>
  );
}
