export function StatusBar() {
  return (
    <footer className="flex h-7 shrink-0 items-center gap-4 border-t border-border px-4 text-xs text-muted-foreground">
      <span>Ready</span>
      <span className="ml-auto">HTTP Requests via Rust backend</span>
    </footer>
  );
}
