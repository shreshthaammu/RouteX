import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AlgorithmResult, 
  AlgorithmType, 
  CellWeight, 
  GridCellData, 
  Position, 
  Scenario, 
  VehicleStatus, 
  VehicleTelemetry 
} from './types';
import { PRESET_SCENARIOS } from './data/scenarios';
import { 
  cloneGrid, 
  createEmptyGrid, 
  generateRandomEnvironment, 
  loadPresetScenario 
} from './utils/gridUtils';
import { runBFS } from './algorithms/bfs';
import { runDijkstra } from './algorithms/dijkstra';
import { runAStar } from './algorithms/astar';
import { arePositionsEqual, posToKey } from './algorithms/common';
import { Header } from './components/Header';
import { ControlSidebar, ToolMode } from './components/ControlSidebar';
import { AlgorithmSelector } from './components/AlgorithmSelector';
import { GridMap } from './components/GridMap';
import { SimulationControls } from './components/SimulationControls';
import { TelemetryHUD } from './components/TelemetryHUD';
import { StatisticsPanel } from './components/StatisticsPanel';
import { NodeInspector } from './components/NodeInspector';
import { AlgorithmExplanation } from './components/AlgorithmExplanation';
import { AlgorithmInternals } from './components/AlgorithmInternals';
import { LiveEventLog } from './components/LiveEventLog';
import { ComparisonModal } from './components/ComparisonModal';
import { SystemTourModal } from './components/SystemTourModal';
import { AboutModal } from './components/AboutModal';
import { RoadGraphView } from './components/RoadGraphView';

