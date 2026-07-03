"use client"

import { useMemo } from "react"
import { TreeNode } from "./tree-node"
import { isExpandable } from "./json-tree-utils"

interface TreePanelProps {
  jsonString: string
  expandedPaths: Set<string>
  onToggle: (path: string) => void
  onChange: (newObj: unknown) => void
}

export function TreePanel({ jsonString, expandedPaths, onToggle, onChange }: TreePanelProps) {
  const parsed = useMemo(() => {
    try {
      return JSON.parse(jsonString)
    } catch {
      return null
    }
  }, [jsonString])

  const isValid = parsed !== null || jsonString.trim() === ""

  if (!isValid) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-[350px] lg:min-h-0 rounded-lg border border-red-500/30 bg-red-500/5 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-red-400 text-sm font-medium mb-1">Invalid JSON</p>
            <p className="text-muted-foreground text-xs">Fix errors in the code editor to see the tree view</p>
          </div>
        </div>
      </div>
    )
  }

  if (jsonString.trim() === "") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 min-h-[350px] lg:min-h-0 rounded-lg border border-border bg-background/50 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-muted-foreground text-sm">Paste or type JSON to see the tree view</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-[350px] lg:min-h-0 rounded-lg border border-border bg-background/50 backdrop-blur-sm overflow-hidden">
        <div className="h-full overflow-auto p-4">
          <TreeNode
            value={parsed}
            path={[]}
            root={parsed}
            expandedPaths={expandedPaths}
            onToggle={onToggle}
            onChange={onChange}
            isRoot
          />
        </div>
      </div>
    </div>
  )
}