import React from 'react';
import { Database, Binary, Cpu } from 'lucide-react';
import { AlgorithmType } from '../types';
import { ALGORITHM_COMPLEXITY } from '../data/complexityData';

interface AlgorithmInternalsProps {
  algorithm: AlgorithmType;
  frontierCount: number;
  exploredCount: number;
}

export const AlgorithmInternals: React.FC<AlgorithmInternalsProps> = ({
  algorithm,
  frontierCount,
  exploredCount,
}) => {
  const info = ALGORITHM_COMPLEXITY[algorithm];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          Data Structures & Memory Layout
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">Computational State</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Frontier Structure */}
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px] block">Frontier Data Structure</span>
          <span className="font-semibold text-cyan-300 text-[11px]">
            {algorithm === 'bfs' ? 'FIFO Queue (Array / Queue)' : 'Binary Min-Heap Priority Queue'}
          </span>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Active elements: <strong className="text-slate-300">{frontierCount}</strong>
          </div>
        </div>

        {/* Visited / Closed Set */}
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
          <span className="text-slate-400 text-[10px] block">Visited / Closed Container</span>
          <span className="font-semibold text-indigo-300 text-[11px]">
            Hash Set (O(1) lookup)
          </span>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Visited elements: <strong className="text-slate-300">{exploredCount}</strong>
          </div>
        </div>
      </div>

      {/* Complexities Table */}
      <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-[11px] space-y-1">
        <div className="flex justify-between items-center text-slate-400">
          <span>Time Complexity:</span>
          <span className="font-mono text-cyan-400 font-bold">{info.timeComplexity}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Auxiliary Space:</span>
          <span className="font-mono text-indigo-400 font-bold">{info.spaceComplexity}</span>
        </div>
        <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 italic">
          <strong>Algorithmic Principle:</strong> {info.daKeyConcept}
        </div>
      </div>
    </div>
  );
};
