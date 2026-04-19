# Heart Graph Layout Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Quartz global graph render as a readable heart-shaped whole graph instead of a free-force blob with a decorative heart outline.

**Architecture:** Add small heart-layout helper functions that classify nodes by connectedness, assign deterministic heart-zone targets, and provide soft containment. Use those helpers inside the graph runtime to seed all nodes into heart-shaped zones before the D3 simulation starts, then rebuild the plugin so Quartz serves the updated dist bundle.

**Tech Stack:** TypeScript, D3 force simulation, PIXI.js, tsup, Quartz plugin build pipeline.

---

## File Structure

- Modify: `.quartz/plugins/graph/src/components/scripts/graph.inline.ts`
  - Integrate heart-aware whole-graph layout into the actual runtime script source.
- Create: `.quartz/plugins/graph/src/components/scripts/heartLayout.ts`
  - Pure helper functions for node classification, heart target generation, and containment math.
- Create: `.quartz/plugins/graph/test/heartLayout.test.ts`
  - Unit tests for the helper math and classification behavior.
- Modify: `.quartz/plugins/graph/src/components/Graph.tsx` (only if config shape must change; otherwise leave untouched)
  - Keep default runtime contract stable unless strictly necessary.
- Modify: `.quartz/plugins/graph/dist/components/index.js`
  - Generated artifact; update only by rebuilding from source, not by hand.
- Modify: `.quartz/plugins/graph/dist/**/*.map`
  - Generated artifact updates from build.

## Chunk 1: Heart layout helpers

### Task 1: Add failing helper tests

**Files:**
- Test: `.quartz/plugins/graph/test/heartLayout.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest"
import { createHeartLayoutTargets, heartCurvePoint } from "../src/components/scripts/heartLayout"
```

Include assertions that:
- every node receives a target
- a hub lands in the `core` band
- isolates land in the `outer` band
- core targets are closer to origin than outer targets
- heart curve points are deterministic for known angles

- [ ] **Step 2: Run test to verify it fails**

Run: `npm exec -- vitest run heartLayout.test.ts`
Expected: FAIL because `heartLayout.ts` does not exist yet

### Task 2: Add minimal heart helper implementation

**Files:**
- Create: `.quartz/plugins/graph/src/components/scripts/heartLayout.ts`
- Test: `.quartz/plugins/graph/test/heartLayout.test.ts`

- [ ] **Step 1: Write minimal implementation**

Implement pure helpers:

```ts
export type HeartLayoutNode = { id: string }
export type HeartLayoutLink = { source: string; target: string }
export type HeartBand = "core" | "mid" | "outer"
export type HeartTarget = { x: number; y: number; band: HeartBand }
```

Functions to implement:
- `heartCurvePoint(angle: number, scale: number): { x: number; y: number }`
- `createHeartLayoutTargets(nodes, links, scale): Map<string, HeartTarget>`

Behavior:
- compute degree counts from links
- classify nodes:
  - `core`: highest-degree linked nodes
  - `mid`: remaining linked nodes
  - `outer`: isolates / tiny components
- place nodes on 3 heart scales, with jitter-free deterministic spacing by sorted node ID
- keep outer band **inside** the contour, not on the exact edge

- [ ] **Step 2: Run test to verify it passes**

Run: `npm exec -- vitest run heartLayout.test.ts`
Expected: PASS

## Chunk 2: Runtime integration

### Task 3: Replace isolate-only shaping with whole-graph shaping

**Files:**
- Modify: `.quartz/plugins/graph/src/components/scripts/graph.inline.ts`
- Modify: `.quartz/plugins/graph/src/components/scripts/heartLayout.ts`

- [ ] **Step 1: Import helpers into `graph.inline.ts`**

Add imports for the helper functions and any types needed by the inline script build.

- [ ] **Step 2: Seed all nodes before simulation starts**

Use `createHeartLayoutTargets(...)` after nodes/links are built and before `d3.forceSimulation(nodes)`.

For each node:
- set `node.x` / `node.y` to its target point
- set `node.vx` / `node.vy` to `0`
- do **not** hard-pin with `fx` / `fy`

- [ ] **Step 3: Add soft heart attraction forces**

Add weak `forceX` and `forceY` toward each node’s assigned target.
Requirements:
- stronger for `outer` band than `core`
- avoid over-banding; keep forces soft
- reduce the effect of generic `forceCenter` for the global graph

- [ ] **Step 4: Add heart-boundary containment**

Implement a lightweight custom D3 force that:
- checks whether a node is outside the implicit heart shape
- nudges its velocity inward toward the assigned target/origin
- never clamps position abruptly
- only runs for global graph mode

- [ ] **Step 5: Remove the old isolate pinning block**

Delete the current `enableRadial` logic that pins isolated nodes to the outline with `fx` / `fy`.
Replace it with the whole-graph shaping path.

## Chunk 3: Readability tuning

### Task 4: Reduce global clutter

**Files:**
- Modify: `.quartz/plugins/graph/src/components/scripts/graph.inline.ts`

- [ ] **Step 1: Hide most labels in global heart mode**

Adjust label visibility so the global graph prioritizes the silhouette:
- labels stay hidden by default at low zoom
- hover/focus labels still appear
- optionally keep only a few top-degree hub labels available at baseline if easy

- [ ] **Step 2: Lower passive link prominence**

Reduce default global link alpha and keep hover/focus links more visible.
Expected result: silhouette first, neighborhoods second.

## Chunk 4: Build + verification

### Task 5: Rebuild the actual runtime bundle

**Files:**
- Modify (generated): `.quartz/plugins/graph/dist/components/index.js`
- Modify (generated): `.quartz/plugins/graph/dist/components/index.js.map`
- Modify (generated): `.quartz/plugins/graph/dist/index.js` and maps if touched by build

- [ ] **Step 1: Build plugin dist from source**

Run: `npm run build`
Working dir: `.quartz/plugins/graph`
Expected: tsup rebuilds the inline script into `dist/components/index.js`

- [ ] **Step 2: Verify generated bundle contains the new layout path**

Run a search for helper/function signatures or unique heart-layout strings in the generated dist.
Expected: no old isolate-only pinning block remains as the primary shaping logic.

### Task 6: Verify correctness honestly

**Files:**
- Modify: none (verification only)

- [ ] **Step 1: Run diagnostics**

Run: `lsp_diagnostics` on `.quartz/plugins/graph/src/components/scripts/graph.inline.ts`
Run: `lsp_diagnostics` on `.quartz/plugins/graph/src/components/scripts/heartLayout.ts`
Expected: no errors

- [ ] **Step 2: Run focused tests if Vitest is installed**

Run: `npm exec -- vitest run heartLayout.test.ts graph.test.ts`
Expected: PASS

If Vitest is unavailable in this environment, report that explicitly and do not claim test success.

- [ ] **Step 3: Rebuild the Quartz site**

Run from repo root: `npx quartz build`
Expected: successful site build using the rebuilt plugin dist

- [ ] **Step 4: Manual visual verification checklist**

Confirm after opening the global graph:
- the whole graph reads as a heart shape, not just the border
- linked nodes stay inside the silhouette
- no large blob spills outside the heart boundary
- labels no longer overpower the visualization
- hover still reveals neighborhoods clearly

## Notes for implementers

- Do not hand-edit the minified dist bundle first. Fix source, then rebuild.
- Do not pin visible nodes with `fx` / `fy` unless a deliberate exception is absolutely necessary.
- Keep helper math pure and deterministic so it can be tested without DOM/D3.
- Prefer a small custom force over adding a dependency.
- Global graph only: local graph behavior should remain unchanged.
