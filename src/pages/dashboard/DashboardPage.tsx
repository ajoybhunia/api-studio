import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/Button";
import { useRequestStore } from "@/pages/request/requestStore";

export function DashboardPage() {
  const [ping, setPing] = useState<string>("");
  const navigate = useNavigate();
  const createRequest = useRequestStore((s) => s.createRequest);

  useEffect(() => {
    invoke<string>("ping")
      .then(setPing)
      .catch(() => setPing("Backend unreachable"));
  }, []);

  const handleNewRequest = () => {
    const id = createRequest();
    navigate(`/request/${id}`);
  };

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
        <Button onClick={handleNewRequest}>New Request</Button>
        <Button variant="outline">Import Collection</Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Create a new request to get started.
      </p>
    </div>
  );
}
