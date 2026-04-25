"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import TabSwitcher from "@/components/tools/shared/tab-switcher"
import CopyButton from "@/components/tools/shared/copy-button"
import * as yaml from "js-yaml"

const tabs = [
  { id: "yaml-json", label: "YAML to JSON" },
  { id: "json-yaml", label: "JSON to YAML" },
]

export default function YamlJsonConverter() {
  const [activeTab, setActiveTab] = useState("yaml-json")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")

  const yamlToJson = useCallback(() => {
    try {
      const parsed = yaml.load(input)
      setOutput(JSON.stringify(parsed, null, 2))
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid YAML")
      setOutput("")
    }
  }, [input])

  const jsonToYaml = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      setOutput(yaml.dump(parsed, { indent: 2, lineWidth: 120 }))
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON")
      setOutput("")
    }
  }, [input])

  const handleConvert = () => {
    if (activeTab === "yaml-json") yamlToJson()
    else jsonToYaml()
  }

  return (
    <div className="space-y-6">
      <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex gap-2">
        <Button onClick={handleConvert} size="sm">Convert</Button>
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
            placeholder={activeTab === "yaml-json" ? "Paste YAML here..." : "Paste JSON here..."}
            className="w-full min-h-[300px] sm:min-h-[400px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
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
            className="w-full min-h-[300px] sm:min-h-[400px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y font-mono text-sm"
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