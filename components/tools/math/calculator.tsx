"use client"

import { useState, useCallback } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Button } from "@/components/ui/button"
import TabSwitcher from "@/components/tools/shared/tab-switcher"

const tabs = [
  { id: "standard", label: "Standard" },
  { id: "scientific", label: "Scientific" },
]

interface HistoryEntry {
  id: string
  expression: string
  result: string
}

function safeEvaluate(expr: string): string {
  try {
    // Replace math functions with Math equivalents
    let sanitized = expr
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/log\(/g, "Math.log10(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/sqrt\(/g, "Math.sqrt(")
      .replace(/abs\(/g, "Math.abs(")
      .replace(/\^/g, "**")
      .replace(/pi/g, "Math.PI")
      .replace(/e(?![a-zA-Z])/g, "Math.E")

    // Safety check: only allow numbers, operators, parentheses, Math methods, and whitespace
    const safe = sanitized.replace(/Math\.(sin|cos|tan|log10|log|sqrt|abs|PI|E|pow)/g, "")
    if (/[^0-9+\-*/.()%\s]/.test(safe)) {
      return "Error"
    }

    // Use Function constructor instead of eval for slightly better safety
    const fn = new Function(`"use strict"; return (${sanitized})`)
    const result = fn()

    if (typeof result !== "number" || !isFinite(result)) return "Error"

    // Format result
    if (Number.isInteger(result)) return result.toString()
    return parseFloat(result.toPrecision(12)).toString()
  } catch {
    return "Error"
  }
}

export default function Calculator() {
  const [activeTab, setActiveTab] = useState("standard")
  const [display, setDisplay] = useState("0")
  const [expression, setExpression] = useState("")
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [newNumber, setNewNumber] = useState(true)

  const appendDigit = useCallback((digit: string) => {
    if (newNumber) {
      setDisplay(digit)
      setNewNumber(false)
    } else {
      setDisplay((prev) => (prev === "0" ? digit : prev + digit))
    }
  }, [newNumber])

  const appendDecimal = useCallback(() => {
    if (newNumber) {
      setDisplay("0.")
      setNewNumber(false)
    } else if (!display.includes(".")) {
      setDisplay((prev) => prev + ".")
    }
  }, [newNumber, display])

  const setOperator = useCallback((op: string) => {
    setExpression((prev) => {
      const current = prev + display + " " + op + " "
      return current
    })
    setNewNumber(true)
  }, [display])

  const calculate = useCallback(() => {
    const fullExpr = expression + display
    const result = safeEvaluate(fullExpr)
    setDisplay(result)
    setExpression("")
    setNewNumber(true)

    if (result !== "Error") {
      setHistory((prev) => [
        { id: Date.now().toString(), expression: fullExpr, result },
        ...prev,
      ].slice(0, 50))
    }
  }, [expression, display])

  const clear = useCallback(() => {
    setDisplay("0")
    setExpression("")
    setNewNumber(true)
  }, [])

  const backspace = useCallback(() => {
    if (newNumber) return
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"))
  }, [newNumber])

  const applyScientific = useCallback((fn: string) => {
    const num = parseFloat(display)
    if (isNaN(num)) return

    let result: number
    switch (fn) {
      case "sin":
        result = Math.sin(num)
        break
      case "cos":
        result = Math.cos(num)
        break
      case "tan":
        result = Math.tan(num)
        break
      case "log":
        result = Math.log10(num)
        break
      case "ln":
        result = Math.log(num)
        break
      case "sqrt":
        result = Math.sqrt(num)
        break
      case "pow2":
        result = Math.pow(num, 2)
        break
      case "pow3":
        result = Math.pow(num, 3)
        break
      case "inv":
        result = num !== 0 ? 1 / num : NaN
        break
      case "negate":
        result = -num
        break
      case "fact": {
        if (num < 0 || !Number.isInteger(num) || num > 170) { result = NaN; break }
        result = 1
        for (let i = 2; i <= num; i++) result *= i
        break
      }
      default:
        return
    }

    if (!isFinite(result)) {
      setDisplay("Error")
    } else {
      setDisplay(Number.isInteger(result) ? result.toString() : parseFloat(result.toPrecision(12)).toString())
    }
    setNewNumber(true)
  }, [display])

  const insertConstant = useCallback((constant: string) => {
    switch (constant) {
      case "pi":
        setDisplay(Math.PI.toString())
        break
      case "e":
        setDisplay(Math.E.toString())
        break
    }
    setNewNumber(true)
  }, [])

  const buttonClass = "h-12 text-sm font-mono rounded-lg transition-colors"

  return (
    <div className="space-y-4">
      <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Display */}
      <ToolResult >
        <p className="text-sm text-muted-foreground text-right h-6 truncate">
          {expression || "\u00A0"}
        </p>
        <p className="text-3xl font-mono text-foreground text-right truncate">
          {display}
        </p>
      </ToolResult>

      {/* Scientific buttons */}
      {activeTab === "scientific" && (
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { label: "sin", fn: "sin" },
            { label: "cos", fn: "cos" },
            { label: "tan", fn: "tan" },
            { label: "log", fn: "log" },
            { label: "ln", fn: "ln" },
            { label: "x\u00B2", fn: "pow2" },
            { label: "x\u00B3", fn: "pow3" },
            { label: "\u221A", fn: "sqrt" },
            { label: "1/x", fn: "inv" },
            { label: "n!", fn: "fact" },
            { label: "\u03C0", fn: "pi", isConst: true },
            { label: "e", fn: "e", isConst: true },
            { label: "(", fn: "(" },
            { label: ")", fn: ")" },
            { label: "\u00B1", fn: "negate" },
          ].map(({ label, fn, isConst }) => (
            <Button
              key={fn}
              variant="outline"
              onClick={() => isConst ? insertConstant(fn) : applyScientific(fn)}
              className={`${buttonClass} border-primary/20 text-primary hover:bg-primary/10`}
            >
              {label}
            </Button>
          ))}
        </div>
      )}

      {/* Standard buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        <Button variant="outline" onClick={clear} className={buttonClass}>C</Button>
        <Button variant="outline" onClick={backspace} className={buttonClass}>&larr;</Button>
        <Button variant="outline" onClick={() => setOperator("%")} className={buttonClass}>%</Button>
        <Button variant="outline" onClick={() => setOperator("/")} className={`${buttonClass} text-primary`}>/</Button>

        {["7", "8", "9"].map((d) => (
          <Button key={d} variant="outline" onClick={() => appendDigit(d)} className={buttonClass}>{d}</Button>
        ))}
        <Button variant="outline" onClick={() => setOperator("*")} className={`${buttonClass} text-primary`}>*</Button>

        {["4", "5", "6"].map((d) => (
          <Button key={d} variant="outline" onClick={() => appendDigit(d)} className={buttonClass}>{d}</Button>
        ))}
        <Button variant="outline" onClick={() => setOperator("-")} className={`${buttonClass} text-primary`}>-</Button>

        {["1", "2", "3"].map((d) => (
          <Button key={d} variant="outline" onClick={() => appendDigit(d)} className={buttonClass}>{d}</Button>
        ))}
        <Button variant="outline" onClick={() => setOperator("+")} className={`${buttonClass} text-primary`}>+</Button>

        <Button variant="outline" onClick={() => appendDigit("0")} className="col-span-1 h-12 text-sm font-mono rounded-lg">0</Button>
        <Button variant="outline" onClick={appendDecimal} className={buttonClass}>.</Button>
        <Button onClick={calculate} className={`${buttonClass} bg-primary text-primary-foreground hover:bg-primary/90`}>=</Button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <ToolResult >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">History</span>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {history.map((entry) => (
              <ToolResult
                key={entry.id}
                className="flex items-center justify-between text-sm py-1 cursor-pointer hover: rounded px-1"
                onClick={() => {
                  setDisplay(entry.result)
                  setNewNumber(true)
                }}
              >
                <span className="font-mono text-muted-foreground truncate mr-2">
                  {entry.expression}
                </span>
                <span className="font-mono text-foreground shrink-0">= {entry.result}</span>
              </ToolResult>
            ))}
          </div>
        </ToolResult>
      )}
    </div>
  )
}