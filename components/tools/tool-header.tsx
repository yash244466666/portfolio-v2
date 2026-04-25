"use client"

import {
  FileText, DollarSign, Ruler, Braces, Binary, QrCode, KeyRound, Palette, Type,
  Hash, CaseSensitive, GitCompare, ListFilter, AlignLeft, ArrowLeft,
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

interface ToolHeaderProps {
  label: string
  description: string
  icon: string
  onBack: () => void
  backLabel: string
}

export default function ToolHeader({ label, description, icon, onBack, backLabel }: ToolHeaderProps) {
  const IconComponent = iconMap[icon] || Braces

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        {backLabel}
      </button>
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <IconComponent className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{label}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
        </div>
      </div>
    </div>
  )
}