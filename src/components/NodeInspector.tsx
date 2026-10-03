import React from 'react';
import { Crosshair, Eye, HelpCircle, X } from 'lucide-react';
import { AlgorithmType, GridCellData, Position } from '../types';
import { manhattanDistance, posToKey } from '../algorithms/common';

interface NodeInspectorProps {
  selectedNode: Position | null;
  grid: GridCellData[][];
  algorithm: AlgorithmType;
  gScores: Record<string, number>;
  hScores: Record<string, number>;
  fScores: Record<string, number>;
  parents: Record<string, Position | null>;
  destPos: Position;
  exploredKeys: Set<string>;
  frontierKeys: Set<string>;
  pathSet: Set<string>;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  grid,
  algorithm,
  gScores,
  hScores,
  fScores,
  parents,
  destPos,
  exploredKeys,
  frontierKeys,
  pathSet,
  onClose,
}) => {
  if (!selectedNode) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            Interactive Node Inspector
          </h3>
        </div>
        <div className="bg-slate-950/60 rounded-lg p-3 text-center text-xs text-slate-500 italic">
          Click any cell on the grid map to inspect its computational state: g(n), h(n), f(n), backpointer, and transit cost.
        </div>
      </div>
    );
  }

  const key = posToKey(selectedNode);
  const cell = grid[selectedNode.row]?.[selectedNode.col];
  const parent = parents[key];

  let status = 'Unvisited';
  if (cell?.isStart) status = 'Start Location 🟢';
  else if (cell?.isDestination) status = 'Destination Target 🔴';
  else if (cell?.isObstacle) status = 'Blocked Obstacle ⬛';
  else if (pathSet.has(key)) status = 'Final Optimal Path ⭐';
  else if (exploredKeys.has(key)) status = 'Explored / Closed Set 🔵';
  else if (frontierKeys.has(key)) status = 'Frontier / Open Set 🟣';

  const g = gScores[key];
  const h = hScores[key] ?? manhattanDistance(selectedNode, destPos);
  const f = fScores[key] ?? (g !== undefined ? g + h : undefined);

  return (
    <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-3 shadow-xl space-y-2.5 relative">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5" />
          Inspecting Node ({selectedNode.row}, {selectedNode.col})
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Status */}
        <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px] block mb-0.5">Cell State</span>
          <span className="font-semibold text-slate-200">{status}</span>
        </div>

        {/* Road Weight */}
        <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px] block mb-0.5">Cell Transit Weight</span>
          <span className="font-mono font-bold text-amber-300">
            {cell?.isObstacle ? '∞ (Blocked)' : `${cell?.weight} (Level)`}
          </span>
        </div>

        {/* Parent Node */}
        <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 col-span-2">
          <span className="text-slate-400 text-[10px] block mb-0.5">Backpointer (Parent)</span>
          <span className="font-mono text-indigo-300 font-semibold">
            {parent ? `(${parent.row}, ${parent.col})` : cell?.isStart ? 'None (Start Node)' : 'Unassigned'}
          </span>
        </div>
      </div>

      {/* Heuristic Decomposition & Cost Metrics */}
      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
        <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between border-b border-slate-800/80 pb-1">
          <span>{algorithm.toUpperCase()} Heuristic Decomposition</span>
          <span className="text-[10px] font-mono text-cyan-400">f(n) = g(n) + h(n)</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center pt-0.5">
          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400">g(n) Cost</div>
            <div className="font-mono font-bold text-amber-300 text-sm">
              {g !== undefined ? g : '—'}
            </div>
            <div className="text-[9px] text-slate-500">
              {algorithm === 'bfs' ? 'Hops' : 'Start to n'}
            </div>
          </div>

          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400">h(n) Est.</div>
            <div className="font-mono font-bold text-indigo-300 text-sm">
              {algorithm === 'astar' ? h : '0'}
            </div>
            <div className="text-[9px] text-slate-500">Manhattan</div>
          </div>

          <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
            <div className="text-[10px] text-slate-400">f(n) Total</div>
            <div className="font-mono font-bold text-cyan-300 text-sm">
              {algorithm === 'astar' ? (f !== undefined ? f : '—') : g !== undefined ? g : '—'}
            </div>
            <div className="text-[9px] text-slate-500">Priority</div>
          </div>
        </div>
      </div>
    </div>
  );
};
