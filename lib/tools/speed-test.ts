export interface LatencyStats {
  median: number
  jitter: number
  samples: number[]
}

export interface SpeedTestResults {
  latency?: LatencyStats
  loadedLatency?: number
  downloadMbps?: number
  uploadMbps?: number
}

export interface NetworkMeta {
  ip: string | null
  colo: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  timezone: string | null
}

export interface AsnInfo {
  company: string | null
  asn: string | null
  city: string | null
  region: string | null
  country: string | null
  timezone: string | null
}

export type SignalStatus = "clear" | "signal" | "unknown"

export interface ProxySignal {
  id: string
  label: string
  status: SignalStatus
  detail: string
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

export function meanAbsoluteDeviation(values: number[], center?: number): number {
  if (values.length === 0) return 0
  const midpoint = center ?? values.reduce((sum, value) => sum + value, 0) / values.length
  return values.reduce((sum, value) => sum + Math.abs(value - midpoint), 0) / values.length
}

export function mbpsFromBytes(bytes: number, elapsedMs: number): number {
  if (!Number.isFinite(bytes) || !Number.isFinite(elapsedMs)) return 0
  if (bytes <= 0 || elapsedMs <= 0) return 0
  return (bytes * 8) / (elapsedMs * 1000)
}

export function formatMbps(mbps: number | undefined | null): string {
  if (mbps === undefined || mbps === null || !Number.isFinite(mbps) || mbps < 0) return "—"
  if (mbps >= 100) return mbps.toFixed(0)
  if (mbps >= 10) return mbps.toFixed(1)
  return mbps.toFixed(2)
}

export function formatMs(ms: number | undefined | null): string {
  if (ms === undefined || ms === null || !Number.isFinite(ms) || ms < 0) return "—"
  return ms >= 10 ? ms.toFixed(0) : ms.toFixed(1)
}

const GAUGE_MIN_MBPS = 0.1
const GAUGE_MAX_MBPS = 1000

/**
 * Maps a throughput value onto 0–1 for the gauge. A logarithmic scale keeps
 * a 5 Mbps mobile link and a 500 Mbps fibre link both readable on one dial.
 */
export function gaugeFraction(mbps: number | null | undefined): number {
  if (mbps === null || mbps === undefined || !Number.isFinite(mbps)) return 0
  if (mbps <= GAUGE_MIN_MBPS) return 0
  if (mbps >= GAUGE_MAX_MBPS) return 1
  const logMin = Math.log10(GAUGE_MIN_MBPS)
  const logMax = Math.log10(GAUGE_MAX_MBPS)
  return (Math.log10(mbps) - logMin) / (logMax - logMin)
}

const DATACENTER_KEYWORDS = [
  "amazon",
  "aws",
  "azure",
  "microsoft",
  "google cloud",
  "digitalocean",
  "linode",
  "akamai",
  "ovh",
  "hetzner",
  "leaseweb",
  "contabo",
  "m247",
  "psychz",
  "vultr",
  "hostinger",
  "hosting",
  "datacenter",
  "data center",
  "colocation",
  "colo",
  "server farm",
  "oracle cloud",
  "alibaba",
  "tencent",
  "gcore",
  "fastly",
  "cloudflare",
  "scaleway",
  "upcloud",
  "ionos",
  "namecheap",
  "racknerd",
  "choopa",
  "servers.com",
]

const VPN_KEYWORDS = [
  "nordvpn",
  "expressvpn",
  "surfshark",
  "protonvpn",
  "proton ag",
  "mullvad",
  "private internet access",
  "cyberghost",
  "ipvanish",
  "purevpn",
  "hide.me",
  "windscribe",
  "tunnelbear",
  "atlas vpn",
  "hola networks",
  "vpn",
  "proxy",
]

export function matchNetworkOperator(
  operator: string | null | undefined
): { kind: "vpn" | "datacenter"; keyword: string } | null {
  if (!operator) return null
  const haystack = operator.toLowerCase()
  for (const keyword of VPN_KEYWORDS) {
    if (haystack.includes(keyword)) return { kind: "vpn", keyword }
  }
  for (const keyword of DATACENTER_KEYWORDS) {
    if (haystack.includes(keyword)) return { kind: "datacenter", keyword }
  }
  return null
}

export function buildProxySignals(input: {
  publicIp: string | null
  webrtcIp: string | null
  asnOrg: string | null
  geoTimezone: string | null
  browserTimezone: string | null
}): ProxySignal[] {
  const signals: ProxySignal[] = []

  if (input.webrtcIp && input.publicIp) {
    if (input.webrtcIp === input.publicIp) {
      signals.push({
        id: "webrtc",
        label: "WebRTC address matches public IP",
        status: "clear",
        detail: "The address exposed over WebRTC equals the one the speed endpoint sees. No split tunnel or local egress was detected.",
      })
    } else {
      signals.push({
        id: "webrtc",
        label: "WebRTC address differs from public IP",
        status: "signal",
        detail: `WebRTC reports ${input.webrtcIp} while the speed endpoint sees ${input.publicIp}. A proxy, split tunnel, or dual-stack route can cause this — it is a hint, not proof.`,
      })
    }
  } else if (!input.webrtcIp) {
    signals.push({
      id: "webrtc",
      label: "WebRTC address unavailable",
      status: "unknown",
      detail: "The browser blocked WebRTC or returned no STUN candidate, so this comparison could not run.",
    })
  }

  const operator = matchNetworkOperator(input.asnOrg)
  if (operator) {
    signals.push({
      id: "operator",
      label:
        operator.kind === "vpn"
          ? "Operator name looks like a VPN service"
          : "Traffic appears to exit a datacenter network",
      status: "signal",
      detail: `The network operator entry contains "${operator.keyword}". Most VPN exits and all cloud egresses look like this — a corporate or ISP network can too.`,
    })
  } else if (input.asnOrg) {
    signals.push({
      id: "operator",
      label: "Operator name looks like a consumer or ISP network",
      status: "clear",
      detail: `${input.asnOrg} does not match common VPN or hosting provider names.`,
    })
  } else {
    signals.push({
      id: "operator",
      label: "Operator name unavailable",
      status: "unknown",
      detail: "The ASN metadata lookup did not answer, so the operator could not be classified.",
    })
  }

  if (input.geoTimezone && input.browserTimezone) {
    if (input.geoTimezone === input.browserTimezone) {
      signals.push({
        id: "timezone",
        label: "Device timezone matches the IP location",
        status: "clear",
        detail: `Both resolve to ${input.browserTimezone}.`,
      })
    } else {
      signals.push({
        id: "timezone",
        label: "Device timezone differs from the IP location",
        status: "signal",
        detail: `The IP resolves to ${input.geoTimezone} while this device uses ${input.browserTimezone}. Travelling, a VPN, or a remote desktop could each explain it.`,
      })
    }
  } else {
    signals.push({
      id: "timezone",
      label: "Timezone comparison unavailable",
      status: "unknown",
      detail: "The location lookup did not return a timezone to compare against.",
    })
  }

  return signals
}

export function buildResultText(input: {
  results: SpeedTestResults
  meta: NetworkMeta | null
  asnInfo: AsnInfo | null
  signals: ProxySignal[]
}): string {
  const { results, meta, asnInfo, signals } = input
  const lines = [
    "Internet Speed Test — results",
    `Download: ${formatMbps(results.downloadMbps)} Mbps`,
    `Upload: ${formatMbps(results.uploadMbps)} Mbps`,
    `Ping: ${formatMs(results.latency?.median)} ms`,
    `Jitter: ${formatMs(results.latency?.jitter)} ms`,
    `Loaded ping: ${formatMs(results.loadedLatency)} ms`,
    "",
    `Public IP: ${meta?.ip ?? "—"}`,
    `Operator: ${asnInfo?.company ?? "—"}${asnInfo?.asn ? ` (${asnInfo.asn})` : ""}`,
    `Location: ${[meta?.city ?? asnInfo?.city, meta?.country ?? asnInfo?.country].filter(Boolean).join(", ") || "—"}`,
    `Edge: ${meta?.colo ?? "—"}`,
    "",
    "Proxy / VPN signals (heuristic):",
    ...signals.map((signal) => `- ${signal.label}: ${signal.detail}`),
  ]
  return lines.join("\n")
}
