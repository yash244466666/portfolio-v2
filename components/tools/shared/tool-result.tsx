import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import CopyButton from "./copy-button"

interface ToolResultProps {
  label?: string
  value?: string
  children?: ReactNode
  className?: string
  copyValue?: string
  onClick?: () => void
}

export function ToolResult({ label = "Result", value, children, className, copyValue, onClick }: ToolResultProps) {
  const contentToCopy = copyValue || value || ""

  return (
    <div 
      className={cn("relative group bg-muted/20 border border-border/50 rounded-xl p-4 sm:p-5 shadow-sm transition-all hover:bg-muted/30", className, onClick && "cursor-pointer hover:bg-muted/40")}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider shadow-sm">
          {label}
        </span>
        {contentToCopy && (
          <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            <CopyButton text={contentToCopy} />
          </div>
        )}
      </div>
      <div className="font-mono text-foreground text-base sm:text-lg whitespace-pre-wrap break-all overflow-auto">
        {children || value || "—"}
      </div>
    </div>
  )
}
