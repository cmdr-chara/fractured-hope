const fs = require("fs");
const path = "./.quartz/plugins/graph/src/components/scripts/heartLayout.ts";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  /function distributeBandTargets\([\s\S]*?\}\n\n/m,
  `function distributeBandTargets(nodeIds: string[], baseScale: number, band: HeartBand, startOffset: number, targetMap: Map<string, HeartTarget>) {
  if (nodeIds.length === 0) return

  const orderedIds = [...nodeIds].sort(compareNodeIds)
  
  // Calculate how many concentric layers we need to prevent overcrowding
  // 50 nodes per layer is a good density for a clean shape
  const layers = Math.max(1, Math.ceil(orderedIds.length / 50));
  
  for (let i = 0; i < orderedIds.length; i++) {
    // Assign each node to a layer (0, 1, 2...)
    const layer = i % layers;
    
    // Calculate total nodes in this specific layer
    const nodesInLayer = Math.floor(orderedIds.length / layers) + (layer < orderedIds.length % layers ? 1 : 0);
    
    // What is this node's index WITHIN its layer?
    const indexInLayer = Math.floor(i / layers);
    
    // Offset each layer slightly so nodes interleave beautifully instead of lining up radially
    const layerOffset = startOffset + (layer * 0.35);
    
    // Spread angle cleanly across 2 PI
    const angle = ((indexInLayer + layerOffset) / nodesInLayer) * Math.PI * 2;
    
    // Shrink scale for inner layers (distance between layers is 8% of base scale)
    const scale = baseScale * (1 - (layer * 0.08));
    
    const point = heartCurvePoint(angle, scale);
    targetMap.set(orderedIds[i], { x: point.x, y: point.y, band });
  }
}

`
);

fs.writeFileSync(path, content);
console.log("Fixed heartLayout bands");
