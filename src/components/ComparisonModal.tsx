import React, { useMemo } from 'react';
import { 
  AlertTriangle, 
  Award, 
  Check, 
  GitCompare, 
  Trophy, 
  X 
} from 'lucide-react';
import { AlgorithmResult, GridCellData, Position } from '../types';
import { runBFS } from '../algorithms/bfs';
import { runDijkstra } from '../algorithms/dijkstra';
import { runAStar } from '../algorithms/astar';
import { posToKey } from '../algorithms/common';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  grid: GridCellData[][];
  startPos: Position;
  destPos: Position;
  hasWeightedRoads: boolean;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  grid,
  startPos,
  destPos,
  hasWeightedRoads,
}) => {
  // Execute all three algorithms deterministically on the current grid
  const comparisonResults = useMemo(() => {
    if (!isOpen) return null;
    const bfsResult = runBFS(grid, startPos, destPos);
    const dijkstraResult = runDijkstra(grid, startPos, destPos);
    const astarResult = runAStar(grid, startPos, destPos);

    return {
      bfs: bfsResult,
      dijkstra: dijkstraResult,
      astar: astarResult,
    };
  }, [isOpen, grid, startPos, destPos]);

  if (!isOpen || !comparisonResults) return null;

  const { bfs, dijkstra, astar } = comparisonResults;

  // Mini Grid Renderer for comparison visualization
  const renderMiniMap = (result: AlgorithmResult, label: string, accentColor: string) => {
    const rows = grid.length;
    const cols = grid[0].length;
    const pathKeys = new Set(result.path.map(posToKey));
    const exploredKeys = new Set(result.exploredOrder.map(posToKey));

    return (
      <div className="flex flex-col items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between w-full mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${accentColor}`}>
            {label}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Cost: <strong className="text-amber-300">{result.metrics.totalCost}</strong> | Hops: <strong className="text-cyan-300">{Math.max(0, result.metrics.pathLength - 1)}</strong>
          </span>
        </div>

        {/* Mini Grid Canvas */}
        <div
          className="grid gap-[1px] bg-slate-900 p-1 rounded max-w-full aspect-square w-56 h-56"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const key = `${r},${c}`;
              const isStart = startPos.row === r && startPos.col === c;
              const isDest = destPos.row === r && destPos.col === c;
              const isObstacle = cell.isObstacle;
              const isPath = pathKeys.has(key);
              const isExplored = exploredKeys.has(key);

              let bg = 'bg-slate-950';
              if (isObstacle) bg = 'bg-slate-700';
              else if (isStart) bg = 'bg-emerald-400';
              else if (isDest) bg = 'bg-rose-500';
              else if (isPath) bg = 'bg-amber-400 shadow-sm';
              else if (isExplored) bg = 'bg-cyan-800/60';
              else if (cell.weight > 1) bg = 'bg-orange-950/40';

              return <div key={key} className={`aspect-square ${bg} rounded-[0.5px]`} />;
            })
          )}
        </div>

        <div className="w-full mt-2 grid grid-cols-2 gap-1 text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5">
          <div>Nodes Explored: <strong className="text-slate-200">{result.metrics.nodesExploredCount}</strong></div>
          <div>Efficiency: <strong className="text-emerald-400">{result.metrics.searchEfficiency}%</strong></div>
        </div>
      </div>
    );
  };

  // Find lowest explored count
  const minExplored = Math.min(
    bfs.metrics.nodesExploredCount,
    dijkstra.metrics.nodesExploredCount,
    astar.metrics.nodesExploredCount
  );

  // Find optimal cost
  const minCost = Math.min(
    bfs.metrics.totalCost,
    dijkstra.metrics.totalCost,
    astar.metrics.totalCost
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-5 shadow-2xl space-y-4 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                3-Way Algorithm Head-to-Head Comparison
              </h2>
              <p className="text-xs text-slate-400">
                Synchronous evaluation of BFS, Dijkstra, and A* on the exact current road environment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if BFS ignores weights */}
        {hasWeightedRoads && (
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-start gap-2 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Algorithmic Routing Principle:</strong> BFS minimizes the total number of edges/hops, not the weighted travel cost. Because variable road weights are present, BFS ignores traffic delays and may select high-friction roads. Dijkstra and A* evaluate edge weights to achieve the true global minimum-cost trajectory.
            </div>
          </div>
        )}

        {/* Side-by-side Mini Map Visualizations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {renderMiniMap(bfs, 'BFS (Breadth-First)', 'text-purple-400')}
          {renderMiniMap(dijkstra, 'Dijkstra Shortest Path', 'text-cyan-400')}
          {renderMiniMap(astar, 'A* Intelligent Search', 'text-amber-400')}
        </div>

        {/* Comprehensive Metrics Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-2.5">Performance Metric</th>
                <th className="p-2.5 text-purple-300">BFS (Unweighted)</th>
                <th className="p-2.5 text-cyan-300">Dijkstra</th>
                <th className="p-2.5 text-amber-300">A* (Heuristic)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {/* Nodes Explored */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-2.5 font-sans font-medium text-slate-300">Nodes Explored (Visited)</td>
                <td className="p-2.5">{bfs.metrics.nodesExploredCount}</td>
                <td className="p-2.5">{dijkstra.metrics.nodesExploredCount}</td>
                <td className="p-2.5 font-bold text-amber-300 flex items-center gap-1.5">
                  {astar.metrics.nodesExploredCount}
                  {astar.metrics.nodesExploredCount === minExplored && (
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </td>
              </tr>

              {/* Total Path Cost */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-2.5 font-sans font-medium text-slate-300">Total Path Cost</td>
                <td className={`p-2.5 ${bfs.metrics.totalCost > minCost ? 'text-rose-400 font-bold' : ''}`}>
                  {bfs.metrics.totalCost} {bfs.metrics.totalCost > minCost && '(Suboptimal)'}
                </td>
                <td className="p-2.5 font-bold text-emerald-400">
                  {dijkstra.metrics.totalCost} (Optimal)
                </td>
                <td className="p-2.5 font-bold text-emerald-400">
                  {astar.metrics.totalCost} (Optimal)
                </td>
              </tr>

              {/* Path Length */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-2.5 font-sans font-medium text-slate-300">Path Length (Nodes)</td>
                <td className="p-2.5">{bfs.metrics.pathLength}</td>
                <td className="p-2.5">{dijkstra.metrics.pathLength}</td>
                <td className="p-2.5">{astar.metrics.pathLength}</td>
              </tr>

              {/* Search Efficiency */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-2.5 font-sans font-medium text-slate-300">Search Efficiency (Path / Visited)</td>
                <td className="p-2.5">{bfs.metrics.searchEfficiency}%</td>
                <td className="p-2.5">{dijkstra.metrics.searchEfficiency}%</td>
                <td className="p-2.5 font-bold text-emerald-300">{astar.metrics.searchEfficiency}%</td>
              </tr>

              {/* Execution Time */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-2.5 font-sans font-medium text-slate-300">Browser JS Runtime (ms)</td>
                <td className="p-2.5">{bfs.metrics.executionTimeMs} ms</td>
                <td className="p-2.5">{dijkstra.metrics.executionTimeMs} ms</td>
                <td className="p-2.5">{astar.metrics.executionTimeMs} ms</td>
              </tr>

              {/* Edge Relaxations */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-2.5 font-sans font-medium text-slate-300">Edge Relaxations / Enqueues</td>
                <td className="p-2.5">{bfs.metrics.relaxationsCount}</td>
                <td className="p-2.5">{dijkstra.metrics.relaxationsCount}</td>
                <td className="p-2.5">{astar.metrics.relaxationsCount}</td>
              </tr>

              {/* Weights Counted */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-2.5 font-sans font-medium text-slate-300">Weighted Costs Considered</td>
                <td className="p-2.5 text-rose-400">No (Treats all as 1)</td>
                <td className="p-2.5 text-emerald-400">Yes (Minimizes Cost)</td>
                <td className="p-2.5 text-emerald-400">Yes (Minimizes Cost)</td>
              </tr>

              {/* Heuristic Used */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-2.5 font-sans font-medium text-slate-300">Heuristic Guided</td>
                <td className="p-2.5 text-slate-500">None (Uniform)</td>
                <td className="p-2.5 text-slate-500">None (Radial wave)</td>
                <td className="p-2.5 text-amber-300">Manhattan (|Δr| + |Δc|)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Conclusion / Takeaway */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Comparative Performance Analysis:</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            • <strong>A* Search</strong> is the most focused algorithm, exploring fewer nodes by directing search toward the destination using its admissible Manhattan distance heuristic, while guaranteeing the same optimal cost as Dijkstra.
            <br />
            • <strong>Dijkstra</strong> finds the mathematically optimal minimum-cost path, but explores nodes symmetrically across all directions.
            <br />
            • <strong>BFS</strong> is ideal for unweighted grids, but on weighted grids it produces suboptimal cost because it assumes every road traversal is equal.
          </p>
        </div>
      </div>
    </div>
  );
};
