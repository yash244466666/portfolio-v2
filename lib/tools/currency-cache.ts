const CACHE_KEY = "portfolio:currency-rates"
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

interface CachedRates {
  base: string
  rates: Record<string, number>
  timestamp: number
}

export function getCachedRates(): CachedRates | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    const parsed = JSON.parse(cached) as CachedRates
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null
    return parsed
  } catch {
    return null
  }
}

export function setCachedRates(base: string, rates: Record<string, number>): void {
  try {
    const data: CachedRates = { base, rates, timestamp: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // localStorage unavailable or full
  }
}

export async function fetchRates(baseCurrency: string = "USD"): Promise<Record<string, number>> {
  const cached = getCachedRates()
  if (cached && cached.base === baseCurrency) {
    return cached.rates
  }

  const response = await fetch(
    `https://api.frankfurter.dev/v1/latest?base=${baseCurrency}`
  )
  if (!response.ok) {
    throw new Error("Failed to fetch exchange rates")
  }

  const data = await response.json()
  const rates = data.rates as Record<string, number>

  setCachedRates(baseCurrency, rates)
  return rates
}

export const supportedCurrencies = [
  "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK",
  "EUR", "GBP", "HKD", "HRK", "HUF", "IDR", "ILS", "INR",
  "ISK", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP",
  "PLN", "RON", "SEK", "SGD", "THB", "TRY", "USD", "ZAR",
]