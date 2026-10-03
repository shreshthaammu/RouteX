import { CellWeight, GraphScenario, Position, Scenario } from '../types';

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'open-city',
    name: 'Scenario 1: Open City',
    description: 'Minimal obstacles, uniform road speeds. Demonstrates baseline search expansion and optimal direct routing.',
    gridSize: 15,
    start: { row: 2, col: 2 },
    destination: { row: 12, col: 12 },
    tag: 'Baseline',
    obstacles: [
      { row: 4, col: 6 },
      { row: 4, col: 7 },
      { row: 5, col: 7 },
      { row: 8, col: 4 },
      { row: 9, col: 4 },
      { row: 9, col: 5 },
      { row: 10, col: 9 },
      { row: 10, col: 10 },
    ],
    weightedCells: [
      { pos: { row: 6, col: 6 }, weight: 2 },
      { pos: { row: 6, col: 7 }, weight: 2 },
      { pos: { row: 7, col: 6 }, weight: 2 },
      { pos: { row: 7, col: 7 }, weight: 2 },
    ],
  },
  {
    id: 'urban-traffic',
    name: 'Scenario 2: Urban Traffic Congestion',
    description: 'Direct route is choked with heavy traffic (cost 5 & 10). Demonstrates BFS taking the high-cost direct path while Dijkstra and A* intelligently detour around congestion.',
    gridSize: 18,
    start: { row: 8, col: 2 },
    destination: { row: 8, col: 15 },
    tag: 'Weighted Detour',
    obstacles: [
      { row: 4, col: 8 },
      { row: 4, col: 9 },
      { row: 12, col: 8 },
      { row: 12, col: 9 },
    ],
    weightedCells: (() => {
      const list: { pos: Position; weight: CellWeight }[] = [];
      // Heavy congestion barrier directly in the middle corridor
      for (let r = 6; r <= 10; r++) {
        for (let c = 6; c <= 11; c++) {
          const isCore = (r === 8 && c >= 7 && c <= 10);
          list.push({
            pos: { row: r, col: c },
            weight: isCore ? 10 : 5,
          });
        }
      }
      return list;
    })(),
  },
  {
    id: 'highway-blockage',
    name: 'Scenario 3: Highway Roadblock & Dynamic Replan',
    description: 'Main arterial expressway has a narrow bypass. Perfect for demonstrating mid-route road blockages and dynamic recalculation.',
    gridSize: 16,
    start: { row: 3, col: 1 },
    destination: { row: 12, col: 14 },
    tag: 'Dynamic Replan',
    obstacles: [
      // Wall with single bottleneck opening
      { row: 1, col: 8 },
      { row: 2, col: 8 },
      { row: 3, col: 8 },
      { row: 4, col: 8 },
      { row: 5, col: 8 },
      { row: 6, col: 8 },
      { row: 7, col: 8 },
      // opening at row 8, col 8
      { row: 9, col: 8 },
      { row: 10, col: 8 },
      { row: 11, col: 8 },
      { row: 12, col: 8 },
      { row: 13, col: 8 },
      { row: 14, col: 8 },
      // Secondary barrier
      { row: 7, col: 11 },
      { row: 8, col: 11 },
      { row: 9, col: 11 },
    ],
    weightedCells: [
      { pos: { row: 7, col: 7 }, weight: 2 },
      { pos: { row: 8, col: 7 }, weight: 5 },
      { pos: { row: 9, col: 7 }, weight: 2 },
    ],
  },
  {
    id: 'city-maze',
    name: 'Scenario 4: Downtown Labyrinth',
    description: 'Complex urban blocks and dead-ends. Highlights A* heuristic directionality vs Dijkstra uniform perimeter expansion.',
    gridSize: 18,
    start: { row: 1, col: 1 },
    destination: { row: 16, col: 16 },
    tag: 'Complex Maze',
    obstacles: [
      // Horizontal barriers
      { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
      { row: 3, col: 6 }, { row: 3, col: 7 }, { row: 3, col: 8 }, { row: 3, col: 9 }, { row: 3, col: 10 },
      { row: 3, col: 11 }, { row: 3, col: 12 }, { row: 3, col: 13 },
      // Opening at (3, 14), (3, 15), (3, 16)
      { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 6, col: 8 },
      { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 },
      { row: 6, col: 14 }, { row: 6, col: 15 }, { row: 6, col: 16 },
      // Opening at (6, 1), (6, 2), (6, 3)
      { row: 9, col: 1 }, { row: 9, col: 2 }, { row: 9, col: 3 }, { row: 9, col: 4 }, { row: 9, col: 5 },
      { row: 9, col: 6 }, { row: 9, col: 7 }, { row: 9, col: 8 }, { row: 9, col: 9 }, { row: 9, col: 10 },
      { row: 9, col: 11 }, { row: 9, col: 12 }, { row: 9, col: 13 },
      // Vertical barrier
      { row: 11, col: 8 }, { row: 12, col: 8 }, { row: 13, col: 8 }, { row: 14, col: 8 },
      { row: 12, col: 12 }, { row: 13, col: 12 }, { row: 14, col: 12 },
    ],
    weightedCells: [
      { pos: { row: 4, col: 14 }, weight: 2 },
      { pos: { row: 7, col: 2 }, weight: 2 },
      { pos: { row: 10, col: 14 }, weight: 5 },
    ],
  },
  {
    id: 'emergency-corridor',
    name: 'Scenario 5: Emergency Transit Grid',
    description: 'Emergency vehicle dispatch with extreme road closures, express lanes, and dynamic construction zones.',
    gridSize: 16,
    start: { row: 1, col: 14 },
    destination: { row: 14, col: 1 },
    tag: 'Emergency',
    obstacles: [
      { row: 5, col: 5 }, { row: 5, col: 6 }, { row: 5, col: 7 }, { row: 5, col: 8 }, { row: 5, col: 9 },
      { row: 10, col: 6 }, { row: 10, col: 7 }, { row: 10, col: 8 }, { row: 10, col: 9 }, { row: 10, col: 10 },
      { row: 7, col: 2 }, { row: 8, col: 2 }, { row: 9, col: 2 },
      { row: 2, col: 10 }, { row: 3, col: 10 }, { row: 4, col: 10 },
    ],
    weightedCells: [
      { pos: { row: 4, col: 4 }, weight: 5 },
      { pos: { row: 6, col: 10 }, weight: 10 },
      { pos: { row: 7, col: 10 }, weight: 10 },
      { pos: { row: 8, col: 10 }, weight: 10 },
      { pos: { row: 9, col: 5 }, weight: 5 },
      { pos: { row: 12, col: 4 }, weight: 2 },
    ],
  },
];

