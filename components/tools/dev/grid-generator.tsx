"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

interface GridItem {
  id: string
  label: string
  gridColumn: string
  gridRow: string
}

let itemCounter = 0

function createGridItem(): GridItem {
  return {
    id: `grid-item-${++itemCounter}`,
    label: `Item ${itemCounter}`,
    gridColumn: "auto",
    gridRow: "auto",
  }
}

export default function GridGenerator() {
  const [columns, setColumns] = useState("1fr 1fr 1fr")
  const [rows, setRows] = useState("auto")
  const [gap, setGap] = useState(8)
  const [items, setItems] = useState<GridItem[]>([
    { ...createGridItem(), label: "Item 1" },
    { ...createGridItem(), label: "Item 2" },
    { ...createGridItem(), label: "Item 3" },
    { ...createGridItem(), label: "Item 4" },
    { ...createGridItem(), label: "Item 5" },
    { ...createGridItem(), label: "Item 6" },
  ])

  const containerStyle = useMemo(
    () => ({
      display: "grid" as const,
      gridTemplateColumns: columns,
      gridTemplateRows: rows,
      gap: `${gap}px`,
    }),
    [columns, rows, gap]
  )

  const cssCode = useMemo(() => {
    const lines = [
      "display: grid;",
      `grid-template-columns: ${columns};`,
      `grid-template-rows: ${rows};`,
      `gap: ${gap}px;`,
    ]
    items.forEach((item) => {
      if (item.gridColumn !== "auto") lines.push(`/* ${item.label} */ grid-column: ${item.gridColumn};`)
      if (item.gridRow !== "auto") lines.push(`/* ${item.label} */ grid-row: ${item.gridRow};`)
    })
    return lines.join("\n")
  }, [columns, rows, gap, items])

  const updateItem = (id: string, field: keyof GridItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      <div
        className="w-full min-h-[200px] rounded-xl border border-border/50 bg-background/50 p-4"
        style={containerStyle}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-primary/20 border border-primary/30 rounded-lg p-3 text-sm text-foreground text-center min-h-[40px] flex items-center justify-center"
            style={{
              gridColumn: item.gridColumn,
              gridRow: item.gridRow,
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Columns</label>
          <Input
            value={columns}
            onChange={(e) => setColumns(e.target.value)}
            placeholder="1fr 1fr 1fr"
            className="bg-background/50 font-mono"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Rows</label>
          <Input
            value={rows}
            onChange={(e) => setRows(e.target.value)}
            placeholder="auto"
            className="bg-background/50 font-mono"
          />
        </div>
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
          <label className="text-sm font-medium text-foreground">Grid Items</label>
          <Button onClick={() => setItems((prev) => [...prev, createGridItem()])} variant="outline" size="sm">
            Add Item
          </Button>
        </div>
        {items.map((item) => (
          <div key={item.id} className="p-3 rounded-lg border border-border/50 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              {items.length > 1 && (
                <Button onClick={() => removeItem(item.id)} variant="ghost" size="sm" className="h-7 text-xs text-red-400 hover:text-red-300">
                  Remove
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">grid-column</label>
                <input
                  value={item.gridColumn}
                  onChange={(e) => updateItem(item.id, "gridColumn", e.target.value)}
                  className="w-full h-7 px-2 rounded border border-border bg-background/50 text-xs font-mono text-foreground"
                  placeholder="auto"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">grid-row</label>
                <input
                  value={item.gridRow}
                  onChange={(e) => updateItem(item.id, "gridRow", e.target.value)}
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