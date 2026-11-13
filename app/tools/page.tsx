import type { Metadata } from "next"
import { StructuredData } from "@/components/structured-data"
import ToolsRoute from "@/components/tools/tools-route"
import {
  buildPageMetadata,
  buildToolsDirectoryStructuredData,
  TOOLS_DESCRIPTION,
  TOOLS_TITLE,
} from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: TOOLS_TITLE,
  description: TOOLS_DESCRIPTION,
  path: "/tools/",
})

export default function ToolsPage() {
  return (
    <>
      <StructuredData data={buildToolsDirectoryStructuredData()} />
      <ToolsRoute />
    </>
  )
}
