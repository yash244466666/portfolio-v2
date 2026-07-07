"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { ToolCategory, ToolDefinition } from "@/lib/content/tools/types"
import { getToolsByCategory, matchesTool } from "@/lib/content/tools/utils"
import { Search, X } from "lucide-react"

interface ToolsToolbarProps {
  categories: ToolCategory[]
  activeCategoryId?: string | null
  matchedCategoryIds?: Set<string> | null
  onCategoryClick: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder: string
}

/**
 * Persistent sticky command bar for the tools page.
 *
 * The toolbar is anchored directly below the fixed nav and stays reachable while
 * the user scrolls through the pinned filmstrip sections or the flat search
 * results. It combines a compact search combobox and category chips in a centered,
 * strip that wraps gracefully on narrow screens.
 */
export default function ToolsToolbar({
  categories,
  activeCategoryId = null,
  matchedCategoryIds = null,
  onCategoryClick,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
}: ToolsToolbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(searchQuery)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    if (!isOpen) setActiveSuggestionIndex(-1)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const allTools = useMemo(
    () => categories.flatMap((cat) => getToolsByCategory(cat.id)),
    [categories]
  )

  const getSuggestions = (query: string): ToolDefinition[] => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return allTools.filter((tool) => matchesTool(q, tool)).slice(0, 6)
  }

  const suggestions = getSuggestions(inputValue)
  const listboxId = "tools-toolbar-listbox"

  const selectSuggestion = (label: string) => {
    setInputValue(label)
    onSearchChange(label)
    setIsOpen(false)
  }

  return (
    <div
      data-tools-toolbar
      className="tools-toolbar tools-toolbar--root sticky top-[var(--nav-height,4.25rem)] z-50 max-sm:bg-background/85 max-sm:backdrop-blur-md max-sm:border-b max-sm:border-border/40 max-sm:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
    >
      <div className="tools-toolbar__inner max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-2 sm:gap-3">
        {/* Search — single native input, single clear button. */}
        <div className="tools-toolbar__search relative w-full sm:shrink-0 sm:w-60">
          <label htmlFor="tools-toolbar-search" className="sr-only">
            {searchPlaceholder}
          </label>
          <div
            className={`tools-toolbar__search-combobox w-full flex items-center h-11 rounded-full border transition-all duration-200 ease-out ${
              isOpen
                ? "bg-background/80 border-primary/40 pr-1 shadow-[0_0_0_4px_rgba(124,58,237,0.08)]"
                : "bg-muted/50 border-white/[0.08] hover:bg-muted/70 hover:border-white/[0.12] cursor-pointer"
            }`}
            onClick={isOpen ? undefined : () => setIsOpen(true)}
          >
            <button
              type="button"
              onClick={() => setIsOpen(isOpen ? false : true)}
              aria-label={isOpen ? "Close search" : "Search tools"}
              aria-expanded={isOpen}
              aria-controls={isOpen ? listboxId : undefined}
              className="tools-toolbar__search-button inline-flex items-center justify-center h-11 w-11 shrink-0 text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>

            {isOpen ? (
              <div className="tools-toolbar__search-open flex-1 min-w-0 flex items-center gap-1">
                <input
                  ref={inputRef}
                  id="tools-toolbar-search"
                  type="text"
                  role="combobox"
                  aria-expanded={isOpen && suggestions.length > 0}
                  aria-controls={listboxId}
                  aria-autocomplete="list"
                  aria-activedescendant={
                    activeSuggestionIndex >= 0
                      ? `${listboxId}-opt-${activeSuggestionIndex}`
                      : undefined
                  }
                  placeholder={searchPlaceholder}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    setActiveSuggestionIndex(-1)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault()
                      if (suggestions.length > 0) {
                        setActiveSuggestionIndex((prev) =>
                          prev < suggestions.length - 1 ? prev + 1 : 0
                        )
                      }
                      return
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault()
                      if (suggestions.length > 0) {
                        setActiveSuggestionIndex((prev) =>
                          prev > 0 ? prev - 1 : suggestions.length - 1
                        )
                      }
                      return
                    }
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
                        selectSuggestion(suggestions[activeSuggestionIndex].label)
                      } else {
                        onSearchChange(inputValue)
                      }
                      return
                    }
                    if (e.key === "Escape") {
                      e.preventDefault()
                      if (inputValue) {
                        setInputValue("")
                        onSearchChange("")
                      } else {
                        setIsOpen(false)
                      }
                    }
                  }}
                  onBlur={() => {
                    window.setTimeout(() => setIsOpen(false), 120)
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  className="tools-toolbar__search-input h-11 min-w-0 flex-1 bg-transparent border-0 outline-none px-1 text-sm text-foreground placeholder:text-muted-foreground/70"
                />
                {inputValue && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setInputValue("")
                      onSearchChange("")
                      inputRef.current?.focus()
                    }}
                    aria-label="Clear search input"
                    className="tools-toolbar__search-clear inline-flex items-center justify-center h-7 w-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : (
              <span className="tools-toolbar__search-label pr-3.5 text-sm font-medium text-foreground/70 whitespace-nowrap select-none">
                Search
              </span>
            )}
          </div>

          {isOpen && suggestions.length > 0 && (
            <ul
              id={listboxId}
              role="listbox"
              className="tools-toolbar__suggestions absolute top-full left-0 right-0 mt-2 max-h-72 overflow-auto rounded-xl border border-border/60 bg-popover/95 backdrop-blur-md shadow-xl shadow-black/30 z-50 py-1"
              onMouseDown={(e) => e.preventDefault()}
            >
              {suggestions.map((tool, idx) => {
                const isActive = idx === activeSuggestionIndex
                return (
                  <li key={tool.id} role="presentation" className="tools-toolbar__suggestion-item">
                    <button
                      id={`${listboxId}-opt-${idx}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => selectSuggestion(tool.label)}
                      onMouseEnter={() => setActiveSuggestionIndex(idx)}
                      className={`tools-toolbar__suggestion w-full text-left px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary transition-colors ${
                        isActive
                          ? "bg-primary/15 text-foreground"
                          : "text-foreground hover:bg-primary/10"
                      }`}
                    >
                      <span className="tools-toolbar__suggestion-label font-medium block">{tool.label}</span>
                      <span className="tools-toolbar__suggestion-desc block text-xs text-muted-foreground truncate">
                        {tool.description}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Category chips — centered, always visible, wrap on very small screens. */}
        <div className="tools-toolbar__chips flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-2 min-w-0 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id
            const hasMatches = matchedCategoryIds === null || matchedCategoryIds.has(cat.id)
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => onCategoryClick(cat.id)}
                disabled={!hasMatches}
                aria-pressed={isActive}
                aria-current={isActive ? "true" : undefined}
                aria-disabled={!hasMatches}
                className={`tools-toolbar__chip snap-start min-h-[44px] px-3.5 sm:px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 ${
                  isActive
                    ? "is-active bg-primary text-primary-foreground border-primary shadow-[0_0_20px_-4px_rgba(124,58,237,0.45)]"
                    : hasMatches
                      ? "bg-muted/50 text-foreground/80 border-white/[0.08] hover:bg-muted hover:border-white/[0.14] hover:text-foreground"
                      : "bg-muted/30 text-muted-foreground/50 border-white/[0.06] cursor-not-allowed"
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Invisible balance element so the category chips stay visually centered on larger screens. */}
        <div className="hidden sm:block w-44 sm:w-60 shrink-0" aria-hidden="true" />
      </div>
    </div>
  )
}
