"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

export default function UuidGenerator() {
  const [count, setCount] = useState(1)
  const [uppercase, setUppercase] = useState(false)
  const [withHyphens, setWithHyphens] = useState(true)
  const [uuids, setUuids] = useState<string[]>([])

  const generate = useCallback(() => {
    const results: string[] = []
    for (let i = 0; i < count; i++) {
      let uuid = crypto.randomUUID()
      if (uppercase) uuid = uuid.toUpperCase()
      if (!withHyphens) uuid = uuid.replace(/-/g, "")
      results.push(uuid)
    }
    setUuids(results)
  }, [count, uppercase, withHyphens])

  const allText = uuids.join("\n")

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Count</label>
            <span className="text-sm text-muted-foreground">{count}</span>
          </div>
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
            className="bg-background/50"
          />
        </div>

        <div className="space-y-3 pt-1">
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-border accent-primary"
            />
            Uppercase
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={withHyphens}
              onChange={(e) => setWithHyphens(e.target.checked)}
              className="rounded border-border accent-primary"
            />
            With hyphens
          </label>
        </div>
      </div>

      <Button onClick={generate} className="w-full sm:w-auto">Generate UUIDs</Button>

      {uuids.length > 0 && (
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">
              Generated UUIDs ({uuids.length})
            </label>
            <CopyButton text={allText} />
          </div>
          <textarea
            readOnly
            value={allText}
            className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y font-mono text-sm"
          />
        </div>
      )}
    </div>
  )
}