export type JsonType = "string" | "number" | "boolean" | "null" | "object" | "array"

export function getJsonType(value: unknown): JsonType {
  if (value === null) return "null"
  if (Array.isArray(value)) return "array"
  return typeof value as JsonType
}

export function isExpandable(value: unknown): boolean {
  return (value !== null && typeof value === "object")
}

/** Get value at a dot-separated path. Array indices are numeric segments. */
export function getByPath(obj: unknown, path: string): unknown {
  if (path === "" || path === "$") return obj
  const parts = path.split(".")
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (Array.isArray(current)) {
      const idx = parseInt(part, 10)
      current = current[idx]
    } else if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return current
}

/** Set value at a path, returning a new object (immutable). */
export function setByPath(obj: unknown, path: string, value: unknown): unknown {
  if (path === "" || path === "$") return value
  const parts = path.split(".")
  return _setRecursive(obj, parts, value)
}

function _setRecursive(current: unknown, parts: string[], value: unknown): unknown {
  const [head, ...rest] = parts
  if (rest.length === 0) {
    // Leaf: set the value
    if (Array.isArray(current)) {
      const idx = parseInt(head, 10)
      const copy = [...current]
      copy[idx] = value
      return copy
    }
    return { ...(current as Record<string, unknown>), [head]: value }
  }
  // Branch: recurse
  if (Array.isArray(current)) {
    const idx = parseInt(head, 10)
    const copy = [...current]
    copy[idx] = _setRecursive(copy[idx], rest, value)
    return copy
  }
  const record = current as Record<string, unknown>
  return { ...record, [head]: _setRecursive(record[head], rest, value) }
}

/** Delete value at a path, returning a new object (immutable). */
export function deleteByPath(obj: unknown, path: string): unknown {
  const parts = path.split(".")
  return _deleteRecursive(obj, parts)
}

function _deleteRecursive(current: unknown, parts: string[]): unknown {
  const [head, ...rest] = parts
  if (rest.length === 0) {
    if (Array.isArray(current)) {
      const idx = parseInt(head, 10)
      return current.filter((_, i) => i !== idx)
    }
    const record = { ...(current as Record<string, unknown>) }
    delete record[head]
    return record
  }
  if (Array.isArray(current)) {
    const idx = parseInt(head, 10)
    const copy = [...current]
    copy[idx] = _deleteRecursive(copy[idx], rest)
    return copy
  }
  const record = current as Record<string, unknown>
  return { ...record, [head]: _deleteRecursive(record[head], rest) }
}

/** Add a new field/item at a parent path. */
export function addAtPath(obj: unknown, parentPath: string, key: string, value: unknown): unknown {
  const parent = parentPath === "" || parentPath === "$" ? obj : getByPath(obj, parentPath)
  if (Array.isArray(parent)) {
    const newParent = [...parent, value]
    if (parentPath === "" || parentPath === "$") return newParent
    return setByPath(obj, parentPath, newParent)
  }
  if (parent !== null && typeof parent === "object") {
    const newParent = { ...(parent as Record<string, unknown>), [key]: value }
    if (parentPath === "" || parentPath === "$") return newParent
    return setByPath(obj, parentPath, newParent)
  }
  return obj
}

/** Duplicate the value at a path. */
export function duplicateByPath(obj: unknown, path: string): unknown {
  const parts = path.split(".")
  if (parts.length === 0) return obj
  const parentParts = parts.slice(0, -1)
  const lastPart = parts[parts.length - 1]
  const parent = parentParts.length === 0 ? obj : getByPath(obj, parentParts.join("."))
  const value = getByPath(obj, path)
  const cloned = typeof value === "object" && value !== null ? JSON.parse(JSON.stringify(value)) : value

  if (Array.isArray(parent)) {
    const idx = parseInt(lastPart, 10)
    const newParent = [...parent]
    newParent.splice(idx + 1, 0, cloned)
    return parentParts.length === 0 ? newParent : setByPath(obj, parentParts.join("."), newParent)
  }
  if (parent !== null && typeof parent === "object") {
    const newKey = lastPart + " (copy)"
    const newParent = { ...(parent as Record<string, unknown>), [newKey]: cloned }
    return parentParts.length === 0 ? newParent : setByPath(obj, parentParts.join("."), newParent)
  }
  return obj
}

/** Compute all expandable paths for "Expand All". */
export function getAllPaths(obj: unknown, prefix = ""): string[] {
  const paths: string[] = []
  if (!isExpandable(obj)) return paths

  if (Array.isArray(obj)) {
    if (prefix) paths.push(prefix)
    obj.forEach((item, idx) => {
      const childPath = prefix ? `${prefix}.${idx}` : `${idx}`
      paths.push(...getAllPaths(item, childPath))
    })
  } else if (obj !== null && typeof obj === "object") {
    if (prefix) paths.push(prefix)
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const childPath = prefix ? `${prefix}.${key}` : key
      paths.push(...getAllPaths(val, childPath))
    }
  }
  return paths
}

/** Convert a JSON value to its display string. */
export function valueToDisplayString(value: unknown): string {
  if (value === null) return "null"
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) return `Array(${value.length})`
  if (typeof value === "object") return `Object{${Object.keys(value).length}}`
  return String(value)
}

/** Generate a unique key name for a new property in an object. */
export function uniqueKeyName(obj: Record<string, unknown>, base = "newKey"): string {
  let name = base
  let counter = 1
  while (obj[name] !== undefined) {
    name = `${base}${counter}`
    counter++
  }
  return name
}

/** Default sample JSON. */
export const SAMPLE_JSON = `{
  "name": "JSON Editor",
  "version": "1.0.0",
  "description": "A professional JSON editor with tree view and code editing",
  "features": [
    "Syntax highlighting",
    "Tree view",
    "Real-time validation",
    "Inline editing"
  ],
  "settings": {
    "theme": "dark",
    "indentSize": 2,
    "autoFormat": true,
    "maxDepth": null
  },
  "isActive": true,
  "users": 0
}`