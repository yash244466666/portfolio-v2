"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Youtube, ExternalLink, Clipboard, Info } from "lucide-react"
import CopyButton from "@/components/tools/shared/copy-button"

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)[\w-]{11}/

function isValidYouTubeUrl(url: string): boolean {
  return YOUTUBE_URL_REGEX.test(url.trim())
}

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/)
  return match ? match[1] : null
}

function buildCobaltUrl(youtubeUrl: string): string {
  return `https://cobalt.tools/#${encodeURIComponent(youtubeUrl.trim())}`
}

export default function YoutubeDownloader() {
  const [url, setUrl] = useState("")
  const valid = url.trim() ? isValidYouTubeUrl(url) : null
  const cobaltUrl = url.trim() && isValidYouTubeUrl(url) ? buildCobaltUrl(url) : null
  const videoId = url.trim() ? extractVideoId(url) : null

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setUrl(text)
    } catch {
      // clipboard permission denied
    }
  }, [])

  const handleOpenCobalt = useCallback(() => {
    if (!cobaltUrl) return
    window.open(cobaltUrl, "_blank", "noopener")
  }, [cobaltUrl])

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm">
        <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-muted-foreground">
          <p>Downloads are handled by <a href="https://cobalt.tools" target="_blank" rel="noopener" className="text-blue-400 hover:underline">cobalt.tools</a> — a free, open-source, ad-free downloader. Your URL is sent to Cobalt, not to any server we control.</p>
          <p>Supports YouTube, Instagram, TikTok, Twitter/X, Reddit, and more.</p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Video URL</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="pl-10 pr-4"
            />
          </div>
          <button
            onClick={pasteFromClipboard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-muted/50 text-muted-foreground border border-border/50 hover:text-foreground hover:bg-muted transition-colors"
            title="Paste from clipboard"
          >
            <Clipboard className="h-4 w-4" />
            <span className="hidden sm:inline">Paste</span>
          </button>
        </div>
        {url.trim() && valid === false && (
          <p className="text-xs text-red-400">Enter a valid YouTube URL (youtube.com/watch?v=, youtu.be/, shorts/, embed/, live/)</p>
        )}
      </div>

      {/* Preview + Actions */}
      {valid && videoId && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Video thumbnail preview */}
          <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
            <div className="relative aspect-video bg-black/50">
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget
                  if (img.src.includes("maxresdefault")) {
                    img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="bg-red-600 rounded px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">YouTube</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleOpenCobalt}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Cobalt to Download
            </button>
            {cobaltUrl && (
              <CopyButton
                text={cobaltUrl}
                className="px-4 py-3 rounded-xl text-sm font-medium bg-muted/50 text-muted-foreground border border-border/50 hover:text-foreground hover:bg-muted transition-colors"
              />
            )}
          </div>

          {/* Supported formats info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Video", desc: "MP4, up to 4K" },
              { label: "Audio", desc: "MP3, OGG, WAV" },
              { label: "No Ads", desc: "Clean downloads" },
              { label: "Free", desc: "No sign-up needed" },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 rounded-lg bg-background/40 border border-border/30">
                <p className="text-xs font-semibold text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!url.trim() && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Youtube className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-muted-foreground text-sm">Paste a YouTube video URL above to get started</p>
        </div>
      )}
    </div>
  )
}