import * as React from "react";
import { cn } from "@/lib/utils";

/** Styled native <select>: zero JS, works in Server Components and plain forms. */
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-input/30 px-3 py-1 text-base shadow-xs outline-none md:text-sm",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>option]:bg-popover",
        className,
      )}
      {...props}
    />
  );
}

export { NativeSelect };
