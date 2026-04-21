export type HeartLayoutNode = { id: string }
export type HeartLayoutLink = { source: string | { id: string }; target: string | { id: string } }
export type HeartBand = "core" | "mid" | "outer"
export type HeartTarget = { x: number; y: number; band: HeartBand }

type ComponentInfo = {
  id: string
  size: number
  members: Set<string>
}

function compareNodeIds(a: string, b: string) {
  return a.localeCompare(b)
}

function normaliseHeartY(y: number, scale: number) {
  return (y / 16) * scale
}

export function heartCurvePoint(angle: number, scale: number) {
  const x = Math.pow(Math.sin(angle), 3) * scale
  const rawY = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle))
  return { x, y: normaliseHeartY(rawY, scale) }
}

function buildComponentData(nodes: HeartLayoutNode[], links: HeartLayoutLink[]) {
  const adjacency = new Map<string, Set<string>>()
  const degreeMap = new Map<string, number>()

  for (const node of nodes) {
    adjacency.set(node.id, new Set())
    degreeMap.set(node.id, 0)
  }

  for (const link of links) {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    adjacency.get(sourceId)?.add(targetId)
    adjacency.get(targetId)?.add(sourceId)
    degreeMap.set(sourceId, (degreeMap.get(sourceId) ?? 0) + 1)
    degreeMap.set(targetId, (degreeMap.get(targetId) ?? 0) + 1)
  }

  const seen = new Set<string>()
  const components: ComponentInfo[] = []
  const componentByNode = new Map<string, ComponentInfo>()

  const sortedNodeIds = nodes.map((node) => node.id).sort(compareNodeIds)
  for (const nodeId of sortedNodeIds) {
    if (seen.has(nodeId)) continue

    const queue = [nodeId]
    const members: string[] = []
    seen.add(nodeId)

    while (queue.length > 0) {
      const current = queue.shift()!
      members.push(current)
      const neighbours = Array.from(adjacency.get(current) ?? []).sort(compareNodeIds)
      for (const neighbour of neighbours) {
        if (!seen.has(neighbour)) {
          seen.add(neighbour)
          queue.push(neighbour)
        }
      }
    }

    const component: ComponentInfo = {
      id: members[0],
      size: members.length,
      members: new Set(members),
    }

    components.push(component)
    for (const member of members) {
      componentByNode.set(member, component)
    }
  }

  components.sort((a, b) => {
    if (b.size !== a.size) return b.size - a.size
    return compareNodeIds(a.id, b.id)
  })

  return { degreeMap, components, componentByNode }
}

function distributeBandTargets(nodeIds: string[], baseScale: number, band: HeartBand, startOffset: number, targetMap: Map<string, HeartTarget>, yOffset: number = 0) {
  if (nodeIds.length === 0) return

  const orderedIds = [...nodeIds].sort(compareNodeIds)
  
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
    
    // Straight line: NO zigzag, NO offsets! Just perfectly smooth curve.
    targetMap.set(nodeId, { x: finalX, y: finalY + yOffset, band });
  }
}

export function isInsideHeart(x: number, y: number, scale: number) {
  if (scale <= 0) return true

  const xn = x / scale
  const yn = -(y / scale) * 0.92
  const value = Math.pow(xn * xn + yn * yn - 1, 3) - xn * xn * yn * yn * yn
  return value <= 0
}

export function createHeartLayoutTargets(nodes: HeartLayoutNode[], links: HeartLayoutLink[], scale: number) {
  const targetMap = new Map<string, HeartTarget>()
  if (nodes.length === 0) return targetMap

  const { degreeMap, componentByNode } = buildComponentData(nodes, links)

  const outerIds: string[] = []
  const innerIds: string[] = []

  for (const node of nodes) {
    const degree = degreeMap.get(node.id) ?? 0
    const componentSize = componentByNode.get(node.id)?.size ?? 1
    if (degree === 0 || componentSize <= 2) {
      outerIds.push(node.id)
    } else {
      innerIds.push(node.id)
    }
  }

  // Use a simpler 2-band approach for a gorgeous double-heart ring effect!
  // Inner nodes form one continuous heart, outer isolated nodes form the boundary.
  // 0.5 offset shifts the nodes perfectly around the sharp tips.
  distributeBandTargets(innerIds, scale * 0.60, "mid", 0.5, targetMap, scale * 0.13)
  distributeBandTargets(outerIds, scale * 0.95, "outer", 0.5, targetMap)

  const sortedIds = nodes.map((node) => node.id).sort(compareNodeIds)
  for (const nodeId of sortedIds) {
    if (!targetMap.has(nodeId)) {
      targetMap.set(nodeId, { x: 0, y: 0, band: "mid" })
    }
  }

  return targetMap
}
