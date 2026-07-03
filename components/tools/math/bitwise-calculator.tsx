"use client"

import { useState, useMemo } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Input } from "@/components/ui/input"

type Operation = "AND" | "OR" | "XOR" | "NOT" | "LSHIFT" | "RSHIFT"

const operations: { id: Operation; label: string; symbol: string; unary: boolean }[] = [
  { id: "AND", label: "AND", symbol: "&", unary: false },
  { id: "OR", label: "OR", symbol: "|", unary: false },
  { id: "XOR", label: "XOR", symbol: "^", unary: false },
  { id: "NOT", label: "NOT", symbol: "~", unary: true },
  { id: "LSHIFT", label: "Left Shift", symbol: "<<", unary: false },
  { id: "RSHIFT", label: "Right Shift", symbol: ">>", unary: false },
]

function toBinary(n: number, bits: number = 32): string {
  if (n < 0) {
    // Two's complement for negative numbers
    n = (n >>> 0)
  }
  const bin = (n >>> 0).toString(2)
  if (bits <= bin.length) return bin.slice(-bits)
  return bin.padStart(bits, "0")
}

function toHex(n: number): string {
  return "0x" + ((n >>> 0) & 0xFFFFFFFF).toString(16).toUpperCase()
}

export default function BitwiseCalculator() {
  const [valueA, setValueA] = useState("255")
  const [valueB, setValueB] = useState("15")
  const [operation, setOperation] = useState<Operation>("AND")
  const [displayBits, setDisplayBits] = useState(8)

  const numA = useMemo(() => {
    const parsed = parseInt(valueA, 10)
    return isNaN(parsed) ? 0 : parsed
  }, [valueA])

  const numB = useMemo(() => {
    const parsed = parseInt(valueB, 10)
    return isNaN(parsed) ? 0 : parsed
  }, [valueB])

  const result = useMemo(() => {
    switch (operation) {
      case "AND":
        return numA & numB
      case "OR":
        return numA | numB
      case "XOR":
        return numA ^ numB
      case "NOT":
        return ~numA
      case "LSHIFT":
        return numA << numB
      case "RSHIFT":
        return numA >> numB
      default:
        return 0
    }
  }, [numA, numB, operation])

  const currentOp = operations.find((o) => o.id === operation)!

  return (
    <div className="space-y-6">
      {/* Operation selector */}
      <div className="flex flex-wrap gap-2">
        {operations.map((op) => (
          <button
            key={op.id}
            onClick={() => setOperation(op.id)}
            className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors ${
              operation === op.id
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {op.label}
            {!op.unary && <span className="ml-1 opacity-60">({op.symbol})</span>}
          </button>
        ))}
      </div>

      {/* Input fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Value A</label>
          <Input
            type="number"
            value={valueA}
            onChange={(e) => setValueA(e.target.value)}
            className="font-mono"
          />
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground">
              Hex: <span className="text-foreground font-mono">{toHex(numA)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Bin: <span className="text-foreground font-mono">{toBinary(numA, displayBits)}</span>
            </p>
          </div>
        </div>

        {!currentOp.unary && (
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Value B</label>
            <Input
              type="number"
              value={valueB}
              onChange={(e) => setValueB(e.target.value)}
              className="font-mono"
            />
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                Hex: <span className="text-foreground font-mono">{toHex(numB)}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Bin: <span className="text-foreground font-mono">{toBinary(numB, displayBits)}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Display bits */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-muted-foreground">Display Bits</label>
          <span className="text-sm font-mono text-foreground">{displayBits}</span>
        </div>
        <div className="flex gap-2">
          {[8, 16, 32].map((bits) => (
            <button
              key={bits}
              onClick={() => setDisplayBits(bits)}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                displayBits === bits
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {bits}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <ToolResult className="    space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Decimal</span>
          <span className="text-xl font-mono text-foreground">{result}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Hexadecimal</span>
          <span className="text-lg font-mono text-foreground">{toHex(result)}</span>
        </div>
        <div>
          <span className="text-sm text-muted-foreground block mb-2">Binary</span>
          <div className="flex flex-wrap gap-0.5 font-mono text-sm">
            {toBinary(result, displayBits).split("").map((bit, i) => (
              <span
                key={i}
                className={`w-5 h-6 flex items-center justify-center rounded-sm ${
                  bit === "1"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {bit}
              </span>
            ))}
          </div>
        </div>
      </ToolResult>

      {/* Visual binary comparison */}
      <ToolResult >
        <span className="text-sm font-medium text-foreground block mb-3">
          Visual Comparison
        </span>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-8">A:</span>
            <div className="flex flex-wrap gap-0.5">
              {toBinary(numA, displayBits).split("").map((bit, i) => (
                <span
                  key={i}
                  className={`w-3.5 h-4 flex items-center justify-center rounded-sm text-[10px] ${
                    bit === "1" ? "bg-blue-500/30 text-blue-400" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {bit}
                </span>
              ))}
            </div>
          </div>
          <div className="text-center text-muted-foreground text-xs">
            {currentOp.symbol}
          </div>
          {!currentOp.unary && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-8">B:</span>
              <div className="flex flex-wrap gap-0.5">
                {toBinary(numB, displayBits).split("").map((bit, i) => (
                  <span
                    key={i}
                    className={`w-3.5 h-4 flex items-center justify-center rounded-sm text-[10px] ${
                      bit === "1" ? "bg-green-500/30 text-green-400" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {bit}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="border-t border-border/50 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-8">=:</span>
              <div className="flex flex-wrap gap-0.5">
                {toBinary(result, displayBits).split("").map((bit, i) => (
                  <span
                    key={i}
                    className={`w-3.5 h-4 flex items-center justify-center rounded-sm text-[10px] ${
                      bit === "1" ? "bg-primary/30 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {bit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ToolResult>
    </div>
  )
}