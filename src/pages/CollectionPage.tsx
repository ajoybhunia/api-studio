import { useParams } from "react-router-dom";

export function CollectionPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-medium">Collections</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {id ? `Collection ${id}` : "Organize your API requests"} — arriving in a
        later phase.
      </p>
    </div>
  );
}
