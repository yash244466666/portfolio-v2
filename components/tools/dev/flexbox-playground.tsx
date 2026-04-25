"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"

interface FlexItem {
  id: string
  label: string
  flexGrow: number
  flexShrink: number
  flexBasis: string
}

let itemCounter = 0

function createItem(): FlexItem {
  return {
    id: `item-${++itemCounter}`,
    label: `Item ${itemCounter}`,
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "auto",
  }
}

export default function FlexboxPlayground() {
  const [direction, setDirection] = useState("row")
  const [justifyContent, setJustifyContent] = useState("flex-start")
  const [alignItems, setAlignItems] = useState("stretch")
  const [flexWrap, setFlexWrap] = useState("nowrap")
  const [gap, setGap] = useState(8)
  const [items, setItems] = useState<FlexItem[]>([
    { ...createItem(), label: "Item 1" },
    { ...createItem(), label: "Item 2" },
    { ...createItem(), label: "Item 3" },
  ])

  const containerStyle = useMemo(
    () => ({
      display: "flex" as const,
      flexDirection: direction as React.CSSProperties["flexDirection"],
      justifyContent: justifyContent as React.CSSProperties["justifyContent"],
      alignItems: alignItems as React.CSSProperties["alignItems"],
      flexWrap: flexWrap as React.CSSProperties["flexWrap"],
      gap: `${gap}px`,
    }),
    [direction, justifyContent, alignItems, flexWrap, gap]
  )

  const cssCode = useMemo(() => {
    const lines = [
      "display: flex;",
      `flex-direction: ${direction};`,
      `justify-content: ${justifyContent};`,
      `align-items: ${alignItems};`,
      `flex-wrap: ${flexWrap};`,
      `gap: ${gap}px;`,
    ]
    return lines.join("\n")
  }, [direction, justifyContent, alignItems, flexWrap, gap])

  const updateItem = (id: string, field: keyof FlexItem, value: number | string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const selectOption = (
    label: string,
    value: string,
    options: string[],
    setter: (v: string) => void
  ) => (
    <div>
      <label className="text-sm font-medium text-foreground block mb-2">{label}</label>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => setter(opt)}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              value === opt
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div
        className="w-full min-h-[200px] rounded-xl border border-border/50 bg-background/50 p-4"
        style={containerStyle}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-primary/20 border border-primary/30 rounded-lg p-3 text-sm text-foreground text-center min-w-[60px] min-h-[40px] flex items-center justify-center"
            style={{
              flexGrow: item.flexGrow,
              flexShrink: item.flexShrink,
              flexBasis: item.flexBasis,
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {selectOption("Direction", direction, ["row", "row-reverse", "column", "column-reverse"], setDirection)}
        {selectOption("Justify Content", justifyContent, ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"], setJustifyContent)}
        {selectOption("Align Items", alignItems, ["stretch", "flex-start", "flex-end", "center", "baseline"], setAlignItems)}
        {selectOption("Flex Wrap", flexWrap, ["nowrap", "wrap", "wrap-reverse"], setFlexWrap)}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Gap</label>
            <span className="text-sm text-muted-foreground">{gap}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={32}
            value={gap}
            onChange={(e) => setGap(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Flex Items</label>
          <Button onClick={() => setItems((prev) => [...prev, createItem()])} variant="outline" size="sm">
            Add Item
          </Button>
        </div>
        {items.map((item) => (
          <div key={item.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              {items.length > 1 && (
                <Button onClick={() => removeItem(item.id)} variant="ghost" size="sm" className="h-7 text-xs text-red-400 hover:text-red-300">
                  Remove
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-muted-foreground">Grow</label>
                  <span className="text-xs text-muted-foreground">{item.flexGrow}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={item.flexGrow}
                  onChange={(e) => updateItem(item.id, "flexGrow", Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-muted-foreground">Shrink</label>
                  <span className="text-xs text-muted-foreground">{item.flexShrink}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={item.flexShrink}
                  onChange={(e) => updateItem(item.id, "flexShrink", Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Basis</label>
                <input
                  value={item.flexBasis}
                  onChange={(e) => updateItem(item.id, "flexBasis", e.target.value)}
                  className="w-full h-7 px-2 rounded border border-border bg-background/50 text-xs font-mono text-foreground"
                  placeholder="auto"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/30 border border-border/50 rounded-lg p-4 relative">
        <p className="text-xs text-muted-foreground mb-1">CSS</p>
        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{cssCode}</pre>
        <div className="absolute top-3 right-3"><CopyButton text={cssCode} /></div>
      </div>
    </div>
  )
}