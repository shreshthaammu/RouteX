export type Position = {
  row: number;
  col: number;
};

export type CellWeight = 1 | 2 | 5 | 10;

export type CellType =
  | 'empty'
  | 'start'
  | 'destination'
  | 'obstacle';

export interface GridCellData {
  row: number;
  col: number;
  isObstacle: boolean;
  isStart: boolean;
  isDestination: boolean;
  weight: CellWeight;
}

export type AlgorithmType = 'bfs' | 'dijkstra' | 'astar';

export type StepActionType =
  | 'init'
  | 'frontier_add'
  | 'current_pop'
  | 'relax_neighbor'
  | 'reached_dest'
  | 'no_path';

export interface SearchStep {
  currentNode: Position | null;
  evaluatingNeighbor?: Position | null;
  frontier: string[]; // Set of "row,col"
  explored: string[]; // Set of "row,col"
  action: StepActionType;
  logMessage: string;
  timestampMs?: number;
}

export interface AlgorithmMetrics {
  nodesExploredCount: number;
  pathLength: number;
  totalCost: number;
  executionTimeMs: number;
  searchEfficiency: number; // percentage: (pathLength / nodesExploredCount) * 100
  reachedDestination: boolean;
  relaxationsCount: number;
}

export interface AlgorithmResult {
  algorithm: AlgorithmType;
  path: Position[];
  exploredOrder: Position[];
  metrics: AlgorithmMetrics;
  steps: SearchStep[];
  gScores: Record<string, number>;
  hScores: Record<string, number>;
  fScores: Record<string, number>;
  parents: Record<string, Position | null>;
  eventLogs: string[];
}

export type VehicleStatus =
  | 'idle'
  | 'searching'
  | 'navigating'
  | 'paused'
  | 'reached'
  | 'blocked_replanning';

export interface VehicleTelemetry {
  currentPosition: Position;
  heading: number; // in degrees
  pathIndex: number;
  status: VehicleStatus;
  accumulatedCost: number;
  distanceTraveled: number;
  remainingHops: number;
  replanCount: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  gridSize: number;
  start: Position;
  destination: Position;
  obstacles: Position[];
  weightedCells: { pos: Position; weight: CellWeight }[];
  tag: string;
}

// Road Graph Mode types
export interface GraphNode {
  id: string;
  label: string;
  x: number; // canvas percentage 0-100
  y: number; // canvas percentage 0-100
  type?: 'start' | 'destination' | 'normal';
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
  blocked?: boolean;
}

export interface GraphScenario {
  id: string;
  name: string;
  description: string;
  startNodeId: string;
  destNodeId: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}
