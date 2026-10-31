"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useComponentInstrumentation } from "@/hooks/use-instrumentation"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",")

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(
    (element) =>
      element.getAttribute("aria-hidden") !== "true" &&
      element.getClientRects().length > 0
  )
}

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** DOM id of the element that names the dialog. */
  labelledBy: string
  /** Optional DOM id of the element that describes the dialog. */
  describedBy?: string
  /** Accessible label for the close button. */
  closeLabel: string
  /**
   * Element that receives focus after the dialog closes.
   * Defaults to whatever was focused before it opened.
   */
  restoreFocusTo?: HTMLElement | null
  className?: string
  children?: React.ReactNode
}

/**
 * Minimal controlled dialog primitive in the local shadcn/New York style.
 *
 * Renders in a portal on the document body, traps Tab focus, closes on Escape
 * or backdrop press, locks background scrolling, and restores focus on close.
 * Add an entrance animation in `className` with `motion-safe:` utilities so
 * reduced-motion visitors get none.
 */
export function Dialog({
  open,
  onOpenChange,
  labelledBy,
  describedBy,
  closeLabel,
  restoreFocusTo,
  className,
  children,
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const onOpenChangeRef = React.useRef(onOpenChange)

  useComponentInstrumentation("Dialog", {
    // Only the open flag is safe to report: children may contain page content.
    propsSnapshot: () => ({ open }),
    trackValues: () => ({ open }),
    throttleMs: 1500,
  })

  useBodyScrollLock(open)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  }, [onOpenChange])

  const isOpen = open && mounted

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    const panel = panelRef.current
    if (!panel) {
      return
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onOpenChangeRef.current(false)
        return
      }

      if (event.key !== "Tab") {
        return
      }

      const focusable = getFocusableElements(panel)
      if (focusable.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const index = document.activeElement instanceof HTMLElement
        ? focusable.indexOf(document.activeElement)
        : -1

      if (event.shiftKey) {
        if (index <= 0) {
          event.preventDefault()
          last.focus()
        }
      } else if (index === -1 || index === focusable.length - 1) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    // Focus the panel itself so assistive technology announces the title.
    const frame = window.requestAnimationFrame(() => {
      panel.focus({ preventScroll: true })
    })

    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener("keydown", handleKeyDown)

      const restoreTarget = restoreFocusTo ?? previouslyFocused
      if (restoreTarget && document.contains(restoreTarget)) {
        restoreTarget.focus({ preventScroll: true })
      }
    }
  }, [isOpen, restoreFocusTo])

  if (!isOpen) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChangeRef.current(false)
        }
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/70 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full outline-none motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200",
          className
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChangeRef.current(false)}
          aria-label={closeLabel}
          className="absolute right-3 top-3 z-20 flex size-[44px] cursor-pointer items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}

export default Dialog
