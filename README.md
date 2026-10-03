# 🚗 Autonomous Vehicle Route Simulator
### *Intelligent Path Planning & Real-Time Dynamic Replanning*

An interactive, research-grade path planning and simulation platform evaluating deterministic graph search algorithms (**Breadth-First Search (BFS)**, **Dijkstra’s Algorithm**, and **A\* Intelligent Search**) across dynamic road networks characterized by unexpected obstructions, variable traffic congestion weights, and real-time route recalculation.

---

## 📋 System Overview & Problem Formulation

Autonomous ground vehicles operating in complex urban road topologies navigate environments subject to dynamic shifts:
1. **Dynamic Roadblocks**: Traffic incidents, infrastructure repairs, or localized closures can obstruct planned trajectories mid-transit.
2. **Variable Edge Traversal Costs**: Traffic friction, school zones, and localized congestion alter transit resistance from nominal speeds (cost 1) to severe gridlock (cost 10).
3. **Hop vs. Cost Suboptimality**: Classical unweighted search algorithms (e.g., standard BFS) minimize graph hop count, naively directing vehicles through congested high-cost corridors rather than lower-friction detours.

This application provides a **transparent, visual, and mathematically rigorous** environment enabling engineers and researchers to inspect path planning decisions, internal memory structures, and dynamic replanning behaviors.

---

## ⚙️ Core Algorithms Implemented

All pathfinding algorithms are custom-engineered in pure TypeScript without external routing abstractions:

### 1. Breadth-First Search (BFS)
- **Data Structures**: First-In-First-Out (FIFO) Queue, Visited Set, Parent Map.
- **Complexity**: Time $\mathcal{O}(V + E)$, Space $\mathcal{O}(V)$.
- **Behavior**: Traverses radially outward level-by-level. Guarantees the **minimum-hop** path on uniform unweighted graphs.
- **Behavior on Weighted Graphs**: BFS treats all road weights uniformly ($w = 1$), seeking minimum edge transitions regardless of friction. Consequently, it traverses congested zones if the hop count remains equal to or lower than clear bypasses.

### 2. Dijkstra’s Shortest Path Algorithm
- **Data Structure**: Binary Min-Heap Priority Queue, Tentative Distance Map, Visited (Closed) Set, Parent Map.
- **Complexity**: Time $\mathcal{O}((V + E) \log V)$ with binary heap, Space $\mathcal{O}(V)$.
- **Behavior**: Systematically extracts the node with the lowest tentative accumulated cost $g(n)$ from the origin, performing edge relaxations on unvisited neighbors. Guarantees the **globally optimal minimum-cost path** across all non-negative edge costs ($w \ge 1$).
- **Wavefront Profile**: Produces concentric cost contours expanding outward until reaching the target destination.

### 3. A* (A-Star) Intelligent Search
- **Data Structure**: Binary Min-Heap Priority Queue (Open Set), Closed Set, $g$-score, $h$-score, and $f$-score Maps, Parent Map.
- **Evaluation Function**:
  $$f(n) = g(n) + h(n)$$
  - $g(n)$: Exact accumulated transit cost from Start to node $n$.
  - $h(n)$: Admissible Manhattan distance heuristic to Destination:
    $$h(n) = |r_n - r_{\text{dest}}| + |c_n - c_{\text{dest}}|$$
- **Complexity**: Worst-case $\mathcal{O}((V + E) \log V)$; practical runtime directed toward the destination.
- **Optimality & Admissibility**: Because the minimum road weight is $1$, the Manhattan distance heuristic never overestimates the true remaining transit cost ($h(n) \le h^*(n)$). Monotonicity (consistency) guarantees that the first extraction of the destination yields an optimal route while exploring significantly fewer states than Dijkstra.

---

## 📊 Comparative Performance Matrix

| Metric / Dimension | BFS (Breadth-First) | Dijkstra's Algorithm | A* Intelligent Search |
| :--- | :--- | :--- | :--- |
| **Frontier Structure** | FIFO Queue | Binary Min-Heap | Binary Min-Heap |
| **Heuristic Guidance** | None | None ($h=0$) | Manhattan Distance ($h \ge 0$) |
| **Edge Weights Evaluated** | Ignored (Minimizes Hops) | Evaluated (Minimizes Cost) | Evaluated (Minimizes Cost) |
| **Exploration Profile** | Radial Diamond / Square | Concentric Cost Contours | Focused Goal-Directed Beam |
| **Time Complexity** | $\mathcal{O}(V + E)$ | $\mathcal{O}((V + E) \log V)$ | $\mathcal{O}((V + E) \log V)$ worst-case |
| **Space Complexity** | $\mathcal{O}(V)$ | $\mathcal{O}(V)$ | $\mathcal{O}(V)$ |
| **Optimality on Weighted Graphs** | Suboptimal Cost | **Guaranteed Minimum Cost** | **Guaranteed Minimum Cost** |

---

## ⚡ Real-Time Dynamic Replanning Architecture

The simulation platform features autonomous dynamic route recalculation:
1. As the autonomous vehicle traverses scheduled waypoints, forward path segments are monitored continuously.
2. When an unexpected blockage or construction barrier is injected onto the upcoming trajectory, collision-avoidance logic triggers immediately.
3. The vehicle halts at its current node, switching status to `BLOCKED_REPLANNING`.
4. Accumulated transit costs and elapsed distance from the departure depot are preserved.
5. Pathfinding re-executes dynamically using the vehicle’s **current coordinates as the origin**.
6. The new optimal path is spliced into the vehicle’s navigation planner, and travel resumes smoothly.
7. If the target destination is fully partitioned by barriers, the system halts safely and reports an unreachable target state.

