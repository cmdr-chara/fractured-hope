import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import * as Component from "./quartz/components"
import * as Plugin from "./.quartz/plugins"

const config = await loadQuartzConfig()
export default config

const graph = Component.DesktopOnly(
  Plugin.Graph({
    localGraph: {
      showTags: false,
      depth: 1,
      enableRadial: false,
    },
    globalGraph: {
      showTags: false,
      depth: -1,
      enableRadial: true,
    },
  }),
)
const backlinks = Component.DesktopOnly(Plugin.Backlinks())

export const layout = await loadQuartzLayout({
  defaults: {
    left: [
      Plugin.PageTitle(),
      Component.Flex({
        components: [
          { Component: Plugin.Search(), grow: true },
          { Component: Plugin.Darkmode() },
          { Component: Plugin.ReaderMode() },
        ],
        direction: "row",
        gap: "0.5rem",
      }),
      Plugin.Explorer({
        title: "Browse",
        folderDefaultState: "collapsed",
        folderClickBehavior: "link",
        useSavedState: true,
      }),
    ],
    right: [backlinks, graph],
  },
  byPageType: {
    content: {
      right: [backlinks, graph],
    },
  },
})
