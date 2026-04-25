"use client"

import { useState, useCallback } from "react"
import Dropzone from "@/components/tools/shared/dropzone"
import CopyButton from "@/components/tools/shared/copy-button"
import { Loader2 } from "lucide-react"

async function computeFileHash(file: File, algorithm: string): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

const algorithms = [
  { id: "SHA-256", label: "SHA-256" },
  { id: "SHA-1", label: "SHA-1" },
  { id: "SHA-512", label: "SHA-512" },
] as const

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export default function FileHashChecker() {
  const [file, setFile] = useState<File | null>(null)
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleFiles = useCallback(async (files: File[]) => {
    const selectedFile = files[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setHashes({})
    setLoading(true)

    const results: Record<string, string> = {}
    for (const algo of algorithms) {
      results[algo.id] = await computeFileHash(selectedFile, algo.id)
    }
    setHashes(results)
    setLoading(false)
  }, [])

  const reset = useCallback(() => {
    setFile(null)
    setHashes({})
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6">
      {!file ? (
        <Dropzone
          onFiles={handleFiles}
          label="Drop a file here to compute its hash"
          maxSizeMB={500}
        />
      ) : (
        <>
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">File Name</span>
              <span className="text-foreground font-medium">{file.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Size</span>
              <span className="text-foreground">{formatFileSize(file.size)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Type</span>
              <span className="text-foreground">{file.type || "Unknown"}</span>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8 gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Computing hashes...</span>
            </div>
          )}

          {!loading && Object.keys(hashes).length > 0 && (
            <div className="space-y-3">
              {algorithms.map((algo) => (
                <div
                  key={algo.id}
                  className="bg-muted/30 border border-border/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{algo.label}</span>
                    <CopyButton text={hashes[algo.id]} />
                  </div>
                  <p className="font-mono text-xs text-muted-foreground break-all">
                    {hashes[algo.id]}
                  </p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={reset}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Check another file
          </button>
        </>
      )}
    </div>
  )
}