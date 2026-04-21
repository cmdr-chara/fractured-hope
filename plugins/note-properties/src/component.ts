import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"

export interface NotePropertiesComponentOptions {}

export default (() => {
  const Component: QuartzComponent = (_props: QuartzComponentProps) => null
  return Component
}) satisfies QuartzComponentConstructor
