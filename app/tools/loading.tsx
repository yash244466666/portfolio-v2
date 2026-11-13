export default function ToolsLoading() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-800 rounded-full animate-spin border-t-yellow-400" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-foreground text-sm font-medium">Loading Tools</p>
          <p className="text-muted-foreground text-xs mt-1">Fetching your utilities...</p>
        </div>
      </div>
    </main>
  )
}