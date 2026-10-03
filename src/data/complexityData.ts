export interface AlgorithmComplexityInfo {
  name: string;
  fullName: string;
  timeComplexity: string;
  spaceComplexity: string;
  heuristicUsed: boolean;
  weightsConsidered: boolean;
  dataStructures: string[];
  description: string;
  behaviorSummary: string;
  daKeyConcept: string;
}

export const ALGORITHM_COMPLEXITY: Record<'bfs' | 'dijkstra' | 'astar', AlgorithmComplexityInfo> = {
  bfs: {
    name: 'BFS',
    fullName: 'Breadth-First Search',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    heuristicUsed: false,
    weightsConsidered: false,
    dataStructures: ['FIFO Queue (std::queue / Array)', 'Visited Set (Hash Map)', 'Parent Map'],
    description: 'Finds minimum-hop paths on unweighted graphs by expanding radially outward level-by-level.',
    behaviorSummary: 'Spreads uniformly across all coordinate directions. Because it ignores road weights, it treats a slow congested highway identically to an open clear street.',
    daKeyConcept: 'Unweighted Shortest Path, Level-order Traversal, First-In-First-Out Queue',
  },
  dijkstra: {
    name: 'Dijkstra',
    fullName: "Dijkstra's Shortest Path",
    timeComplexity: 'O((V + E) log V) with Binary Min-Heap',
    spaceComplexity: 'O(V)',
    heuristicUsed: false,
    weightsConsidered: true,
    dataStructures: ['Binary Min-Heap / Priority Queue', 'Distance Map (g-scores)', 'Parent Map', 'Visited Set'],
    description: 'Finds guaranteed global minimum-cost paths in graphs with non-negative edge costs.',
    behaviorSummary: 'Expands nodes in strict order of accumulated cost from the start. Concentric equal-cost wavefronts form around the origin, bypassing heavy traffic.',
    daKeyConcept: 'Greedy Choice Property, Edge Relaxation, Min-Heap Priority Queue',
  },
  astar: {
    name: 'A*',
    fullName: 'A-Star (A*) Intelligent Search',
    timeComplexity: 'O(E) best-case up to O((V + E) log V) depending on heuristic accuracy',
    spaceComplexity: 'O(V)',
    heuristicUsed: true,
    weightsConsidered: true,
    dataStructures: ['Binary Min-Heap (Open Set)', 'Closed Set (Hash Set)', 'g-score & f-score Maps', 'Parent Map'],
    description: 'Combines actual accumulated cost g(n) with admissible heuristic estimate h(n) to prioritize nodes facing the destination.',
    behaviorSummary: 'Heuristic-guided beam directed towards the destination. Explores significantly fewer nodes than Dijkstra while maintaining mathematical optimality.',
    daKeyConcept: 'Heuristic Search, Admissibility & Consistency (Triangle Inequality), f(n) = g(n) + h(n)',
  },
};
