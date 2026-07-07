import { tools, toolCategories, toolsPageContent } from "./index"
import type { ToolDefinition, ToolCategory } from "./types"

export function getToolsPageContent() {
  return toolsPageContent
}

export function getToolCategories(): ToolCategory[] {
  return toolCategories
}

export function getToolsByCategory(category: ToolDefinition["category"]): ToolDefinition[] {
  return tools.filter((tool) => tool.category === category)
}

export function getToolById(id: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.id === id)
}

export function matchesTool(query: string, tool: ToolDefinition): boolean {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return false
  return (
    tool.label.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

export function searchTools(query: string): ToolDefinition[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return tools
  return tools.filter((tool) => matchesTool(lowerQuery, tool))
}