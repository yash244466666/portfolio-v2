"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Gauge,
  HelpCircle,
  Info,
  MapPin,
  Play,
  Square,
  Wifi,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"
import { cn } from "@/lib/utils"
import {
  buildProxySignals,
  buildResultText,
  formatMbps,
  formatMs,
  gaugeFraction,
  mbpsFromBytes,
  meanAbsoluteDeviation,
  median,
  type AsnInfo,
  type LatencyStats,
  type NetworkMeta,
  type ProxySignal,
  type SpeedTestResults,
} from "@/lib/tools/speed-test"

const DOWN_URL = "https://speed.cloudflare.com/__down"
const UP_URL = "https://speed.cloudflare.com/__up"

const DOWNLOAD_SECONDS = 8
const UPLOAD_SECONDS = 6
const DOWNLOAD_STREAMS = 5
const UPLOAD_STREAMS = 3
// Cloudflare rejects a single download larger than roughly 9 MB with 429/403,
// so each stream pulls 8 MB at a time and loops until the timer stops it.
const DOWNLOAD_CHUNK_BYTES = 8 * 1024 * 1024
const UPLOAD_CHUNK_BYTES = 8 * 1024 * 1024
const LATENCY_SAMPLES = 10
const WARMUP_MS = 800

type Stage = "metadata" | "latency" | "download" | "upload" | "signals"
type Phase = "idle" | "running" | "done" | "stopped" | "error"

const STAGE_LABELS: Record<Stage, string> = {
  metadata: "Reading connection details",
  latency: "Measuring latency",
  download: "Measuring download speed",
  upload: "Measuring upload speed",
  signals: "Checking for proxy signals",
}

interface NetworkInformationLike {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
  type?: string
}

function readConnection(): NetworkInformationLike | null {
  if (typeof navigator === "undefined") return null
  const nav = navigator as Navigator & { connection?: NetworkInformationLike }
  return nav.connection ?? null
}

function readBrowserTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

function readNextHopProtocol(prefix: string): string | null {
  if (typeof performance === "undefined" || !performance.getEntriesByType) return null
  const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[]
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index]
    if (entry.name.startsWith(prefix) && entry.nextHopProtocol) return entry.nextHopProtocol
  }
  return null
}

