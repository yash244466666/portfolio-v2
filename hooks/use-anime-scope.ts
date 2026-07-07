"use client"

import { useEffect, useRef } from "react"
import { createScope } from "animejs"
import type { Scope } from "animejs"

export interface UseAnimeScopeOptions {
  defaults?: Record<string, unknown>
  mediaQueries?: Record<string, string>
  /** Skip scope creation (e.g. reduced motion / mobile). Scope stays null. */
  disabled?: boolean
}

/**
 * Reusable React lifecycle wrapper around anime.js v4 `createScope`.
 * Matches the convention used by the Canvas-2D backgrounds
 * (`components/backgrounds/*-background.tsx`) and ANIMATION-MIGRATION-PLAN.md §3.2.
 *
 * Returns a `rootRef` to attach to the scoped subtree and the `scope` ref.
 * On unmount (or when `disabled` flips) the scope is reverted so anime.js
 * cleans up any DOM mutations it made.
 */
export function useAnimeScope(options: UseAnimeScopeOptions = {}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef<Scope | null>(null)

  useEffect(() => {
    if (options.disabled || !rootRef.current) return
    scopeRef.current = createScope({
      root: rootRef.current,
      defaults: options.defaults,
      mediaQueries: options.mediaQueries,
    })
    return () => {
      scopeRef.current?.revert()
      scopeRef.current = null
    }
  }, [options.disabled])

  return { rootRef, scope: scopeRef }
}