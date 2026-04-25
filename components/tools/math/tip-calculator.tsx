"use client"

import { useState, useMemo } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const presetTips = [10, 15, 18, 20, 25]

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState("")
  const [tipPercent, setTipPercent] = useState(18)
  const [splitCount, setSplitCount] = useState(1)

  const result = useMemo(() => {
    const bill = parseFloat(billAmount)
    if (isNaN(bill) || bill <= 0) return null

    const tip = bill * (tipPercent / 100)
    const total = bill + tip
    const perPerson = splitCount > 0 ? total / splitCount : total

    return {
      tip: tip.toFixed(2),
      total: total.toFixed(2),
      perPerson: perPerson.toFixed(2),
      tipPerPerson: (tip / (splitCount > 0 ? splitCount : 1)).toFixed(2),
    }
  }, [billAmount, tipPercent, splitCount])

  return (
    <div className="space-y-6">
      {/* Bill amount */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Bill Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            type="number"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            placeholder="0.00"
            className="font-mono pl-7"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Tip percentage */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">Tip</label>
          <span className="text-sm text-primary font-mono">{tipPercent}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          value={tipPercent}
          onChange={(e) => setTipPercent(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
        />
        <div className="flex gap-2 mt-3">
          {presetTips.map((pct) => (
            <Button
              key={pct}
              variant={tipPercent === pct ? "default" : "outline"}
              size="sm"
              onClick={() => setTipPercent(pct)}
              className="flex-1 font-mono text-xs"
            >
              {pct}%
            </Button>
          ))}
        </div>
      </div>

      {/* Split count */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">Split Between</label>
          <span className="text-sm text-muted-foreground font-mono">{splitCount} people</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSplitCount((c) => Math.max(1, c - 1))}
            className="w-10"
          >
            -
          </Button>
          <div className="flex-1 text-center font-mono text-foreground text-lg">
            {splitCount}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSplitCount((c) => Math.min(100, c + 1))}
            className="w-10"
          >
            +
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <ToolResult className="    space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tip Amount</span>
            <span className="text-lg font-mono text-foreground">${result.tip}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-mono text-foreground">${result.total}</span>
          </div>
          {splitCount > 1 && (
            <>
              <div className="border-t border-border/50 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Per Person</span>
                  <span className="text-lg font-mono text-primary">${result.perPerson}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Tip per person</span>
                  <span className="text-sm font-mono text-muted-foreground">${result.tipPerPerson}</span>
                </div>
              </div>
            </>
          )}
        </ToolResult>
      )}
    </div>
  )
}