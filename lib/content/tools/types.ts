export type ToolCategoryId = "core" | "dev" | "text" | "media" | "security" | "math"

export interface ToolDefinition {
  id: string
  label: string
  description: string
  icon: string
  category: ToolCategoryId
  tags: string[]
  wide?: boolean
}

export interface ToolCategory {
  id: ToolCategoryId
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