"use client"

import { useState, useMemo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import CopyButton from "@/components/tools/shared/copy-button"
import { Plus, Trash2 } from "lucide-react"

interface Rule {
  id: string
  path: string
}

interface UserAgentGroup {
  id: string
  userAgent: string
  allowRules: Rule[]
  disallowRules: Rule[]
}

export default function RobotsTxtGenerator() {
  const [groups, setGroups] = useState<UserAgentGroup[]>([
    {
      id: "1",
      userAgent: "*",
      allowRules: [{ id: "1-1", path: "/" }],
      disallowRules: [{ id: "1-2", path: "/admin/" }],
    },
  ])
  const [sitemapUrl, setSitemapUrl] = useState("https://example.com/sitemap.xml")

  const addGroup = useCallback(() => {
    setGroups((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        userAgent: "",
        allowRules: [],
        disallowRules: [],
      },
    ])
  }, [])

  const removeGroup = useCallback((id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const updateGroupAgent = useCallback((id: string, agent: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, userAgent: agent } : g))
    )
  }, [])

  const addAllowRule = useCallback((groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              allowRules: [
                ...g.allowRules,
                { id: `${groupId}-allow-${Date.now()}`, path: "" },
              ],
            }
          : g
      )
    )
  }, [])

  const addDisallowRule = useCallback((groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              disallowRules: [
                ...g.disallowRules,
                { id: `${groupId}-disallow-${Date.now()}`, path: "" },
              ],
            }
          : g
      )
    )
  }, [])

  const updateRule = useCallback(
    (groupId: string, ruleType: "allowRules" | "disallowRules", ruleId: string, path: string) => {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                [ruleType]: g[ruleType].map((r) =>
                  r.id === ruleId ? { ...r, path } : r
                ),
              }
            : g
        )
      )
    },
    []
  )

  const removeRule = useCallback(
    (groupId: string, ruleType: "allowRules" | "disallowRules", ruleId: string) => {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, [ruleType]: g[ruleType].filter((r) => r.id !== ruleId) }
            : g
        )
      )
    },
    []
  )

  const robotsTxt = useMemo(() => {
    const lines: string[] = []

    for (const group of groups) {
      if (!group.userAgent) continue
      lines.push(`User-agent: ${group.userAgent}`)
      for (const rule of group.allowRules) {
        if (rule.path) lines.push(`Allow: ${rule.path}`)
      }
      for (const rule of group.disallowRules) {
        if (rule.path) lines.push(`Disallow: ${rule.path}`)
      }
      lines.push("")
    }

    if (sitemapUrl) {
      lines.push(`Sitemap: ${sitemapUrl}`)
    }

    return lines.join("\n").trim()
  }, [groups, sitemapUrl])

  return (
    <div className="space-y-6">
      {/* User-agent groups */}
      {groups.map((group) => (
        <div
          key={group.id}
          className="bg-muted/30 border border-border/50 rounded-lg p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <Input
              value={group.userAgent}
              onChange={(e) => updateGroupAgent(group.id, e.target.value)}
              placeholder="User-agent (e.g. * or Googlebot)"
              className="font-mono text-sm max-w-xs"
            />
            {groups.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeGroup(group.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Allow rules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                Allow
              </span>
              <button
                onClick={() => addAllowRule(group.id)}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                + Add Allow
              </button>
            </div>
            {group.allowRules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-2 mb-2">
                <Input
                  value={rule.path}
                  onChange={(e) => updateRule(group.id, "allowRules", rule.id, e.target.value)}
                  placeholder="/path/"
                  className="font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(group.id, "allowRules", rule.id)}
                  className="text-muted-foreground hover:text-red-400 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {/* Disallow rules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
                Disallow
              </span>
              <button
                onClick={() => addDisallowRule(group.id)}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                + Add Disallow
              </button>
            </div>
            {group.disallowRules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-2 mb-2">
                <Input
                  value={rule.path}
                  onChange={(e) => updateRule(group.id, "disallowRules", rule.id, e.target.value)}
                  placeholder="/private/"
                  className="font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(group.id, "disallowRules", rule.id)}
                  className="text-muted-foreground hover:text-red-400 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button onClick={addGroup} variant="outline" className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Add User-agent Group
      </Button>

      {/* Sitemap */}
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">
          Sitemap URL
        </label>
        <Input
          value={sitemapUrl}
          onChange={(e) => setSitemapUrl(e.target.value)}
          placeholder="https://example.com/sitemap.xml"
          className="font-mono text-sm"
        />
      </div>

      {/* Generated output */}
      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">robots.txt</span>
          <CopyButton text={robotsTxt} />
        </div>
        <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap">
          {robotsTxt || "Add rules above to generate robots.txt"}
        </pre>
      </div>
    </div>
  )
}