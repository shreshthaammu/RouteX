import { AlgorithmResult, GridCellData, Position, SearchStep } from '../types';
import { calculatePathCost, getNeighbors, manhattanDistance, posToKey, reconstructPath } from './common';
import { PriorityQueue } from './PriorityQueue';

/**
 * A* Intelligent Path Planning Algorithm
 * 
 * Evaluates nodes by f(n) = g(n) + h(n):
 *  - g(n): exact accumulated road transit cost from start to node n
 *  - h(n): Manhattan distance heuristic (|dr| + |dc|) to destination
 *  - f(n): total estimated cost of path through n
 * 
 * Uses a Binary Min-Heap Priority Queue ordered by f-score.
 */
export function runAStar(
  grid: GridCellData[][],
  start: Position,
  destination: Position
): AlgorithmResult {
  const startTime = performance.now();
  const startKey = posToKey(start);
  const destKey = posToKey(destination);

  // Heuristic at start
  const startH = manhattanDistance(start, destination);

  // Data maps
  const gScore: Record<string, number> = { [startKey]: 0 };
  const hScore: Record<string, number> = { [startKey]: startH };
  const fScore: Record<string, number> = { [startKey]: startH };
  const parents: Record<string, Position | null> = { [startKey]: null };

  const pq = new PriorityQueue<Position>();
  pq.enqueue(start, startH);

  const openSetKeys = new Set<string>([startKey]);
  const closedSet = new Set<string>();

  const exploredOrder: Position[] = [];
  const steps: SearchStep[] = [];
  const eventLogs: string[] = [];
  let relaxationsCount = 0;
  let reachedDestination = false;

  eventLogs.push(
    `[A*:00] Initialized Open Set. Start (${start.row}, ${start.col}) enqueued with g=0, h=${startH}, f=${startH}.`
  );

  steps.push({
    currentNode: start,
    frontier: [startKey],
    explored: [],
    action: 'init',
    logMessage: `A* initialized at (${start.row}, ${start.col}) | g=0, h=${startH} -> f=${startH}`,
  });

  while (!pq.isEmpty()) {
    const item = pq.dequeue()!;
    const current = item.element;
    const currentKey = posToKey(current);

    openSetKeys.delete(currentKey);

    if (closedSet.has(currentKey)) {
      continue;
    }

    closedSet.add(currentKey);
    exploredOrder.push(current);

    const currentG = gScore[currentKey] ?? 0;
    const currentH = hScore[currentKey] ?? manhattanDistance(current, destination);
    const currentF = fScore[currentKey] ?? (currentG + currentH);

    steps.push({
      currentNode: current,
      frontier: Array.from(openSetKeys),
      explored: [...exploredOrder.map(posToKey)],
      action: 'current_pop',
      logMessage: `Expanded node (${current.row}, ${current.col}) [g=${currentG}, h=${currentH}, f=${currentF}]`,
    });

    // Check goal
    if (currentKey === destKey) {
      reachedDestination = true;
      eventLogs.push(
        `[A*:Goal] Destination (${destination.row}, ${destination.col}) reached! Total Path Cost: ${currentG}.`
      );
      steps.push({
        currentNode: current,
        frontier: Array.from(openSetKeys),
        explored: [...exploredOrder.map(posToKey)],
        action: 'reached_dest',
        logMessage: `Target reached! Optimal path finalized with cost ${currentG}.`,
      });
      break;
    }

    // Examine neighbors
    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      const neighborKey = posToKey(neighbor);

      if (closedSet.has(neighborKey)) {
        continue;
      }

      // Edge weight from cell
      const edgeWeight = grid[neighbor.row][neighbor.col].weight;
      const tentativeG = currentG + edgeWeight;
      const existingG = gScore[neighborKey] !== undefined ? gScore[neighborKey] : Infinity;

      if (tentativeG < existingG) {
        // Better path discovered
        parents[neighborKey] = current;
        gScore[neighborKey] = tentativeG;

        const h = manhattanDistance(neighbor, destination);
        const f = tentativeG + h;
        hScore[neighborKey] = h;
        fScore[neighborKey] = f;

        pq.enqueue(neighbor, f);
        openSetKeys.add(neighborKey);
        relaxationsCount++;

        eventLogs.push(
          `[A*:Relax] Node (${neighbor.row}, ${neighbor.col}) updated via (${current.row}, ${current.col}): g=${tentativeG}, h=${h} => f=${f}`
        );

        steps.push({
          currentNode: current,
          evaluatingNeighbor: neighbor,
          frontier: Array.from(openSetKeys),
          explored: [...exploredOrder.map(posToKey)],
          action: 'relax_neighbor',
          logMessage: `Neighbor (${neighbor.row}, ${neighbor.col}) relaxed: g=${tentativeG}, h=${h}, f=${f}`,
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
    eventLogs.push(`[A*:Terminated] Open set exhausted. No traversable path to destination.`);
    steps.push({
      currentNode: null,
      frontier: [],
      explored: [...exploredOrder.map(posToKey)],
      action: 'no_path',
      logMessage: `Open set exhausted without finding a route to destination.`,
    });
  }

  return {
    algorithm: 'astar',
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
    gScores: gScore,
    hScores: hScore,
    fScores: fScore,
    parents,
    eventLogs,
  };
}
