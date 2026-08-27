import { Input } from "@/components/ui/Input";
import type { AuthConfig, RequestData } from "../requestStore";

interface AuthEditorProps {
  request: RequestData;
  onUpdate: (updates: Partial<Omit<RequestData, "id">>) => void;
}

const AUTH_OPTIONS: { value: AuthConfig["type"]; label: string }[] = [
  { value: "none", label: "No Auth" },
  { value: "bearer", label: "Bearer Token" },
  { value: "basic", label: "Basic Auth" },
];

export function AuthEditor({ request, onUpdate }: AuthEditorProps) {
  const { auth } = request;

  const setAuthType = (type: AuthConfig["type"]) => {
    onUpdate({ auth: { ...auth, type } });
  };

  const updateField = (
    field: "token" | "username" | "password",
    value: string,
  ) => {
    onUpdate({ auth: { ...auth, [field]: value } });
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex gap-2">
        {AUTH_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAuthType(opt.value)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              auth.type === opt.value
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {auth.type === "bearer" && (
        <Input
          value={auth.token}
          onChange={(e) => updateField("token", e.target.value)}
          placeholder="Token"
        />
      )}

      {auth.type === "basic" && (
        <div className="flex flex-col gap-2">
          <Input
            value={auth.username}
            onChange={(e) => updateField("username", e.target.value)}
            placeholder="Username"
          />
          <Input
            type="password"
            value={auth.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Password"
          />
        </div>
      )}

      {auth.type === "none" && (
        <p className="text-xs text-muted-foreground">
          No authentication configured
        </p>
      )}
    </div>
  );
}
