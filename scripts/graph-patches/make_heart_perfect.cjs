const fs = require("fs");
const path = "./.quartz/plugins/graph/src/components/scripts/heartLayout.ts";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  /function distributeBandTargets\([\s\S]*?\}\n\n/m,
  `function distributeBandTargets(nodeIds: string[], baseScale: number, band: HeartBand, startOffset: number, targetMap: Map<string, HeartTarget>) {
  if (nodeIds.length === 0) return

  const orderedIds = [...nodeIds].sort(compareNodeIds)
  
  // Stable random function so nodes don't jump around on page load!
  function pseudoRandom(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    }
    return (Math.abs(hash) % 10000) / 10000;
  }
  
  for (let index = 0; index < orderedIds.length; index++) {
    const nodeId = orderedIds[index];
    const pRand1 = pseudoRandom(nodeId + "1");
    const pRand2 = pseudoRandom(nodeId + "2");
    
    // Distribute angles evenly around the 360 circle
    const angle = ((index + startOffset) / orderedIds.length) * Math.PI * 2;
    
    // Create a precise "thick band" effect (a cloud) instead of a single thin line or multiple rigid lines
    const thickness = band === "outer" ? 0.08 : 0.15; // 8% thickness for outer, 15% thickness for inner
    
    // Scale randomly between [baseScale - thickness] and [baseScale]
    const scale = baseScale * (1 - (pRand1 * thickness));
    
    // Slight angle jitter to make the cloud look natural and break any grid patterns
    const angleJitter = angle + (pRand2 - 0.5) * (Math.PI * 4 / orderedIds.length);
    
    const point = heartCurvePoint(angleJitter, scale);
    targetMap.set(nodeId, { x: point.x, y: point.y, band });
  }
}

`
);

fs.writeFileSync(path, content);
console.log("Updated heartLayout.ts with thick cloud bands");
