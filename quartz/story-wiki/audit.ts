export type StoryAuditSection =
  | "story"
  | "characters"
  | "lore"
  | "locations"
  | "relationships"
  | "themes"
  | "timeline"
  | "meta"

export type StoryAuditPage = {
  slug: string
  title?: string
  tags?: string[]
  aliases?: string[]
  content?: string
}

export type StoryAuditLookupEntry = {
  title?: string
  aliases?: string[]
}

export type StoryAuditIssue = {
  type: "missing-target" | "missing-coverage"
  page?: string
  target?: string
  detail: string
}

export type StoryAuditReport = {
  brokenLinks: StoryAuditIssue[]
  missingCoverage: StoryAuditIssue[]
}

export const STORY_REQUIRED_PAGES: Record<StoryAuditSection, string[]> = {
  story: [
    "story/overview",
    "story/prologue",
    "story/arc-1-a-new-dawn",
    "story/arc-2-building-alliances",
    "story/arc-3-calculated-mercy",
    "story/arc-4-the-weight-of-promises",
    "story/arc-5-the-birthday-betrayal",
    "story/arc-6-the-hollow-morning",
  ],
  characters: [
    "characters/chara",
    "characters/raiden",
    "characters/frisk",
    "characters/kager",
    "characters/sans",
    "characters/axel",
    "characters/javier",
    "characters/paloma",
    "characters/hchara",
    "characters/valerius",
    "characters/elias-the-administrator",
    "characters/asriel",
    "characters/asgore",
  ],
  lore: [
    "lore/souls",
    "lore/lumina",
    "lore/determination",
    "lore/jikle",
    "lore/soul-fusion",
    "lore/resets-and-save-points",
    "lore/lab-c7",
    "lore/the-red-genocide",
  ],
  locations: [
    "locations/brasilia",
    "locations/chara-house",
    "locations/hidden-lab",
    "locations/the-library",
    "locations/judgment-hall",
    "locations/beach",
    "locations/asriels-prison",
  ],
  relationships: [
    "relationships/chara-and-raiden",
    "relationships/chara-and-frisk",
    "relationships/chara-and-sans",
    "relationships/javier-and-paloma",
    "relationships/raiden-and-kager",
  ],
  themes: [
    "themes/love-vs-perfection",
    "themes/trauma-and-weaponization",
    "themes/mercy-and-monstrosity",
    "themes/identity-fragmentation",
    "themes/chosen-family",
  ],
  timeline: ["timeline/chronology", "timeline/reset-sequence", "timeline/alternate-timelines"],
  meta: ["meta/canon-policy", "meta/source-map", "meta/open-questions"],
}

const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g

function normalizeTarget(raw: string): string {
  return raw.trim().replace(/\\/g, "/").replace(/\.md$/i, "").toLowerCase()
}

function extractWikilinks(content: string): string[] {
  const results = new Set<string>()
  for (const match of content.matchAll(WIKILINK_RE)) {
    const raw = match[1]
    if (!raw) continue
    results.add(normalizeTarget(raw))
  }
  return [...results]
}

export function analyzeStoryWiki(
  pages: StoryAuditPage[],
  allSlugs: string[],
  pageLookup: Record<string, StoryAuditLookupEntry> = {},
): StoryAuditReport {
  const validTargets = new Set(allSlugs.map(normalizeTarget))
  const brokenLinks: StoryAuditIssue[] = []
  const missingCoverage: StoryAuditIssue[] = []

  for (const [slug, entry] of Object.entries(pageLookup)) {
    validTargets.add(normalizeTarget(slug))

    if (entry.title) {
      validTargets.add(normalizeTarget(entry.title))
    }

    for (const alias of entry.aliases ?? []) {
      validTargets.add(normalizeTarget(alias))
    }
  }

  for (const page of pages) {
    if (normalizeTarget(page.slug) === "meta/story-audit") {
      continue
    }

    const content = page.content ?? ""
    const links = extractWikilinks(content)
    for (const link of links) {
      if (!validTargets.has(link)) {
        brokenLinks.push({
          type: "missing-target",
          page: page.slug,
          target: link,
          detail: `[[${link}]] does not resolve to a known page slug.`,
        })
      }
    }
  }

  for (const [section, required] of Object.entries(STORY_REQUIRED_PAGES) as Array<
    [StoryAuditSection, string[]]
  >) {
    for (const slug of required) {
      if (!validTargets.has(slug)) {
        missingCoverage.push({
          type: "missing-coverage",
          target: slug,
          detail: `Required ${section} page is missing: ${slug}`,
        })
      }
    }
  }

  return { brokenLinks, missingCoverage }
}

export function renderStoryAuditMarkdown(report: StoryAuditReport): string {
  const lines: string[] = []
  lines.push("---")
  lines.push('title: "Story Audit"')
  lines.push(
    'description: "Build-time audit of broken internal links and missing story coverage requirements for the Fractured Hope wiki."',
  )
  lines.push("tags: [meta, audit, story-audit]")
  lines.push('aliases: ["Story Coverage Audit", "Wiki Audit"]')
  lines.push("---")
  lines.push("")
  lines.push("# Story Audit")
  lines.push("")
  lines.push(
    "This page is generated from local story-wiki audit rules. It exists to catch broken internal links and obvious canon coverage gaps.",
  )
  lines.push("")
  lines.push("## Broken Links")
  lines.push("")
  if (report.brokenLinks.length === 0) {
    lines.push("No broken internal links were detected.")
  } else {
    for (const issue of report.brokenLinks) {
      lines.push(`- **${issue.page}** → \`[[${issue.target}]]\` - ${issue.detail}`)
    }
  }
  lines.push("")
  lines.push("## Missing Required Coverage")
  lines.push("")
  if (report.missingCoverage.length === 0) {
    lines.push("All required baseline story pages are present.")
  } else {
    for (const issue of report.missingCoverage) {
      lines.push(`- \`${issue.target}\` - ${issue.detail}`)
    }
  }
  lines.push("")
  lines.push("## Notes")
  lines.push("")
  lines.push(
    "This audit is intentionally conservative. It checks for required baseline pages and literal unresolved wikilinks. It does not try to infer every possible canon omission.",
  )
  lines.push("")
  return lines.join("\n")
}
