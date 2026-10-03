import React from 'react';
import { BookOpen, CheckCircle, Info, Lightbulb } from 'lucide-react';
import { AlgorithmResult, AlgorithmType } from '../types';
import { generateExplanation } from '../utils/metrics';

interface AlgorithmExplanationProps {
  algorithm: AlgorithmType;
  result: AlgorithmResult | null;
  hasWeightedRoads: boolean;
}

export const AlgorithmExplanation: React.FC<AlgorithmExplanationProps> = ({
  algorithm,
  result,
  hasWeightedRoads,
}) => {
  if (!result) return null;

  const explanation = generateExplanation(result, algorithm, hasWeightedRoads);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          Algorithmic Rationale & Proof
        </h3>
        <span className="text-[10px] text-cyan-400 font-mono">Verified Optimality</span>
      </div>

      {/* How it worked */}
      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-indigo-300 font-semibold mb-1">
          <Info className="w-3.5 h-3.5" />
          <span>Execution Mechanism</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          {explanation.howItWorked}
        </p>
      </div>

      {/* Why this path */}
      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-300 font-semibold mb-1">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Why Was This Path Chosen?</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          {explanation.whyThisPath}
        </p>
      </div>

      {/* Key observation / algorithmic analysis */}
      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Algorithmic Analysis</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          {explanation.keyObservation}
        </p>
      </div>
    </div>
  );
};
