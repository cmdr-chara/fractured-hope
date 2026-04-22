import fs from "fs"
import path from "path"
import { styleText } from "util"
import type { BuildCtx } from "../../../quartz/util/ctx.ts"
import type { ProcessedContent } from "../../../quartz/plugins/vfile.ts"
import type { QuartzEmitterPlugin } from "../../../quartz/plugins/types.ts"

export type DeadLinksOptions = {
  failOnBrokenLinks?: boolean
  checkExternalLinks?: boolean
  externalTimeoutMs?: number
}

type DeadLinkIssue = {
  page: string
  line: number
  target: string
  kind: "wikilink" | "markdown" | "external"
  detail: string
}

type LookupData = {
  slug: string
  title?: string
  aliases: string[]
}

const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g
const MARKDOWN_LINK_RE = /!?\[[^\]]*?\]\(([^)]+)\)/g

const DEFAULTS: Required<DeadLinksOptions> = {
  failOnBrokenLinks: true,
  checkExternalLinks: false,
  externalTimeoutMs: 5000,
}

function normalizeLookupKey(raw: string): string {
  return raw
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/^\/+/, "")
    .replace(/\.(md|html)$/i, "")
    .replace(/\/index$/i, "")
    .replace(/\/+$/, "")
    .toLowerCase()
}

function normalizeDisplayKey(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase()
}

function stripMarkdownTitle(raw: string): string {
  const trimmed = raw.trim().replace(/^<|>$/g, "")
  const titleMatch = trimmed.match(/^(.*?)(?:\s+"[^"]*")?$/)
  return (titleMatch?.[1] ?? trimmed).trim()
}

function isExternalUrl(raw: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(raw)
}

function isLocalMarkdownLink(raw: string): boolean {
  return raw.startsWith("./") || raw.startsWith("../") || raw.startsWith("/") || !isExternalUrl(raw)
}

function linkCandidateKeys(target: string, currentFilePath: string): string[] {
  const cleaned = stripMarkdownTitle(target).split("?")[0]!.split("#")[0]!
  const currentDir = path.posix.dirname(currentFilePath)

  const candidates = new Set<string>()
  const addCandidate = (candidate: string) => {
    const normalized = normalizeLookupKey(candidate)
    if (normalized) candidates.add(normalized)
  }

  addCandidate(cleaned)

  if (cleaned.startsWith("/")) {
    addCandidate(cleaned.slice(1))
  } else {
    addCandidate(path.posix.join(currentDir, cleaned))
  }

  return [...candidates]
}

function wikiCandidateKeys(target: string): string[] {
  const cleaned = target.split("?")[0]!.split("#")[0]!
  const candidates = new Set<string>()
  const normalized = normalizeLookupKey(cleaned)
  if (normalized) candidates.add(normalized)
  const display = normalizeDisplayKey(cleaned)
  if (display) candidates.add(display)
  return [...candidates]
}

function buildLookup(content: ProcessedContent[]): Set<string> {
  const targets = new Set<string>()
  for (const [, file] of content) {
    const slug = file.data.slug
    if (typeof slug === "string" && slug.length > 0) {
      targets.add(normalizeLookupKey(slug))
    }

    const frontmatter = file.data.frontmatter as Record<string, unknown> | undefined
    const title = frontmatter?.title
    if (typeof title === "string" && title.length > 0) {
      targets.add(normalizeDisplayKey(title))
    }

    const aliases = frontmatter?.aliases
    if (Array.isArray(aliases)) {
      for (const alias of aliases) {
        if (typeof alias === "string" && alias.length > 0) {
          targets.add(normalizeDisplayKey(alias))
        }
      }
    }
  }
  return targets
}

function extractIssuesFromLine(
  line: string,
  pageSlug: string,
  currentFilePath: string,
  lineNumber: number,
  validTargets: Set<string>,
  options: Required<DeadLinksOptions>,
): DeadLinkIssue[] {
  const issues: DeadLinkIssue[] = []

  for (const match of line.matchAll(WIKILINK_RE)) {
    const rawTarget = match[1]
    if (!rawTarget) continue

    const candidates = wikiCandidateKeys(rawTarget)
    if (candidates.some((candidate) => validTargets.has(candidate))) continue

    issues.push({
      page: pageSlug,
      line: lineNumber,
      target: rawTarget,
      kind: "wikilink",
      detail: `[[${rawTarget}]] does not resolve to a known page.`,
    })
  }

  for (const match of line.matchAll(MARKDOWN_LINK_RE)) {
    const rawTarget = match[1]
    if (!rawTarget) continue

    const cleaned = stripMarkdownTitle(rawTarget)
    if (cleaned.startsWith("#")) continue

    if (isExternalUrl(cleaned)) {
      if (!options.checkExternalLinks) continue

      issues.push({
        page: pageSlug,
        line: lineNumber,
        target: cleaned,
        kind: "external",
        detail: `External link check is enabled and this URL will be verified later.`,
      })
      continue
    }

    if (!isLocalMarkdownLink(cleaned)) continue

    const candidates = linkCandidateKeys(cleaned, currentFilePath)
    if (candidates.some((candidate) => validTargets.has(candidate))) continue

    issues.push({
      page: pageSlug,
      line: lineNumber,
      target: cleaned,
      kind: "markdown",
      detail: `[${cleaned}](${cleaned}) does not resolve to a known page.`,
    })
  }

  return issues
}

async function checkExternalUrl(url: string, timeoutMs: number): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    })

    if (response.ok) return true

    if (response.status === 405 || response.status === 501) {
      const fallback = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
      })
      return fallback.ok
    }

    return false
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

