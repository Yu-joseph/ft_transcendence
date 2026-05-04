
export function getErrorMessage(error: unknown, fallback: string): string {

  if (error instanceof Error && error.message)
    return error.message;
  if (typeof error === "string" && error.trim())
    return error;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    const msg = (error as { message: string }).message.trim();
    if (msg)
        return msg;
  }
  return fallback;
}