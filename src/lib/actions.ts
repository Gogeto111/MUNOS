import { ZodError } from "zod";

export type ActionState<T = undefined> =
  | { status: "idle"; message?: string }
  | { status: "success"; message: string; data?: T }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export const IDLE_ACTION_STATE: ActionState = { status: "idle" };

export function ok<T>(message: string, data?: T): ActionState<T> {
  return { status: "success", message, data };
}

export function fail(message: string, fieldErrors?: Record<string, string[]>): ActionState {
  return { status: "error", message, fieldErrors };
}

/**
 * Normalizes unexpected errors (including Zod validation failures) into a
 * stable ActionState. Keeps server actions free of try/catch boilerplate.
 */
export function toActionError(error: unknown): ActionState {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    return fail("Please fix the highlighted fields.", fieldErrors);
  }
  if (error instanceof Error && error.message === "AUTH_REQUIRED") {
    return fail("You must be signed in to do that.");
  }
  if (error instanceof Error && error.message === "AI_NOT_CONFIGURED") {
    return fail(
      "AI is not configured yet. Add GOOGLE_GENERATIVE_AI_API_KEY to your .env and restart the dev server.",
    );
  }
  if (error instanceof Error && error.message === "ADMIN_REQUIRED") {
    return fail("This action requires admin access.");
  }
  return fail(error instanceof Error ? error.message : "Something went wrong. Please try again.");
}

export function isActionError(state: ActionState): state is Extract<ActionState, { status: "error" }> {
  return state.status === "error";
}
