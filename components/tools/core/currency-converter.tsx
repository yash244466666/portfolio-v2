"use client"

import { useEffect, useState } from "react"
import { ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyCombobox } from "@/components/tools/shared/currency-combobox"
import { fetchRates, type CurrencyRates } from "@/lib/tools/currency-cache"
import { getCurrency } from "@/lib/tools/currency-data"

function formatUpdatedAt(value: string): string {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
}

function formatCurrencyValue(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(value)
  } catch {
    return `${value.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${currency}`
  }
}

function formatRate(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumSignificantDigits: 6 }).format(value)
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [ratesData, setRatesData] = useState<CurrencyRates | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setRatesData(null)
    setLoadError("")

    fetchRates(fromCurrency)
      .then((data) => {
        if (cancelled) return
        setRatesData(data)
        if (data.stale) {
          setLoadError(
            `Could not refresh exchange rates. Showing cached rates${
              data.updatedAt ? ` from ${formatUpdatedAt(data.updatedAt)}` : ""
            }.`
          )
        }
      })
      .catch(() => {
        if (cancelled) return
        setRatesData(null)
        setLoadError("Unable to load exchange rates. Check your connection and try again.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [fromCurrency])

  const fromInfo = getCurrency(fromCurrency)
  const toInfo = getCurrency(toCurrency)
  const ratesMatch = ratesData?.base === fromCurrency
  const isBusy = loading || (ratesData !== null && !ratesMatch)
  const rate = ratesMatch ? ratesData?.rates[toCurrency] : undefined
  const amountValue = Number.parseFloat(amount)
  const converted =
    rate !== undefined && Number.isFinite(amountValue) ? amountValue * rate : null
  const missingRate = !isBusy && ratesData !== null && rate === undefined
  const updatedLabel = ratesData?.updatedAt ? formatUpdatedAt(ratesData.updatedAt) : ""

  const swap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  return (
    <div className="space-y-6">
      {(loadError || missingRate) && (
        <div className="space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-400">
          {loadError && <p>{loadError}</p>}
          {missingRate && (
            <p>
              No exchange rate is available for {toInfo?.name ?? toCurrency} ({toCurrency}). Pick
              another currency.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <label htmlFor="currency-amount" className="text-sm font-medium text-foreground block mb-2">
            Amount
          </label>
          <Input
            id="currency-amount"
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="bg-background/50 font-mono"
          />
        </div>

        <div className="flex items-center justify-center sm:pb-0 pb-2">
          <Button
            variant="outline"
            size="icon"
            onClick={swap}
            aria-label="Swap currencies"
            className="min-h-[44px] min-w-[44px] rounded-full"
          >
            <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="min-w-0">
          <span className="text-sm font-medium text-foreground block mb-2">Result</span>
          <div
            aria-live="polite"
            className="min-h-6 break-words text-lg font-semibold text-foreground"
          >
            {isBusy ? "…" : converted !== null ? formatCurrencyValue(converted, toCurrency) : "—"}
          </div>
          {!isBusy && converted !== null && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              in {toInfo?.name ?? toCurrency}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyCombobox label="From" value={fromCurrency} onChange={setFromCurrency} />
        <CurrencyCombobox label="To" value={toCurrency} onChange={setToCurrency} />
      </div>

      {!isBusy && ratesData !== null && rate !== undefined && (
        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="text-sm text-foreground">
            {fromInfo?.name ?? fromCurrency} → {toInfo?.name ?? toCurrency}
          </p>
          <p>
            1 {fromCurrency} = {formatRate(rate)} {toCurrency}
            {updatedLabel ? ` • Rates updated ${updatedLabel}` : ""}
          </p>
        </div>
      )}
    </div>
  )
}
