"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import CopyButton from "@/components/tools/shared/copy-button"

const tabs = [
  { id: "text", label: "Text" },
  { id: "file", label: "File" },
]

export default function Base64Tool() {
  const [activeTab, setActiveTab] = useState("text")
  const [textInput, setTextInput] = useState("")
  const [textOutput, setTextOutput] = useState("")
  const [fileOutput, setFileOutput] = useState("")
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")

  const encode = useCallback(() => {
    try {
      setTextOutput(btoa(unescape(encodeURIComponent(textInput))))
      setError("")
    } catch {
      setError("Failed to encode text")
    }
  }, [textInput])

  const decode = useCallback(() => {
    try {
      setTextOutput(decodeURIComponent(escape(atob(textInput))))
      setError("")
    } catch {
      setError("Invalid Base64 string")
    }
  }, [textInput])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setError("")
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setFileOutput(result.split(",")[1] || "")
    }
    reader.onerror = () => setError("Failed to read file")
    reader.readAsDataURL(file)
  }, [])

  return (
    <div className="space-y-6">
      <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "text" ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={encode} size="sm">Encode</Button>
            <Button onClick={decode} variant="outline" size="sm">Decode</Button>
            <Button onClick={() => { setTextInput(""); setTextOutput(""); setError("") }} variant="ghost" size="sm">Clear</Button>
          </div>

          <div className="relative">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text or Base64 string..."
              className="w-full min-h-[150px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
            />
            {textInput && <div className="absolute top-2 right-2"><CopyButton text={textInput} /></div>}
          </div>

          {textOutput && (
            <div className="relative">
              <textarea
                readOnly
                value={textOutput}
                className="w-full min-h-[150px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y font-mono text-sm"
              />
              <div className="absolute top-2 right-2"><CopyButton text={textOutput} /></div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 text-sm">
              Choose File
              <input type="file" onChange={handleFile} className="hidden" />
            </label>
            {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
          </div>

          {fileOutput && (
            <div className="relative">
              <textarea
                readOnly
                value={fileOutput}
                className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y font-mono text-sm"
              />
              <div className="absolute top-2 right-2"><CopyButton text={fileOutput} /></div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}