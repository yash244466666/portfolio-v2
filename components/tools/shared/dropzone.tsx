"use client"

import { useState, useCallback, type DragEvent, type ChangeEvent } from "react"
import { Upload, X, File as FileIcon } from "lucide-react"

interface DropzoneProps {
  onFiles: (files: File[]) => void
  selectedFiles?: File[] | null
  accept?: string
  multiple?: boolean
  label?: string
  maxSizeMB?: number
}

export default function Dropzone({
  onFiles,
  selectedFiles,
  accept,
  multiple = false,
  label = "Drop files here or click to browse",
  maxSizeMB = 50,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files)
      const filtered = files.filter((f) => f.size <= maxSizeMB * 1024 * 1024)
      if (filtered.length > 0) onFiles(filtered)
    },
    [onFiles, maxSizeMB]
  )

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return
      const files = Array.from(e.target.files)
      onFiles(files)
      e.target.value = ""
    },
    [onFiles]
  )

  const handleRemove = (e: React.MouseEvent, fileToRemove: File) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedFiles) return
    onFiles(selectedFiles.filter((f) => f !== fileToRemove))
  }

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer min-h-[120px] sm:min-h-[150px] flex flex-col items-center justify-center gap-3 p-6 ${
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      }`}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
      {selectedFiles && selectedFiles.length > 0 ? (
        <div className="w-full flex flex-col gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
          {selectedFiles.map((f, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-background/50 border border-border rounded-lg shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileIcon className="h-5 w-5 text-primary shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handleRemove(e, f)}
                className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {multiple && (
            <div className="mt-2 text-center">
              <p className="text-xs text-muted-foreground">Click or drag more files here</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <Upload className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"} pointer-events-none`} />
          <p className="text-sm text-muted-foreground text-center pointer-events-none">{label}</p>
          <p className="text-xs text-muted-foreground/60 pointer-events-none">Max {maxSizeMB}MB per file</p>
        </>
      )}
    </label>
  )
}