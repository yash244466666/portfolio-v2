"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"

interface OgTag {
  property: string
  content: string
}

function parseOgTags(html: string): OgTag[] {
  const tags: OgTag[] = []
  const regex = /<meta\s+[^>]*?(?:property|name)\s*=\s*["']([^"']+)["'][^>]*?(?:content)\s*=\s*["']([^"']*?)["'][^>]*?\/?>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const prop = match[1].toLowerCase()
    if (prop.startsWith("og:") || prop.startsWith("twitter:")) {
      tags.push({ property: prop, content: match[2] })
    }
  }
  // Also try the reverse attribute order (content before property)
  const regex2 = /<meta\s+[^>]*?(?:content)\s*=\s*["']([^"']*?)["'][^>]*?(?:property|name)\s*=\s*["']([^"']+)["'][^>]*?\/?>/gi
  while ((match = regex2.exec(html)) !== null) {
    const prop = match[2].toLowerCase()
    const content = match[1]
    if (prop.startsWith("og:") || prop.startsWith("twitter:")) {
      if (!tags.some((t) => t.property === prop && t.content === content)) {
        tags.push({ property: prop, content })
      }
    }
  }
  return tags
}

function getTag(tags: OgTag[], property: string): string {
  return tags.find((t) => t.property === property)?.content || ""
}

export default function OpenGraphPreview() {
  const [input, setInput] = useState("")

  const tags = useMemo(() => parseOgTags(input), [input])

  const ogTitle = getTag(tags, "og:title")
  const ogDescription = getTag(tags, "og:description")
  const ogImage = getTag(tags, "og:image")
  const ogUrl = getTag(tags, "og:url")
  const ogType = getTag(tags, "og:type")
  const twCard = getTag(tags, "twitter:card")
  const twTitle = getTag(tags, "twitter:title")
  const twDescription = getTag(tags, "twitter:description")
  const twImage = getTag(tags, "twitter:image")

  const displayTitle = ogTitle || twTitle || "(No title)"
  const displayDescription = ogDescription || twDescription || "(No description)"
  const displayImage = ogImage || twImage || ""
  const displayUrl = ogUrl || "(No URL)"
  const displayType = ogType || "(No type)"

  const allTagsText = tags.map((t) => `<meta property="${t.property}" content="${t.content}" />`).join("\n")

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Paste HTML head content</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`<meta property="og:title" content="My Page Title" />\n<meta property="og:description" content="A description of my page" />\n<meta property="og:image" content="https://example.com/image.png" />\n<meta property="og:url" content="https://example.com" />`}
          className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-background/50 text-foreground text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {tags.length > 0 && (
        <>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Extracted Tags</h3>
              <CopyButton text={allTagsText} />
            </div>
            <div className="space-y-2">
              {tags.map((tag, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-lg p-2 text-sm">
                  <code className="text-primary font-mono text-xs">{tag.property}</code>
                  <span className="text-muted-foreground">=</span>
                  <code className="text-foreground font-mono text-xs flex-1 min-w-0 truncate">{tag.content}</code>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Social Media Preview</h3>
            <div className="max-w-md mx-auto bg-muted/30 border border-border/50 rounded-xl overflow-hidden">
              {displayImage && (
                <div className="w-full h-48 bg-muted overflow-hidden">
                  <img
                    src={displayImage}
                    alt="OG Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                </div>
              )}
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{displayUrl}</p>
                <h4 className="text-foreground font-semibold mb-1 line-clamp-2">{displayTitle}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{displayDescription}</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Title</p>
                <p className="text-foreground">{displayTitle}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="text-foreground">{displayType}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Description</p>
                <p className="text-foreground">{displayDescription}</p>
              </div>
              {displayImage && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Image</p>
                  <p className="text-foreground text-xs font-mono break-all">{displayImage}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {input && tags.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-400 text-sm">
          No Open Graph or Twitter Card tags found. Make sure the HTML contains meta tags with og: or twitter: properties.
        </div>
      )}
    </div>
  )
}