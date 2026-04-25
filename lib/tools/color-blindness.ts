// Color blindness simulation matrices
// Based on Brettel, Viénot & Mollon (1997) and other standard models

const protanopiaMatrix = [
  [0.56667, 0.43333, 0.0],
  [0.55833, 0.44167, 0.0],
  [0.0, 0.24167, 0.75833],
]

const deuteranopiaMatrix = [
  [0.625, 0.375, 0.0],
  [0.7, 0.3, 0.0],
  [0.0, 0.3, 0.7],
]

const tritanopiaMatrix = [
  [0.95, 0.05, 0.0],
  [0.0, 0.43333, 0.56667],
  [0.0, 0.475, 0.525],
]

const achromatopsiaMatrix = [
  [0.299, 0.587, 0.114],
  [0.299, 0.587, 0.114],
  [0.299, 0.587, 0.114],
]

const matrices: Record<string, number[][]> = {
  protanopia: protanopiaMatrix,
  deuteranopia: deuteranopiaMatrix,
  tritanopia: tritanopiaMatrix,
  achromatopsia: achromatopsiaMatrix,
}

export function simulateColorBlindness(
  r: number,
  g: number,
  b: number,
  type: string
): { r: number; g: number; b: number } {
  const matrix = matrices[type.toLowerCase()]
  if (!matrix) return { r, g, b }

  const simR = matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b
  const simG = matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b
  const simB = matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b

  return {
    r: Math.round(Math.max(0, Math.min(255, simR))),
    g: Math.round(Math.max(0, Math.min(255, simG))),
    b: Math.round(Math.max(0, Math.min(255, simB))),
  }
}

export const colorBlindnessTypes = [
  { id: "protanopia", label: "Protanopia", description: "Red-blind (~1% of males)" },
  { id: "deuteranopia", label: "Deuteranopia", description: "Green-blind (~1% of males)" },
  { id: "tritanopia", label: "Tritanopia", description: "Blue-blind (~0.01%)" },
  { id: "achromatopsia", label: "Achromatopsia", description: "Total color blindness (~0.003%)" },
]