---

## 🛠️ Key Capabilities & Features

1. **Interactive Road Network Painter**:
   - Set Start (🟢) and Destination (🔴).
   - Draw/Erase impassable barriers (⬛).
   - Configure Road Transit Costs: Cost 1 (Normal), Cost 2 (Moderate), Cost 5 (Heavy), Cost 10 (Gridlock).
2. **Deterministic Search Step Visualization**:
   - Play (▶), Pause (⏸), Step Forward (⏭), Step Backward (⏮).
   - Adjustable speed multiplier (0.25x to 5x).
   - Timeline scrubber to examine frontier additions and heap extractions.
3. **Autonomous Vehicle Locomotion & Telemetry**:
   - Vehicle entity (🚗) with dynamic directional orientation, heading angle calculation, and live telemetry tracking.
4. **Interactive Node Inspector**:
   - Inspect any coordinate to analyze node status, road cost, backpointer parent, and mathematical decomposition of $g(n)$, $h(n)$, and $f(n)$.
5. **Head-to-Head 3-Way Comparative Evaluation**:
   - Executes BFS, Dijkstra, and A* synchronously on the current environment.
   - Generates side-by-side exploration maps and quantitative performance tables.
6. **Dual Topology Modes**:
   - 2D Cartesian Grid Map with variable friction cells.
   - Topological Road Graph with named intersections and weighted edges.
7. **Preset Architectural Scenarios**:
   - Scenario 1: Open City (Baseline direct routing)
   - Scenario 2: Urban Traffic Congestion (Friction corridor testing weighted detours)
   - Scenario 3: Highway Roadblock & Dynamic Replan
   - Scenario 4: Downtown Labyrinth (Complex maze topology)
   - Scenario 5: Emergency Transit Grid
8. **Automated System Tour**:
   - 6-step guided walkthrough illustrating core planning, navigation, obstacle injection, and replanning workflows.

---

## 🏗️ Architecture & Component Hierarchy

```
src/
├── algorithms/
│   ├── PriorityQueue.ts       # Binary min-heap with O(log N) operations
│   ├── bfs.ts                 # FIFO queue BFS with hop tracking
│   ├── dijkstra.ts            # Min-heap Dijkstra with relaxation tracking
│   ├── astar.ts               # A* with Manhattan heuristic and g/h/f decomposition
│   ├── graphAlgorithms.ts     # Graph network BFS, Dijkstra, A* on adjacency lists
│   └── common.ts              # Cardinal neighbors, path reconstruction, cost utilities
├── components/
│   ├── Header.tsx             # System branding, vehicle status, global actions
│   ├── ControlSidebar.tsx     # Map painter, grid scale, procedural generator
│   ├── AlgorithmSelector.tsx  # Algorithm picker with complexity & weight badges
│   ├── GridMap.tsx            # Visual grid map container with legend
│   ├── GridCell.tsx           # Individual cell with weight indicators and animations
│   ├── SimulationControls.tsx # Playback controls, step scrubber, replan triggers
│   ├── TelemetryHUD.tsx       # Real-time autonomous vehicle telemetry HUD
│   ├── StatisticsPanel.tsx    # Live execution metrics and efficiency calculations
│   ├── NodeInspector.tsx      # Deep inspector for g, h, f and parent pointers
│   ├── AlgorithmExplanation.tsx# "Execution mechanism" and "Why this path?" rationale
│   ├── AlgorithmInternals.tsx # Real-time active data structures inspector
│   ├── LiveEventLog.tsx       # Real-time scrolling algorithm event stream
│   ├── ComparisonModal.tsx    # 3-way synchronous side-by-side comparison
│   ├── RoadGraphView.tsx      # Topological road network graph mode
│   ├── SystemTourModal.tsx    # 6-step guided system walkthrough
│   └── AboutModal.tsx         # System technical specification & architecture
├── data/
│   ├── scenarios.ts           # 5 deterministic preset scenarios & road graph
│   └── complexityData.ts      # Theoretical and practical complexity matrix
├── types/
│   └── index.ts               # Strict TypeScript definitions
├── utils/
│   ├── gridUtils.ts           # Grid generator, seedable PRNG, cloner
│   └── metrics.ts             # Metric formulas and explanation generator
├── App.tsx                    # Master coordinator & state engine
└── main.tsx                   # React 19 entry point
```

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# Navigate to http://localhost:3000
```

### Production Build
```bash
# Validate TypeScript and lint
npm run lint

# Compile production bundle
npm run build

# Preview build
npm run preview
```

---

## 🔍 System Verification Workflow

To evaluate core system capabilities:
1. Click **"System Tour"** in the top navigation bar.
2. **Step 1**: Load the Urban Traffic Congestion environment.
3. **Step 2**: Execute A* Search to observe directional heuristic beam expansion bypassing heavy friction corridors.
4. **Step 3**: Launch autonomous navigation to track waypoint following and live telemetry.
5. **Step 4**: Trigger an in-route roadblock to observe dynamic incident detection.
6. **Step 5**: Observe Dynamic Replanning generate an immediate bypass trajectory from the vehicle's current node.
7. **Step 6**: Launch the 3-Way Comparison modal to review BFS vs. Dijkstra vs. A* side-by-side metrics.
