"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ChevronRight, Plus, Trash2, Copy, Pencil, Check, X } from "lucide-react"
import { getJsonType, isExpandable, valueToDisplayString, uniqueKeyName, JsonType, setByPath, deleteByPath, addAtPath, duplicateByPath, pathKey, Path } from "./json-tree-utils"

interface TreeNodeProps {
  keyName?: string
  value: unknown
  path: Path
  root: unknown
  expandedPaths: Set<string>
  onToggle: (pathKey: string) => void
  onChange: (newRoot: unknown) => void
  isRoot?: boolean
}

const TYPE_COLORS: Record<JsonType, { text: string; badge: string; dot: string }> = {
  string:  { text: "text-emerald-400", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", dot: "bg-emerald-400" },
  number:  { text: "text-blue-400",     badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",         dot: "bg-blue-400" },
  boolean: { text: "text-amber-400",    badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",       dot: "bg-amber-400" },
  null:    { text: "text-muted-foreground", badge: "bg-muted/50 border-border/50 text-muted-foreground",  dot: "bg-muted-foreground" },
  object:  { text: "text-purple-400",   badge: "bg-purple-500/10 border-purple-500/20 text-purple-400",   dot: "bg-purple-400" },
  array:   { text: "text-cyan-400",    badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",          dot: "bg-cyan-400" },
}

export function TreeNode({ keyName, value, path, root, expandedPaths, onToggle, onChange, isRoot }: TreeNodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [addKey, setAddKey] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const type = getJsonType(value)
  const expandable = isExpandable(value)
  const colors = TYPE_COLORS[type]
  const pk = pathKey(path)
  const expanded = path.length === 0 ? true : expandedPaths.has(pk)

  const startEdit = useCallback(() => {
    if (expandable) return
    setEditValue(String(value))
    setIsEditing(true)
  }, [expandable, value])

  const commitEdit = useCallback(() => {
    let newVal: unknown
    if (type === "number") {
      const parsed = Number(editValue)
      newVal = isNaN(parsed) ? 0 : parsed
    } else if (type === "boolean") {
      newVal = editValue === "true"
    } else if (type === "null") {
      newVal = null
    } else {
      newVal = editValue
    }
    onChange(setByPath(root, path, newVal))
    setIsEditing(false)
  }, [editValue, type, root, path, onChange])

  const cancelEdit = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleDelete = useCallback(() => {
    onChange(deleteByPath(root, path))
  }, [root, path, onChange])

  const handleDuplicate = useCallback(() => {
    onChange(duplicateByPath(root, path))
  }, [root, path, onChange])

  const startAdd = useCallback(() => {
    if (Array.isArray(value)) {
      onChange(addAtPath(root, path, "", ""))
      return
    }
    if (typeof value === "object" && value !== null) {
      const obj = value as Record<string, unknown>
      setAddKey(uniqueKeyName(obj))
      setIsAdding(true)
    }
  }, [root, path, value, onChange])

  const commitAdd = useCallback(() => {
    if (!addKey.trim()) { setIsAdding(false); return }
    onChange(addAtPath(root, path, addKey.trim(), ""))
    setIsAdding(false)
    setAddKey("")
    if (!expanded) onToggle(pk)
  }, [addKey, root, path, onChange, expanded, onToggle, pk])

  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus()
  }, [isAdding])

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus()
  }, [isEditing])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isEditing) commitEdit()
      else if (isAdding) commitAdd()
    }
    if (e.key === "Escape") {
      if (isEditing) cancelEdit()
      else if (isAdding) setIsAdding(false)
    }
  }, [isEditing, isAdding, commitEdit, commitAdd, cancelEdit])

  const children = expandable
    ? Array.isArray(value)
      ? value.map((item, idx) => {
          const childPath = [...path, String(idx)]
          return (
            <TreeNode
              key={pathKey(childPath)}
              keyName={String(idx)}
              value={item}
              path={childPath}
              root={root}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              onChange={onChange}
            />
          )
        })
      : Object.entries(value as Record<string, unknown>).map(([k, v]) => {
          const childPath = [...path, k]
          return (
            <TreeNode
              key={pathKey(childPath)}
              keyName={k}
              value={v}
              path={childPath}
              root={root}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              onChange={onChange}
            />
          )
        })
    : null

  const childCount = expandable
    ? Array.isArray(value) ? value.length : Object.keys(value as Record<string, unknown>).length
    : 0

  const displayValue = expandable ? valueToDisplayString(value) : null

  return (
    <div>
      <div className="group flex items-start gap-1.5 py-0.5 hover:bg-muted/20 rounded px-1 -mx-1">
        {/* Expand toggle or spacer */}
        {expandable ? (
          <button
            onClick={() => onToggle(pk)}
            className="shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-150 ${expanded ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        {/* Key name */}
        {keyName !== undefined && (
          <>
            <span className="text-sm font-mono text-purple-400 shrink-0 max-w-[200px] truncate" title={keyName}>
              &quot;{keyName}&quot;
            </span>
            <span className="text-muted-foreground text-sm shrink-0">:</span>
          </>
        )}

        {/* Type badge + value */}
        <span className={`shrink-0 px-1.5 py-px rounded text-[10px] font-semibold uppercase tracking-wider border ${colors.badge}`}>
          {type}
        </span>

        {/* Value display / inline edit */}
        {!expandable && !isEditing && (
          <button
            onClick={startEdit}
            className={`text-sm font-mono truncate max-w-[300px] text-left ${colors.text} hover:underline cursor-text`}
            title="Click to edit"
          >
            {type === "string" ? `&quot;${value}&quot;` : String(value)}
          </button>
        )}

        {!expandable && isEditing && (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commitEdit}
              className="flex-1 min-w-0 text-sm font-mono bg-background/80 border border-primary/50 rounded px-1.5 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button onClick={commitEdit} className="shrink-0 text-emerald-400 hover:text-emerald-300">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button onClick={cancelEdit} className="shrink-0 text-red-400 hover:text-red-300">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Summary for expandable */}
        {expandable && !expanded && (
          <span className="text-xs text-muted-foreground font-mono">
            {displayValue}
          </span>
        )}

        {/* Actions — always visible on mobile, hover on desktop */}
        <div className="flex items-center gap-0.5 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity ml-auto shrink-0">
          {!expandable && (
            <button onClick={startEdit} className="p-1.5 text-muted-foreground hover:text-foreground active:text-foreground rounded hover:bg-muted/50 active:bg-muted/50" title="Edit">
              <Pencil className="h-3 w-3" />
            </button>
          )}
          {!isRoot && (
            <button onClick={handleDelete} className="p-1.5 text-muted-foreground hover:text-red-400 active:text-red-400 rounded hover:bg-red-500/10 active:bg-red-500/10" title="Delete">
              <Trash2 className="h-3 w-3" />
            </button>
          )}
          {!isRoot && (
            <button onClick={handleDuplicate} className="p-1.5 text-muted-foreground hover:text-foreground active:text-foreground rounded hover:bg-muted/50 active:bg-muted/50" title="Duplicate">
              <Copy className="h-3 w-3" />
            </button>
          )}
          {expandable && (
            <button onClick={startAdd} className="p-1.5 text-muted-foreground hover:text-foreground active:text-foreground rounded hover:bg-muted/50 active:bg-muted/50" title="Add">
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded children */}
      {expandable && expanded && (
        <div className="ml-3 border-l border-border/50 pl-1">
          {children}
          {/* Add property/item */}
          {isAdding ? (
            <div className="flex items-center gap-1.5 py-0.5 px-1">
              <span className="w-5 shrink-0" />
              {typeof value === "object" && value !== null && !Array.isArray(value) && (
                <input
                  ref={inputRef}
                  value={addKey}
                  onChange={(e) => setAddKey(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={commitAdd}
                  placeholder="key name"
                  className="text-sm font-mono bg-background/80 border border-primary/50 rounded px-1.5 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-32"
                />
              )}
              <button onClick={commitAdd} className="text-emerald-400 hover:text-emerald-300">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setIsAdding(false)} className="text-red-400 hover:text-red-300">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={startAdd}
              className="flex items-center gap-1.5 py-1 px-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add {Array.isArray(value) ? "item" : "property"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}