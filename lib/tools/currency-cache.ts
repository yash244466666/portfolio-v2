const CACHE_KEY = "portfolio:currency-rates:v2"
const LEGACY_CACHE_KEY = "portfolio:currency-rates"
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

const API_BASE = "https://open.er-api.com/v6/latest"

export interface CurrencyRates {
  base: string
  rates: Record<string, number>
  /** Provider timestamp for the rate snapshot (UTC string). */
  updatedAt: string
  /** When this snapshot was stored locally. */
  fetchedAt: number
  /** True when a refresh failed and these rates came from the cache. */
  stale: boolean
}

interface CachedRates {
  version: 2
  base: string
  rates: Record<string, number>
  updatedAt: string
  fetchedAt: number
}

function sanitizeRates(value: unknown): Record<string, number> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([code, rate]) =>
      /^[A-Z]{3}$/.test(code) && typeof rate === "number" && Number.isFinite(rate)
  )
  if (entries.length === 0) return null
  return Object.fromEntries(entries) as Record<string, number>
}

function readCache(): CachedRates | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CachedRates>
    if (
      parsed.version !== 2 ||
      typeof parsed.base !== "string" ||
      typeof parsed.fetchedAt !== "number"
    ) {
      return null
    }
    const rates = sanitizeRates(parsed.rates)
    if (!rates) return null
    return {
      version: 2,
      base: parsed.base,
      rates,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
      fetchedAt: parsed.fetchedAt,
    }
  } catch {
    return null
  }
}

function writeCache(cache: CachedRates): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    // Drop the pre-v2 entry so it never supplies the old 30-currency list.
    window.localStorage.removeItem(LEGACY_CACHE_KEY)
  } catch {
    // localStorage unavailable or full
  }
}

/**
 * Fresh cached rates for a base currency, or null when absent/expired.
 * Expired entries are still used as an offline fallback inside `fetchRates`.
 */
export function getCachedRates(baseCurrency: string): CachedRates | null {
  const cached = readCache()
  if (!cached || cached.base !== baseCurrency.toUpperCase()) return null
  if (Date.now() - cached.fetchedAt > CACHE_TTL) return null
  return cached
}

/**
 * Fetch rates from open.er-api.com, using the versioned 24-hour cache.
 * On a network/API failure a cached snapshot for the same base is returned
 * with `stale: true`; with no usable cache the failure is re-thrown.
 */
export async function fetchRates(baseCurrency: string = "USD"): Promise<CurrencyRates> {
  const base = baseCurrency.toUpperCase()
  const cached = readCache()

  if (cached && cached.base === base && Date.now() - cached.fetchedAt <= CACHE_TTL) {
    return { ...cached, stale: false }
  }

  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(base)}`)
    if (!response.ok) {
      throw new Error(`Exchange-rate request failed (${response.status})`)
    }

    const data = (await response.json()) as {
      result?: string
      base_code?: string
      time_last_update_utc?: string
      rates?: unknown
    }

    const rates = sanitizeRates(data.rates)
    if (data.result !== "success" || !rates) {
      throw new Error("Exchange-rate provider returned an unexpected response")
    }

    const resolvedBase =
      typeof data.base_code === "string" ? data.base_code.toUpperCase() : base
    if (resolvedBase !== base) {
      throw new Error("Exchange-rate provider returned a different base currency")
    }

    const cache: CachedRates = {
      version: 2,
      base,
      rates,
      updatedAt:
        typeof data.time_last_update_utc === "string" ? data.time_last_update_utc : "",
      fetchedAt: Date.now(),
    }

    writeCache(cache)
    return { ...cache, stale: false }
  } catch (error) {
    if (cached && cached.base === base) {
      return { ...cached, stale: true }
    }
    throw error
  }
}
