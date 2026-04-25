"use client"

import { useState, useCallback, type DragEvent, type ChangeEvent } from "react"
import { Upload } from "lucide-react"

interface DropzoneProps {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  label?: string
  maxSizeMB?: number
}

export default function Dropzone({
  onFiles,
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

  return (
    <div
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
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <Upload className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
      <p className="text-sm text-muted-foreground text-center">{label}</p>
      <p className="text-xs text-muted-foreground/60">Max {maxSizeMB}MB per file</p>
    </div>
  )
}