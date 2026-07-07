"use client"

import { useEffect, useMemo, useState } from "react"
import type { ToolCategory, ToolDefinition } from "@/lib/content/tools/types"
import { getToolsByCategory } from "@/lib/content/tools/utils"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface ToolsToolbarProps {
  categories: ToolCategory[]
  activeCategoryId?: string | null
  onCategoryClick: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder: string
}

/**
 * Persistent sticky toolbar for the tools page. Hosts the single search
 * combobox and category chips so they remain reachable while scrolling
 * through the pinned filmstrip sections and while browsing flat search
 * results. Sits flush below the fixed nav (≈68px tall).
 */
export default function ToolsToolbar({
  categories,
  activeCategoryId = null,
  onCategoryClick,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
}: ToolsToolbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(searchQuery)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    if (!isOpen) setActiveSuggestionIndex(-1)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const input = document.querySelector<HTMLInputElement>("#tools-toolbar-search")
    if (input) input.focus()
  }, [isOpen])

  const allTools = useMemo(
    () => categories.flatMap((cat) => getToolsByCategory(cat.id)),
    [categories]
  )

  const getSuggestions = (query: string): ToolDefinition[] => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return allTools
      .filter(
        (tool) =>
          tool.label.toLowerCase().includes(q) ||
          tool.description.toLowerCase().includes(q)
      )
      .slice(0, 6)
  }

  const suggestions = getSuggestions(inputValue)
  const listboxId = "tools-toolbar-listbox"
  const showChips = !searchQuery

  const selectSuggestion = (label: string) => {
    setInputValue(label)
    onSearchChange(label)
    setIsOpen(false)
  }

  return (
    <div className="tools-toolbar tools-toolbar--root sticky top-[4.25rem] z-30">
      <div className="tools-toolbar__inner max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-center gap-3">
        <div className="tools-toolbar__search relative shrink-0">
          <div
            className={`tools-toolbar__search-combobox flex items-center h-11 rounded-full border transition-[width,background-color,border-color] duration-200 ease-out ${
              isOpen
                ? "w-56 sm:w-72 bg-muted/80 border-primary/40 pr-1 shadow-[0_0_0_4px_rgba(124,58,237,0.08)]"
                : "w-auto bg-muted/50 border-border/60 hover:bg-muted hover:border-border cursor-pointer"
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
                <label htmlFor="tools-toolbar-search" className="sr-only">
                  {searchPlaceholder}
                </label>
                <Input
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
                  className="tools-toolbar__search-input h-11 min-w-0 flex-1 border-0 bg-transparent shadow-none px-1 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70 text-sm"
                />
                {inputValue && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setInputValue("")
                      onSearchChange("")
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
              className="tools-toolbar__suggestions absolute top-full left-0 mt-2 w-56 sm:w-72 max-h-72 overflow-auto rounded-xl border border-border/60 bg-popover/95 backdrop-blur-md shadow-xl shadow-black/30 z-50 py-1"
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

        {showChips && (
          <div className="tools-toolbar__chips min-w-0 flex items-center justify-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1">
            {categories.map((cat) => {
              const isActive = activeCategoryId === cat.id
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => onCategoryClick(cat.id)}
                  aria-pressed={isActive}
                  aria-current={isActive ? "true" : undefined}
                  className={`tools-toolbar__chip min-h-[44px] px-3.5 sm:px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 ${
                    isActive
                      ? "is-active bg-primary text-primary-foreground border-primary shadow-[0_0_20px_-4px_rgba(124,58,237,0.45)]"
                      : "bg-muted/50 text-foreground/80 border-border/60 hover:bg-muted hover:border-border hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}