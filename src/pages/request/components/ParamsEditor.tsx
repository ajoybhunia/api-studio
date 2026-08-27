import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { KeyValueRow, RequestData } from "../requestStore";

interface ParamsEditorProps {
  request: RequestData;
  onUpdate: (updates: Partial<Omit<RequestData, "id">>) => void;
}

function newParam(): KeyValueRow {
  return { id: crypto.randomUUID(), key: "", value: "", enabled: true };
}

export function ParamsEditor({ request, onUpdate }: ParamsEditorProps) {
  const rows = request.queryParams;

  const updateRow = (
    id: string,
    field: "key" | "value" | "enabled",
    val: string | boolean,
  ) => {
    onUpdate({
      queryParams: rows.map((r) => (r.id === id ? { ...r, [field]: val } : r)),
    });
  };

  const addRow = () => {
    onUpdate({ queryParams: [...rows, newParam()] });
  };

  const removeRow = (id: string) => {
    onUpdate({ queryParams: rows.filter((r) => r.id !== id) });
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground">No query parameters</p>
      )}
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => updateRow(row.id, "enabled", e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-accent"
          />
          <Input
            value={row.key}
            onChange={(e) => updateRow(row.id, "key", e.target.value)}
            placeholder="Key"
            className="flex-1"
          />
          <Input
            value={row.value}
            onChange={(e) => updateRow(row.id, "value", e.target.value)}
            placeholder="Value"
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeRow(row.id)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            ×
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={addRow} className="self-start">
        + Add param
      </Button>
    </div>
  );
}
