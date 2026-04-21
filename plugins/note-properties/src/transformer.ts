import remarkParse from "remark-parse"
import { unified } from "unified"
import { parse as parseYaml } from "yaml"

type BuildCtx = any
type FilePath = string
type FullSlug = string
type QuartzTransformerPlugin<Options = undefined> = (opts?: Options) => {
  name: string
  markdownPlugins?: (ctx: BuildCtx) => Array<() => (tree: any, file: any) => void>
}

function getFileExtension(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/")
  const idx = normalized.lastIndexOf(".")
  return idx === -1 ? "" : normalized.slice(idx)
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/\.md$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function slugTag(tag: string): string {
  return slugify(tag)
}

function slugifyFilePath(filePath: FilePath): FullSlug {
  const normalized = filePath.replace(/\\/g, "/")
  const withoutIndex = normalized.replace(/\/index\.md$/i, "").replace(/\.md$/i, "")
  return slugify(withoutIndex) as FullSlug
}

type FrontmatterOptions = {
  includeAll: boolean
  includedProperties: string[]
  excludedProperties: string[]
  hidePropertiesView: boolean
  delimiters: string | [string, string]
  language: "yaml"
}

export type NotePropertiesOptions = Partial<FrontmatterOptions>

const defaultOptions: FrontmatterOptions = {
  includeAll: false,
  includedProperties: ["description", "tags", "aliases"],
  excludedProperties: [],
  hidePropertiesView: false,
  delimiters: "---",
  language: "yaml",
}

function coalesceAliases(data: Record<string, unknown>, aliases: string[]): unknown | undefined {
  for (const alias of aliases) {
    if (data[alias] !== undefined && data[alias] !== null) return data[alias]
  }
}

function coerceToArray(input: unknown): string[] | undefined {
  if (input === undefined || input === null) return undefined

  if (!Array.isArray(input)) {
    return String(input)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }

  return input
    .filter((v: unknown) => typeof v === "string" || typeof v === "number")
    .map((v: string | number) => v.toString())
    .filter(Boolean)
}

function getAliasSlugs(aliases: string[]): FullSlug[] {
  return aliases.map((alias) => {
    const isMd = getFileExtension(alias) === ".md"
    const mockFp = isMd ? alias : `${alias}.md`
    return slugifyFilePath(mockFp as FilePath)
  })
}

const WIKILINK_PATTERN = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g
const MDLINK_PATTERN = /\[(?:[^\]]*)\]\(([^)]+)\)/g

function extractLinksFromValue(value: unknown): string[] {
  if (typeof value === "string") {
    const links: string[] = []
    let match: RegExpExecArray | null

    WIKILINK_PATTERN.lastIndex = 0
    while ((match = WIKILINK_PATTERN.exec(value)) !== null) {
      links.push(slugifyFilePath(`${match[1]!.trim()}.md` as FilePath))
    }

    MDLINK_PATTERN.lastIndex = 0
    while ((match = MDLINK_PATTERN.exec(value)) !== null) {
      links.push(match[1]!)
    }

    return links
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractLinksFromValue(item))
  }

  if (value !== null && typeof value === "object") {
    return Object.values(value).flatMap((v) => extractLinksFromValue(v))
  }

  return []
}

const QUARTZ_INTERNAL_KEYS = new Set([
  "quartz-properties",
  "quartzProperties",
  "quartz-properties-collapse",
  "quartzPropertiesCollapse",
])

function coerceToBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const lower = value.toLowerCase()
    if (lower === "true") return true
    if (lower === "false") return false
  }
  return undefined
}

function getVisibleProperties(
  data: Record<string, unknown>,
  opts: FrontmatterOptions,
): Record<string, unknown> {
  const excluded = new Set(opts.excludedProperties)
  for (const key of QUARTZ_INTERNAL_KEYS) {
    excluded.add(key)
  }

  if (opts.includeAll) {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (!excluded.has(key)) {
        result[key] = value
      }
    }
    return result
  }

  const result: Record<string, unknown> = {}
  for (const key of opts.includedProperties) {
    if (!excluded.has(key) && data[key] !== undefined) {
      result[key] = data[key]
    }
  }
  return result
}

