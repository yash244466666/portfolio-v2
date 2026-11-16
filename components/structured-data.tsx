import { serializeJsonLd } from "@/lib/seo";

interface StructuredDataProps {
  data: unknown;
}

/** Server-rendered JSON-LD. Kept out of client bundles. */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export default StructuredData;
