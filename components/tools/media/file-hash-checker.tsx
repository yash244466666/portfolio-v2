"use client"

import { useState, useCallback } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import Dropzone from "@/components/tools/shared/dropzone"
import CopyButton from "@/components/tools/shared/copy-button"
import { Loader2 } from "lucide-react"
import { hashBuffer } from "@/components/tools/shared/crypto-utils"

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
  const [error, setError] = useState("")

  const handleFiles = useCallback(async (files: File[]) => {
    const selectedFile = files[0]
    if (!selectedFile) {
      setFile(null)
      setHashes({})
      return
    }
    setFile(selectedFile)
    setHashes({})
    setError("")
    setLoading(true)

    try {
      const buffer = await selectedFile.arrayBuffer()
      const results: Record<string, string> = {}
      for (const algo of algorithms) {
        results[algo.id] = await hashBuffer(algo.id, buffer)
      }
      setHashes(results)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hash computation failed")
      setHashes({})
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setFile(null)
    setHashes({})
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6">
      <Dropzone
        onFiles={handleFiles}
        selectedFiles={file ? [file] : null}
        label="Drop a file here to compute its hash"
        maxSizeMB={500}
      />
      {file && (
        <>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8 gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Computing hashes...</span>
            </div>
          )}

          {!loading && Object.keys(hashes).length > 0 && (
            <div className="space-y-3">
              {algorithms.map((algo) => (
                <ToolResult
                  key={algo.id}
                  
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{algo.label}</span>
                    <CopyButton text={hashes[algo.id]} />
                  </div>
                  <p className="font-mono text-xs text-muted-foreground break-all">
                    {hashes[algo.id]}
                  </p>
                </ToolResult>
              ))}
            </div>
          )}

        </>
      )}
    </div>
  )
}