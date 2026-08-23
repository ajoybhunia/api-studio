import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import { version } from "../../../package.json";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/collections", label: "Collections" },
  { to: "/environments", label: "Environments" },
  { to: "/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-muted/40">
      <div className="flex h-12 items-center border-b border-border px-4">
        <span className="text-sm font-semibold">API Studio</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
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

      <div className="border-t border-border p-3 text-xs text-muted-foreground">
        <Link to="/settings" className="cursor-pointer hover:text-foreground">
          API Studio v{version}
        </Link>
      </div>
    </aside>
  );
}
