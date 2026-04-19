const fs = require("fs");
const path = "./.quartz/plugins/graph/src/components/scripts/heartLayout.ts";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  /function distributeBandTargets\([\s\S]*?\}\n\n/m,
  `function distributeBandTargets(nodeIds: string[], scale: number, band: HeartBand, startOffset: number, targetMap: Map<string, HeartTarget>) {
  if (nodeIds.length === 0) return

  const orderedIds = [...nodeIds].sort(compareNodeIds)
  
  for (let index = 0; index < orderedIds.length; index++) {
    // Distribute angles evenly around the 360 circle
    const angle = ((index + startOffset) / orderedIds.length) * Math.PI * 2;
    
    // Add a tiny bit of random jitter so it doesn't look completely artificial
    // Jitter scale slightly (+/- 4%) and angle slightly
    const scaleJitter = scale * (1 + (Math.random() * 0.08 - 0.04));
    
    const point = heartCurvePoint(angle, scaleJitter);
    targetMap.set(orderedIds[index], { x: point.x, y: point.y, band });
  }
}

`
);

fs.writeFileSync(path, content);
console.log("Restored heartLayout to single organic band with jitter");
