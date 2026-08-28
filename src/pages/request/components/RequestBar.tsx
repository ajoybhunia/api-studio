import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
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

const METHOD_OPTIONS = HTTP_METHODS.map((m) => ({ value: m, label: m }));

interface RequestBarProps {
  request: RequestData;
  onSend: () => void;
  onUpdate: (updates: Partial<Omit<RequestData, "id">>) => void;
  isLoading?: boolean;
}

export function RequestBar({ request, onSend, onUpdate, isLoading }: RequestBarProps) {
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
      <Dropdown
        options={METHOD_OPTIONS}
        value={request.method}
        onChange={(method) => onUpdate({ method: method as HttpMethod })}
      />

      <Input
        type="text"
        value={request.url}
        onChange={(e) => onUpdate({ url: e.target.value })}
        placeholder="Enter request URL"
        className="flex-1"
      />

      <Button onClick={onSend} disabled={!request.url.trim() || isLoading} className="min-w-[5rem]">
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          "Send"
        )}
      </Button>
    </div>
  );
}
