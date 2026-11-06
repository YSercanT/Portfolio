"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// asks for confirmation, then calls the delete action
export function DeleteButton({
  action,
  id,
  confirmText = "Delete this entry? This cannot be undone.",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="icon" aria-label="Delete" className="text-destructive">
        <Trash2 />
      </Button>
    </form>
  );
}
