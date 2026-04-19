const fs = require("fs");
const path = "./.quartz/plugins/graph/src/components/scripts/heartLayout.ts";
let content = fs.readFileSync(path, "utf-8");

content = content.replace(
  /function distributeBandTargets\([\s\S]*?\}\n\n/m,
  `function distributeBandTargets(nodeIds: string[], baseScale: number, band: HeartBand, startOffset: number, targetMap: Map<string, HeartTarget>) {
  if (nodeIds.length === 0) return

  const orderedIds = [...nodeIds].sort(compareNodeIds)
  
  // The "straight line" problem was caused by parameterization clustering! 
  // The math equation for the heart moves slower at the top cleft and bottom tip,
  // causing nodes to pile up vertically. 
  // We fix this by calculating the true arc-length of the perimeter and spacing nodes evenly!
  
  const steps = 1000;
  const curvePoints = [];
  let totalLength = 0;
  
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const p = heartCurvePoint(t, baseScale);
    if (i > 0) {
      const prev = curvePoints[i - 1];
      const dist = Math.sqrt(Math.pow(p.x - prev.x, 2) + Math.pow(p.y - prev.y, 2));
      totalLength += dist;
    }
    curvePoints.push({ t, x: p.x, y: p.y, length: totalLength });
  }

  for (let index = 0; index < orderedIds.length; index++) {
    const nodeId = orderedIds[index];
    
    // Calculate perfectly even spacing along the perimeter length
    const fraction = (index + startOffset) / orderedIds.length;
    let targetLength = fraction * totalLength;
    targetLength = targetLength % totalLength;
    if (targetLength < 0) targetLength += totalLength;
    
    let finalX = 0;
    let finalY = 0;
    
    for (let i = 1; i <= steps; i++) {
      if (curvePoints[i].length >= targetLength) {
        const p1 = curvePoints[i - 1];
        const p2 = curvePoints[i];
        const segmentLength = p2.length - p1.length;
        const t_interp = segmentLength === 0 ? 0 : (targetLength - p1.length) / segmentLength;
        
        finalX = p1.x + (p2.x - p1.x) * t_interp;
        finalY = p1.y + (p2.y - p1.y) * t_interp;
        break;
      }
    }
    
    // Subtle alternating offset (zigzag) so nodes don't overlap completely if there are too many
    // It creates a beautiful "braided" border effect.
    const isEven = index % 2 === 0;
    const zigzag = isEven ? 1.015 : 0.985;
    
    targetMap.set(nodeId, { x: finalX * zigzag, y: finalY * zigzag, band });
  }
}

`
);

fs.writeFileSync(path, content);
console.log("Updated heartLayout.ts with perfect arc-length parameterization");
