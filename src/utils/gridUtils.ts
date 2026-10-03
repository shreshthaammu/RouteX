import { CellWeight, GridCellData, Position, Scenario } from '../types';

export function createEmptyGrid(
  rows: number,
  cols: number,
  start: Position = { row: 1, col: 1 },
  destination: Position = { row: rows - 2, col: cols - 2 }
): GridCellData[][] {
  const grid: GridCellData[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: GridCellData[] = [];
    for (let c = 0; c < cols; c++) {
      const isStart = r === start.row && c === start.col;
      const isDestination = r === destination.row && c === destination.col;
      row.push({
        row: r,
        col: c,
        isObstacle: false,
        isStart,
        isDestination,
        weight: 1,
      });
    }
    grid.push(row);
  }

  return grid;
}

export function cloneGrid(grid: GridCellData[][]): GridCellData[][] {
  return grid.map((row) =>
    row.map((cell) => ({
      ...cell,
    }))
  );
}

/**
 * Linear Congruential Generator (LCG) for deterministic reproducible maps
 */
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }
  public next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

export interface RandomEnvConfig {
  size: number;
  obstacleDensity: number; // e.g. 0.1, 0.2, 0.3, 0.4
  costVariation: 'low' | 'medium' | 'high';
  seed?: number;
}

export function generateRandomEnvironment(config: RandomEnvConfig): {
  grid: GridCellData[][];
  start: Position;
  destination: Position;
} {
  const { size, obstacleDensity, costVariation, seed = Math.floor(Math.random() * 100000) } = config;
  const rng = new SeededRandom(seed);

  const start: Position = { row: 1, col: 1 };
  const destination: Position = { row: size - 2, col: size - 2 };

  const grid: GridCellData[][] = [];

  for (let r = 0; r < size; r++) {
    const row: GridCellData[] = [];
    for (let c = 0; c < size; c++) {
      const isStart = r === start.row && c === start.col;
      const isDest = r === destination.row && c === destination.col;

      let isObstacle = false;
      let weight: CellWeight = 1;

      if (!isStart && !isDest) {
        // Obstacle generation
        if (rng.next() < obstacleDensity) {
          isObstacle = true;
        } else {
          // Weight assignment based on variation
          const roll = rng.next();
          if (costVariation === 'low') {
            if (roll < 0.15) weight = 2;
          } else if (costVariation === 'medium') {
            if (roll < 0.2) weight = 2;
            else if (roll < 0.3) weight = 5;
          } else {
            // high
            if (roll < 0.2) weight = 2;
            else if (roll < 0.35) weight = 5;
            else if (roll < 0.45) weight = 10;
          }
        }
      }

      row.push({
        row: r,
        col: c,
        isObstacle,
        isStart,
        isDestination: isDest,
        weight,
      });
    }
    grid.push(row);
  }

  // Ensure immediate neighbors of start and destination are clear
  ensureTraversableSurrounding(grid, start);
  ensureTraversableSurrounding(grid, destination);

  return { grid, start, destination };
}

function ensureTraversableSurrounding(grid: GridCellData[][], pos: Position) {
  const directions = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
  ];
  for (const d of directions) {
    const nr = pos.row + d.r;
    const nc = pos.col + d.c;
    if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
      grid[nr][nc].isObstacle = false;
    }
  }
}

export function loadPresetScenario(scenario: Scenario): {
  grid: GridCellData[][];
  start: Position;
  destination: Position;
} {
  const size = scenario.gridSize;
  const grid = createEmptyGrid(size, size, scenario.start, scenario.destination);

  // Set obstacles
  for (const obs of scenario.obstacles) {
    if (
      obs.row >= 0 &&
      obs.row < size &&
      obs.col >= 0 &&
      obs.col < size &&
      !(obs.row === scenario.start.row && obs.col === scenario.start.col) &&
      !(obs.row === scenario.destination.row && obs.col === scenario.destination.col)
    ) {
      grid[obs.row][obs.col].isObstacle = true;
    }
  }

  // Set weights
  for (const w of scenario.weightedCells) {
    if (
      w.pos.row >= 0 &&
      w.pos.row < size &&
      w.pos.col >= 0 &&
      w.pos.col < size &&
      !grid[w.pos.row][w.pos.col].isObstacle
    ) {
      grid[w.pos.row][w.pos.col].weight = w.weight;
    }
  }

  return {
    grid,
    start: scenario.start,
    destination: scenario.destination,
  };
}
