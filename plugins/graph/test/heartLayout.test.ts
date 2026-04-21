import { describe, expect, it } from "vitest"
import {
  createHeartLayoutTargets,
  heartCurvePoint,
} from "../src/components/scripts/heartLayout"

describe("heart layout helpers", () => {
  it("creates targets for every node and keeps hubs closer to the center than isolates", () => {
    const nodes = [
      { id: "hub" },
      { id: "ally-a" },
      { id: "ally-b" },
      { id: "ally-c" },
      { id: "pair-a" },
      { id: "pair-b" },
      { id: "solo-a" },
      { id: "solo-b" },
    ]

    const links = [
      { source: "hub", target: "ally-a" },
      { source: "hub", target: "ally-b" },
      { source: "hub", target: "ally-c" },
      { source: "pair-a", target: "pair-b" },
    ]

    const targets = createHeartLayoutTargets(nodes, links, 220)

    expect(targets.size).toBe(nodes.length)
    expect(targets.get("hub")?.band).toBe("core")
    expect(targets.get("solo-a")?.band).toBe("outer")
    expect(targets.get("solo-b")?.band).toBe("outer")

    const hubTarget = targets.get("hub")!
    const isolateTarget = targets.get("solo-a")!

    const hubDistance = Math.hypot(hubTarget.x, hubTarget.y)
    const isolateDistance = Math.hypot(isolateTarget.x, isolateTarget.y)

    expect(hubDistance).toBeLessThan(isolateDistance)
  })

  it("generates deterministic heart-curve points", () => {
    const topCleft = heartCurvePoint(0, 100)
    const bottomTip = heartCurvePoint(Math.PI, 100)

    expect(topCleft.x).toBeCloseTo(0)
    expect(topCleft.y).toBeCloseTo(-31.25)
    expect(bottomTip.x).toBeCloseTo(0)
    expect(bottomTip.y).toBeCloseTo(106.25)
  })
})
