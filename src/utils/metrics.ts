import { AlgorithmResult, AlgorithmType } from '../types';

export interface ComparisonSummary {
  bfs: AlgorithmResult;
  dijkstra: AlgorithmResult;
  astar: AlgorithmResult;
  optimalCost: number;
  leastExploredAlgo: AlgorithmType;
  fastestAlgo: AlgorithmType;
}

export function generateExplanation(
  algoResult: AlgorithmResult,
  algorithm: AlgorithmType,
  hasWeightedCells: boolean
): {
  howItWorked: string;
  whyThisPath: string;
  keyObservation: string;
} {
  const { metrics } = algoResult;

  if (!metrics.reachedDestination) {
    return {
      howItWorked: `${algorithm.toUpperCase()} initiated search from start but was blocked by impassable obstacles before reaching the destination.`,
      whyThisPath: 'No path was formed because the destination is completely partitioned inside an enclosed barrier.',
      keyObservation: 'Graph search proved conclusively that no connected component connects start to destination.',
    };
  }

  if (algorithm === 'bfs') {
    return {
      howItWorked:
        'Breadth-First Search utilized a First-In-First-Out (FIFO) queue, expanding outwards layer-by-layer uniformly in all coordinate directions.',
      whyThisPath: `BFS discovered the destination at hop level ${metrics.pathLength - 1}. Because BFS does not evaluate road costs, it simply picked the first route with the lowest number of grid steps.`,
      keyObservation: hasWeightedCells
        ? `⚠️ Notice: Total cost is ${metrics.totalCost}. Since BFS ignores road weights, it may have traversed heavy traffic zones because they had the same hop distance!`
        : `On this uniform unweighted grid, BFS successfully achieved an optimal ${metrics.pathLength - 1}-hop route.`,
    };
  }

  if (algorithm === 'dijkstra') {
    return {
      howItWorked:
        'Dijkstra maintained a Binary Min-Heap Priority Queue, continually extracting the node with the lowest accumulated cost g(n) and relaxing adjacent edges.',
      whyThisPath: `Dijkstra selected this specific path with total cost ${metrics.totalCost} because all alternative branches through heavier traffic or longer detours had equal or higher accumulated costs.`,
      keyObservation: `Dijkstra explored ${metrics.nodesExploredCount} nodes symmetrically around the origin until the cost wavefront expanded enough to engulf the destination.`,
    };
  }

  // A*
  return {
    howItWorked:
      'A* evaluated nodes using f(n) = g(n) + h(n), balancing real accumulated road cost g(n) with the admissible Manhattan distance heuristic h(n) = |Δr| + |Δc|.',
    whyThisPath: `A* chose this path (total cost: ${metrics.totalCost}) because every step minimized total estimated journey cost to the destination. Non-promising nodes directed away from the destination were postponed in the priority queue.`,
    keyObservation: `By guiding search towards the goal, A* explored ${metrics.nodesExploredCount} nodes with ${metrics.searchEfficiency}% search efficiency, finding the mathematically optimal route.`,
  };
}
