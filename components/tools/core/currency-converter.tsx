"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supportedCurrencies, fetchRates } from "@/lib/tools/currency-cache"
import { ArrowRightLeft } from "lucide-react"

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [result, setResult] = useState<string | null>(null)
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchRates(fromCurrency)
      .then((data) => {
        setRates(data)
        setLastUpdated(new Date().toLocaleDateString())
        setError("")
      })
      .catch(() => setError("Failed to fetch rates. Using cached data if available."))
      .finally(() => setLoading(false))
  }, [fromCurrency])

  const convert = useCallback(() => {
    const num = parseFloat(amount)
    if (isNaN(num) || !rates) return
    const rate = rates[toCurrency]
    if (!rate) {
      setError(`No rate available for ${toCurrency}`)
      return
    }
    setResult((num * rate).toFixed(4))
    setError("")
  }, [amount, rates, toCurrency])

  useEffect(() => {
    convert()
  }, [convert])

  const swap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background/50 font-mono"
          />
        </div>

        <div className="flex items-center justify-center sm:pb-0 pb-2">
          <Button variant="outline" size="icon" onClick={swap} className="rounded-full">
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Result</label>
          <div className="h-9 flex items-center px-3 rounded-md border border-border bg-muted/30 font-mono text-foreground">
            {loading ? "..." : result || "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">From</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background/50 text-foreground text-sm"
          >
            {supportedCurrencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">To</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-background/50 text-foreground text-sm"
          >
            {supportedCurrencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {rates && (
        <div className="text-xs text-muted-foreground">
          {lastUpdated && `Rates last updated: ${lastUpdated}`}
          {rates[toCurrency] && ` • 1 ${fromCurrency} = ${rates[toCurrency].toFixed(4)} ${toCurrency}`}
        </div>
      )}
    </div>
  )
}