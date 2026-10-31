import * as React from "react"

import { cn } from "@/lib/utils"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  useComponentInstrumentation("Textarea", {
    // Never report the typed value; hasValue is enough for telemetry.
    propsSnapshot: () => ({
      className,
      hasValue: props.value !== undefined || props.defaultValue !== undefined,
      rows: props.rows,
      maxLength: props.maxLength,
    }),
    throttleMs: 2500,
  })

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground/50 flex field-sizing-content min-h-[120px] w-full rounded-xl border border-border/50 bg-background/40 backdrop-blur-md px-4 py-3 text-base shadow-sm transition-all duration-300 outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 hover:border-border hover:bg-background/60",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