async function fetchNetworkMeta(signal: AbortSignal): Promise<NetworkMeta> {
  const response = await fetch(`${DOWN_URL}?bytes=0&r=${Math.random()}`, { signal, cache: "no-store" })
  if (!response.ok) {
    if (response.status === 429 || response.status === 403) {
      throw new Error("The speed service is refusing requests from this network right now (HTTP " + response.status + "). Wait a minute, then try again.")
    }
    throw new Error(`The speed service answered HTTP ${response.status}.`)
  }
  await response.arrayBuffer()
  const number = (value: string | null): number | null => {
    const parsed = value === null ? NaN : Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return {
    ip: response.headers.get("cf-meta-ip"),
    colo: response.headers.get("cf-meta-colo"),
    city: response.headers.get("cf-meta-city"),
    country: response.headers.get("cf-meta-country"),
    latitude: number(response.headers.get("cf-meta-latitude")),
    longitude: number(response.headers.get("cf-meta-longitude")),
    timezone: response.headers.get("cf-meta-timezone"),
  }
}

async function fetchAsnInfo(ip: string, signal: AbortSignal): Promise<AsnInfo | null> {
  const controller = new AbortController()
  const forward = () => controller.abort()
  signal.addEventListener("abort", forward, { once: true })
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(`https://api.ipapi.is/?q=${encodeURIComponent(ip)}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    })
    if (!response.ok) return null
    const data = (await response.json()) as Record<string, unknown>
    const text = (key: string): string | null =>
      typeof data[key] === "string" && (data[key] as string).length > 0 ? (data[key] as string) : null
    return {
      company: text("company"),
      asn: text("asn"),
      city: text("city"),
      region: text("region"),
      country: text("country"),
      timezone: text("timezone"),
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
    signal.removeEventListener("abort", forward)
  }
}

function probeWebRtcAddress(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof window.RTCPeerConnection === "undefined") {
      resolve(null)
      return
    }
    let settled = false
    let connection: RTCPeerConnection
    try {
      connection = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }] })
    } catch {
      resolve(null)
      return
    }
    const finish = (address: string | null) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      try {
        connection.close()
      } catch {
        // ignore close races
      }
      resolve(address)
    }
    const timer = window.setTimeout(() => finish(null), 3500)
    connection.onicecandidate = (event) => {
      const candidate = event.candidate?.candidate
      if (!candidate) return
      const parts = candidate.split(" ")
      const typeIndex = parts.indexOf("typ")
      if (typeIndex === -1 || parts[typeIndex + 1] !== "srflx") return
      const address = parts[4]
      if (address) finish(address)
    }
    connection.createDataChannel("probe")
    connection
      .createOffer()
      .then((offer) => connection.setLocalDescription(offer))
      .catch(() => finish(null))
  })
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out")), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

async function measureLatency(
  signal: AbortSignal,
  samples: number,
  onSample: (collected: number, total: number) => void
): Promise<number[]> {
  const results: number[] = []
  for (let index = 0; index < samples; index += 1) {
    if (signal.aborted) break
    const started = performance.now()
    try {
      const response = await withTimeout(
        fetch(`${DOWN_URL}?bytes=0&r=${Math.random()}`, { signal, cache: "no-store" }),
        5000
      )
      await withTimeout(response.arrayBuffer(), 5000)
      results.push(performance.now() - started)
    } catch {
      break
    }
    onSample(results.length, samples)
  }
  return results
}

async function probeLoadedLatency(signal: AbortSignal, durationMs: number): Promise<number[]> {
  const samples: number[] = []
  const deadline = performance.now() + durationMs
  while (performance.now() < deadline && !signal.aborted) {
    const started = performance.now()
    try {
      const response = await withTimeout(
        fetch(`${DOWN_URL}?bytes=0&r=${Math.random()}`, { signal, cache: "no-store" }),
        6000
      )
      await withTimeout(response.arrayBuffer(), 6000)
      samples.push(performance.now() - started)
    } catch {
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 700))
  }
  return samples
}

async function measureDownload(
  signal: AbortSignal,
  durationMs: number,
  onProgress: (mbps: number, progress: number) => void
): Promise<number> {
  const started = performance.now()
  const deadline = started + durationMs
  let bytes = 0
  let warmupBytes = 0
  let warmupTime = 0
  let warmupRecorded = false
  let failures = 0
  let refusals = 0
  let lastEmit = 0

  const report = (force = false) => {
    const now = performance.now()
    const elapsed = now - started
    if (!warmupRecorded && elapsed >= WARMUP_MS) {
      warmupRecorded = true
      warmupBytes = bytes
      warmupTime = now
    }
    if (!force && now - lastEmit < 120) return
    lastEmit = now
    const baseBytes = warmupRecorded ? warmupBytes : 0
    const baseTime = warmupRecorded ? warmupTime : started
    onProgress(mbpsFromBytes(bytes - baseBytes, now - baseTime), Math.min(1, elapsed / durationMs))
  }

  const streams = Array.from({ length: DOWNLOAD_STREAMS }, async () => {
    while (!signal.aborted && performance.now() < deadline) {
      try {
        const response = await fetch(`${DOWN_URL}?bytes=${DOWNLOAD_CHUNK_BYTES}&r=${Math.random()}`, {
          signal,
          cache: "no-store",
        })
        if (!response.ok) {
          // 429/403 is how the endpoint refuses a burst. Back off instead of
          // counting the tiny error body as received data.
          refusals += 1
          await response.arrayBuffer().catch(() => undefined)
          if (refusals >= 12) return
          await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))
          continue
        }
        if (!response.body) {
          const buffer = await response.arrayBuffer()
          bytes += buffer.byteLength
          report()
          continue
        }
        const reader = response.body.getReader()
        while (!signal.aborted) {
          if (performance.now() >= deadline) {
            await reader.cancel().catch(() => undefined)
            break
          }
          const { done, value } = await reader.read()
          if (done) break
          if (value) bytes += value.byteLength
          report()
        }
      } catch {
        if (signal.aborted) return
        failures += 1
        return
      }
    }
  })

  await Promise.allSettled(streams)
  const ended = performance.now()
  if (bytes === 0 && !signal.aborted) {
    if (refusals > 0) {
      throw new Error("The speed service refused the requests (rate limit). Wait a minute, then try again.")
    }
    if (failures >= DOWNLOAD_STREAMS) {
      throw new Error("No data came back from the speed endpoint.")
    }
  }
  if (warmupRecorded) return mbpsFromBytes(bytes - warmupBytes, ended - warmupTime)
  return mbpsFromBytes(bytes, ended - started)
}

function createUploadPayload(size: number): Blob {
  const block = new Uint8Array(64 * 1024)
  const parts: BlobPart[] = []
  for (let offset = 0; offset < size; offset += block.length) {
    crypto.getRandomValues(block)
    parts.push(block.slice())
  }
  return new Blob(parts, { type: "application/octet-stream" })
}

function sendUploadChunk(
  url: string,
  payload: Blob,
  signal: AbortSignal,
  onLoaded: (loaded: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      resolve()
      return
    }
    const xhr = new XMLHttpRequest()
    xhr.open("POST", url, true)
    xhr.setRequestHeader("Content-Type", "application/octet-stream")
    xhr.upload.onprogress = (event) => onLoaded(event.loaded)
    xhr.onload = () => {
      if (xhr.status >= 400) {
        reject(new Error(`Upload refused with HTTP ${xhr.status}.`))
        return
      }
      onLoaded(payload.size)
      resolve()
    }
    xhr.onerror = () => reject(new Error("Upload request failed."))
    xhr.ontimeout = () => reject(new Error("Upload request timed out."))
    xhr.onabort = () => resolve()
    signal.addEventListener("abort", () => xhr.abort(), { once: true })
    xhr.send(payload)
  })
}

async function measureUpload(
  signal: AbortSignal,
  durationMs: number,
  onProgress: (mbps: number, progress: number) => void
): Promise<number> {
  const payload = createUploadPayload(UPLOAD_CHUNK_BYTES)
  const started = performance.now()
  const local = new AbortController()
  const stop = () => local.abort()
  if (signal.aborted) stop()
  signal.addEventListener("abort", stop, { once: true })
  const timer = window.setTimeout(stop, durationMs)

  const loaded = new Array<number>(UPLOAD_STREAMS).fill(0)
  let warmupTotal = 0
  let warmupTime = 0
  let warmupRecorded = false
  let lastEmit = 0
  const total = () => loaded.reduce((sum, value) => sum + value, 0)

  const report = () => {
    const now = performance.now()
    const elapsed = now - started
    if (!warmupRecorded && elapsed >= WARMUP_MS) {
      warmupRecorded = true
      warmupTotal = total()
      warmupTime = now
    }
    if (now - lastEmit < 120) return
    lastEmit = now
    const baseBytes = warmupRecorded ? warmupTotal : 0
    const baseTime = warmupRecorded ? warmupTime : started
    onProgress(mbpsFromBytes(total() - baseBytes, now - baseTime), Math.min(1, elapsed / durationMs))
  }

  const streams = Array.from({ length: UPLOAD_STREAMS }, (_, index) => (async () => {
    let completed = 0
    while (!local.signal.aborted) {
      if ((started + durationMs) - performance.now() < 300) break
      try {
        await sendUploadChunk(UP_URL, payload, local.signal, (value) => {
          loaded[index] = completed + Math.min(value, payload.size)
          report()
        })
      } catch {
        return
      }
      if (local.signal.aborted) return
      completed += payload.size
      loaded[index] = completed
      report()
    }
  })())

  await Promise.allSettled(streams)
  window.clearTimeout(timer)
  signal.removeEventListener("abort", stop)

  const ended = performance.now()
  const bytesOut = total()
  if (bytesOut === 0 && !local.signal.aborted) throw new Error("Uploads were blocked by the network.")
  if (warmupRecorded) return mbpsFromBytes(bytesOut - warmupTotal, ended - warmupTime)
  return mbpsFromBytes(bytesOut, ended - started)
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return reduced
}

const TICKS = [1, 5, 25, 100, 500, 1000]

function polar(radius: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180
  return { x: 100 + radius * Math.cos(radians), y: 100 + radius * Math.sin(radians) }
}

function GaugeDial({
  mbps,
  reducedMotion,
  active,
}: {
  mbps: number | null
  reducedMotion: boolean
  active: boolean
}) {
  const fraction = mbps === null ? 0 : gaugeFraction(mbps)
  const angle = 150 + fraction * 240
  const tip = polar(78, angle)
  const transition = reducedMotion || !active ? "none" : "stroke-dashoffset 500ms ease-out, transform 500ms ease-out"

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 150"
        className="w-full max-w-[280px]"
        role="img"
        aria-label={mbps === null ? "Speed dial, no measurement yet" : `Speed dial at ${formatMbps(mbps)} megabits per second`}
      >
        <path
          d="M 32.46 139 A 78 78 0 1 1 167.54 139"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
          className="text-muted-foreground/20"
        />
        <path
          d="M 32.46 139 A 78 78 0 1 1 167.54 139"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - fraction * 100}
          className="text-primary"
          style={{ transition }}
        />
        {TICKS.map((value) => {
          const tickAngle = 150 + gaugeFraction(value) * 240
          const inner = polar(68, tickAngle)
          const outer = polar(76, tickAngle)
          const label = polar(57, tickAngle)
          return (
            <g key={value}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground/40"
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fill="currentColor"
                className="text-muted-foreground/60"
              >
                {value}
              </text>
            </g>
          )
        })}
        <g style={{ transform: `translate(${tip.x}px, ${tip.y}px)`, transition }}>
          <circle r="4" fill="currentColor" stroke="var(--background)" strokeWidth="1.5" className="text-primary" />
        </g>
      </svg>
      <div className="-mt-8 text-center">
        <div className="text-3xl sm:text-4xl font-bold tabular-nums text-foreground">
          {formatMbps(mbps)}
        </div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Mbps</div>
      </div>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Activity
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-3 sm:p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl sm:text-2xl font-semibold tabular-nums text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-mono text-foreground text-right break-words">{value}</span>
    </div>
  )
}

function SignalRow({ signal }: { signal: ProxySignal }) {
  const tone =
    signal.status === "signal"
      ? "text-amber-400"
      : signal.status === "clear"
        ? "text-emerald-400"
        : "text-muted-foreground"
  const Icon = signal.status === "signal" ? AlertTriangle : signal.status === "clear" ? CheckCircle2 : HelpCircle
  return (
    <li className="flex gap-2.5 rounded-lg border border-border/40 bg-muted/10 p-3">
      <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", tone)} aria-hidden="true" />
      <div className="min-w-0">
        <p className={cn("text-sm font-medium", tone)}>{signal.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{signal.detail}</p>
      </div>
    </li>
  )
}

export default function SpeedTest() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [stage, setStage] = useState<Stage | null>(null)
  const [progress, setProgress] = useState(0)
  const [liveMbps, setLiveMbps] = useState<number | null>(null)
  const [results, setResults] = useState<SpeedTestResults>({})
  const [meta, setMeta] = useState<NetworkMeta | null>(null)
  const [asnInfo, setAsnInfo] = useState<AsnInfo | null>(null)
  const [signals, setSignals] = useState<ProxySignal[]>([])
  const [protocol, setProtocol] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")

  const runRef = useRef<AbortController | null>(null)
  const runIdRef = useRef(0)
  const mountedRef = useRef(true)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      runRef.current?.abort()
    }
  }, [])

  const runTest = useCallback(async () => {
    if (runRef.current) return
    const controller = new AbortController()
    runRef.current = controller
    const signal = controller.signal
    const runId = runIdRef.current + 1
    runIdRef.current = runId
    const alive = () => mountedRef.current && runIdRef.current === runId

    setPhase("running")
    setError("")
    setWarning("")
    setResults({})
    setSignals([])
    setMeta(null)
    setAsnInfo(null)
    setProtocol(null)
    setLiveMbps(null)
    setProgress(0.02)
    setStage("metadata")

    let partial: SpeedTestResults = {}

    try {
      const networkMeta = await fetchNetworkMeta(signal)
      if (!alive()) return
      setMeta(networkMeta)
      setProgress(0.08)

      const [operator, webrtcAddress] = await Promise.all([
        networkMeta.ip ? fetchAsnInfo(networkMeta.ip, signal) : Promise.resolve(null),
        probeWebRtcAddress(),
      ])
      if (!alive()) return
      setAsnInfo(operator)
      setProtocol(readNextHopProtocol(DOWN_URL))
      setProgress(0.14)

      setStage("latency")
      const idleSamples = await measureLatency(signal, LATENCY_SAMPLES, (collected, total) => {
        if (!alive()) return
        setProgress(0.14 + (collected / total) * 0.08)
      })
      if (idleSamples.length > 0) {
        const latency: LatencyStats = {
          median: median(idleSamples),
          jitter: meanAbsoluteDeviation(idleSamples),
          samples: idleSamples,
        }
        partial = { ...partial, latency }
        if (alive()) setResults(partial)
      }
      if (signal.aborted) return

      setStage("download")
      setProgress(0.22)
      const downloadPhase = new AbortController()
      const abortDownload = () => downloadPhase.abort()
      signal.addEventListener("abort", abortDownload, { once: true })
      const downloadWatchdog = window.setTimeout(abortDownload, DOWNLOAD_SECONDS * 1000 + 6000)
      const loadedProbe = probeLoadedLatency(downloadPhase.signal, DOWNLOAD_SECONDS * 1000)
      let downloadMbps: number
      try {
        downloadMbps = await measureDownload(downloadPhase.signal, DOWNLOAD_SECONDS * 1000, (mbps, value) => {
          if (!alive()) return
          setLiveMbps(mbps)
          setProgress(0.22 + value * 0.4)
        })
      } finally {
        window.clearTimeout(downloadWatchdog)
        signal.removeEventListener("abort", abortDownload)
      }
      const loadedSamples = await loadedProbe
      const loadedLatency = loadedSamples.length > 0 && idleSamples.length > 0
        ? Math.max(0, median(loadedSamples) - median(idleSamples))
        : loadedSamples.length > 0
          ? median(loadedSamples)
          : undefined
      partial = { ...partial, downloadMbps, loadedLatency }
      if (alive()) setResults(partial)
      if (signal.aborted) return

      setStage("upload")
      setProgress(0.64)
      try {
        const uploadMbps = await measureUpload(signal, UPLOAD_SECONDS * 1000, (mbps, value) => {
          if (!alive()) return
          setLiveMbps(mbps)
          setProgress(0.64 + value * 0.28)
        })
        partial = { ...partial, uploadMbps }
        if (alive()) setResults(partial)
      } catch (uploadError) {
        if (signal.aborted) return
        if (alive()) {
          setWarning(
            uploadError instanceof Error
              ? `Upload could not be measured: ${uploadError.message}`
              : "Upload could not be measured."
          )
        }
      }
      if (signal.aborted) return

      setStage("signals")
      setProgress(0.94)
      const proxySignals = buildProxySignals({
        publicIp: networkMeta.ip,
        webrtcIp: webrtcAddress,
        asnOrg: operator?.company ?? null,
        geoTimezone: networkMeta.timezone ?? operator?.timezone ?? null,
        browserTimezone: readBrowserTimezone(),
      })
      if (!alive()) return
      setSignals(proxySignals)
      setProgress(1)
      setLiveMbps(null)
      setStage(null)
      setPhase("done")
    } catch (runError) {
      if (signal.aborted) {
        if (alive()) {
          setPhase("stopped")
          setStage(null)
          setLiveMbps(null)
        }
        return
      }
      if (!alive()) return
      const message = runError instanceof Error ? runError.message : ""
      const blocked = /failed to fetch|networkerror|load failed/i.test(message)
      setError(
        blocked
          ? "The speed endpoint could not be reached. A content blocker, firewall, VPN, or offline connection may be interfering."
          : message || "The test could not complete."
      )
      setPhase("error")
      setStage(null)
      setLiveMbps(null)
    } finally {
      if (runRef.current === controller) runRef.current = null
    }
  }, [])

  const stopTest = useCallback(() => {
    runIdRef.current += 1
    runRef.current?.abort()
    runRef.current = null
    setPhase((current) => (current === "running" ? "stopped" : current))
    setStage(null)
    setLiveMbps(null)
  }, [])

  const running = phase === "running"
  const started = phase !== "idle"
  const connection = typeof navigator === "undefined" ? null : readConnection()
  const dialValue = running ? liveMbps : results.downloadMbps ?? null

  const statusText = running && stage
    ? `${STAGE_LABELS[stage]}…`
    : phase === "done"
      ? `Test complete. Download ${formatMbps(results.downloadMbps)} Mbps, upload ${formatMbps(results.uploadMbps)} Mbps, ping ${formatMs(results.latency?.median)} milliseconds.`
      : phase === "stopped"
        ? "Test stopped. Partial results are shown below."
        : phase === "error"
          ? error
          : "Ready. Press Start test to measure this connection."

  const copyText = buildResultText({ results, meta, asnInfo, signals })

  return (
    <div className="space-y-6">
      <div className="flex gap-2.5 rounded-xl border border-blue-500/25 bg-blue-500/5 p-3.5 text-xs leading-relaxed text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" aria-hidden="true" />
        <p>
          This test sends real traffic to <strong className="text-foreground">speed.cloudflare.com</strong>, reads the
          connection details it returns, looks up the network operator at{" "}
          <strong className="text-foreground">api.ipapi.is</strong>, and checks the local address through{" "}
          <strong className="text-foreground">stun.cloudflare.com</strong>. Nothing is stored on this site and the test
          only runs when you press Start.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-2">
          <Button onClick={runTest} disabled={running} aria-label="Start internet speed test">
            <Play className="h-4 w-4" aria-hidden="true" />
            {started && !running ? "Run again" : "Start test"}
          </Button>
          {running && (
            <Button variant="outline" onClick={stopTest} aria-label="Stop internet speed test">
              <Square className="h-4 w-4" aria-hidden="true" />
              Stop
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite" aria-atomic="true">
          {statusText}
        </p>
      </div>

      {running && (
        <div className="space-y-1.5">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label="Speed test progress"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.max(2, progress * 100)}%`,
                transition: reducedMotion ? "none" : "width 200ms ease-out",
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm" role="alert">
          {error}
        </div>
      )}

      {warning && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-400 text-sm" role="status">
          {warning}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-border/50 bg-muted/10 p-4 sm:p-6">
          <GaugeDial mbps={dialValue} reducedMotion={reducedMotion} active={running} />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatTile icon={ArrowDown} label="Download" value={formatMbps(results.downloadMbps)} unit="Mbps" />
            <StatTile icon={ArrowUp} label="Upload" value={formatMbps(results.uploadMbps)} unit="Mbps" />
            <StatTile icon={Activity} label="Ping" value={formatMs(results.latency?.median)} unit="ms" />
            <StatTile icon={Wifi} label="Jitter" value={formatMs(results.latency?.jitter)} unit="ms" />
          </div>

          {results.loadedLatency !== undefined && (
            <p className="mt-3 text-xs text-muted-foreground">
              Latency under load adds{" "}
              <span className="font-mono text-foreground">{formatMs(results.loadedLatency)} ms</span> above the idle
              figure. Lower is better for calls and games.
            </p>
          )}

          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            Download uses {DOWNLOAD_STREAMS} parallel streams for {DOWNLOAD_SECONDS} seconds, upload uses{" "}
            {UPLOAD_STREAMS} streams for {UPLOAD_SECONDS} seconds, and the first 800 ms of each phase is discarded so
            connection ramp-up does not drag the number down.
          </p>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-border/50 bg-muted/10 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              Your connection
            </h3>
            <div>
              <DetailRow label="Public IP" value={meta?.ip ?? "—"} />
              <DetailRow label="Operator" value={asnInfo?.company ?? "—"} />
              <DetailRow label="ASN" value={asnInfo?.asn ?? "—"} />
              <DetailRow
                label="Location"
                value={[meta?.city ?? asnInfo?.city, meta?.country ?? asnInfo?.country].filter(Boolean).join(", ") || "—"}
              />
              <DetailRow label="Region" value={asnInfo?.region ?? "—"} />
              <DetailRow label="Edge server" value={meta?.colo ?? "—"} />
              <DetailRow label="Protocol" value={protocol ?? "—"} />
              <DetailRow label="Browser estimate" value={connection?.effectiveType ? `${connection.effectiveType} · ${connection.downlink ?? "?"} Mbps · ${connection.rtt ?? "?"} ms RTT` : "—"} />
              <DetailRow label="Save-Data" value={connection?.saveData ? "On" : "Off"} />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Browser estimates come from the page&apos;s own network hints and are not measurements.
            </p>
          </section>

          <section className="rounded-xl border border-border/50 bg-muted/10 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
              Proxy / VPN signals
            </h3>
            {signals.length > 0 ? (
              <ul className="space-y-2">
                {signals.map((signal) => (
                  <SignalRow key={signal.id} signal={signal} />
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                Signals appear after a test runs. A browser can suggest a VPN or proxy; it cannot prove one.
              </p>
            )}
          </section>

          {started && results.downloadMbps !== undefined && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {results.latency ? `${results.latency.samples.length} latency samples` : "Partial results"}
              </p>
              <CopyButton text={copyText} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
