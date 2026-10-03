import { GridCellData, Position } from '../types';

export function posToKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

export function keyToPos(key: string): Position {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}

export function arePositionsEqual(a: Position | null, b: Position | null): boolean {
  if (!a || !b) return false;
  return a.row === b.row && a.col === b.col;
}

/**
 * 4-directional cardinal neighbors: Up, Right, Down, Left
 */
export function getNeighbors(pos: Position, grid: GridCellData[][]): Position[] {
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [
    { row: -1, col: 0 }, // Up
    { row: 0, col: 1 },  // Right
    { row: 1, col: 0 },  // Down
    { row: 0, col: -1 }, // Left
  ];

  const neighbors: Position[] = [];

  for (const dir of directions) {
    const nextRow = pos.row + dir.row;
    const nextCol = pos.col + dir.col;

    // Check bounds
    if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
      // Check if traversable (not an obstacle)
      if (!grid[nextRow][nextCol].isObstacle) {
        neighbors.push({ row: nextRow, col: nextCol });
      }
    }
  }

  return neighbors;
}

/**
 * Backtrack from destination to start using the parent map
 */
export function reconstructPath(
  parents: Record<string, Position | null>,
  destination: Position,
  start: Position
): Position[] {
  const path: Position[] = [];
  let currentKey = posToKey(destination);
  const startKey = posToKey(start);

  if (!parents[currentKey] && currentKey !== startKey) {
    return []; // No path found
  }

  while (currentKey) {
    path.push(keyToPos(currentKey));
    if (currentKey === startKey) {
      break;
    }
    const parent = parents[currentKey];
    if (!parent) break;
    currentKey = posToKey(parent);
  }

  return path.reverse();
}

/**
 * Calculate total path cost based on grid cell weights
 */
export function calculatePathCost(path: Position[], grid: GridCellData[][]): number {
  if (path.length <= 1) return 0;
  let totalCost = 0;
  // Starting node incurs 0 cost; cost accumulates on entering each subsequent cell
  for (let i = 1; i < path.length; i++) {
    const node = path[i];
    totalCost += grid[node.row][node.col].weight;
  }
  return totalCost;
}

/**
 * Standard Manhattan Distance Heuristic:
 * h(n) = |row1 - row2| + |col1 - col2|
 * Admissible and consistent since min cell weight is 1.
 */
export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}
