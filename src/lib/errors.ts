export class AppError extends Error {
  kind: string;

  constructor(kind: string, message: string) {
    super(message);
    this.name = "AppError";
    this.kind = kind;
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (
    typeof error === "object" &&
    error !== null &&
    "kind" in error &&
    "message" in error
  ) {
    const e = error as { kind: unknown; message: unknown };
    if (typeof e.kind === "string" && typeof e.message === "string") {
      return new AppError(e.kind, e.message);
    }
  }

  if (typeof error === "string") {
    return new AppError("unknown", error);
  }

  if (error instanceof Error) {
    return new AppError("unknown", error.message);
  }

  return new AppError("unknown", "An unknown error occurred");
}
