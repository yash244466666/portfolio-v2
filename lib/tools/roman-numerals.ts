const romanMap: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
]

const romanDigitValues: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
}

export function toRoman(num: number): string {
  if (!Number.isInteger(num) || num < 1 || num > 3999) {
    throw new Error("Number must be an integer between 1 and 3999")
  }

  let result = ""
  let remaining = num

  for (const [value, symbol] of romanMap) {
    while (remaining >= value) {
      result += symbol
      remaining -= value
    }
  }

  return result
}

export function fromRoman(str: string): number {
  if (!str || typeof str !== "string") {
    throw new Error("Input must be a non-empty string")
  }

  const upper = str.toUpperCase().trim()

  if (!/^[IVXLCDM]+$/.test(upper)) {
    throw new Error("Invalid Roman numeral: contains invalid characters")
  }

  let total = 0
  let lastValue = 0
  let repeatCount = 1

  for (let i = upper.length - 1; i >= 0; i--) {
    const char = upper[i]
    const value = romanDigitValues[char]

    if (value === undefined) {
      throw new Error(`Invalid character in Roman numeral: ${char}`)
    }

    if (value < lastValue) {
      total -= value
    } else {
      total += value
    }

    if (value === lastValue) {
      repeatCount++
      if (
        repeatCount > 3 ||
        (repeatCount > 1 && (value === 5 || value === 50 || value === 500))
      ) {
        throw new Error(`Invalid Roman numeral: too many consecutive ${char} characters`)
      }
    } else {
      repeatCount = 1
    }

    lastValue = value
  }

  // Validate by round-tripping
  const reconverted = toRoman(total)
  if (reconverted !== upper) {
    throw new Error("Invalid Roman numeral: not a canonical form")
  }

  return total
}

export function isValidRoman(str: string): boolean {
  try {
    fromRoman(str)
    return true
  } catch {
    return false
  }
}