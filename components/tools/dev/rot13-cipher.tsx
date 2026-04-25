"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"

function caesarShift(text: string, shift: number): string {
  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65)
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97)
      }
      return char
    })
    .join("")
}

export default function Rot13Cipher() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [shift, setShift] = useState(13)

  const handleEncode = useCallback(() => {
    setOutput(caesarShift(input, shift))
  }, [input, shift])

  const handleDecode = useCallback(() => {
    setOutput(caesarShift(input, 26 - shift))
  }, [input, shift])

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">Shift Amount</label>
          <span className="text-sm text-muted-foreground">{shift}</span>
        </div>
        <input
          type="range"
          min={1}
          max={25}
          value={shift}
          onChange={(e) => setShift(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1</span>
          <span className="text-primary font-medium">ROT{shift}</span>
          <span>25</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleEncode} size="sm">Encode</Button>
        <Button onClick={handleDecode} variant="outline" size="sm">Decode</Button>
        <Button onClick={() => { setInput(""); setOutput("") }} variant="ghost" size="sm">Clear</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Input</label>
            {input && <CopyButton text={input} />}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to encode/decode..."
            className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            {output && <CopyButton text={output} />}
          </div>
          <textarea
            readOnly
            value={output}
            className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y font-mono text-sm"
          />
        </div>
      </div>
    </div>
  )
}