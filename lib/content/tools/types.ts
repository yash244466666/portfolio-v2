export interface ToolDefinition {
  id: string
  label: string
  description: string
  icon: string
  category: "core" | "dev" | "text" | "media" | "security" | "math"
  tags: string[]
}

export interface ToolCategory {
  id: "core" | "dev" | "text" | "media" | "security" | "math"
  label: string
  description: string
}

export interface ToolsPageContent {
  heading: string
  description: string
  searchPlaceholder: string
  backToGridLabel: string
  categories: ToolCategory[]
  tools: ToolDefinition[]
}