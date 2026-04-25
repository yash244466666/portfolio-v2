type ConversionEntry = { toBase: number | ((v: number) => number); fromBase: number | ((v: number) => number) }

type ConversionTable = Record<string, ConversionEntry>

export const unitCategories = [
  { id: "length", label: "Length" },
  { id: "weight", label: "Weight" },
  { id: "temperature", label: "Temperature" },
  { id: "volume", label: "Volume" },
  { id: "area", label: "Area" },
  { id: "speed", label: "Speed" },
  { id: "time", label: "Time" },
  { id: "data", label: "Data" },
] as const

export type UnitCategory = (typeof unitCategories)[number]["id"]

export const unitData: Record<UnitCategory, ConversionTable> = {
  length: {
    meter: { toBase: 1, fromBase: 1 },
    kilometer: { toBase: 1000, fromBase: 0.001 },
    centimeter: { toBase: 0.01, fromBase: 100 },
    millimeter: { toBase: 0.001, fromBase: 1000 },
    mile: { toBase: 1609.344, fromBase: 1 / 1609.344 },
    yard: { toBase: 0.9144, fromBase: 1 / 0.9144 },
    foot: { toBase: 0.3048, fromBase: 1 / 0.3048 },
    inch: { toBase: 0.0254, fromBase: 1 / 0.0254 },
  },
  weight: {
    kilogram: { toBase: 1, fromBase: 1 },
    gram: { toBase: 0.001, fromBase: 1000 },
    milligram: { toBase: 0.000001, fromBase: 1000000 },
    pound: { toBase: 0.453592, fromBase: 1 / 0.453592 },
    ounce: { toBase: 0.0283495, fromBase: 1 / 0.0283495 },
    ton: { toBase: 1000, fromBase: 0.001 },
  },
  temperature: {
    celsius: {
      toBase: (v: number) => v,
      fromBase: (v: number) => v,
    },
    fahrenheit: {
      toBase: (v: number) => (v - 32) * (5 / 9),
      fromBase: (v: number) => v * (9 / 5) + 32,
    },
    kelvin: {
      toBase: (v: number) => v - 273.15,
      fromBase: (v: number) => v + 273.15,
    },
  },
  volume: {
    liter: { toBase: 1, fromBase: 1 },
    milliliter: { toBase: 0.001, fromBase: 1000 },
    gallon: { toBase: 3.78541, fromBase: 1 / 3.78541 },
    quart: { toBase: 0.946353, fromBase: 1 / 0.946353 },
    pint: { toBase: 0.473176, fromBase: 1 / 0.473176 },
    cup: { toBase: 0.236588, fromBase: 1 / 0.236588 },
    "fluid ounce": { toBase: 0.0295735, fromBase: 1 / 0.0295735 },
  },
  area: {
    "sq meter": { toBase: 1, fromBase: 1 },
    "sq kilometer": { toBase: 1000000, fromBase: 0.000001 },
    "sq mile": { toBase: 2589988.11, fromBase: 1 / 2589988.11 },
    "sq yard": { toBase: 0.836127, fromBase: 1 / 0.836127 },
    "sq foot": { toBase: 0.092903, fromBase: 1 / 0.092903 },
    acre: { toBase: 4046.86, fromBase: 1 / 4046.86 },
    hectare: { toBase: 10000, fromBase: 0.0001 },
  },
  speed: {
    "m/s": { toBase: 1, fromBase: 1 },
    "km/h": { toBase: 1 / 3.6, fromBase: 3.6 },
    "mph": { toBase: 0.44704, fromBase: 1 / 0.44704 },
    knot: { toBase: 0.514444, fromBase: 1 / 0.514444 },
    "ft/s": { toBase: 0.3048, fromBase: 1 / 0.3048 },
  },
  time: {
    second: { toBase: 1, fromBase: 1 },
    minute: { toBase: 60, fromBase: 1 / 60 },
    hour: { toBase: 3600, fromBase: 1 / 3600 },
    day: { toBase: 86400, fromBase: 1 / 86400 },
    week: { toBase: 604800, fromBase: 1 / 604800 },
    month: { toBase: 2592000, fromBase: 1 / 2592000 },
    year: { toBase: 31536000, fromBase: 1 / 31536000 },
  },
  data: {
    byte: { toBase: 1, fromBase: 1 },
    KB: { toBase: 1024, fromBase: 1 / 1024 },
    MB: { toBase: 1048576, fromBase: 1 / 1048576 },
    GB: { toBase: 1073741824, fromBase: 1 / 1073741824 },
    TB: { toBase: 1099511627776, fromBase: 1 / 1099511627776 },
    bit: { toBase: 0.125, fromBase: 8 },
  },
}

export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: UnitCategory
): number {
  const table = unitData[category]
  if (!table[fromUnit] || !table[toUnit]) return NaN

  const toBase = table[fromUnit].toBase
  const fromBase = table[toUnit].fromBase

  const baseValue = typeof toBase === "function" ? toBase(value) : value * toBase
  return typeof fromBase === "function" ? fromBase(baseValue) : baseValue * fromBase
}