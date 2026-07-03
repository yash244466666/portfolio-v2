"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Download, RotateCcw } from "lucide-react"

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [recordingUrl, setRecordingUrl] = useState<string>("")
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [waveformBars] = useState(() => Array.from({ length: 40 }, () => Math.random()))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recordingUrl) URL.revokeObjectURL(recordingUrl)
    }
  }, [recordingUrl])

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setRecordingBlob(blob)
        setRecordingUrl(url)
        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    } catch {
      setError("Microphone access denied. Please allow microphone permissions.")
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRecording(false)
  }, [])

  const playRecording = useCallback(() => {
    if (!recordingUrl) return
    const audio = new Audio(recordingUrl)
    audioRef.current = audio
    audio.play()
    setIsPlaying(true)
    audio.onended = () => setIsPlaying(false)
  }, [recordingUrl])

  const downloadRecording = useCallback(() => {
    if (!recordingBlob) return
    const a = document.createElement("a")
    a.href = recordingUrl
    a.download = `recording-${Date.now()}.webm`
    a.click()
  }, [recordingBlob, recordingUrl])

  const reset = useCallback(() => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl)
    setRecordingBlob(null)
    setRecordingUrl("")
    setDuration(0)
    setIsPlaying(false)
    setError(null)
  }, [recordingUrl])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Waveform visualization */}
      <ToolResult className="   p-6">
        <div className="flex items-end justify-center gap-[2px] h-24">
          {waveformBars.map((height, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-200 ${
                isRecording
                  ? "bg-red-500 animate-pulse"
                  : recordingUrl
                  ? "bg-primary/60"
                  : "bg-muted-foreground/20"
              }`}
              style={{
                height: isRecording
                  ? `${20 + height * 80}%`
                  : recordingUrl
                  ? `${height * 60}%`
                  : "4px",
                animationDelay: isRecording ? `${i * 50}ms` : undefined,
              }}
            />
          ))}
        </div>

        <div className="text-center mt-4">
          <span className="text-2xl font-mono text-foreground">{formatTime(duration)}</span>
          {isRecording && (
            <span className="ml-3 text-sm text-red-400 animate-pulse">Recording...</span>
          )}
        </div>
      </ToolResult>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center mt-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!recordingUrl && !isRecording && (
          <Button onClick={startRecording} size="lg" className="gap-2">
            <Mic className="h-5 w-5" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2">
            <Square className="h-5 w-5" />
            Stop
          </Button>
        )}

        {recordingUrl && !isRecording && (
          <>
            <Button onClick={playRecording} variant="outline" size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              {isPlaying ? "Playing..." : "Play"}
            </Button>
            <Button onClick={downloadRecording} variant="outline" size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Download
            </Button>
            <Button onClick={reset} variant="ghost" size="lg" className="gap-2">
              <RotateCcw className="h-5 w-5" />
              Reset
            </Button>
          </>
        )}
      </div>

      {recordingUrl && !isRecording && (
        <ToolResult >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duration</span>
            <span className="text-foreground font-mono">{formatTime(duration)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Format</span>
            <span className="text-foreground font-mono">WebM</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Size</span>
            <span className="text-foreground font-mono">
              {recordingBlob ? (recordingBlob.size / 1024).toFixed(1) + " KB" : "--"}
            </span>
          </div>
        </ToolResult>
      )}
    </div>
  )
}