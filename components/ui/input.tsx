import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-500 placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
