import { GraphEdge, GraphNode } from '../types';
import { PriorityQueue } from './PriorityQueue';

export interface GraphAlgorithmResult {
  algorithm: 'bfs' | 'dijkstra' | 'astar';
  path: string[]; // array of node IDs
  exploredNodes: string[];
  totalCost: number;
  hopCount: number;
  executionTimeMs: number;
  eventLogs: string[];
  parents: Record<string, string | null>;
  distances: Record<string, number>;
}

export function runGraphAlgorithm(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startId: string,
  destId: string,
  algorithm: 'bfs' | 'dijkstra' | 'astar'
): GraphAlgorithmResult {
  const startTime = performance.now();
  const nodeMap = new Map<string, GraphNode>(nodes.map((n) => [n.id, n]));
  const adj = new Map<string, { to: string; weight: number }[]>();

  for (const n of nodes) {
    adj.set(n.id, []);
  }

  for (const edge of edges) {
    if (edge.blocked) continue;
    adj.get(edge.from)?.push({ to: edge.to, weight: edge.weight });
    adj.get(edge.to)?.push({ to: edge.from, weight: edge.weight }); // undirected roads
  }

  const exploredNodes: string[] = [];
  const parents: Record<string, string | null> = { [startId]: null };
  const distances: Record<string, number> = { [startId]: 0 };
  const eventLogs: string[] = [];
  let reached = false;

  const destNode = nodeMap.get(destId);
  const heuristic = (nodeId: string): number => {
    if (algorithm !== 'astar' || !destNode) return 0;
    const n = nodeMap.get(nodeId);
    if (!n) return 0;
    // Euclidean distance in layout percentage
    const dx = n.x - destNode.x;
    const dy = n.y - destNode.y;
    return Math.round(Math.hypot(dx, dy) / 4); // scale down to be admissible
  };

  if (algorithm === 'bfs') {
    const queue: string[] = [startId];
    const visited = new Set<string>([startId]);
    eventLogs.push(`[Graph BFS] Enqueued start junction ${startId}`);

    while (queue.length > 0) {
      const u = queue.shift()!;
      exploredNodes.push(u);

      if (u === destId) {
        reached = true;
        eventLogs.push(`[Graph BFS] Destination reached at ${u}`);
        break;
      }

      for (const edge of adj.get(u) || []) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          parents[edge.to] = u;
          distances[edge.to] = (distances[u] || 0) + 1; // hop count
          queue.push(edge.to);
          eventLogs.push(`[Graph BFS] Visited ${edge.to} from ${u}`);
        }
      }
    }
  } else {
    // Dijkstra or A*
    const pq = new PriorityQueue<string>();
    const visited = new Set<string>();
    const startH = heuristic(startId);
    pq.enqueue(startId, startH);
    eventLogs.push(`[Graph ${algorithm.toUpperCase()}] Initialized Priority Queue at ${startId}`);

    while (!pq.isEmpty()) {
      const item = pq.dequeue()!;
      const u = item.element;

      if (visited.has(u)) continue;
      visited.add(u);
      exploredNodes.push(u);

      if (u === destId) {
        reached = true;
        eventLogs.push(`[Graph ${algorithm.toUpperCase()}] Destination ${destId} reached with cost ${distances[u]}`);
        break;
      }

      const currentG = distances[u] || 0;
      for (const edge of adj.get(u) || []) {
        if (visited.has(edge.to)) continue;

        const tentativeG = currentG + edge.weight;
        const oldG = distances[edge.to] !== undefined ? distances[edge.to] : Infinity;

        if (tentativeG < oldG) {
          distances[edge.to] = tentativeG;
          parents[edge.to] = u;
          const priority = tentativeG + heuristic(edge.to);
          pq.enqueue(edge.to, priority);
          eventLogs.push(
            `[Graph ${algorithm.toUpperCase()}] Edge (${u} -> ${edge.to}) cost: ${tentativeG} (weight ${edge.weight})`
          );
        }
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  if (reached) {
    let curr: string | null = destId;
    while (curr) {
      path.push(curr);
      if (curr === startId) break;
      curr = parents[curr] ?? null;
    }
    path.reverse();
  }

  // Calculate actual weighted cost of the reconstructed path
  let totalCost = 0;
  if (path.length > 1) {
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      const edge = (adj.get(u) || []).find((e) => e.to === v);
      totalCost += edge ? edge.weight : 1;
    }
  }

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(3));

  return {
    algorithm,
    path,
    exploredNodes,
    totalCost,
    hopCount: Math.max(0, path.length - 1),
    executionTimeMs,
    eventLogs,
    parents,
    distances,
  };
}
