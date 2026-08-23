import { useParams } from "react-router-dom";

export function RequestPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-medium">Request Editor</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {id ? `Request ${id}` : "Select or create a request"} — arriving in the
        next phase.
      </p>
    </div>
  );
}
