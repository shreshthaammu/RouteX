import { AlgorithmResult, GridCellData, Position, SearchStep } from '../types';
import { calculatePathCost, getNeighbors, posToKey, reconstructPath } from './common';
import { PriorityQueue } from './PriorityQueue';

/**
 * Dijkstra's Shortest Path Algorithm
 * 
 * Uses a Binary Min-Heap Priority Queue to expand cheapest unexplored nodes first.
 * Respects non-negative edge/cell weights. Guarantees global minimum-cost path.
 */
export function runDijkstra(
  grid: GridCellData[][],
  start: Position,
  destination: Position
): AlgorithmResult {
  const startTime = performance.now();
  const startKey = posToKey(start);
  const destKey = posToKey(destination);

  // Initialize Priority Queue and distance records
  const pq = new PriorityQueue<Position>();
  const distances: Record<string, number> = { [startKey]: 0 };
  const parents: Record<string, Position | null> = { [startKey]: null };
  const visited = new Set<string>();

  const exploredOrder: Position[] = [];
  const steps: SearchStep[] = [];
  const eventLogs: string[] = [];
  let relaxationsCount = 0;
  let reachedDestination = false;

  // Enqueue start node with cost 0
  pq.enqueue(start, 0);
  eventLogs.push(`[Dijkstra:00] Initialized Min-Heap. Enqueued start (${start.row}, ${start.col}) with cost 0.`);

  steps.push({
    currentNode: start,
    frontier: [startKey],
    explored: [],
    action: 'init',
    logMessage: `Dijkstra initialized at start (${start.row}, ${start.col}) with initial cost 0.`,
  });

  while (!pq.isEmpty()) {
    const item = pq.dequeue()!;
    const current = item.element;
    const currentKey = posToKey(current);
    const currentDist = item.priority;

    // Skip stale heap entries if already finalized with lower cost
    if (visited.has(currentKey)) {
      continue;
    }

    // Mark finalized / explored
    visited.add(currentKey);
    exploredOrder.push(current);

    steps.push({
      currentNode: current,
      frontier: pq.toArray().map((pqItem) => posToKey(pqItem.element)),
      explored: [...exploredOrder.map(posToKey)],
      action: 'current_pop',
      logMessage: `Extracted min-cost node (${current.row}, ${current.col}) from Priority Queue (accumulated cost: ${currentDist}).`,
    });

    // Check if destination is reached
    if (currentKey === destKey) {
      reachedDestination = true;
      eventLogs.push(`[Dijkstra:Goal] Optimal destination (${destination.row}, ${destination.col}) reached with cost ${currentDist}!`);
      steps.push({
        currentNode: current,
        frontier: pq.toArray().map((pqItem) => posToKey(pqItem.element)),
        explored: [...exploredOrder.map(posToKey)],
        action: 'reached_dest',
        logMessage: `Target reached! Optimal path cost finalized at ${currentDist}.`,
      });
      break;
    }

    // Relax neighboring edges
    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      const neighborKey = posToKey(neighbor);

      if (visited.has(neighborKey)) {
        continue;
      }

      // Edge weight = cell weight of neighbor
      const edgeWeight = grid[neighbor.row][neighbor.col].weight;
      const tentativeDist = currentDist + edgeWeight;
      const existingDist = distances[neighborKey] !== undefined ? distances[neighborKey] : Infinity;

      if (tentativeDist < existingDist) {
        // Relaxation succeeded
        distances[neighborKey] = tentativeDist;
        parents[neighborKey] = current;
        pq.enqueue(neighbor, tentativeDist);
        relaxationsCount++;

        eventLogs.push(
          `[Dijkstra:Relax] Relaxed edge to (${neighbor.row}, ${neighbor.col}) via (${current.row}, ${current.col}). Cost: ${existingDist === Infinity ? '∞' : existingDist} -> ${tentativeDist} (cell weight: ${edgeWeight})`
        );

        steps.push({
          currentNode: current,
          evaluatingNeighbor: neighbor,
          frontier: pq.toArray().map((pqItem) => posToKey(pqItem.element)),
          explored: [...exploredOrder.map(posToKey)],
          action: 'relax_neighbor',
          logMessage: `Relaxed neighbor (${neighbor.row}, ${neighbor.col}): updated tentative cost to ${tentativeDist}.`,
        });
      }
    }
  }

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(3));

  // Reconstruct path
  const path = reachedDestination ? reconstructPath(parents, destination, start) : [];
  const totalCost = calculatePathCost(path, grid);
  const pathLength = path.length;
  const nodesExploredCount = exploredOrder.length;
  const searchEfficiency = nodesExploredCount > 0 
    ? parseFloat(((pathLength / nodesExploredCount) * 100).toFixed(1)) 
    : 0;

  if (!reachedDestination) {
    eventLogs.push(`[Dijkstra:Terminated] Priority queue empty. Destination unreachable.`);
    steps.push({
      currentNode: null,
      frontier: [],
      explored: [...exploredOrder.map(posToKey)],
      action: 'no_path',
      logMessage: `Search exhausted without reaching destination.`,
    });
  }

  return {
    algorithm: 'dijkstra',
    path,
    exploredOrder,
    metrics: {
      nodesExploredCount,
      pathLength,
      totalCost,
      executionTimeMs,
      searchEfficiency,
      reachedDestination,
      relaxationsCount,
    },
    steps,
    gScores: distances,
    hScores: {},
    fScores: distances, // Dijkstra has h=0, so f = g
    parents,
    eventLogs,
  };
}
