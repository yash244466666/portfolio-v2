"use client"

import { useState, useMemo } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Input } from "@/components/ui/input"
import TabSwitcher from "@/components/tools/shared/tab-switcher"

const tabs = [
  { id: "percent-of", label: "X% of Y" },
  { id: "what-percent", label: "X is ?% of Y" },
  { id: "percent-change", label: "% Change" },
]

export default function PercentageCalculator() {
  const [activeTab, setActiveTab] = useState("percent-of")
  const [valueA, setValueA] = useState("")
  const [valueB, setValueB] = useState("")

  const result = useMemo(() => {
    const a = parseFloat(valueA)
    const b = parseFloat(valueB)
    if (isNaN(a) || isNaN(b)) return null

    switch (activeTab) {
      case "percent-of":
        return (a / 100) * b
      case "what-percent":
        return b !== 0 ? (a / b) * 100 : null
      case "percent-change":
        return b !== 0 ? ((a - b) / Math.abs(b)) * 100 : null
      default:
        return null
    }
  }, [activeTab, valueA, valueB])

  const getLabels = () => {
    switch (activeTab) {
      case "percent-of":
        return { aLabel: "Percentage (X%)", bLabel: "Of Value (Y)", prefix: "" }
      case "what-percent":
        return { aLabel: "Value (X)", bLabel: "Total (Y)", prefix: "" }
      case "percent-change":
        return { aLabel: "New Value", bLabel: "Old Value", prefix: "" }
      default:
        return { aLabel: "Value A", bLabel: "Value B", prefix: "" }
    }
  }

  const getResultLabel = () => {
    switch (activeTab) {
      case "percent-of":
        return "Result"
      case "what-percent":
        return "Percentage"
      case "percent-change":
        return "Change"
      default:
        return "Result"
    }
  }

  const formatResult = (val: number) => {
    if (activeTab === "what-percent" || activeTab === "percent-change") {
      return val.toFixed(4).replace(/\.?0+$/, "") + "%"
    }
    return val.toFixed(4).replace(/\.?0+$/, "")
  }

  const labels = getLabels()

  return (
    <div className="space-y-6">
      <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            {labels.aLabel}
          </label>
          <Input
            type="number"
            value={valueA}
            onChange={(e) => setValueA(e.target.value)}
            placeholder="0"
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            {labels.bLabel}
          </label>
          <Input
            type="number"
            value={valueB}
            onChange={(e) => setValueB(e.target.value)}
            placeholder="0"
            className="font-mono"
          />
        </div>
      </div>

      <ToolResult className="    text-center">
        <span className="text-sm text-muted-foreground block mb-1">{getResultLabel()}</span>
        <span className="text-3xl font-mono text-foreground">
          {result !== null ? formatResult(result) : "--"}
        </span>
      </ToolResult>

      {activeTab === "percent-of" && valueA && valueB && result !== null && (
        <ToolResult className="    text-center">
          <p className="text-sm text-muted-foreground">
            {valueA}% of {valueB} = <span className="text-foreground font-medium">{formatResult(result)}</span>
          </p>
        </ToolResult>
      )}
      {activeTab === "what-percent" && valueA && valueB && result !== null && (
        <ToolResult className="    text-center">
          <p className="text-sm text-muted-foreground">
            {valueA} is <span className="text-foreground font-medium">{formatResult(result)}</span> of {valueB}
          </p>
        </ToolResult>
      )}
      {activeTab === "percent-change" && valueA && valueB && result !== null && (
        <ToolResult className="    text-center">
          <p className="text-sm text-muted-foreground">
            {result >= 0 ? "Increase" : "Decrease"} of{" "}
            <span className="text-foreground font-medium">{formatResult(Math.abs(result))}</span>{" "}
            from {valueB} to {valueA}
          </p>
        </ToolResult>
      )}
    </div>
  )
}