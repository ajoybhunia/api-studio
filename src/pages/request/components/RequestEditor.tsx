import type { EditorTab, RequestData } from "../requestStore";
import { cn } from "@/lib/cn";
import { ParamsEditor } from "./ParamsEditor";
import { BodyEditor } from "./BodyEditor";
import { AuthEditor } from "./AuthEditor";
import { HeadersEditor } from "./HeadersEditor";

interface RequestEditorProps {
  request: RequestData;
  onUpdate: (updates: Partial<Omit<RequestData, "id">>) => void;
}

const TABS: { key: EditorTab; label: string }[] = [
  { key: "params", label: "Params" },
  { key: "body", label: "Body" },
  { key: "auth", label: "Auth" },
  { key: "headers", label: "Headers" },
];

export function RequestEditor({ request, onUpdate }: RequestEditorProps) {
  const activeTab = request.activeEditorTab;

  const renderEditor = () => {
    switch (activeTab) {
      case "params":
        return <ParamsEditor request={request} onUpdate={onUpdate} />;
      case "body":
        return <BodyEditor request={request} onUpdate={onUpdate} />;
      case "auth":
        return <AuthEditor request={request} onUpdate={onUpdate} />;
      case "headers":
        return <HeadersEditor request={request} onUpdate={onUpdate} />;
    }
  };

  return (
    <div className="flex flex-col border-b border-border">
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onUpdate({ activeEditorTab: tab.key })}
            className={cn(
              "cursor-pointer px-4 py-2 text-xs font-medium transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-accent text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto">{renderEditor()}</div>
    </div>
  );
}
