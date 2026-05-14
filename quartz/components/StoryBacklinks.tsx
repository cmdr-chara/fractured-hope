import { classNames } from "../util/lang"
import { FullSlug, resolveRelative, simplifySlug } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

type StoryBacklinksOptions = {
  hideWhenEmpty: boolean
}

type BacklinkPage = {
  unlisted?: boolean
  links?: string[]
  slug?: string
  frontmatter?: {
    title?: string
    aliases?: string[]
  }
}

const defaultOptions: StoryBacklinksOptions = {
  hideWhenEmpty: true,
}

function backlinkTargets(currentSlug: string, aliases: string[] = []) {
  return new Set([currentSlug, ...aliases.map((alias) => simplifySlug(alias))])
}

export function selectStoryBacklinks(allFiles: BacklinkPage[], currentPage: BacklinkPage) {
  const currentSlug = simplifySlug(currentPage.slug ?? "")
  const targets = backlinkTargets(currentSlug, currentPage.frontmatter?.aliases ?? [])

  return allFiles
    .filter((file) => {
      if (file.unlisted === true || file.slug === currentPage.slug) {
        return false
      }

      return file.links?.some((link) => targets.has(simplifySlug(link))) ?? false
    })
    .sort((a, b) =>
      (a.frontmatter?.title ?? a.slug ?? "").localeCompare(
        b.frontmatter?.title ?? b.slug ?? "",
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      ),
    )
}

export default ((opts?: Partial<StoryBacklinksOptions>) => {
  const options = { ...defaultOptions, ...opts }

  const StoryBacklinks: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const backlinkFiles = selectStoryBacklinks(allFiles as BacklinkPage[], fileData as BacklinkPage)

    if (options.hideWhenEmpty && backlinkFiles.length === 0) {
      return null
    }

    return (
      <div class={classNames(displayClass, "backlinks")}>
        <h3>Backlinks</h3>
        <ul class="overflow">
          {backlinkFiles.length > 0 ? (
            backlinkFiles.map((file) => (
              <li>
                <a
                  href={resolveRelative(fileData.slug as FullSlug, file.slug as FullSlug)}
                  class="internal"
                >
                  {file.frontmatter?.title ?? file.slug}
                </a>
              </li>
            ))
          ) : (
            <li class="backlink-empty">No backlinks found</li>
          )}
          <li class="overflow-end"></li>
        </ul>
      </div>
    )
  }

  StoryBacklinks.displayName = "StoryBacklinks"
  return StoryBacklinks
}) satisfies QuartzComponentConstructor<Partial<StoryBacklinksOptions> | undefined>
