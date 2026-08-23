import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { HttpMethod, RequestData } from "../requestStore";

const HTTP_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

interface RequestBarProps {
  request: RequestData;
  onSend: () => void;
  onUpdate: (updates: Partial<Omit<RequestData, "id">>) => void;
}

export function RequestBar({ request, onSend, onUpdate }: RequestBarProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onSend();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSend]);

  return (
    <div className="flex items-center gap-2 border-b border-border p-2">
      <Select
        value={request.method}
        onChange={(e) => onUpdate({ method: e.target.value as HttpMethod })}
      >
        {HTTP_METHODS.map((method) => (
          <option key={method} value={method}>
            {method}
          </option>
        ))}
      </Select>

      <Input
        type="text"
        value={request.url}
        onChange={(e) => onUpdate({ url: e.target.value })}
        placeholder="Enter request URL"
        className="flex-1"
      />

      <Button onClick={onSend} disabled={!request.url.trim()}>
        Send
      </Button>
    </div>
  );
}
