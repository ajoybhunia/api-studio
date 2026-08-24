import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { version } from "../../../package.json";
import { cn } from "@/lib/cn";

const HEALTH_CHECK_INTERVAL = 30 * 1000;

export function StatusBar() {
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    const checkHealth = () => {
      invoke("ping")
        .then(() => setStatus("Connected"))
        .catch(() => setStatus("Backend unreachable"));
    };

    checkHealth();
    const interval = setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="flex h-7 shrink-0 items-center gap-4 border-t border-border px-4 text-xs text-muted-foreground">
      <span
        className={cn(
          status === "Connected" && "text-green-500",
          status === "Backend unreachable" && "text-red-500",
        )}
      >
        {status}
      </span>
      <span className="ml-auto">API Studio v{version}</span>
    </footer>
  );
}
