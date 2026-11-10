import type { Metadata } from "next"
import ToolsRoute from "@/components/tools/tools-route"
import { buildPageMetadata, TOOLS_DESCRIPTION, TOOLS_TITLE } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: TOOLS_TITLE,
  description: TOOLS_DESCRIPTION,
  path: "/tools/",
})

export default function ToolsPage() {
  return <ToolsRoute />
}