export default function App() {
  // Initial Scenario: Urban Traffic (shows weighted detour)
  const initialScenario = PRESET_SCENARIOS[1];
  const initialData = loadPresetScenario(initialScenario);

  // Grid & Environment State
  const [gridSize, setGridSize] = useState<number>(initialScenario.gridSize);
  const [grid, setGrid] = useState<GridCellData[][]>(initialData.grid);
  const [startPos, setStartPos] = useState<Position>(initialData.start);
  const [destPos, setDestPos] = useState<Position>(initialData.destination);
  const [selectedTool, setSelectedTool] = useState<ToolMode>('obstacle');

  // Algorithm & Simulation State
  const [currentAlgorithm, setCurrentAlgorithm] = useState<AlgorithmType>('astar');
  const [algorithmResult, setAlgorithmResult] = useState<AlgorithmResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [inspectedNode, setInspectedNode] = useState<Position | null>(null);

  // Vehicle Telemetry State
  const [vehicleTelemetry, setVehicleTelemetry] = useState<VehicleTelemetry>({
    currentPosition: initialData.start,
    heading: 0,
    pathIndex: 0,
    status: 'idle',
    accumulatedCost: 0,
    distanceTraveled: 0,
    remainingHops: 0,
    replanCount: 0,
  });

  // Modal & Mode States
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isGraphMode, setIsGraphMode] = useState<boolean>(false);
  const [selectedPage, setSelectedPage] = useState<string>('dashboard');

  // Event Logs
  const [eventLogs, setEventLogs] = useState<string[]>([]);

  // Refs for animation loops
  const timerRef = useRef<number | null>(null);
  const vehicleTimerRef = useRef<number | null>(null);

  const addLog = useCallback((msg: string) => {
    setEventLogs((prev) => [...prev.slice(-150), msg]);
  }, []);

  // Compute road cost presence
  const hasWeightedRoads = grid.some((row) => row.some((c) => c.weight > 1));
  const obstacleCount = grid.reduce((acc, row) => acc + row.filter((c) => c.isObstacle).length, 0);
  const weightedCellCount = grid.reduce((acc, row) => acc + row.filter((c) => c.weight > 1).length, 0);

  // Helper: Run selected algorithm
  const executePathfinding = useCallback((
    currentGrid: GridCellData[][],
    sPos: Position,
    dPos: Position,
    algo: AlgorithmType
  ): AlgorithmResult => {
    let result: AlgorithmResult;
    if (algo === 'bfs') {
      result = runBFS(currentGrid, sPos, dPos);
    } else if (algo === 'dijkstra') {
      result = runDijkstra(currentGrid, sPos, dPos);
    } else {
      result = runAStar(currentGrid, sPos, dPos);
    }
    return result;
  }, []);

  // Initialize pathfinding search
  const handleRunSearch = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (vehicleTimerRef.current) clearInterval(vehicleTimerRef.current);

    const result = executePathfinding(grid, startPos, destPos, currentAlgorithm);
    setAlgorithmResult(result);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    addLog(`[System] Initialized ${currentAlgorithm.toUpperCase()} path search with ${result.steps.length} trace steps.`);

    // Reset vehicle to start
    setVehicleTelemetry((prev) => ({
      ...prev,
      currentPosition: startPos,
      pathIndex: 0,
      status: 'idle',
      accumulatedCost: 0,
      distanceTraveled: 0,
      remainingHops: Math.max(0, result.path.length - 1),
    }));
  }, [grid, startPos, destPos, currentAlgorithm, executePathfinding, addLog]);

  // Handle Search Animation Step Playback
  useEffect(() => {
    if (!isPlaying || !algorithmResult) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.max(8, Math.round(50 / speed));

    timerRef.current = window.setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= algorithmResult.steps.length - 1) {
          setIsPlaying(false);
          if (algorithmResult.metrics.reachedDestination) {
            addLog(`[System] Path search completed. Route ready for autonomous navigation.`);
          } else {
            addLog(`[System] Destination is unreachable. Check obstacles.`);
          }
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, algorithmResult, speed, addLog]);

  // Synchronize initial run on map mount
  useEffect(() => {
    const res = executePathfinding(grid, startPos, destPos, currentAlgorithm);
    setAlgorithmResult(res);
    setCurrentStepIndex(res.steps.length > 0 ? res.steps.length - 1 : 0);
  }, []); // Run once on startup

  // Handle Step Forward
  const handleStepForward = () => {
    if (!algorithmResult) return;
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(algorithmResult.steps.length - 1, prev + 1));
  };

  // Handle Step Backward
  const handleStepBackward = () => {
    if (!algorithmResult) return;
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  // Reset Search
  const handleResetSearch = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (vehicleTimerRef.current) clearInterval(vehicleTimerRef.current);
    setCurrentStepIndex(0);
    setVehicleTelemetry((prev) => ({
      ...prev,
      currentPosition: startPos,
      pathIndex: 0,
      status: 'idle',
      accumulatedCost: 0,
    }));
    addLog(`[System] Simulation search state reset to step 0.`);
  };

  // Autonomous Vehicle Driving along planned path
  const handleDriveVehicle = () => {
    if (!algorithmResult || algorithmResult.path.length <= 1) return;
    if (vehicleTimerRef.current) clearInterval(vehicleTimerRef.current);

    setIsPlaying(false);
    // Ensure search visualization shows full path
    setCurrentStepIndex(algorithmResult.steps.length - 1);

    const path = algorithmResult.path;
    setVehicleTelemetry((prev) => ({
      ...prev,
      currentPosition: path[0],
      pathIndex: 0,
      status: 'navigating',
      accumulatedCost: 0,
      distanceTraveled: 0,
      remainingHops: path.length - 1,
    }));

    addLog(`[Vehicle] Autonomous navigation started from (${path[0].row}, ${path[0].col}).`);

    let currentIdx = 0;
    let accumulated = 0;

    const stepInterval = Math.max(120, Math.round(500 / speed));

    vehicleTimerRef.current = window.setInterval(() => {
      currentIdx++;

      if (currentIdx >= path.length) {
        clearInterval(vehicleTimerRef.current!);
        setVehicleTelemetry((prev) => ({
          ...prev,
          status: 'reached',
        }));
        addLog(`[Vehicle] Destination reached successfully! Total cost: ${accumulated}.`);
        return;
      }

      const nextNode = path[currentIdx];
      const prevNode = path[currentIdx - 1];

      // Calculate heading angle
      let heading = 0;
      if (nextNode.row < prevNode.row) heading = 270; // North
      else if (nextNode.row > prevNode.row) heading = 90; // South
      else if (nextNode.col > prevNode.col) heading = 0; // East
      else if (nextNode.col < prevNode.col) heading = 180; // West

      // Accumulate weight
      accumulated += grid[nextNode.row][nextNode.col].weight;

      setVehicleTelemetry((prev) => ({
        ...prev,
        currentPosition: nextNode,
        pathIndex: currentIdx,
        heading,
        status: 'navigating',
        accumulatedCost: accumulated,
        distanceTraveled: currentIdx,
        remainingHops: path.length - 1 - currentIdx,
      }));
    }, stepInterval);
  };

  // DYNAMIC REPLANNING: Triggered when vehicle route becomes blocked mid-movement
  const triggerDynamicReplanning = useCallback((
    currentPos: Position,
    blockedPos: Position,
    currentGrid: GridCellData[][]
  ) => {
    if (vehicleTimerRef.current) clearInterval(vehicleTimerRef.current);

    addLog(`[ALERT] ⚠️ ROUTE BLOCKED at (${blockedPos.row}, ${blockedPos.col})! Halting vehicle.`);
    addLog(`[Vehicle] Initiating Dynamic Replanning from current node (${currentPos.row}, ${currentPos.col}) to (${destPos.row}, ${destPos.col})...`);

    setVehicleTelemetry((prev) => ({
      ...prev,
      status: 'blocked_replanning',
      replanCount: prev.replanCount + 1,
    }));

    // Recompute path from vehicle's current node to destination
    const newResult = executePathfinding(currentGrid, currentPos, destPos, currentAlgorithm);
    setAlgorithmResult(newResult);
    setCurrentStepIndex(newResult.steps.length - 1);

    if (newResult.metrics.reachedDestination && newResult.path.length > 1) {
      addLog(`[Dynamic Replan] New route found! ${newResult.path.length - 1} hops remaining. Resuming navigation.`);
      
      // Auto resume driving along new path after brief pause
      setTimeout(() => {
        const path = newResult.path;
        let currentIdx = 0;
        let accumulated = vehicleTelemetry.accumulatedCost;
        const stepInterval = Math.max(120, Math.round(500 / speed));

        vehicleTimerRef.current = window.setInterval(() => {
          currentIdx++;

          if (currentIdx >= path.length) {
            clearInterval(vehicleTimerRef.current!);
            setVehicleTelemetry((prev) => ({
              ...prev,
              status: 'reached',
            }));
            addLog(`[Vehicle] Destination reached following dynamic replan!`);
            return;
          }

          const nextNode = path[currentIdx];
          const prevNode = path[currentIdx - 1];

          let heading = 0;
          if (nextNode.row < prevNode.row) heading = 270;
          else if (nextNode.row > prevNode.row) heading = 90;
          else if (nextNode.col > prevNode.col) heading = 0;
          else if (nextNode.col < prevNode.col) heading = 180;

          accumulated += currentGrid[nextNode.row][nextNode.col].weight;

          setVehicleTelemetry((prev) => ({
            ...prev,
            currentPosition: nextNode,
            pathIndex: currentIdx,
            heading,
            status: 'navigating',
            accumulatedCost: accumulated,
            distanceTraveled: prev.distanceTraveled + 1,
            remainingHops: path.length - 1 - currentIdx,
          }));
        }, stepInterval);
      }, 700);
    } else {
      addLog(`[ALERT] ❌ NO VALID ROUTE EXISTS from (${currentPos.row}, ${currentPos.col}) to destination!`);
      setVehicleTelemetry((prev) => ({
        ...prev,
        status: 'blocked_replanning',
      }));
    }
  }, [destPos, currentAlgorithm, executePathfinding, addLog, speed, vehicleTelemetry.accumulatedCost]);

  // Inject Roadblock Directly in Vehicle's Forward Path (For Dynamic Incident Simulation)
  const handleInjectRoadblockAhead = () => {
    if (!algorithmResult || algorithmResult.path.length <= 1) return;

    const path = algorithmResult.path;
    const currentIdx = vehicleTelemetry.pathIndex;
    
    // Pick the node 2 steps ahead or next node
    const targetIdx = Math.min(path.length - 1, currentIdx + 2);
    if (targetIdx <= currentIdx || arePositionsEqual(path[targetIdx], destPos)) {
      addLog(`[System] Cannot block immediate destination or current position.`);
      return;
    }

    const blockNode = path[targetIdx];
    const newGrid = cloneGrid(grid);
    newGrid[blockNode.row][blockNode.col].isObstacle = true;
    setGrid(newGrid);

    // Trigger dynamic replan
    triggerDynamicReplanning(vehicleTelemetry.currentPosition, blockNode, newGrid);
  };

  // Inject Traffic Spike ahead (Dynamic Road Cost Change)
  const handleInjectDynamicTraffic = () => {
    if (!algorithmResult || algorithmResult.path.length <= 1) return;

    const path = algorithmResult.path;
    const currentIdx = vehicleTelemetry.pathIndex;
    const targetIdx = Math.min(path.length - 1, currentIdx + 2);

    if (targetIdx <= currentIdx || arePositionsEqual(path[targetIdx], destPos)) return;

    const spikeNode = path[targetIdx];
    const newGrid = cloneGrid(grid);
    newGrid[spikeNode.row][spikeNode.col].weight = 10;
    setGrid(newGrid);

    addLog(`[Traffic Event] ⚠️ Road at (${spikeNode.row}, ${spikeNode.col}) spiked to Cost 10 (Severe Congestion)!`);

    // Recalculate optimal path from current position
    const newResult = executePathfinding(newGrid, vehicleTelemetry.currentPosition, destPos, currentAlgorithm);
    setAlgorithmResult(newResult);
    setCurrentStepIndex(newResult.steps.length - 1);
    addLog(`[Traffic Event] Path recalculated with new edge costs. Total Cost: ${newResult.metrics.totalCost}.`);
  };

  // Interactive Cell Editing (Click or Drag)
  const applyToolToCell = useCallback((row: number, col: number) => {
    const isStartCell = startPos.row === row && startPos.col === col;
    const isDestCell = destPos.row === row && destPos.col === col;

    if (selectedTool === 'start') {
      if (isDestCell) return;
      setStartPos({ row, col });
      setVehicleTelemetry((prev) => ({ ...prev, currentPosition: { row, col } }));
      const newGrid = cloneGrid(grid);
      newGrid[row][col].isObstacle = false;
      setGrid(newGrid);
      const res = executePathfinding(newGrid, { row, col }, destPos, currentAlgorithm);
      setAlgorithmResult(res);
      setCurrentStepIndex(res.steps.length - 1);
      addLog(`[Map] Vehicle Start moved to (${row}, ${col}).`);
      return;
    }

    if (selectedTool === 'destination') {
      if (isStartCell) return;
      setDestPos({ row, col });
      const newGrid = cloneGrid(grid);
      newGrid[row][col].isObstacle = false;
      setGrid(newGrid);
      const res = executePathfinding(newGrid, startPos, { row, col }, currentAlgorithm);
      setAlgorithmResult(res);
      setCurrentStepIndex(res.steps.length - 1);
      addLog(`[Map] Target Destination moved to (${row}, ${col}).`);
      return;
    }

    // Do not overwrite start or dest with walls/weights
    if (isStartCell || isDestCell) return;

    const newGrid = cloneGrid(grid);
    const targetCell = newGrid[row][col];

    if (selectedTool === 'obstacle') {
      targetCell.isObstacle = !targetCell.isObstacle;
    } else if (selectedTool === 'eraser') {
      targetCell.isObstacle = false;
      targetCell.weight = 1;
    } else if (selectedTool === 'weight_1') {
      targetCell.isObstacle = false;
      targetCell.weight = 1;
    } else if (selectedTool === 'weight_2') {
      targetCell.isObstacle = false;
      targetCell.weight = 2;
    } else if (selectedTool === 'weight_5') {
      targetCell.isObstacle = false;
      targetCell.weight = 5;
    } else if (selectedTool === 'weight_10') {
      targetCell.isObstacle = false;
      targetCell.weight = 10;
    }

    setGrid(newGrid);

    // If vehicle is currently navigating and the modified cell is on the remaining path:
    if (vehicleTelemetry.status === 'navigating' && targetCell.isObstacle) {
      const remainingPath = algorithmResult?.path.slice(vehicleTelemetry.pathIndex) || [];
      if (remainingPath.some((p) => p.row === row && p.col === col)) {
        triggerDynamicReplanning(vehicleTelemetry.currentPosition, { row, col }, newGrid);
        return;
      }
    }

    // Recalculate path immediately
    const res = executePathfinding(newGrid, startPos, destPos, currentAlgorithm);
    setAlgorithmResult(res);
    setCurrentStepIndex(res.steps.length - 1);
  }, [
    startPos, 
    destPos, 
    selectedTool, 
    grid, 
    currentAlgorithm, 
    executePathfinding, 
    addLog, 
    vehicleTelemetry, 
    algorithmResult, 
    triggerDynamicReplanning
  ]);

  // Node Inspector selection on click
  const handleCellClick = (row: number, col: number) => {
    setInspectedNode({ row, col });
  };

  // Scenario Loading
  const handleLoadScenario = (scenario: Scenario) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (vehicleTimerRef.current) clearInterval(vehicleTimerRef.current);
    setIsPlaying(false);

    const loaded = loadPresetScenario(scenario);
    setGridSize(scenario.gridSize);
    setGrid(loaded.grid);
    setStartPos(loaded.start);
    setDestPos(loaded.destination);

    const res = executePathfinding(loaded.grid, loaded.start, loaded.destination, currentAlgorithm);
    setAlgorithmResult(res);
    setCurrentStepIndex(res.steps.length - 1);
    setVehicleTelemetry({
      currentPosition: loaded.start,
      heading: 0,
      pathIndex: 0,
      status: 'idle',
      accumulatedCost: 0,
      distanceTraveled: 0,
      remainingHops: Math.max(0, res.path.length - 1),
      replanCount: 0,
    });
    setInspectedNode(null);
    addLog(`[Scenario] Loaded preset: ${scenario.name}.`);
  };

  // Random Map Generation
  const handleGenerateRandom = (density: number, variation: 'low' | 'medium' | 'high') => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (vehicleTimerRef.current) clearInterval(vehicleTimerRef.current);
    setIsPlaying(false);

    const generated = generateRandomEnvironment({
      size: gridSize,
      obstacleDensity: density,
      costVariation: variation,
    });

    setGrid(generated.grid);
    setStartPos(generated.start);
    setDestPos(generated.destination);

    const res = executePathfinding(generated.grid, generated.start, generated.destination, currentAlgorithm);
    setAlgorithmResult(res);
    setCurrentStepIndex(res.steps.length - 1);
    setVehicleTelemetry({
      currentPosition: generated.start,
      heading: 0,
      pathIndex: 0,
      status: 'idle',
      accumulatedCost: 0,
      distanceTraveled: 0,
      remainingHops: Math.max(0, res.path.length - 1),
      replanCount: 0,
    });
    setInspectedNode(null);
    addLog(`[Random Env] Generated ${gridSize}x${gridSize} grid (${Math.round(density * 100)}% density, ${variation} traffic).`);
  };

  // Change Algorithm
  const handleSelectAlgorithm = (algo: AlgorithmType) => {
    setCurrentAlgorithm(algo);
    const res = executePathfinding(grid, startPos, destPos, algo);
    setAlgorithmResult(res);
    setCurrentStepIndex(res.steps.length - 1);
    addLog(`[Algorithm] Switched active pathfinder to ${algo.toUpperCase()}.`);
  };

  // Grid Scale change
  const handleGridSizeChange = (newSize: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (vehicleTimerRef.current) clearInterval(vehicleTimerRef.current);
    setIsPlaying(false);

    const s = { row: 1, col: 1 };
    const d = { row: newSize - 2, col: newSize - 2 };
    const emptyGrid = createEmptyGrid(newSize, newSize, s, d);

    setGridSize(newSize);
    setGrid(emptyGrid);
    setStartPos(s);
    setDestPos(d);

    const res = executePathfinding(emptyGrid, s, d, currentAlgorithm);
    setAlgorithmResult(res);
    setCurrentStepIndex(res.steps.length - 1);
    setVehicleTelemetry({
      currentPosition: s,
      heading: 0,
      pathIndex: 0,
      status: 'idle',
      accumulatedCost: 0,
      distanceTraveled: 0,
      remainingHops: Math.max(0, res.path.length - 1),
      replanCount: 0,
    });
    setInspectedNode(null);
    addLog(`[Grid] Resized to ${newSize}x${newSize}.`);
  };

  // Clear Walls
  const handleClearObstacles = () => {
    const newGrid = cloneGrid(grid);
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        newGrid[r][c].isObstacle = false;
      }
    }
    setGrid(newGrid);
    const res = executePathfinding(newGrid, startPos, destPos, currentAlgorithm);
    setAlgorithmResult(res);
    setCurrentStepIndex(res.steps.length - 1);
    addLog(`[Map] Cleared all obstacles.`);
  };

  // Clear Weights
  const handleClearWeights = () => {
    const newGrid = cloneGrid(grid);
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        newGrid[r][c].weight = 1;
      }
    }
    setGrid(newGrid);
    const res = executePathfinding(newGrid, startPos, destPos, currentAlgorithm);
    setAlgorithmResult(res);
    setCurrentStepIndex(res.steps.length - 1);
    addLog(`[Map] Reset all road costs to 1.`);
  };

  // Reset Everything to Blank
  const handleResetGrid = () => {
    const s = { row: 1, col: 1 };
    const d = { row: gridSize - 2, col: gridSize - 2 };
    const empty = createEmptyGrid(gridSize, gridSize, s, d);
    setGrid(empty);
    setStartPos(s);
    setDestPos(d);
    const res = executePathfinding(empty, s, d, currentAlgorithm);
    setAlgorithmResult(res);
    setCurrentStepIndex(res.steps.length - 1);
    addLog(`[Map] Cleared grid completely to blank.`);
  };

  // Full Reset All
  const handleResetAll = () => {
    handleLoadScenario(PRESET_SCENARIOS[1]);
    addLog(`[System] Complete simulator reset to initial state.`);
  };

  // System Tour Action Handler
  const handleTourStepAction = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        // Step 1: Load Urban scenario
        handleLoadScenario(PRESET_SCENARIOS[1]);
        break;
      case 2:
        // Step 2: Select A* and run search animation
        handleSelectAlgorithm('astar');
        handleRunSearch();
        break;
      case 3:
        // Step 3: Launch Vehicle
        handleDriveVehicle();
        break;
      case 4:
        // Step 4: Inject Roadblock in vehicle path
        handleInjectRoadblockAhead();
        break;
      case 5:
        // Step 5: Dynamic Replan already triggered in step 4
        addLog(`[System Tour] Dynamic Replanning active: observed automatic bypass calculation.`);
        break;
      case 6:
        // Step 6: Open 3-Way comparison
        setIsComparisonOpen(true);
        break;
    }
  };

  // Current Step Data for Visualization
  const currentStep = algorithmResult?.steps[currentStepIndex] || null;
  const currentStepNode = currentStep?.currentNode || null;
  const frontierKeys = new Set<string>(currentStep?.frontier || []);
  const exploredKeys = new Set<string>(currentStep?.explored || []);

  const path = currentStepIndex >= (algorithmResult?.steps.length || 1) - 1
    ? (algorithmResult?.path || [])
    : [];

  const pathSet = new Set<string>(algorithmResult?.path.map(posToKey) || []);

  const leftSidebarPages = [
    { id: 'dashboard', label: 'Dashboard', icon: '▣' },
    { id: 'maps', label: 'Maps', icon: '◫' },
    { id: 'routes', label: 'Routes', icon: '⇄' },
    { id: 'analysis', label: 'Analysis', icon: '◔' },
    { id: 'logs', label: 'Logs', icon: '▤' },
    { id: 'compare', label: 'Compare', icon: '≣' },
  ];

  const renderPageContent = () => {
    switch (selectedPage) {
      case 'dashboard':
        return (
          <section className="space-y-3">
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-slate-950 p-4 shadow-lg shadow-indigo-900/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-indigo-300">Mission Control</p>
                  <h2 className="mt-1 text-xl font-bold text-white">Dashboard</h2>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  {vehicleTelemetry.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">RouteStatus</p>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between"><span className="text-slate-400">Algorithm</span><span className="font-semibold text-cyan-300">{currentAlgorithm.toUpperCase()}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-400">Vehicle</span><span className="font-semibold text-emerald-300">{vehicleTelemetry.status}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-400">Cost</span><span className="font-semibold text-amber-300">{algorithmResult?.metrics.totalCost ?? 0}</span></div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">SystemOverview</p>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between"><span className="text-slate-400">Grid</span><span className="font-semibold">{gridSize}x{gridSize}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-400">Obstacles</span><span className="font-semibold text-rose-300">{obstacleCount}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-400">Traffic</span><span className="font-semibold text-orange-300">{weightedCellCount}</span></div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">QuickActions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => handleRunSearch()} className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20">RunSearch</button>
                <button onClick={handleDriveVehicle} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20">DriveVehicle</button>
                <button onClick={() => setIsComparisonOpen(true)} className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200">Compare3Way</button>
                <button onClick={() => setIsGraphMode((p) => !p)} className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200">ToggleGraph</button>
              </div>
            </div>
          </section>
        );
      case 'maps':
        return (
          <section className="space-y-3">
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/40 via-slate-900 to-slate-950 p-4 shadow-lg shadow-cyan-900/20">
              <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">MapEditor</p>
              <h2 className="mt-1 text-xl font-bold text-white">Maps</h2>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
              <button onClick={() => setIsGraphMode(false)} className="w-full rounded-xl bg-slate-800 px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-700">GridMapView</button>
              <button onClick={() => setIsGraphMode(true)} className="w-full rounded-xl bg-slate-800 px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-700">RoadGraphView</button>
              <button onClick={() => handleResetGrid()} className="w-full rounded-xl bg-slate-800 px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-700">ResetGrid</button>
            </div>
          </section>
        );
      case 'routes':
        return (
          <section className="space-y-3">
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-950 p-4 shadow-lg shadow-emerald-900/20">
              <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-300">Navigation</p>
              <h2 className="mt-1 text-xl font-bold text-white">Routes</h2>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
              <button onClick={handleRunSearch} className="w-full rounded-xl bg-slate-800 px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-700">RecomputeRoute</button>
              <button onClick={handleDriveVehicle} className="w-full rounded-xl bg-slate-800 px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-700">AutonomousDrive</button>
              <button onClick={handleInjectRoadblockAhead} className="w-full rounded-xl bg-slate-800 px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-700">InjectRoadblock</button>
              <button onClick={handleInjectDynamicTraffic} className="w-full rounded-xl bg-slate-800 px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-700">TrafficSpike</button>
            </div>
          </section>
        );
      case 'analysis':
        return (
          <section className="space-y-3">
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/40 via-slate-900 to-slate-950 p-4 shadow-lg shadow-amber-900/20">
              <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300">Metrics</p>
              <h2 className="mt-1 text-xl font-bold text-white">Analysis</h2>
            </div>
            <StatisticsPanel
              algorithm={currentAlgorithm}
              metrics={algorithmResult?.metrics || null}
              hasWeightedRoads={hasWeightedRoads}
            />
          </section>
        );
      case 'logs':
        return (
          <section className="space-y-3">
            <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-900/40 via-slate-900 to-slate-950 p-4 shadow-lg shadow-violet-900/20">
              <p className="text-[10px] uppercase tracking-[0.28em] text-violet-300">Timeline</p>
              <h2 className="mt-1 text-xl font-bold text-white">Logs</h2>
            </div>
            <LiveEventLog
              logs={eventLogs}
              onClearLogs={() => setEventLogs([])}
            />
          </section>
        );
      case 'compare':
        return (
          <section className="space-y-3">
            <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-900/40 via-slate-900 to-slate-950 p-4 shadow-lg shadow-pink-900/20">
              <p className="text-[10px] uppercase tracking-[0.28em] text-pink-300">Benchmark</p>
              <h2 className="mt-1 text-xl font-bold text-white">Compare</h2>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
              <button onClick={() => setIsComparisonOpen(true)} className="w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Open3WayCompare</button>
              <button onClick={() => setIsTourOpen(true)} className="w-full rounded-xl bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200">OpenSystemTour</button>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        algorithm={currentAlgorithm}
        vehicleStatus={vehicleTelemetry.status}
        isSimulating={isPlaying}
        isGraphMode={isGraphMode}
        onToggleGraphMode={() => setIsGraphMode((prev) => !prev)}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onResetAll={handleResetAll}
      />

      <main className="flex-1 w-full px-2 py-3 sm:px-3 xl:px-4 grid grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)_320px] gap-3 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),transparent_30%)]">
        <aside className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
            <div className="mb-2 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-500">Workspace</div>
            <nav className="space-y-1.5">
              {leftSidebarPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition ${
                    selectedPage === page.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base leading-none">{page.icon}</span>
                  <span>{page.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
            <div className="mb-2 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-500">Controls</div>
            <AlgorithmSelector
              currentAlgorithm={currentAlgorithm}
              onSelectAlgorithm={handleSelectAlgorithm}
              hasWeightedRoads={hasWeightedRoads}
              disabled={isPlaying || vehicleTelemetry.status === 'navigating'}
            />
          </div>

          <ControlSidebar
            gridSize={gridSize}
            onGridSizeChange={handleGridSizeChange}
            selectedTool={selectedTool}
            onSelectTool={setSelectedTool}
            startPos={startPos}
            destPos={destPos}
            obstacleCount={obstacleCount}
            weightedCellCount={weightedCellCount}
            onLoadScenario={handleLoadScenario}
            onGenerateRandom={handleGenerateRandom}
            onClearObstacles={handleClearObstacles}
            onClearWeights={handleClearWeights}
            onResetGrid={handleResetGrid}
            disabled={isPlaying}
          />
        </aside>

        <section className="min-w-0 space-y-3">
          {renderPageContent()}

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 sm:p-3">
            {isGraphMode ? (
              <RoadGraphView algorithm={currentAlgorithm} />
            ) : (
              <GridMap
                grid={grid}
                startPos={startPos}
                destPos={destPos}
                currentStepNode={currentStepNode}
                frontierKeys={frontierKeys}
                exploredKeys={exploredKeys}
                path={path}
                vehiclePos={vehicleTelemetry.currentPosition}
                vehicleHeading={vehicleTelemetry.heading}
                inspectedNode={inspectedNode}
                fScores={algorithmResult?.fScores}
                gScores={algorithmResult?.gScores}
                hScores={algorithmResult?.hScores}
                onCellMouseDown={applyToolToCell}
                onCellMouseEnter={applyToolToCell}
                onCellClick={handleCellClick}
              />
            )}
          </div>

          <SimulationControls
            isPlaying={isPlaying}
            onPlayToggle={() => {
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                handleRunSearch();
              }
            }}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onResetSearch={handleResetSearch}
            speed={speed}
            onSpeedChange={setSpeed}
            currentStepIndex={currentStepIndex}
            totalSteps={algorithmResult?.steps.length || 0}
            onScrubStep={(idx) => {
              setIsPlaying(false);
              setCurrentStepIndex(idx);
            }}
            hasPath={(algorithmResult?.path.length || 0) > 0}
            vehicleStatus={vehicleTelemetry.status}
            onDriveVehicle={handleDriveVehicle}
            onInjectRoadblock={handleInjectRoadblockAhead}
            onInjectDynamicTraffic={handleInjectDynamicTraffic}
          />

          <TelemetryHUD
            telemetry={vehicleTelemetry}
            totalPathLength={algorithmResult?.path.length || 0}
          />
        </section>

        <aside className="space-y-4">
          {(selectedPage === 'analysis' || selectedPage === 'dashboard' || selectedPage === 'compare') && (
            <StatisticsPanel
              algorithm={currentAlgorithm}
              metrics={algorithmResult?.metrics || null}
              hasWeightedRoads={hasWeightedRoads}
            />
          )}

          {selectedPage !== 'logs' && (
            <NodeInspector
              selectedNode={inspectedNode}
              grid={grid}
              algorithm={currentAlgorithm}
              gScores={algorithmResult?.gScores || {}}
              hScores={algorithmResult?.hScores || {}}
              fScores={algorithmResult?.fScores || {}}
              parents={algorithmResult?.parents || {}}
              destPos={destPos}
              exploredKeys={exploredKeys}
              frontierKeys={frontierKeys}
              pathSet={pathSet}
              onClose={() => setInspectedNode(null)}
            />
          )}

          {selectedPage !== 'logs' && (
            <AlgorithmExplanation
              algorithm={currentAlgorithm}
              result={algorithmResult}
              hasWeightedRoads={hasWeightedRoads}
            />
          )}

          {selectedPage !== 'analysis' && selectedPage !== 'dashboard' && (
            <LiveEventLog
              logs={eventLogs}
              onClearLogs={() => setEventLogs([])}
            />
          )}
        </aside>
      </main>

      {/* Modals */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        grid={grid}
        startPos={startPos}
        destPos={destPos}
        hasWeightedRoads={hasWeightedRoads}
      />

      <SystemTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onStepAction={handleTourStepAction}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
