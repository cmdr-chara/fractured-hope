import test from "node:test"
import assert from "node:assert/strict"

import {
  shouldHideExplorerNode,
  shouldShowStoryWikiGraph,
  STORY_WIKI_CHARACTER_ORDER,
  STORY_WIKI_SECTION_ORDER,
  storyWikiExplorerSort,
} from "./navigation"

type ExplorerNode = {
  slugSegment?: string
  slugSegments?: string[]
  displayName?: string
  isFolder: boolean
  data: Record<string, unknown> | null
  children: ExplorerNode[]
}

function makeNode(args: {
  slugSegment: string
  slugSegments?: string[]
  displayName?: string
  isFolder?: boolean
}): ExplorerNode {
  return {
    slugSegment: args.slugSegment,
    slugSegments: args.slugSegments ?? [args.slugSegment],
    displayName: args.displayName ?? args.slugSegment,
    isFolder: args.isFolder ?? false,
    data: null,
    children: [],
  }
}

test("section order prioritizes curated top-level folders", () => {
  assert.ok(
    STORY_WIKI_SECTION_ORDER.indexOf("characters") < STORY_WIKI_SECTION_ORDER.indexOf("meta"),
  )

  const characters = makeNode({ slugSegment: "characters", isFolder: true })
  const meta = makeNode({ slugSegment: "meta", isFolder: true })

  assert.ok(storyWikiExplorerSort(characters, meta) < 0)
})

test("character order prioritizes Chara before Raiden and Ale", () => {
  assert.ok(
    STORY_WIKI_CHARACTER_ORDER.indexOf("chara") < STORY_WIKI_CHARACTER_ORDER.indexOf("raiden"),
  )
  assert.ok(
    STORY_WIKI_CHARACTER_ORDER.indexOf("raiden") < STORY_WIKI_CHARACTER_ORDER.indexOf("ale"),
  )

  const chara = makeNode({
    slugSegment: "chara",
    slugSegments: ["characters", "chara"],
    displayName: "Chara",
  })
  const raiden = makeNode({
    slugSegment: "raiden",
    slugSegments: ["characters", "raiden"],
    displayName: "Raiden",
  })
  const ale = makeNode({
    slugSegment: "ale",
    slugSegments: ["characters", "ale"],
    displayName: "Ale",
  })

  assert.ok(storyWikiExplorerSort(chara, raiden) < 0)
  assert.ok(storyWikiExplorerSort(raiden, ale) < 0)
})

test("unknown items fall back to alphabetical order", () => {
  const alpha = makeNode({ slugSegment: "alpha", displayName: "Alpha" })
  const beta = makeNode({ slugSegment: "beta", displayName: "Beta" })

  assert.ok(storyWikiExplorerSort(alpha, beta) < 0)
  assert.ok(storyWikiExplorerSort(beta, alpha) > 0)
})

test("graph is hidden for meta and sandbox tagged pages", () => {
  assert.equal(shouldShowStoryWikiGraph(["meta"]), false)
  assert.equal(shouldShowStoryWikiGraph(["sandbox"]), false)
  assert.equal(shouldShowStoryWikiGraph(["meta", "sandbox", "quartz"]), false)
})

test("graph is shown for normal content pages", () => {
  assert.equal(shouldShowStoryWikiGraph(["character"]), true)
  assert.equal(shouldShowStoryWikiGraph(["story", "arc-6"]), true)
  assert.equal(shouldShowStoryWikiGraph(["lore"]), true)
  assert.equal(shouldShowStoryWikiGraph(undefined), true)
})

test("root-level loose pages like Liberado can be hidden from explorer", () => {
  const liberado = makeNode({
    slugSegment: "liberado",
    slugSegments: ["liberado"],
    displayName: "Liberado",
  })
  const characterPage = makeNode({
    slugSegment: "chara",
    slugSegments: ["characters", "chara"],
    displayName: "Chara",
  })

  assert.equal(shouldHideExplorerNode(liberado), true)
  assert.equal(shouldHideExplorerNode(characterPage), false)
})
