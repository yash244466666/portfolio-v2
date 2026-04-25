"use client"

interface StrengthMeterProps {
  score: number
  labels?: { weak: string; fair: string; good: string; strong: string }
}

export default function StrengthMeter({
  score,
  labels = { weak: "Weak", fair: "Fair", good: "Good", strong: "Strong" },
}: StrengthMeterProps) {
  const clampedScore = Math.max(0, Math.min(1, score))

  const getColor = () => {
    if (clampedScore < 0.25) return "bg-red-500"
    if (clampedScore < 0.5) return "bg-orange-500"
    if (clampedScore < 0.75) return "bg-yellow-500"
    return "bg-emerald-500"
  }

  const getLabel = () => {
    if (clampedScore < 0.25) return labels.weak
    if (clampedScore < 0.5) return labels.fair
    if (clampedScore < 0.75) return labels.good
    return labels.strong
  }

  const getTextColor = () => {
    if (clampedScore < 0.25) return "text-red-400"
    if (clampedScore < 0.5) return "text-orange-400"
    if (clampedScore < 0.75) return "text-yellow-400"
    return "text-emerald-400"
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Strength</span>
        <span className={`text-xs font-medium ${getTextColor()}`}>{getLabel()}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${clampedScore * 100}%` }}
        />
      </div>
    </div>
  )
}