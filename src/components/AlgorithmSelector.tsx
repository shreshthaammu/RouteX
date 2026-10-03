import React from 'react';
import { AlgorithmType } from '../types';
import { ALGORITHM_COMPLEXITY } from '../data/complexityData';
import { AlertTriangle, Compass, Layers, Zap } from 'lucide-react';

interface AlgorithmSelectorProps {
  currentAlgorithm: AlgorithmType;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
  hasWeightedRoads: boolean;
  disabled?: boolean;
}

export const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  currentAlgorithm,
  onSelectAlgorithm,
  hasWeightedRoads,
  disabled = false,
}) => {
  const algorithms: { type: AlgorithmType; icon: React.ReactNode; label: string; badge: string }[] = [
    {
      type: 'bfs',
      icon: <Layers className="w-4 h-4" />,
      label: 'BFS',
      badge: 'Unweighted',
    },
    {
      type: 'dijkstra',
      icon: <Zap className="w-4 h-4" />,
      label: 'Dijkstra',
      badge: 'Min-Cost',
    },
    {
      type: 'astar',
      icon: <Compass className="w-4 h-4" />,
      label: 'A*',
      badge: 'Heuristic',
    },
  ];

  const currentInfo = ALGORITHM_COMPLEXITY[currentAlgorithm];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          Select Pathfinding Algorithm
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">Core Routing</span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800/80 mb-3">
        {algorithms.map((algo) => {
          const isSelected = currentAlgorithm === algo.type;
          return (
            <button
              key={algo.type}
              disabled={disabled}
              onClick={() => onSelectAlgorithm(algo.type)}
              className={`flex flex-col items-center justify-center py-2 px-2 rounded-md transition-all text-xs font-semibold cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-1.5">
                {algo.icon}
                <span>{algo.label}</span>
              </div>
              <span
                className={`text-[9px] mt-0.5 px-1 rounded font-mono ${
                  isSelected ? 'bg-indigo-800/70 text-indigo-200' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {algo.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Info Card */}
      <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/70 text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200">{currentInfo.fullName}</span>
          <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/40">
            {currentInfo.timeComplexity}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-snug">{currentInfo.description}</p>

        {/* Feature badges */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60 text-[10px]">
          <span
            className={`px-1.5 py-0.5 rounded font-mono ${
              currentInfo.weightsConsidered
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
            }`}
          >
            {currentInfo.weightsConsidered ? '✓ Weights Counted' : '✗ Weights Ignored'}
          </span>

          <span
            className={`px-1.5 py-0.5 rounded font-mono ${
              currentInfo.heuristicUsed
                ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/40'
                : 'bg-slate-900 text-slate-500 border border-slate-800'
            }`}
          >
            {currentInfo.heuristicUsed ? '✓ Manhattan Heuristic' : '✗ No Heuristic'}
          </span>
        </div>

        {/* BFS Warning if weights exist */}
        {currentAlgorithm === 'bfs' && hasWeightedRoads && (
          <div className="mt-2 p-1.5 rounded bg-amber-950/40 border border-amber-800/50 flex items-start gap-1.5 text-[10px] text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Routing Note:</strong> Weighted roads present. BFS only minimizes hop count (edges) and does not calculate lowest travel cost. Select Dijkstra or A* for cost-optimized routing.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
