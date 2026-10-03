import React from 'react';
import { BookOpen, CheckCircle, Code, Compass, Layers, ShieldCheck, X, Zap } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-5 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Autonomous Navigation System — Technical Specification & Architecture
              </h2>
              <p className="text-xs text-slate-400">
                Deterministic Path Planning, Heuristic Optimality & Dynamic Route Replanning
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

        {/* Problem Statement */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Problem Statement & Academic Scope
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Autonomous ground vehicles must navigate dynamic road networks subject to unexpected roadblocks, construction detours, and variable traffic congestion. This application implements an academically rigorous, visual graph pathfinding simulator solving this exact challenge using classic Design and Analysis of Algorithms (DAA) paradigms.
          </p>
          <div className="p-2 rounded bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-200">
            <strong>Key Note:</strong> All routing decisions and heuristics are computed deterministically via BFS, Dijkstra, and A* algorithm implementations. No black-box ML models or simulated random telemetry are used.
          </div>
        </div>

        {/* The 3 Core Algorithms */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Comparative Algorithm Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            {/* BFS */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                <Layers className="w-4 h-4" />
                <span>BFS</span>
              </div>
              <div className="font-mono text-[10px] text-slate-400">Time: O(V + E) | Space: O(V)</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Uses a FIFO Queue to traverse level-by-level radially. Guarantees minimum-hop paths on unweighted graphs, but ignores road weights.
              </p>
            </div>

            {/* Dijkstra */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Zap className="w-4 h-4" />
                <span>Dijkstra</span>
              </div>
              <div className="font-mono text-[10px] text-slate-400">Time: O((V+E) log V)</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Uses a Binary Min-Heap Priority Queue to expand cheapest unexplored nodes first. Guarantees global minimum-cost routing for non-negative weights.
              </p>
            </div>

            {/* A* */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Compass className="w-4 h-4" />
                <span>A* Search</span>
              </div>
              <div className="font-mono text-[10px] text-slate-400">f(n) = g(n) + h(n)</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Combines path cost g(n) with Manhattan distance heuristic h(n) = |Δr| + |Δc|. Because min cell cost is 1, the heuristic is admissible and consistent, guaranteeing optimality while exploring fewer states.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Replanning System */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-400" />
            Dynamic Replanning & Obstacle Detection
          </h3>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            When the autonomous vehicle moves, sensor inputs continually inspect the projected forward path. If a new obstacle or traffic surge is detected:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
            <li>Vehicle immediately transitions from <code>NAVIGATING</code> to <code>BLOCKED_REPLANNING</code>.</li>
            <li>Current waypoint becomes the new <strong>Start position</strong> (retaining accumulated transit cost).</li>
            <li>Selected pathfinding algorithm re-executes over the updated graph structure.</li>
            <li>New optimal trajectory is spliced, and the vehicle resumes locomotion without restarting from the original departure depot.</li>
          </ol>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
