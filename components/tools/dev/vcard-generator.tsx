"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CopyButton from "@/components/tools/shared/copy-button"

export default function VcardGenerator() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [org, setOrg] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [url, setUrl] = useState("")
  const [address, setAddress] = useState("")
  const [output, setOutput] = useState("")

  const generate = useCallback(() => {
    const lines: string[] = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${lastName};${firstName};;;`,
      `FN:${firstName} ${lastName}`,
    ]
    if (org) lines.push(`ORG:${org}`)
    if (phone) lines.push(`TEL;TYPE=VOICE:${phone}`)
    if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`)
    if (url) lines.push(`URL:${url}`)
    if (address) lines.push(`ADR;TYPE=HOME:;;${address};;;;`)
    lines.push("END:VCARD")
    setOutput(lines.join("\r\n"))
  }, [firstName, lastName, org, phone, email, url, address])

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: "text/vcard;charset=utf-8" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${firstName || "contact"}_${lastName || ""}.vcf`.replace(/\s+/g, "").trim()
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">First Name</label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            className="bg-background/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Last Name</label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            className="bg-background/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Organization</label>
          <Input
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="Acme Inc."
            className="bg-background/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Phone</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 123 4567"
            className="bg-background/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="bg-background/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">URL</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="bg-background/50"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-foreground block mb-2">Address</label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, City, Country"
            className="bg-background/50"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={generate} size="sm">Generate vCard</Button>
        {output && (
          <Button onClick={handleDownload} variant="outline" size="sm">Download .vcf</Button>
        )}
      </div>

      {output && (
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Output</label>
            <CopyButton text={output} />
          </div>
          <textarea
            readOnly
            value={output}
            className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-muted/30 text-foreground resize-y font-mono text-sm"
          />
        </div>
      )}
    </div>
  )
}