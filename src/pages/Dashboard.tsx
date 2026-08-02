import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/Button";
import { useRequestStore } from "@/stores/requestStore";

export function Dashboard() {
  const [ping, setPing] = useState<string>("");
  const openTab = useRequestStore((s) => s.openTab);

  useEffect(() => {
    invoke<string>("greet", { name: "developer" })
      .then(setPing)
      .catch(() => setPing("Backend unreachable"));
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Welcome to API Studio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A lightweight, Git-friendly API development platform.
        </p>
      </div>

      <div className="rounded-md border border-border bg-muted/40 px-4 py-2 text-sm">
        {ping || "Checking Rust backend..."}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() =>
            openTab({ id: "new-request", title: "Untitled Request" })
          }
        >
          New Request
        </Button>
        <Button variant="outline">Import Collection</Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Request editor, collections, and history are coming in the next phases.
      </p>
    </div>
  );
}
