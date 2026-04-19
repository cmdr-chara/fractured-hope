const fs = require("fs");
const path = "./.quartz/plugins/graph/src/components/scripts/heartLayout.ts";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  /function distributeBandTargets\([\s\S]*?\}\n\n/m,
  `function distributeBandTargets(nodeIds: string[], baseScale: number, band: HeartBand, startOffset: number, targetMap: Map<string, HeartTarget>) {
  if (nodeIds.length === 0) return

  const orderedIds = [...nodeIds].sort(compareNodeIds)
  
  // A golden ratio approach for perfect, even distribution without unnatural stacking!
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const goldenAngle = Math.PI * 2 * (1 - 1 / goldenRatio);
  
  // Calculate how many concentric layers we need to prevent overcrowding
  const layerDensity = 60; // Max nodes per single heart line
  const numLayers = Math.max(1, Math.ceil(orderedIds.length / layerDensity));
  
  for (let i = 0; i < orderedIds.length; i++) {
    // Determine which layer this node belongs to
    const layer = Math.floor(i / layerDensity);
    
    // Nodes inside this specific layer
    const nodesInThisLayer = Math.min(layerDensity, orderedIds.length - layer * layerDensity);
    const indexInLayer = i % layerDensity;
    
    // Offset each layer so they don't form straight lines
    const angleOffset = startOffset + (layer * 0.5);
    
    // Distribute angles evenly around the 360 circle
    const angle = ((indexInLayer + angleOffset) / nodesInThisLayer) * Math.PI * 2;
    
    // Scale down inner layers
    const scale = baseScale * (1 - (layer * 0.12));
    
    const point = heartCurvePoint(angle, scale);
    targetMap.set(orderedIds[i], { x: point.x, y: point.y, band });
  }
}

`
);

fs.writeFileSync(path, content);
console.log("Fixed heartLayout golden distribution");