function readMarkdownSource(ctx: BuildCtx, filePath: string): string | null {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(ctx.argv.directory, filePath)
  if (!fs.existsSync(resolvedPath)) return null
  return fs.readFileSync(resolvedPath, "utf-8")
}

export const DeadLinks: QuartzEmitterPlugin<DeadLinksOptions> = (opts) => {
  const options = { ...DEFAULTS, ...opts }

  return {
    name: "DeadLinks",
    async emit(ctx, content) {
      const validTargets = buildLookup(content)
      const issues: DeadLinkIssue[] = []
      const externalTargets = new Set<string>()

      for (const [, file] of content) {
        const slug = typeof file.data.slug === "string" ? file.data.slug : null
        const filePath = typeof file.data.filePath === "string" ? file.data.filePath : null
        const relativePath =
          typeof file.data.relativePath === "string" ? file.data.relativePath : null

        if (!slug || !filePath || !relativePath) continue

        const raw = readMarkdownSource(ctx, filePath)
        if (!raw) continue

        const lines = raw.split(/\r?\n/)
        for (const [index, line] of lines.entries()) {
          const lineIssues = extractIssuesFromLine(
            line,
            slug,
            relativePath,
            index + 1,
            validTargets,
            options,
          )
          for (const issue of lineIssues) {
            if (issue.kind === "external") {
              externalTargets.add(issue.target)
            } else {
              issues.push(issue)
            }
          }
        }
      }

      if (options.checkExternalLinks && externalTargets.size > 0) {
        for (const url of externalTargets) {
          const ok = await checkExternalUrl(url, options.externalTimeoutMs)
          if (!ok) {
            issues.push({
              page: "external",
              line: 0,
              target: url,
              kind: "external",
              detail: `External URL returned a non-2xx response or timed out.`,
            })
          }
        }
      }

      if (issues.length === 0) {
        console.log(styleText("green", "✓ Dead link check passed"))
        return []
      }

      console.log(styleText("yellow", `⚠ Dead link check found ${issues.length} issue(s)`))
      for (const issue of issues) {
        const location = issue.line > 0 ? `${issue.page}:${issue.line}` : issue.page
        console.log(styleText("red", `  ✗ ${location} -> ${issue.target}`))
        console.log(styleText("gray", `    ${issue.detail}`))
      }

      if (options.failOnBrokenLinks) {
        throw new Error(`Dead link check failed with ${issues.length} issue(s).`)
      }

      return []
    },
  }
}

export default DeadLinks
