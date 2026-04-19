import test from "node:test"
import assert from "node:assert/strict"

import { analyzeStoryWiki, renderStoryAuditMarkdown } from "./audit"

test("story audit reports missing wikilink targets", () => {
  const report = analyzeStoryWiki(
    [
      {
        slug: "characters/chara",
        content:
          "See [[characters/raiden|Raiden]] and [[characters/missing-person|Missing Person]].",
      },
    ],
    ["characters/chara", "characters/raiden"],
  )

  assert.equal(report.brokenLinks.length, 1)
  assert.equal(report.brokenLinks[0]?.target, "characters/missing-person")
})

test("story audit reports missing required coverage pages", () => {
  const report = analyzeStoryWiki([], ["story/overview", "story/prologue", "characters/chara"])

  assert.ok(report.missingCoverage.some((issue) => issue.target === "characters/raiden"))
  assert.ok(report.missingCoverage.some((issue) => issue.target === "lore/lumina"))
})

test("story audit resolves title and alias based wikilinks", () => {
  const report = analyzeStoryWiki(
    [
      {
        slug: "index",
        content: "See [[Chara]], [[Canon Policy]], and [[Missing Page]].",
      },
    ],
    ["index", "characters/chara", "meta/canon-policy"],
    {
      "characters/chara": { title: "Chara", aliases: ["Chara Dreemurr"] },
      "meta/canon-policy": { title: "Canon Policy", aliases: ["Wiki Canon Standards"] },
    },
  )

  assert.equal(report.brokenLinks.length, 1)
  assert.equal(report.brokenLinks[0]?.target, "missing page")
})

test("story audit matches title aliases case-insensitively and skips generated audit page", () => {
  const report = analyzeStoryWiki(
    [
      {
        slug: "lore/index",
        content: "See [[Lily Note]].",
      },
      {
        slug: "meta/story-audit",
        content: "- **lore/index** → `[[Lily Note]]` - example output",
      },
    ],
    ["lore/index", "meta/story-audit", "lore/lily-note"],
    {
      "lore/lily-note": { title: "The Lily Note", aliases: ["lily note", "the lily note"] },
    },
  )

  assert.equal(report.brokenLinks.length, 0)
})

test("story audit markdown renders clean no-issue state", () => {
  const markdown = renderStoryAuditMarkdown({ brokenLinks: [], missingCoverage: [] })

  assert.match(markdown, /No broken internal links were detected\./)
  assert.match(markdown, /All required baseline story pages are present\./)
})
