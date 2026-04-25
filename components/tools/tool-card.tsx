"use client"

import { useSectionVisibility } from "@/hooks/use-section-visibility"
import type { ToolDefinition } from "@/lib/content/tools/types"
import { Card } from "@/components/ui/card"
import {
  FileText, DollarSign, Ruler, Braces, Binary, QrCode, KeyRound, Palette, Type,
  Hash, CaseSensitive, GitCompare, ListFilter, AlignLeft, ArrowRight,
  Clock, Shield, Image, FileCode, Regex, Link, Code, Key, PenTool, Blend, Pipette,
  Text, Smile, Fingerprint, Timer, CalendarClock, Table, FileJson, FileCode2,
  Database, Calendar, Contact, Lock, Radio, ShieldCheck, Square, RectangleHorizontal,
  Columns3, Grid3X3, Triangle, Globe, FileSearch, Search, Eye, Tag, Link2, Languages,
  Table2, UserRound, Frame, Play, Snowflake, Cloud, BarChart3, Replace, Undo2,
  ArrowUpDown, ListOrdered, Scissors, ScanEye, StickyNote, Bookmark, Mic, Film,
  FileCheck, ShieldAlert, Eraser, ShieldHalf, ArrowLeftRight, Bot, Percent, Cake,
  Receipt, Sigma, EyeOff, Calculator, Watch, Hourglass,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, DollarSign, Ruler, Braces, Binary, QrCode, KeyRound, Palette, Type,
  Hash, CaseSensitive, GitCompare, ListFilter, AlignLeft, Clock, Shield, Image,
  FileCode, Regex, Link, Code, Key, PenTool, Blend, Pipette, Text, Smile, Fingerprint,
  Timer, CalendarClock, Table, FileJson, FileCode2, Database, Calendar, Contact, Lock,
  Radio, ShieldCheck, Square, RectangleHorizontal, Columns3, Grid3X3, Triangle,
  Globe, FileSearch, Search, Eye, Tag, Link2, Languages, Table2, UserRound, Frame,
  Play, Snowflake, Cloud, BarChart3, Replace, Undo2, ArrowUpDown, ListOrdered,
  Scissors, ScanEye, StickyNote, Bookmark, Mic, Film, FileCheck, ShieldAlert, Eraser,
  ShieldHalf, ArrowLeftRight, Bot, Percent, Cake, Receipt, Sigma, EyeOff, Calculator,
  Watch, Hourglass,
}

interface ToolCardProps {
  tool: ToolDefinition
  onSelect: (id: string) => void
  animationDelay?: number
}

export default function ToolCard({ tool, onSelect, animationDelay = 0 }: ToolCardProps) {
  const { sectionRef, isVisible } = useSectionVisibility({ once: true, threshold: 0.1 })
  const IconComponent = iconMap[tool.icon] || Braces

  const categoryColors: Record<string, string> = {
    core: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dev: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    text: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    media: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    security: "bg-red-500/10 text-red-400 border-red-500/20",
    math: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  }

  const categoryLabels: Record<string, string> = {
    core: "Core", dev: "Dev", text: "Text", media: "Media", security: "Security", math: "Math",
  }

  return (
    <Card
      ref={sectionRef}
      className={`group cursor-pointer p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm bg-background/80 border-border/50 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={() => onSelect(tool.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
          <IconComponent className="h-5 w-5" />
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[tool.category] || categoryColors.dev}`}>
          {categoryLabels[tool.category] || "Dev"}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {tool.label}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {tool.description}
      </p>
      <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Open tool <ArrowRight className="ml-1 h-3.5 w-3.5" />
      </div>
    </Card>
  )
}