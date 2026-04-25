"use client"

import { useState, useMemo, useCallback } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

const STORAGE_KEY = "portfolio:bookmarks"

interface Bookmark {
  id: string
  title: string
  url: string
  tags: string[]
  createdAt: string
}

function loadBookmarks(): Bookmark[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveBookmarks(bookmarks: Bookmark[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
}

export default function BookmarkManager() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [tags, setTags] = useState("")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return bookmarks
    const query = search.toLowerCase()
    return bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query) ||
        b.tags.some((t) => t.toLowerCase().includes(query))
    )
  }, [bookmarks, search])

  const handleAdd = useCallback(() => {
    if (!title.trim() || !url.trim()) return

    const newBookmark: Bookmark = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      title: title.trim(),
      url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
    }

    const updated = [newBookmark, ...bookmarks]
    setBookmarks(updated)
    saveBookmarks(updated)
    setTitle("")
    setUrl("")
    setTags("")
  }, [title, url, tags, bookmarks])

  const handleDelete = useCallback((id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id)
    setBookmarks(updated)
    saveBookmarks(updated)
  }, [bookmarks])

  const handleExport = useCallback(() => {
    const json = JSON.stringify(bookmarks, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bookmarks.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [bookmarks])

  const handleImport = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const imported = JSON.parse(text)
        if (!Array.isArray(imported)) return
        const validated: Bookmark[] = imported
          .filter((b: unknown) => b && typeof b === "object" && "title" in (b as Record<string, unknown>) && "url" in (b as Record<string, unknown>))
          .map((b: Record<string, unknown>) => ({
            id: (b.id as string) || Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            title: String(b.title || ""),
            url: String(b.url || ""),
            tags: Array.isArray(b.tags) ? b.tags.map(String) : [],
            createdAt: String(b.createdAt || new Date().toISOString()),
          }))
        const updated = [...validated, ...bookmarks]
        setBookmarks(updated)
        saveBookmarks(updated)
      } catch {
        // ignore invalid files
      }
    }
    input.click()
  }, [bookmarks])

  return (
    <div className="space-y-6">
      <ToolResult className="    space-y-3">
        <h3 className="text-sm font-medium text-foreground">Add Bookmark</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
          />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL"
            className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma-separated)"
          className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
        />
        <Button onClick={handleAdd} className="w-full" disabled={!title.trim() || !url.trim()}>
          Add Bookmark
        </Button>
      </ToolResult>

      <div className="flex flex-wrap gap-2 items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, URL, or tags..."
          className="flex-1 min-w-[200px] bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
        />
        <Button variant="outline" size="sm" onClick={handleExport}>
          Export JSON
        </Button>
        <Button variant="outline" size="sm" onClick={handleImport}>
          Import JSON
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {bookmarks.length === 0 ? "No bookmarks yet. Add one above!" : "No bookmarks match your search."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((bookmark) => (
            <ToolResult
              key={bookmark.id}
              className="group     hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-foreground line-clamp-1">{bookmark.title}</h4>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="text-muted-foreground hover:text-red-400 transition-colors text-xs shrink-0"
                >
                  Delete
                </button>
              </div>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline line-clamp-1 block mt-1"
              >
                {bookmark.url}
              </a>
              {bookmark.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {bookmark.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </ToolResult>
          ))}
        </div>
      )}

      {bookmarks.length > 0 && (
        <div className="text-center text-xs text-muted-foreground">
          {filtered.length} of {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}