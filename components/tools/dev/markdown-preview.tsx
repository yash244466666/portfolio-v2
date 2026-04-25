"use client"

import { useState, useMemo } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"
import CopyButton from "@/components/tools/shared/copy-button"

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = useState("# Hello World\n\nThis is **markdown** preview.\n\n- Item 1\n- Item 2\n\n```js\nconsole.log('hello')\n```\n")

  const html = useMemo(() => {
    try {
      const parsed = marked(markdown) as string
      return typeof window !== "undefined" ? DOMPurify.sanitize(parsed) : parsed
    } catch {
      return "<p>Invalid markdown</p>"
    }
  }, [markdown])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Markdown</label>
            <CopyButton text={markdown} />
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Write markdown here..."
            className="w-full min-h-[400px] p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono text-sm"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Preview</label>
            <CopyButton text={html} />
          </div>
          <div
            className="min-h-[400px] p-4 rounded-lg border border-border bg-background/30 prose prose-invert prose-sm max-w-none overflow-auto text-foreground [&_pre]:bg-muted/50 [&_pre]:p-3 [&_pre]:rounded-md [&_code]:text-primary [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  )
}