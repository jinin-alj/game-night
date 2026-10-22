import { inviteCodeSchema } from "./schemas";

/** Returns a cleaned invite code from a URL or form value, or null if it isn't one. */
export function parseJoinCode(value: unknown): string | null {
  const result = inviteCodeSchema.safeParse(value);
  if (!result.success) {
    return null;
  }
  return result.data;
}

/** Adds ?join=CODE to a path when there is a code to keep. */
export function addJoinCode(path: string, joinCode: string | null): string {
  if (!joinCode) {
    return path;
  }
  return `${path}?join=${joinCode}`;
}
