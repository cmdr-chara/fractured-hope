import { h } from "preact"
import { classNames, resolveRelative, simplifySlug } from "@quartz-community/utils"

function backlinkTargets(currentSlug, aliases = []) {
  return new Set([currentSlug, ...aliases.map((alias) => simplifySlug(alias))])
}

function selectStoryBacklinks(allFiles, currentPage) {
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

export function StoryBacklinks(opts = {}) {
  const options = { hideWhenEmpty: false, ...opts }

  return function StoryBacklinksComponent({ fileData, allFiles, displayClass }) {
    const backlinkFiles = selectStoryBacklinks(allFiles, fileData)

    if (options.hideWhenEmpty && backlinkFiles.length === 0) {
      return null
    }

    return h(
      "div",
      { class: classNames(displayClass, "backlinks") },
      h("h3", {}, "Backlinks"),
      h(
        "ul",
        { class: "overflow" },
        backlinkFiles.length > 0
          ? backlinkFiles.map((file) =>
              h(
                "li",
                {},
                h(
                  "a",
                  {
                    href: resolveRelative(fileData.slug, file.slug),
                    class: "internal",
                  },
                  file.frontmatter?.title ?? file.slug,
                ),
              ),
            )
          : h("li", { class: "backlink-empty" }, "No backlinks found"),
        h("li", { class: "overflow-end" }),
      ),
    )
  }
}
