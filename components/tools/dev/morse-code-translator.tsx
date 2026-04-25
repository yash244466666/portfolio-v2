"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import CopyButton from "@/components/tools/shared/copy-button"
import { textToMorse, morseToText } from "@/lib/tools/morse-code"

const tabs = [
  { id: "text-morse", label: "Text to Morse" },
  { id: "morse-text", label: "Morse to Text" },
]

function playMorseAudio(morse: string) {
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  const dit = 0.08
  const dah = dit * 3
  const symbolGap = dit
  const letterGap = dit * 3
  const wordGap = dit * 7

  let time = audioCtx.currentTime + 0.05

  const words = morse.split(" / ")
  for (const word of words) {
    const letters = word.split(" ")
    for (let li = 0; li < letters.length; li++) {
      const letter = letters[li]
      for (let si = 0; si < letter.length; si++) {
        const symbol = letter[si]
        if (symbol === "." || symbol === "-") {
          const duration = symbol === "." ? dit : dah
          const osc = audioCtx.createOscillator()
          const gain = audioCtx.createGain()
          osc.connect(gain)
          gain.connect(audioCtx.destination)
          osc.frequency.value = 600
          gain.gain.setValueAtTime(0.5, time)
          gain.gain.setValueAtTime(0, time + duration)
          osc.start(time)
          osc.stop(time + duration)
          time += duration

          if (si < letter.length - 1) {
            time += symbolGap
          }
        }
      }
      if (li < letters.length - 1) {
        time += letterGap
      }
    }
    time += wordGap
  }
}

export default function MorseCodeTranslator() {
  const [activeTab, setActiveTab] = useState("text-morse")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")

  const handleConvert = useCallback(() => {
    try {
      if (activeTab === "text-morse") {
        setOutput(textToMorse(input))
      } else {
        setOutput(morseToText(input))
      }
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed")
      setOutput("")
    }
  }, [input, activeTab])

  const handlePlay = useCallback(() => {
    if (!output || activeTab !== "text-morse") return
    playMorseAudio(output)
  }, [output, activeTab])

  return (
    <div className="space-y-6">
      <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex gap-2">
        <Button onClick={handleConvert} size="sm">Convert</Button>
        {output && activeTab === "text-morse" && (
          <Button onClick={handlePlay} variant="outline" size="sm">Play Audio</Button>
        )}
        <Button onClick={() => { setInput(""); setOutput(""); setError("") }} variant="ghost" size="sm">Clear</Button>
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
            placeholder={activeTab === "text-morse" ? "Enter text..." : "Enter morse code (use . - / and spaces)..."}
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

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}