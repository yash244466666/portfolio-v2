"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { X } from "lucide-react"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  useComponentInstrumentation("Input", {
    propsSnapshot: () => ({
      className,
      type,
      hasValue: props.value !== undefined || props.defaultValue !== undefined,
    }),
    throttleMs: 2500,
  })

  const inputRef = React.useRef<HTMLInputElement>(null)
  const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue)

  React.useEffect(() => {
    if (props.value !== undefined) {
      setHasValue(props.value !== "")
    }
  }, [props.value])

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (props.value === undefined) {
      setHasValue(e.currentTarget.value !== "")
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props.onInput?.(e as any)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (inputRef.current) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      nativeInputValueSetter?.call(inputRef.current, '')
      const event = new Event('input', { bubbles: true })
      inputRef.current.dispatchEvent(event)
      const changeEvent = new Event('change', { bubbles: true })
      inputRef.current.dispatchEvent(changeEvent)
      if (props.onChange) {
        props.onChange({ target: inputRef.current, currentTarget: inputRef.current } as React.ChangeEvent<HTMLInputElement>)
      }
      if (props.value === undefined) {
        setHasValue(false)
      }
    }
  }

  const showClear = hasValue && !props.readOnly && !props.disabled && 
    (type === "text" || type === "search" || type === "number" || type === "url" || type === "email" || !type)

  return (
    <div 
      className={cn(
        "flex items-center h-12 w-full rounded-xl border border-border/50 bg-background/40 backdrop-blur-md px-3 sm:px-4 shadow-sm transition-all duration-300",
        "focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 hover:border-border hover:bg-background/60",
        "has-[[aria-invalid]]:ring-destructive/20 dark:has-[[aria-invalid]]:ring-destructive/40 has-[[aria-invalid]]:border-destructive",
        props.disabled ? "cursor-not-allowed opacity-50" : "",
        className
      )}
    >
      <input
        ref={inputRef}
        type={type}
        data-slot="input"
        className={cn(
          "flex-1 w-full min-w-0 bg-transparent border-none outline-none p-0 m-0",
          "file:text-foreground placeholder:text-muted-foreground/50 selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium text-base md:text-sm",
          "disabled:pointer-events-none"
        )}
        onInput={handleInput}
        {...props}
      />
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 ml-1.5 flex items-center justify-center w-7 h-7 text-muted-foreground/60 hover:text-foreground transition-colors rounded-full hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Clear input"
        >
          <X className="h-3.5 w-3.5 stroke-[2.5px]" />
        </button>
      )}
    </div>
  )
}

export { Input }
