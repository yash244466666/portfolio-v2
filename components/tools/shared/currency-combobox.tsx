"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
import {
  formatCurrencyLabel,
  getCurrency,
  getDefaultCurrencyOptions,
  normalizeCurrencySearch,
  searchCurrencies,
  type CurrencyInfo,
} from "@/lib/tools/currency-data"
import { cn } from "@/lib/utils"

interface CurrencyComboboxProps {
  label: string
  value: string
  onChange: (code: string) => void
  className?: string
}

/**
 * Searchable currency picker. The input is a real ARIA combobox: focus opens
 * the list, typing filters by code/name/country/symbol, arrows move the active
 * option, Enter selects, Escape closes, and Tab leaves the field.
 */
export function CurrencyCombobox({ label, value, onChange, className }: CurrencyComboboxProps) {
  const baseId = useId()
  const inputId = `${baseId}-input`
  const listboxId = `${baseId}-listbox`
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(-1)

  const selected = getCurrency(value)
  const selectedLabel = selected ? formatCurrencyLabel(selected) : value
  const defaultOptions = useMemo(() => getDefaultCurrencyOptions(), [])
  const options = useMemo(
    () => (normalizeCurrencySearch(query) ? searchCurrencies(query) : defaultOptions),
    [defaultOptions, query]
  )

  const closeList = useCallback(() => {
    setOpen(false)
    setQuery("")
    setActiveIndex(-1)
  }, [])

  const openList = useCallback(() => {
    const selectedIndex = defaultOptions.findIndex((currency) => currency.code === value)
    setQuery("")
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }, [defaultOptions, value])

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeList()
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [closeList, open])

  useEffect(() => {
    if (!open || activeIndex < 0) return
    const activeCode = options[activeIndex]?.code
    if (!activeCode) return
    document
      .getElementById(`${listboxId}-option-${activeCode}`)
      ?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, listboxId, open, options])

  const selectCurrency = (currency: CurrencyInfo) => {
    onChange(currency.code)
    closeList()
    inputRef.current?.focus()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      if (!open) {
        openList()
        return
      }
      setActiveIndex((previous) =>
        options.length === 0 ? -1 : previous < 0 ? 0 : (previous + 1) % options.length
      )
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      if (!open) {
        openList()
        return
      }
      setActiveIndex((previous) =>
        options.length === 0 ? -1 : previous <= 0 ? options.length - 1 : previous - 1
      )
      return
    }

    if (open && event.key === "Home") {
      event.preventDefault()
      setActiveIndex(0)
      return
    }

    if (open && event.key === "End") {
      event.preventDefault()
      setActiveIndex(options.length - 1)
      return
    }

    if (event.key === "Enter") {
      if (open && activeIndex >= 0 && options[activeIndex]) {
        event.preventDefault()
        selectCurrency(options[activeIndex])
      }
      return
    }

    if (event.key === "Escape") {
      if (open) {
        event.preventDefault()
        closeList()
        inputRef.current?.focus()
      }
      return
    }

    if (event.key === "Tab") {
      closeList()
    }
  }

  return (
    <div ref={containerRef} className={cn("relative min-w-0", className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-foreground block mb-2">
        {label}
      </label>

      <div
        className="relative flex h-12 min-h-[44px] w-full items-center rounded-xl border border-border/50 bg-background/40 px-3 shadow-sm backdrop-blur-md transition-all duration-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 hover:border-border hover:bg-background/60"
        onClick={() => {
          inputRef.current?.focus()
          if (!open) openList()
        }}
      >
        <Search className="mr-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            open && activeIndex >= 0 && options[activeIndex]
              ? `${listboxId}-option-${options[activeIndex].code}`
              : undefined
          }
          aria-label={label}
          autoComplete="off"
          spellCheck={false}
          value={open ? query : selectedLabel}
          placeholder={open ? "Search currencies..." : selectedLabel}
          onChange={(event) => {
            if (!open) setOpen(true)
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onFocus={() => {
            if (!open) openList()
          }}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground md:text-sm"
        />
        {open && query ? (
          <button
            type="button"
            aria-label="Clear currency search"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("")
              setActiveIndex(0)
              inputRef.current?.focus()
            }}
            className="flex size-[44px] shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        )}
      </div>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(18rem,60dvh)] overflow-y-auto overscroll-contain rounded-xl border border-border/60 bg-popover/95 py-1 shadow-xl backdrop-blur-md"
        >
          {options.length === 0 ? (
            <li role="presentation" className="px-4 py-3 text-sm text-muted-foreground">
              No currencies found
            </li>
          ) : (
            options.map((currency, index) => {
              const isActive = index === activeIndex
              const isSelected = currency.code === value
              return (
                <li
                  key={currency.code}
                  id={`${listboxId}-option-${currency.code}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCurrency(currency)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex min-h-[44px] cursor-pointer items-center justify-between gap-3 px-4 py-2 text-sm",
                    isActive ? "bg-primary/15" : "hover:bg-muted/60",
                    isSelected && "font-medium"
                  )}
                >
                  <span className="min-w-0 truncate">
                    <span className="font-mono font-semibold">{currency.code}</span>
                    <span className="text-muted-foreground"> — {currency.name}</span>
                  </span>
                  {isSelected && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}

export default CurrencyCombobox
