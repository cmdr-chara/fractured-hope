type ExplorerNode = {
  slugSegment?: string
  slugSegments?: string[]
  displayName?: string
  isFolder: boolean
  data: Record<string, unknown> | null
  children: ExplorerNode[]
}

type StoryWikiSection = (typeof STORY_WIKI_SECTION_ORDER)[number]
type StoryWikiCharacter = (typeof STORY_WIKI_CHARACTER_ORDER)[number]

export const STORY_WIKI_SECTION_ORDER = [
  "story",
  "characters",
  "lore",
  "locations",
  "relationships",
  "themes",
  "timeline",
  "meta",
  "tags",
] as const

const STORY_WIKI_HIDDEN_META_SLUGS = new Set([
  "meta/canon-policy",
  "meta/source-map",
  "meta/story-audit",
  "meta/sandbox",
  "meta/sandbox/index",
])

export const STORY_WIKI_CHARACTER_ORDER = [
  "chara",
  "raiden",
  "frisk",
  "kager",
  "axel",
  "sans",
  "elias-the-administrator",
  "hchara",
  "valerius",
  "javier",
  "paloma",
  "asriel",
  "asgore",
  "marcus",
  "martinez",
  "ale",
] as const

const sectionPriority = new Map<StoryWikiSection, number>(
  STORY_WIKI_SECTION_ORDER.map((name, index) => [name, index]),
)
const characterPriority = new Map<StoryWikiCharacter, number>(
  STORY_WIKI_CHARACTER_ORDER.map((name, index) => [name, index]),
)

function getNodeName(node: ExplorerNode): string {
  return (node.slugSegment ?? node.displayName ?? "").toLowerCase()
}

export function shouldHideExplorerNode(node: ExplorerNode): boolean {
  const segments = node.slugSegments?.map((segment) => segment.toLowerCase()) ?? []

  if (!node.isFolder && segments.length === 1 && segments[0] !== "index") {
    return true
  }

  const slugPath = segments.join("/")
  if (STORY_WIKI_HIDDEN_META_SLUGS.has(slugPath)) {
    return true
  }

  return false
}

function alphabeticalCompare(a: ExplorerNode, b: ExplorerNode): number {
  const aName = a.displayName ?? a.slugSegment ?? ""
  const bName = b.displayName ?? b.slugSegment ?? ""
  return aName.localeCompare(bName, undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

function toSectionKey(value: string): StoryWikiSection | undefined {
  return STORY_WIKI_SECTION_ORDER.find((entry) => entry === value)
}

function toCharacterKey(value: string): StoryWikiCharacter | undefined {
  return STORY_WIKI_CHARACTER_ORDER.find((entry) => entry === value)
}

function compareFolderPriority(a: ExplorerNode, b: ExplorerNode): number | null {
  const aPriority = sectionPriority.get(toSectionKey(getNodeName(a)) as StoryWikiSection)
  const bPriority = sectionPriority.get(toSectionKey(getNodeName(b)) as StoryWikiSection)

  if (aPriority === undefined && bPriority === undefined) return null
  if (aPriority === undefined) return 1
  if (bPriority === undefined) return -1
  return aPriority - bPriority
}

function compareCharacterPriority(a: ExplorerNode, b: ExplorerNode): number | null {
  const aParent = a.slugSegments?.[0]?.toLowerCase()
  const bParent = b.slugSegments?.[0]?.toLowerCase()
  if (aParent !== "characters" || bParent !== "characters") return null

  const aPriority = characterPriority.get(toCharacterKey(getNodeName(a)) as StoryWikiCharacter)
  const bPriority = characterPriority.get(toCharacterKey(getNodeName(b)) as StoryWikiCharacter)

  if (aPriority === undefined && bPriority === undefined) return null
  if (aPriority === undefined) return 1
  if (bPriority === undefined) return -1
  return aPriority - bPriority
}

export function storyWikiExplorerSort(a: ExplorerNode, b: ExplorerNode): number {
  if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
    if (a.isFolder && b.isFolder) {
      const folderComparison = compareFolderPriority(a, b)
      if (folderComparison !== null && folderComparison !== 0) return folderComparison
    }

    const characterComparison = compareCharacterPriority(a, b)
    if (characterComparison !== null && characterComparison !== 0) return characterComparison

    return alphabeticalCompare(a, b)
  }

  return a.isFolder ? -1 : 1
}

export function shouldShowStoryWikiGraph(tags?: string[]): boolean {
  if (!tags || tags.length === 0) return true

  const lowered = new Set(tags.map((tag) => tag.toLowerCase()))
  return !lowered.has("meta") && !lowered.has("sandbox")
}

export const STORY_WIKI_GRAPH_HIDDEN_TAGS = [
  "meta",
  "sandbox",
  "section",
  "navigation",
  "index",
] as const
