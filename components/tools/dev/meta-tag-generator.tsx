"use client"

import { useState, useMemo } from "react"
import { ToolResult } from "@/components/tools/shared/tool-result"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

/** Escape text nodes: &, <, and >. */
function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/** Escape a double-quoted attribute value: text escaping plus quotes. */
function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;")
}

export default function MetaTagGenerator() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [keywords, setKeywords] = useState("")
  const [author, setAuthor] = useState("")
  const [viewport, setViewport] = useState("width=device-width, initial-scale=1")
  const [robots, setRobots] = useState("index, follow")
  const [canonical, setCanonical] = useState("")
  const [ogTitle, setOgTitle] = useState("")
  const [ogDescription, setOgDescription] = useState("")
  const [ogImage, setOgImage] = useState("")
  const [ogUrl, setOgUrl] = useState("")
  const [ogType, setOgType] = useState("website")
  const [twCard, setTwCard] = useState("summary_large_image")
  const [twTitle, setTwTitle] = useState("")
  const [twDescription, setTwDescription] = useState("")
  const [twImage, setTwImage] = useState("")

  const generatedHtml = useMemo(() => {
    const lines: string[] = []
    lines.push("<!-- Primary Meta Tags -->")
    if (title) lines.push(`<title>${escapeText(title)}</title>`)
    if (description) lines.push(`<meta name="description" content="${escapeAttribute(description)}" />`)
    if (keywords) lines.push(`<meta name="keywords" content="${escapeAttribute(keywords)}" />`)
    if (author) lines.push(`<meta name="author" content="${escapeAttribute(author)}" />`)
    if (viewport) lines.push(`<meta name="viewport" content="${escapeAttribute(viewport)}" />`)
    if (robots) lines.push(`<meta name="robots" content="${escapeAttribute(robots)}" />`)
    if (canonical) lines.push(`<link rel="canonical" href="${escapeAttribute(canonical)}" />`)

    const hasOg = ogTitle || ogDescription || ogImage || ogUrl
    if (hasOg) {
      lines.push("")
      lines.push("<!-- Open Graph / Facebook -->")
      lines.push(`<meta property="og:type" content="${escapeAttribute(ogType)}" />`)
      if (ogTitle) lines.push(`<meta property="og:title" content="${escapeAttribute(ogTitle)}" />`)
      if (ogDescription) lines.push(`<meta property="og:description" content="${escapeAttribute(ogDescription)}" />`)
      if (ogImage) lines.push(`<meta property="og:image" content="${escapeAttribute(ogImage)}" />`)
      if (ogUrl) lines.push(`<meta property="og:url" content="${escapeAttribute(ogUrl)}" />`)
    }

    const hasTw = twTitle || twDescription || twImage
    if (hasTw) {
      lines.push("")
      lines.push("<!-- Twitter -->")
      lines.push(`<meta name="twitter:card" content="${escapeAttribute(twCard)}" />`)
      if (twTitle) lines.push(`<meta name="twitter:title" content="${escapeAttribute(twTitle)}" />`)
      if (twDescription) lines.push(`<meta name="twitter:description" content="${escapeAttribute(twDescription)}" />`)
      if (twImage) lines.push(`<meta name="twitter:image" content="${escapeAttribute(twImage)}" />`)
    }

    return lines.join("\n")
  }, [title, description, keywords, author, viewport, robots, canonical, ogTitle, ogDescription, ogImage, ogUrl, ogType, twCard, twTitle, twDescription, twImage])

  const fields = [
    { label: "Title", value: title, setter: setTitle, placeholder: "My Website" },
    { label: "Description", value: description, setter: setDescription, placeholder: "A brief description of your website" },
    { label: "Keywords (legacy)", value: keywords, setter: setKeywords, placeholder: "web, development, tools" },
    { label: "Author", value: author, setter: setAuthor, placeholder: "John Doe" },
    { label: "Viewport", value: viewport, setter: setViewport, placeholder: "width=device-width, initial-scale=1" },
    { label: "Robots", value: robots, setter: setRobots, placeholder: "index, follow" },
    { label: "Canonical URL", value: canonical, setter: setCanonical, placeholder: "https://example.com/page" },
  ]

  const ogFields = [
    { label: "og:title", value: ogTitle, setter: setOgTitle, placeholder: title || "My Website" },
    { label: "og:description", value: ogDescription, setter: setOgDescription, placeholder: description || "A brief description" },
    { label: "og:image", value: ogImage, setter: setOgImage, placeholder: "https://example.com/image.png" },
    { label: "og:url", value: ogUrl, setter: setOgUrl, placeholder: "https://example.com" },
  ]

  const twFields = [
    { label: "twitter:title", value: twTitle, setter: setTwTitle, placeholder: ogTitle || title || "My Website" },
    { label: "twitter:description", value: twDescription, setter: setTwDescription, placeholder: ogDescription || description || "A brief description" },
    { label: "twitter:image", value: twImage, setter: setTwImage, placeholder: ogImage || "https://example.com/image.png" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Basic Meta Tags</h3>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.label}>
              <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
              <Input
                value={f.value}
                onChange={(e) => f.setter(e.target.value)}
                placeholder={f.placeholder}
                className="bg-background/50"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-1">Open Graph Type</h3>
        <div className="flex gap-2 flex-wrap mb-3">
          {["website", "article", "profile", "video.movie", "music.song"].map((type) => (
            <button
              key={type}
              onClick={() => setOgType(type)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                ogType === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {ogFields.map((f) => (
            <div key={f.label}>
              <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
              <Input
                value={f.value}
                onChange={(e) => f.setter(e.target.value)}
                placeholder={f.placeholder}
                className="bg-background/50"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-1">Twitter Card Type</h3>
        <div className="flex gap-2 mb-3">
          {["summary", "summary_large_image"].map((card) => (
            <button
              key={card}
              onClick={() => setTwCard(card)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                twCard === card ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {card}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {twFields.map((f) => (
            <div key={f.label}>
              <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
              <Input
                value={f.value}
                onChange={(e) => f.setter(e.target.value)}
                placeholder={f.placeholder}
                className="bg-background/50"
              />
            </div>
          ))}
        </div>
      </div>

      <ToolResult className="    relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground">Generated Meta Tags</p>
          <CopyButton text={generatedHtml} />
        </div>
        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-all">{generatedHtml}</pre>
        <p className="mt-2 text-xs text-muted-foreground">
          Text is escaped for &amp;, &lt;, and &gt;; quoted attributes also escape
          double quotes. Keywords are kept for legacy systems and are ignored by
          Google.
        </p>
      </ToolResult>
    </div>
  )
}