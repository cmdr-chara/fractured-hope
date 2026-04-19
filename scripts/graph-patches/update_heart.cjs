const fs = require("fs");
const path = "./.quartz/plugins/graph/src/components/scripts/heartLayout.ts";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  /function distributeBandTargets\([\s\S]*?\}\n\n/m,
  `function distributeBandTargets(nodeIds: string[], baseScale: number, band: HeartBand, startOffset: number, targetMap: Map<string, HeartTarget>) {
  if (nodeIds.length === 0) return

  const orderedIds = [...nodeIds].sort(compareNodeIds)
  
  // Dynamically calculate how many sub-bands we need to prevent overcrowding.
  // Assuming a rough circumference where we don't want nodes closer than a certain angle.
  // 60 nodes per band is a safe threshold for a beautiful shape without looking cluttered.
  const nodesPerBand = 60; 
  const numBands = Math.ceil(orderedIds.length / nodesPerBand);
  
  for (let index = 0; index < orderedIds.length; index++) {
    // Distribute nodes across sub-bands
    const subBandIndex = index % numBands;
    // Shrink scale for inner sub-bands slightly (e.g., 0.95 -> 0.90 -> 0.85)
    const scale = baseScale * (1 - (subBandIndex * 0.08)); 
    
    const nodesInThisBand = Math.ceil((orderedIds.length - subBandIndex) / numBands);
    const bandPos = Math.floor(index / numBands);
    
    // Offset each sub-band slightly differently so they interleave beautifully
    const angleOffset = startOffset + (subBandIndex * 0.25);
    const angle = ((bandPos + angleOffset) / nodesInThisBand) * Math.PI * 2;
    
    const point = heartCurvePoint(angle, scale)
    targetMap.set(orderedIds[index], { x: point.x, y: point.y, band })
  }
}

`
);

fs.writeFileSync(path, content);
console.log("Updated heartLayout.ts");
