import { useEffect, useState } from "react";
import type { BodyConfig, RequestData } from "../requestStore";

interface BodyEditorProps {
  request: RequestData;
  onUpdate: (updates: Partial<Omit<RequestData, "id">>) => void;
}

const BODY_OPTIONS: { value: BodyConfig["type"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "raw", label: "Raw" },
  { value: "json", label: "JSON" },
];

export function BodyEditor({ request, onUpdate }: BodyEditorProps) {
  const { body } = request;
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (body.type === "json" && body.content) {
      validateJson(body.content);
    }
  }, []);

  const setBodyType = (type: BodyConfig["type"]) => {
    onUpdate({ body: { ...body, type } });
    if (type === "json" && body.content) {
      validateJson(body.content);
    } else {
      setJsonError(null);
    }
  };

  const updateContent = (content: string) => {
    onUpdate({ body: { ...body, content } });
    if (body.type === "json") {
      validateJson(content);
    }
  };

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch {
      setJsonError("Invalid JSON");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex gap-2">
        {BODY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setBodyType(opt.value)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              body.type === opt.value
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {body.type === "none" && (
        <p className="text-xs text-muted-foreground">No body</p>
      )}

      {body.type !== "none" && (
        <div className="flex flex-col gap-1">
          <textarea
            value={body.content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder={
              body.type === "json" ? '{\n  "key": "value"\n}' : "Request body"
            }
            spellCheck={false}
            className={`min-h-[120px] w-full resize-y rounded-md border bg-background p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent ${
              jsonError ? "border-red-500" : "border-border"
            }`}
          />
          {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
        </div>
      )}
    </div>
  );
}
