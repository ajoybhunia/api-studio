import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";
import { useRequestStore } from "@/pages/request/requestStore";
import type { HttpMethod } from "@/pages/request/requestStore";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/collections", label: "Collections" },
  { to: "/environments", label: "Environments" },
  { to: "/settings", label: "Settings" },
];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-green-500/15 text-green-600 dark:text-green-400",
  POST: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  PUT: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  PATCH: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  DELETE: "bg-red-500/15 text-red-600 dark:text-red-400",
  HEAD: "bg-muted text-muted-foreground",
  OPTIONS: "bg-muted text-muted-foreground",
};

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const requests = useRequestStore((s) => s.requests);
  const createRequest = useRequestStore((s) => s.createRequest);
  const deleteRequest = useRequestStore((s) => s.deleteRequest);

  const requestList = Object.values(requests);

  const handleCreate = () => {
    const id = createRequest();
    navigate(`/request/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteRequest(id);
    if (location.pathname === `/request/${id}`) {
      navigate("/");
    }
  };

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-muted/40">
      <div className="flex h-12 items-center border-b border-border px-4">
        <span className="text-sm font-semibold">API Studio</span>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Requests
          </p>
          <button
            onClick={handleCreate}
            className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
            title="New Request"
          >
            +
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto px-2">
          {requestList.length === 0 && (
            <li className="px-2 py-1 text-xs text-muted-foreground">
              No requests yet
            </li>
          )}
          {requestList.map((req) => {
            const isActive = location.pathname === `/request/${req.id}`;
            return (
              <li key={req.id} className="group relative">
                <NavLink
                  to={`/request/${req.id}`}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 rounded px-1 py-0.5 font-mono text-[10px] font-bold leading-none",
                      METHOD_COLORS[req.method],
                    )}
                  >
                    {req.method}
                  </span>
                  <span className="truncate">{req.name}</span>
                </NavLink>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(req.id);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  title="Delete request"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>

        <nav className="border-t border-border p-2">
          <p className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Workspace
          </p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "block cursor-pointer rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      isActive && "bg-muted text-foreground",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border p-3 text-xs text-muted-foreground">
        API Studio
      </div>
    </aside>
  );
}
