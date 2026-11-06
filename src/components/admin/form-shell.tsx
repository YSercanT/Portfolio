"use client";

import { startTransition, useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface FormShellProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
}

const humanize = (field: string) => field.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

// Shared wrapper for the admin forms: runs the server action, shows a saving
// state and any errors. The fields are passed in as children.
//
// It submits through onSubmit + startTransition instead of <form action>, because
// React 19 clears forms that use `action`, and you'd lose what you typed on every error.
export function FormShell({ action, children, submitLabel = "Save", className }: FormShellProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form
      className={cn("grid gap-4", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      {children}

      {state?.error && (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <p className="font-medium text-destructive">{state.error}</p>
          {state.fieldErrors && (
            <ul className="mt-1 list-inside list-disc text-muted-foreground">
              {Object.entries(state.fieldErrors).map(([field, messages]) => (
                <li key={field}>
                  <span className="text-foreground">{humanize(field)}:</span> {messages?.join(", ")}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Button type="submit" disabled={pending} className="justify-self-start">
        {pending && <Loader2 className="animate-spin" />}
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
