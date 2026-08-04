"use client";

import { useCallback, useTransition } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import type { ActionState } from "@/lib/actions";

/**
 * Wraps a server action so it can be driven from a react-hook-form submit.
 * Resolves success/error to a toast and surfaces field errors onto the form.
 */
export function useServerAction<TInput extends FieldValues, TData = undefined>(
  action: (input: TInput) => Promise<ActionState<TData>>,
  setError: UseFormSetError<TInput>,
) {
  const [isPending, startTransition] = useTransition();

  const run = useCallback(
    (input: TInput) =>
      new Promise<ActionState<TData>>((resolve) => {
        startTransition(async () => {
          const result = await action(input);
          if (result.status === "success") {
            toast.success(result.message);
          } else if (result.status === "error") {
            toast.error(result.message);
            for (const [field, messages] of Object.entries(
              result.fieldErrors ?? {},
            )) {
              setError(field as Path<TInput>, { message: messages[0] });
            }
          }
          resolve(result);
        });
      }),
    [action, setError],
  );

  return { isPending, run };
}
