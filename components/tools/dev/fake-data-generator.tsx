"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"
import { fakeFullName, fakeEmail, fakePhone, fakeAddress, fakeCompany } from "@/lib/tools/fake-data"

type DataType = "fullname" | "email" | "phone" | "address" | "company" | "all"

const dataTypes: { id: DataType; label: string }[] = [
  { id: "fullname", label: "Full Name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "address", label: "Address" },
  { id: "company", label: "Company" },
  { id: "all", label: "All Fields" },
]

interface FakeEntry {
  type: string
  value: string
}

function generateData(type: DataType): FakeEntry[] {
  switch (type) {
    case "fullname": return [{ type: "Name", value: fakeFullName() }]
    case "email": return [{ type: "Email", value: fakeEmail() }]
    case "phone": return [{ type: "Phone", value: fakePhone() }]
    case "address": return [{ type: "Address", value: fakeAddress() }]
    case "company": return [{ type: "Company", value: fakeCompany() }]
    case "all": return [
      { type: "Name", value: fakeFullName() },
      { type: "Email", value: fakeEmail() },
      { type: "Phone", value: fakePhone() },
      { type: "Address", value: fakeAddress() },
      { type: "Company", value: fakeCompany() },
    ]
  }
}

export default function FakeDataGenerator() {
  const [type, setType] = useState<DataType>("fullname")
  const [count, setCount] = useState(5)
  const [results, setResults] = useState<FakeEntry[][]>([])

  const handleGenerate = useCallback(() => {
    const entries: FakeEntry[][] = []
    for (let i = 0; i < count; i++) {
      entries.push(generateData(type))
    }
    setResults(entries)
  }, [type, count])

  const allText = results.map((entry) => entry.map((e) => `${e.type}: ${e.value}`).join(" | ")).join("\n")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground block mb-2">Data Type</label>
          <div className="flex flex-wrap gap-2">
            {dataTypes.map((dt) => (
              <button
                key={dt.id}
                onClick={() => setType(dt.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  type === dt.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full sm:w-32">
          <label className="text-sm font-medium text-foreground block mb-2">Count</label>
          <Input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value))))}
            className="bg-background/50"
          />
        </div>

        <div className="flex items-end">
          <Button onClick={handleGenerate}>Generate</Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">{results.length} result{results.length !== 1 ? "s" : ""}</h3>
            <CopyButton text={allText} />
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {results.map((entry, i) => (
              <div key={i} className="bg-background/50 border border-border/50 rounded-lg p-3">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {entry.map((e, j) => (
                    <div key={j}>
                      <span className="text-xs text-muted-foreground">{e.type}: </span>
                      <span className="text-sm text-foreground font-mono">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}