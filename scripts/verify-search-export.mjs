import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const output = process.argv[2] ?? "out"
const origin = "https://yashcodes.com"
const readPage = (path) => readFileSync(join(output, path.slice(1), "index.html"), "utf8")

const xml = readFileSync(join(output, "sitemap.xml"), "utf8")
const entries = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
const listed = new Set(entries)
assert.equal(listed.size, entries.length, "Sitemap URLs must be unique")

const titles = new Set()
for (const entry of listed) {
  const url = new URL(entry)
  assert.equal(url.origin, origin, entry)
  assert.equal(url.search + url.hash, "", entry)
  const html = readPage(url.pathname)
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]
  assert(title && !titles.has(title), "Missing or duplicate title for " + entry)
  titles.add(title)
  assert(html.includes('rel="canonical" href="' + entry + '"'), "Missing canonical for " + entry)
  assert(html.includes("<h1"), "Missing page heading for " + entry)
}

const toolLinks = new Map()
for (const [tag, id] of readPage("/tools/").matchAll(/<a\b[^>]*\bdata-tool-card="([^"]+)"[^>]*>/g)) {
  const path = tag.match(/\bhref="([^"]+)"/)?.[1]
  assert(path && /^\/tools\/[a-z0-9-]+\/$/.test(path), "Missing standalone link for " + id)
  assert(!toolLinks.has(id) || toolLinks.get(id) === path, "Conflicting links for " + id)
  toolLinks.set(id, path)
}
assert(toolLinks.size > 0, "No tool cards found in the exported directory")
assert.equal(new Set(toolLinks.values()).size, toolLinks.size, "Tool cards must have unique URLs")

function exportedRoutes(section) {
  return readdirSync(join(output, section), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => "/" + section + "/" + entry.name + "/")
}

const toolRoutes = exportedRoutes("tools")
assert.deepEqual(toolRoutes.sort(), [...toolLinks.values()].sort(), "Tool exports must match the directory")
const projectRoutes = exportedRoutes("projects")
const home = readPage("/")
for (const path of projectRoutes) {
  assert(home.includes('href="' + path + '"'), "Missing homepage link for " + path)
}

assert.deepEqual(
  [...listed].sort(),
  ["/", "/tools/", ...toolRoutes, ...projectRoutes].map((path) => origin + path).sort(),
  "Sitemap must cover the exported pages"
)
console.log("Verified " + listed.size + " sitemap URLs, including " + toolRoutes.length + " tools and " + projectRoutes.length + " project pages")