function extractFrontmatter(source: string, delimiters: string | [string, string]) {
  const [start, end] = Array.isArray(delimiters) ? delimiters : [delimiters, delimiters]
  const lines = source.split(/\r?\n/)
  if (lines.length === 0 || lines[0]?.trim() !== start) return null

  let closingIndex = -1
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i]!.trim() === end) {
      closingIndex = i
      break
    }
  }

  if (closingIndex === -1) return null

  const frontmatterText = lines.slice(1, closingIndex).join("\n")
  const body = lines.slice(closingIndex + 1).join("\n")
  return { frontmatterText, body }
}

export const NoteProperties: QuartzTransformerPlugin<NotePropertiesOptions> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  const bodyParser = unified().use(remarkParse)

  return {
    name: "NoteProperties",
    markdownPlugins(_ctx: BuildCtx) {
      return [
        () => {
          return (tree, file) => {
            const source = String(file.value)
            const extracted = extractFrontmatter(source, opts.delimiters)
            const data: Record<string, unknown> = extracted
              ? ((parseYaml(extracted.frontmatterText) as Record<string, unknown>) ?? {})
              : {}

            if (data.title != null && data.title.toString() !== "") {
              data.title = data.title.toString()
            } else {
              data.title = file.stem ?? "Untitled"
            }

            const tags = coerceToArray(coalesceAliases(data, ["tags", "tag"]))
            if (tags) data.tags = [...new Set(tags.map((tag) => slugTag(tag)))]

            const aliases = coerceToArray(coalesceAliases(data, ["aliases", "alias"]))
            if (aliases) {
              data.aliases = aliases
              const currentAliases = (file.data.aliases as FullSlug[]) ?? []
              const nextAliases = [...currentAliases, ...getAliasSlugs(aliases)]
              file.data.aliases = [...new Set(nextAliases)]
            }

            const permalink = coalesceAliases(data, ["permalink"])
            if (permalink != null && permalink.toString() !== "") {
              data.permalink = permalink.toString() as FullSlug
              const currentAliases = (file.data.aliases as FullSlug[]) ?? []
              file.data.aliases = [...new Set([...currentAliases, data.permalink])]
            }

            const cssclasses = coerceToArray(coalesceAliases(data, ["cssclasses", "cssclass"]))
            if (cssclasses) data.cssclasses = cssclasses

            const socialImage = coalesceAliases(data, ["socialImage", "image", "cover"])
            if (socialImage) data.socialImage = socialImage

            const created = coalesceAliases(data, ["created", "date"])
            if (created) data.created = created

            const modified = coalesceAliases(data, [
              "modified",
              "lastmod",
              "updated",
              "last-modified",
            ])
            if (modified) data.modified = modified
            if (data.modified == null) data.modified = created

            const published = coalesceAliases(data, ["published", "publishDate", "date"])
            if (published) data.published = published

            const frontmatterLinks = extractLinksFromValue(data)
            if (frontmatterLinks.length > 0) {
              const existingLinks = (file.data.frontmatterLinks as string[]) ?? []
              file.data.frontmatterLinks = [...existingLinks, ...frontmatterLinks]
            }

            const showProperties = coerceToBool(
              coalesceAliases(data, ["quartz-properties", "quartzProperties"]),
            )
            const collapseProperties = coerceToBool(
              coalesceAliases(data, ["quartz-properties-collapse", "quartzPropertiesCollapse"]),
            )
            const visibleProps = getVisibleProperties(data, opts)

            file.data.frontmatter = data
            file.data.noteProperties = {
              properties: visibleProps,
              hideView: opts.hidePropertiesView,
              showProperties,
              collapseProperties,
            }

            if (extracted) {
              file.value = extracted.body
              const bodyTree = bodyParser.parse(extracted.body)
              tree.children = bodyTree.children
            }
          }
        },
      ]
    },
  }
}
