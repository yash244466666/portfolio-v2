export type JsonType = "string" | "number" | "boolean" | "null" | "object" | "array"

export function getJsonType(value: unknown): JsonType {
  if (value === null) return "null"
  if (Array.isArray(value)) return "array"
  return typeof value as JsonType
}

export function isExpandable(value: unknown): boolean {
  return (value !== null && typeof value === "object")
}

/** Path segments: each segment is a string key or numeric index. */
export type Path = string[]

const PATH_SEP = "/"

/** Encode a Path array to a string for use in Set/map keys. */
export function pathKey(path: Path): string {
  return path.join(PATH_SEP)
}

/** Decode a string key back to a Path array. */
export function parsePathKey(key: string): Path {
  return key === "" ? [] : key.split(PATH_SEP)
}

/** Get value at a path. */
export function getByPath(obj: unknown, path: Path): unknown {
  if (path.length === 0) return obj
  let current: unknown = obj
  for (const part of path) {
    if (current === null || current === undefined) return undefined
    if (Array.isArray(current)) {
      current = current[parseInt(part, 10)]
    } else if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return current
}

/** Set value at a path, returning a new object (immutable). */
export function setByPath(obj: unknown, path: Path, value: unknown): unknown {
  if (path.length === 0) return value
  return _setRecursive(obj, path, value)
}

function _setRecursive(current: unknown, path: Path, value: unknown): unknown {
  const [head, ...rest] = path
  if (rest.length === 0) {
    if (Array.isArray(current)) {
      const idx = parseInt(head, 10)
      const copy = [...current]
      copy[idx] = value
      return copy
    }
    return { ...(current as Record<string, unknown>), [head]: value }
  }
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
export function deleteByPath(obj: unknown, path: Path): unknown {
  if (path.length === 0) return obj
  return _deleteRecursive(obj, path)
}

function _deleteRecursive(current: unknown, path: Path): unknown {
  const [head, ...rest] = path
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
export function addAtPath(obj: unknown, parentPath: Path, key: string, value: unknown): unknown {
  const parent = parentPath.length === 0 ? obj : getByPath(obj, parentPath)
  if (Array.isArray(parent)) {
    const newParent = [...parent, value]
    if (parentPath.length === 0) return newParent
    return setByPath(obj, parentPath, newParent)
  }
  if (parent !== null && typeof parent === "object") {
    const newParent = { ...(parent as Record<string, unknown>), [key]: value }
    if (parentPath.length === 0) return newParent
    return setByPath(obj, parentPath, newParent)
  }
  return obj
}

/** Duplicate the value at a path. */
export function duplicateByPath(obj: unknown, path: Path): unknown {
  if (path.length === 0) return obj
  const parentPath = path.slice(0, -1)
  const lastPart = path[path.length - 1]
  const parent = parentPath.length === 0 ? obj : getByPath(obj, parentPath)
  const value = getByPath(obj, path)
  const cloned = typeof value === "object" && value !== null ? JSON.parse(JSON.stringify(value)) : value

  if (Array.isArray(parent)) {
    const idx = parseInt(lastPart, 10)
    const newParent = [...parent]
    newParent.splice(idx + 1, 0, cloned)
    return parentPath.length === 0 ? newParent : setByPath(obj, parentPath, newParent)
  }
  if (parent !== null && typeof parent === "object") {
    const newKey = lastPart + " (copy)"
    const newParent = { ...(parent as Record<string, unknown>), [newKey]: cloned }
    return parentPath.length === 0 ? newParent : setByPath(obj, parentPath, newParent)
  }
  return obj
}

/** Compute all expandable paths for "Expand All". Returns string keys for Set storage. */
export function getAllPaths(obj: unknown, prefix: Path = []): string[] {
  const paths: string[] = []
  if (!isExpandable(obj)) return paths

  if (prefix.length > 0) paths.push(pathKey(prefix))

  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      const childPath = [...prefix, String(idx)]
      paths.push(...getAllPaths(item, childPath))
    })
  } else if (obj !== null && typeof obj === "object") {
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const childPath = [...prefix, key]
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