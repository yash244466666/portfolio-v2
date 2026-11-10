import type { Metadata } from "next"
import HomePage from "@/components/home-page"
import { StructuredData } from "@/components/structured-data"
import { buildHomeMetadata, buildHomeStructuredData } from "@/lib/seo"

export const metadata: Metadata = buildHomeMetadata()

export default function Page() {
  return (
    <>
      <StructuredData data={buildHomeStructuredData()} />
      <HomePage />
    </>
  )
}
