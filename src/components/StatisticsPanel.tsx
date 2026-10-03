import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Compass, 
  Layers, 
  Percent, 
  Route, 
  XCircle, 
  Zap 
} from 'lucide-react';
import { AlgorithmMetrics, AlgorithmType } from '../types';

interface StatisticsPanelProps {
  algorithm: AlgorithmType;
  metrics: AlgorithmMetrics | null;
  hasWeightedRoads: boolean;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  algorithm,
  metrics,
  hasWeightedRoads,
}) => {
  if (!metrics) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Algorithm Performance Telemetry
        </h3>
        <div className="bg-slate-950/60 rounded-lg p-6 text-center text-xs text-slate-500 italic">
          Run the simulation to generate real algorithm execution metrics.
        </div>
      </div>
    );
  }

  const reached = metrics.reachedDestination;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Execution Metrics ({algorithm.toUpperCase()})
        </h3>
        {reached ? (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Path Discovered
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
            <XCircle className="w-3.5 h-3.5" />
            No Path Exists
          </span>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {/* Total Path Cost */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span>Total Path Cost</span>
            <span className="text-amber-400 font-bold">Σ Cost</span>
          </div>
          <div className="font-mono text-base font-bold text-amber-300">
            {reached ? metrics.totalCost : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-500">
            {algorithm === 'bfs' && hasWeightedRoads ? '⚠️ Hop-based (not min cost)' : 'Weighted edge sum'}
          </div>
        </div>

        {/* Path Length */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span>Path Length</span>
            <Route className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="font-mono text-base font-bold text-cyan-300">
            {reached ? `${metrics.pathLength} nodes` : '0'}
          </div>
          <div className="text-[10px] text-slate-500">
            {reached ? `${metrics.pathLength - 1} road hops` : 'No route'}
          </div>
        </div>

        {/* Nodes Explored */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span>Nodes Explored</span>
            <Layers className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="font-mono text-base font-bold text-indigo-300">
            {metrics.nodesExploredCount}
          </div>
          <div className="text-[10px] text-slate-500">Visited states</div>
        </div>

        {/* Search Efficiency */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span>Search Efficiency</span>
            <Percent className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="font-mono text-base font-bold text-emerald-300">
            {metrics.searchEfficiency}%
          </div>
          <div className="text-[10px] text-slate-500">Path / Explored ratio</div>
        </div>

        {/* Execution Time */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span>Compute Time</span>
            <Clock className="w-3 h-3 text-violet-400" />
          </div>
          <div className="font-mono text-base font-bold text-violet-300">
            {metrics.executionTimeMs} ms
          </div>
          <div className="text-[10px] text-slate-500">Browser JS runtime</div>
        </div>

        {/* Edge Relaxations */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span>Relaxations</span>
            <Compass className="w-3 h-3 text-pink-400" />
          </div>
          <div className="font-mono text-base font-bold text-pink-300">
            {metrics.relaxationsCount}
          </div>
          <div className="text-[10px] text-slate-500">Edge improvements</div>
        </div>
      </div>
    </div>
  );
};
