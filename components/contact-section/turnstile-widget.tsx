"use client"

import { useEffect, useRef, useState } from "react"

interface TurnstileOptions {
  sitekey: string
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "compact" | "flexible"
  callback?: (token: string) => void
  "expired-callback"?: () => void
  "error-callback"?: () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
let scriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile requires a browser"))
  }
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]'
    )

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener(
        "error",
        () => {
          scriptPromise = null
          reject(new Error("Turnstile failed to load"))
        },
        { once: true }
      )
      return
    }

    const script = document.createElement("script")
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.addEventListener("load", () => resolve(), { once: true })
    script.addEventListener(
      "error",
      () => {
        scriptPromise = null
        reject(new Error("Turnstile failed to load"))
      },
      { once: true }
    )
    document.head.appendChild(script)
  })

  return scriptPromise
}

interface TurnstileWidgetProps {
  siteKey: string
  onTokenChange: (token: string) => void
  resetKey?: number
  errorMessage: string
}

/**
 * Cloudflare Turnstile widget. Renders invisibly until the challenge is needed
 * and calls `onTokenChange` with a single-use token. The token itself stays in
 * the parent's state and is never passed back down as a prop.
 */
export function TurnstileWidget({
  siteKey,
  onTokenChange,
  resetKey = 0,
  errorMessage,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onTokenChangeRef = useRef(onTokenChange)
  const [error, setError] = useState("")

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange
  }, [onTokenChange])

  useEffect(() => {
    if (!siteKey) return

    let cancelled = false
    let widgetId: string | null = null
    setError("")

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          size: "flexible",
          callback: (token) => onTokenChangeRef.current(token),
          "expired-callback": () => onTokenChangeRef.current(""),
          "error-callback": () => onTokenChangeRef.current(""),
        })
        widgetIdRef.current = widgetId
      })
      .catch(() => {
        if (!cancelled) setError(errorMessage)
      })

    return () => {
      cancelled = true
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId)
        } catch {
          // The widget may already be gone after a script reload.
        }
      }
      widgetIdRef.current = null
      onTokenChangeRef.current("")
    }
  }, [errorMessage, siteKey])

  useEffect(() => {
    if (resetKey === 0) return
    const widgetId = widgetIdRef.current
    if (widgetId && window.turnstile) {
      try {
        window.turnstile.reset(widgetId)
      } catch {
        // Reset is best-effort; the next challenge still issues a token.
      }
    }
    onTokenChangeRef.current("")
  }, [resetKey])

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="min-h-[65px]" />
      {error && (
        <p role="status" className="text-xs text-amber-400">
          {error}
        </p>
      )}
    </div>
  )
}

export default TurnstileWidget
