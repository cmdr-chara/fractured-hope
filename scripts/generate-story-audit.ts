import fs from "node:fs/promises"
import path from "node:path"

import { globby } from "globby"
import yaml from "yaml"

import {
  analyzeStoryWiki,
  renderStoryAuditMarkdown,
  type StoryAuditLookupEntry,
  type StoryAuditPage,
} from "../quartz/story-wiki/audit"

const rootDir = path.resolve(import.meta.dirname, "..")
const contentDir = path.join(rootDir, "content")
const outputPath = path.join(contentDir, "meta", "story-audit.md")

function normalizeSlug(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/\.md$/i, "")
}

function getDerivedSlugs(slug: string): string[] {
  const slugs = new Set<string>([slug])
  const parts = slug.split("/")
  const basename = parts.at(-1)
  if (basename) slugs.add(basename)
  if (slug.endsWith("/index")) {
    const folderSlug = slug.slice(0, -"/index".length)
    if (folderSlug) slugs.add(folderSlug)
  }
  return [...slugs]
}

function extractFrontmatter(content: string): StoryAuditLookupEntry {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (!match?.[1]) {
    return {}
  }

  const parsed = yaml.parse(match[1]) as { title?: unknown; aliases?: unknown } | null
  const title = typeof parsed?.title === "string" ? parsed.title : undefined
  const aliases = Array.isArray(parsed?.aliases)
    ? parsed.aliases.filter((value): value is string => typeof value === "string")
    : undefined

  return { title, aliases }
}

async function main() {
  const files = await globby("**/*.md", {
    cwd: contentDir,
    gitignore: false,
  })

  const pages: StoryAuditPage[] = []
  const allSlugs = new Set<string>()
  const pageLookup: Record<string, StoryAuditLookupEntry> = {}

  for (const file of files) {
    const fullPath = path.join(contentDir, file)
    const content = await fs.readFile(fullPath, "utf8")
    const slug = normalizeSlug(file)
    const frontmatter = extractFrontmatter(content)

    pages.push({ slug, title: frontmatter.title, aliases: frontmatter.aliases, content })
    pageLookup[slug] = frontmatter
    for (const derived of getDerivedSlugs(slug)) {
      allSlugs.add(derived)
    }
  }

  const report = analyzeStoryWiki(pages, [...allSlugs], pageLookup)
  const markdown = renderStoryAuditMarkdown(report)
  await fs.writeFile(outputPath, markdown, "utf8")
}

await main()
