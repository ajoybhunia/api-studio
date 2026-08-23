export function EnvironmentPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-medium">Environments</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage reusable variables with {"{{VAR}}"} placeholders — arriving in a
        later phase.
      </p>
    </div>
  );
}
