"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

const bases = [
  { id: "decimal", label: "Decimal", radix: 10 },
  { id: "binary", label: "Binary", radix: 2 },
  { id: "octal", label: "Octal", radix: 8 },
  { id: "hex", label: "Hexadecimal", radix: 16 },
  { id: "base32", label: "Base 32", radix: 32 },
  { id: "base36", label: "Base 36", radix: 36 },
]

export default function NumberBaseConverter() {
  const [decimalValue, setDecimalValue] = useState<string>("255")

  const isValidDecimal = (v: string) => /^-?\d+$/.test(v)

  const convert = (radix: number): string => {
    const num = parseInt(decimalValue, 10)
    if (isNaN(num)) return ""
    return num.toString(radix).toUpperCase()
  }

  const handleOtherBaseChange = (radix: number, value: string) => {
    const cleaned = value.replace(/[^0-9a-zA-Z]/g, "")
    const num = parseInt(cleaned, radix)
    if (!isNaN(num)) {
      setDecimalValue(num.toString(10))
    } else {
      setDecimalValue("")
    }
  }

  return (
    <div className="space-y-4">
      {bases.map((base) => (
        <div key={base.id}>
          <label className="text-sm font-medium text-foreground block mb-1.5">{base.label} (radix {base.radix})</label>
          <Input
            type="text"
            value={base.id === "decimal" ? decimalValue : convert(base.radix)}
            onChange={(e) => {
              if (base.id === "decimal") setDecimalValue(e.target.value)
              else handleOtherBaseChange(base.radix, e.target.value)
            }}
            placeholder={base.id === "decimal" ? "Enter a number..." : ""}
            className="bg-background/50 font-mono"
          />
        </div>
      ))}

      <div className="mt-4">
        <label className="text-sm font-medium text-foreground block mb-1.5">Custom Radix</label>
        <div className="flex gap-3">
          <Input
            type="number"
            min={2}
            max={36}
            placeholder="2-36"
            className="w-24 bg-background/50 font-mono"
            onChange={(e) => {
              const r = parseInt(e.target.value)
              if (r >= 2 && r <= 36) {
                const num = parseInt(decimalValue, 10)
                if (!isNaN(num)) {
                  (e.target as HTMLInputElement).dataset.output = num.toString(r).toUpperCase()
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}