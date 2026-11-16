// =============================================================================
// STANDALONE TOOL PAGES
// =============================================================================
// One inventory drives the published routes, their page copy, the promoted
// links in the tools directory, and the sitemap. Keep the answer copy next to
// the widget it describes.

export interface ToolPageExampleRow {
  label: string;
  value: string;
}

export interface ToolPageExampleCode {
  label: string;
  value: string;
}

export interface ToolPageContent {
  slug: string;
  /** Catalog tool ID; the implementation is loaded from here. */
  toolId: string;
  /** Short label used in breadcrumbs and directory links. */
  label: string;
  /** Page h1. */
  heading: string;
  metaTitle: string;
  metaDescription: string;
  /** One-sentence direct answer shown directly under the h1. */
  intro: string;
  /** Supporting answer paragraphs, rendered in the initial HTML. */
  answer: string[];
  example: {
    title: string;
    rows?: ToolPageExampleRow[];
    code?: ToolPageExampleCode[];
    note?: string;
  };
  related: { label: string; href: string }[];
}

export const toolPages: ToolPageContent[] = [
  {
    slug: "json-editor",
    toolId: "json-editor",
    label: "JSON Editor",
    heading: "JSON Editor",
    metaTitle: "JSON Editor – Format, Minify & Validate JSON | YashCodes",
    metaDescription:
      "Format, minify, and validate JSON in your browser, then explore it as a tree. See why a trailing comma makes JSON invalid.",
    intro:
      "Format, minify, validate, and explore JSON without sending it anywhere. The editor runs entirely in your browser.",
    answer: [
      "Paste JSON into the code panel and use Format to indent it or Minify to remove whitespace. The status indicator validates as you type, and the tree panel lets you expand, collapse, and edit values without leaving the code view.",
      "JSON does not allow a trailing comma before a closing brace or bracket. {\"active\":true} is valid. {\"active\":true,} is invalid because the comma promises another member that never arrives.",
    ],
    example: {
      title: "Valid, formatted, and invalid JSON",
      code: [
        { label: "Valid input", value: '{"active":true}' },
        { label: "After Format", value: '{\n  "active": true\n}' },
        { label: "Invalid input", value: '{"active":true,}' },
      ],
      note: "The invalid example fails because of the trailing comma. Your browser supplies the exact parser message, which the editor shows below the panels.",
    },
    related: [
      { label: "Unix Timestamp Converter", href: "/tools/timestamp-converter/" },
      { label: "Meta Tag Generator", href: "/tools/meta-tag-generator/" },
      { label: "All developer tools", href: "/tools/" },
    ],
  },
  {
    slug: "timestamp-converter",
    toolId: "timestamp-converter",
    label: "Timestamp Converter",
    heading: "Unix Timestamp Converter",
    metaTitle: "Unix Timestamp Converter – Seconds & Milliseconds | YashCodes",
    metaDescription:
      "Convert Unix timestamps in seconds or milliseconds to UTC dates, and convert dates back to timestamps. See a worked 2000-01-01 example.",
    intro:
      "Convert Unix timestamps and dates in either direction, with the unit stated explicitly instead of guessed silently.",
    answer: [
      "Unix time counts from 1970-01-01T00:00:00Z. The same instant is 946684800 seconds or 946684800000 milliseconds; both convert to 2000-01-01T00:00:00.000Z. Choose Seconds or Milliseconds, or use Auto and the tool labels the unit it detected.",
      "The result shows UTC and local time. The date is validated before it is formatted, so malformed and out-of-range input produce an error rather than an invalid date.",
    ],
    example: {
      title: "Worked conversions",
      rows: [
        { label: "946684800 seconds", value: "2000-01-01T00:00:00.000Z" },
        { label: "946684800000 milliseconds", value: "2000-01-01T00:00:00.000Z" },
        { label: "0 seconds", value: "1970-01-01T00:00:00.000Z" },
        { label: "-1 second", value: "1969-12-31T23:59:59.000Z" },
      ],
      note: "ISO values are UTC. The tool also shows the local-time equivalent for the same instant.",
    },
    related: [
      { label: "JSON Editor", href: "/tools/json-editor/" },
      { label: "Meta Tag Generator", href: "/tools/meta-tag-generator/" },
      { label: "All developer tools", href: "/tools/" },
    ],
  },
  {
    slug: "image-compressor",
    toolId: "image-compressor",
    label: "Image Compressor",
    heading: "Image Compressor",
    metaTitle: "Image Compressor – Resize & Convert in Your Browser | YashCodes",
    metaDescription:
      "Compress PNG, JPEG, WebP, and AVIF images in your browser. Resize, convert formats, and compare dimensions, format, and bytes before downloading.",
    intro:
      "Compress, resize, and convert images locally, with the dimensions, format, and byte size shown before you download.",
    answer: [
      "Drop an image to see its dimensions, format, and size. Choose an output format and quality, optionally resize, then compare the before-and-after metadata before downloading. Processing stays in the browser; the file is not uploaded.",
      "Browsers do not all support every encoder. The tool probes AVIF support and disables the option when it is unavailable. It also checks the MIME type returned by the encoder, so the output label and file extension match the actual bytes rather than the requested format.",
    ],
    example: {
      title: "Before and after",
      rows: [
        { label: "Original", value: "1200 × 800 px · PNG · 15.2 KB" },
        { label: "Output", value: "1200 × 800 px · WebP · 5.2 KB" },
        { label: "Settings", value: "Quality 80 · no resize" },
      ],
      note: "Measured in Chromium with a generated 1200 × 800 PNG; AVIF encoding was unavailable in that browser, so WebP won. Your result depends on the image and the encoder.",
    },
    related: [
      { label: "JSON Editor", href: "/tools/json-editor/" },
      { label: "Unix Timestamp Converter", href: "/tools/timestamp-converter/" },
      { label: "All developer tools", href: "/tools/" },
    ],
  },
  {
    slug: "meta-tag-generator",
    toolId: "meta-tag-generator",
    label: "Meta Tag Generator",
    heading: "Meta Tag Generator",
    metaTitle: "Meta Tag Generator – SEO, Open Graph & Twitter Tags | YashCodes",
    metaDescription:
      "Generate title, description, canonical, Open Graph, and Twitter card tags. Copy escaped HTML that is safe for quotes, angle brackets, and ampersands.",
    intro:
      "Build search and social metadata, then copy markup whose text and attribute values are escaped correctly.",
    answer: [
      "Fill in the title, description, canonical URL, and social fields; the tool produces the markup in the preview. Titles and descriptions are escaped as text, and attribute values are escaped for double-quoted attributes, so special characters cannot break out of the tag.",
      "The keywords field is retained for legacy systems but is ignored by Google. Canonical URLs help search engines consolidate duplicate URLs; Open Graph and Twitter tags control the social preview.",
    ],
    example: {
      title: "Escaping special characters",
      code: [
        { label: "Input title", value: "Tom & Jerry <Guide>" },
        { label: "Output", value: "<title>Tom &amp; Jerry &lt;Guide&gt;</title>" },
        { label: "Input description", value: 'Use "quotes" & <brackets>' },
        {
          label: "Output",
          value:
            '<meta name="description" content="Use &quot;quotes&quot; &amp; &lt;brackets&gt;" />',
        },
      ],
      note: "Text nodes escape &, <, and >. Quoted attributes also escape double quotes.",
    },
    related: [
      { label: "JSON Editor", href: "/tools/json-editor/" },
      { label: "Unix Timestamp Converter", href: "/tools/timestamp-converter/" },
      { label: "All developer tools", href: "/tools/" },
    ],
  },
];

export const TOOL_PAGE_SLUGS = toolPages.map((page) => page.slug)

export const PROMOTED_TOOL_IDS = toolPages.map((page) => page.toolId)

export function getToolPage(slug: string): ToolPageContent | undefined {
  return toolPages.find((page) => page.slug === slug)
}

export function isPromotedToolId(toolId: string): boolean {
  return PROMOTED_TOOL_IDS.includes(toolId)
}

export function getToolPagePath(toolId: string): string | null {
  const page = toolPages.find((entry) => entry.toolId === toolId)
  return page ? `/tools/${page.slug}/` : null
}