export const ROAD_GRAPH_SCENARIOS: GraphScenario[] = [
  {
    id: 'metro-network',
    name: 'Metropolitan Arterial Network',
    description: 'Graph representation with major highway junctions, ring roads, and city centers.',
    startNodeId: 'A_DEPOT',
    destNodeId: 'Z_HOSPITAL',
    nodes: [
      { id: 'A_DEPOT', label: 'Fleet Depot (Start)', x: 12, y: 20, type: 'start' },
      { id: 'J_NORTH', label: 'North Crossing', x: 38, y: 15, type: 'normal' },
      { id: 'J_RING', label: 'Ring Road Interchange', x: 65, y: 18, type: 'normal' },
      { id: 'J_CENTRAL', label: 'Central Plaza', x: 45, y: 48, type: 'normal' },
      { id: 'J_WEST', label: 'West Industrial Park', x: 18, y: 62, type: 'normal' },
      { id: 'J_EXPRESS', label: 'Toll Expressway Hub', x: 78, y: 52, type: 'normal' },
      { id: 'J_SOUTH', label: 'South Gateway', x: 42, y: 82, type: 'normal' },
      { id: 'Z_HOSPITAL', label: 'Metro Hospital (Dest)', x: 86, y: 82, type: 'destination' },
    ],
    edges: [
      { id: 'e1', from: 'A_DEPOT', to: 'J_NORTH', weight: 4 },
      { id: 'e2', from: 'A_DEPOT', to: 'J_WEST', weight: 6 },
      { id: 'e3', from: 'J_NORTH', to: 'J_RING', weight: 5 },
      { id: 'e4', from: 'J_NORTH', to: 'J_CENTRAL', weight: 3 },
      { id: 'e5', from: 'J_RING', to: 'J_EXPRESS', weight: 3 },
      { id: 'e6', from: 'J_CENTRAL', to: 'J_EXPRESS', weight: 8 }, // heavy congestion
      { id: 'e7', from: 'J_CENTRAL', to: 'J_WEST', weight: 4 },
      { id: 'e8', from: 'J_CENTRAL', to: 'J_SOUTH', weight: 3 },
      { id: 'e9', from: 'J_WEST', to: 'J_SOUTH', weight: 7 },
      { id: 'e10', from: 'J_SOUTH', to: 'Z_HOSPITAL', weight: 5 },
      { id: 'e11', from: 'J_EXPRESS', to: 'Z_HOSPITAL', weight: 4 },
    ],
  },
];
