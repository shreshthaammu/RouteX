import { AlgorithmResult, GridCellData, Position, SearchStep } from '../types';
import { calculatePathCost, getNeighbors, posToKey, reconstructPath } from './common';

/**
 * Breadth-First Search (BFS) Algorithm
 * 
 * Explores graph level-by-level using a FIFO Queue.
 * Guarantees minimum-hop path on unweighted graphs.
 * NOTE: Ignores road weights; does not minimize weighted transit cost.
 */
export function runBFS(
  grid: GridCellData[][],
  start: Position,
  destination: Position
): AlgorithmResult {
  const startTime = performance.now();
  const startKey = posToKey(start);
  const destKey = posToKey(destination);

  // Data Structures
  const queue: Position[] = [start];
  const visited = new Set<string>([startKey]);
  const parents: Record<string, Position | null> = { [startKey]: null };
  const hopDistances: Record<string, number> = { [startKey]: 0 };

  const exploredOrder: Position[] = [];
  const steps: SearchStep[] = [];
  const eventLogs: string[] = [];

  // Log start
  eventLogs.push(`[BFS:00] Initialized FIFO Queue. Pushed start node (${start.row}, ${start.col}).`);
  
  steps.push({
    currentNode: start,
    frontier: [startKey],
    explored: [],
    action: 'init',
    logMessage: `BFS initialized at start (${start.row}, ${start.col}). Level 0.`,
  });

  let reachedDestination = false;
  let relaxationsCount = 0;

  // Search Loop
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = posToKey(current);
    exploredOrder.push(current);

    steps.push({
      currentNode: current,
      frontier: queue.map(posToKey),
      explored: [...exploredOrder.map(posToKey)],
      action: 'current_pop',
      logMessage: `Dequeued node (${current.row}, ${current.col}) at hop distance ${hopDistances[currentKey]}.`,
    });

    // Check if goal reached
    if (currentKey === destKey) {
      reachedDestination = true;
      eventLogs.push(`[BFS:Goal] Destination (${destination.row}, ${destination.col}) reached!`);
      steps.push({
        currentNode: current,
        frontier: queue.map(posToKey),
        explored: [...exploredOrder.map(posToKey)],
        action: 'reached_dest',
        logMessage: `Target reached! Reconstructing minimum-hop path.`,
      });
      break;
    }

    // Explore neighbors
    const neighbors = getNeighbors(current, grid);
    for (const neighbor of neighbors) {
      const neighborKey = posToKey(neighbor);

      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        parents[neighborKey] = current;
        hopDistances[neighborKey] = (hopDistances[currentKey] || 0) + 1;
        queue.push(neighbor);
        relaxationsCount++;

        eventLogs.push(
          `[BFS:Explore] Discovered (${neighbor.row}, ${neighbor.col}) via (${current.row}, ${current.col}), Hop: ${hopDistances[neighborKey]}`
        );

        steps.push({
          currentNode: current,
          evaluatingNeighbor: neighbor,
          frontier: queue.map(posToKey),
          explored: [...exploredOrder.map(posToKey)],
          action: 'frontier_add',
          logMessage: `Enqueued unvisited neighbor (${neighbor.row}, ${neighbor.col}) at hop ${hopDistances[neighborKey]}.`,
        });

        // Early exit if neighbor is destination
        if (neighborKey === destKey) {
          reachedDestination = true;
          exploredOrder.push(neighbor);
          eventLogs.push(`[BFS:Goal] Destination discovered in frontier!`);
          break;
        }
      }
    }

    if (reachedDestination) break;
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
    eventLogs.push(`[BFS:Terminated] Queue exhausted. No path found to (${destination.row}, ${destination.col}).`);
    steps.push({
      currentNode: null,
      frontier: [],
      explored: [...exploredOrder.map(posToKey)],
      action: 'no_path',
      logMessage: `Queue empty. Destination unreachable.`,
    });
  }

  return {
    algorithm: 'bfs',
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
    gScores: hopDistances, // For BFS, g-score is hop count
    hScores: {},
    fScores: hopDistances,
    parents,
    eventLogs,
  };
}
