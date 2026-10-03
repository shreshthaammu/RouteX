import React, { useState } from 'react';
import { 
  Award, 
  Car, 
  CheckCircle, 
  ChevronRight, 
  Flame, 
  GitCompare, 
  Play, 
  RotateCcw, 
  Sparkles, 
  X, 
  Zap 
} from 'lucide-react';

interface SystemTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStepAction: (stepNumber: number) => void;
}

export const SystemTourModal: React.FC<SystemTourModalProps> = ({
  isOpen,
  onClose,
  onStepAction,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const tourSteps = [
    {
      step: 1,
      title: 'Step 1: Initialize Urban Congestion Grid',
      desc: 'Configures an 18×18 road grid with a dense high-friction traffic corridor (Cost 5 & 10) along the direct line, contrasted with open peripheral avenues (Cost 1).',
      actionLabel: 'Load Urban Scenario',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      technicalNote: 'Establishes a baseline benchmark environment contrasting unweighted hop minimization against weighted path optimization.',
    },
    {
      step: 2,
      title: 'Step 2: Run A* Heuristic Search',
      desc: 'Executes A* path planning utilizing the Manhattan distance heuristic f(n) = g(n) + h(n) to compute the minimum-cost detour around heavy congestion.',
      actionLabel: 'Execute A* Search',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      technicalNote: 'Search frontier concentrates directionally toward the target destination, minimizing exploratory node expansions.',
    },
    {
      step: 3,
      title: 'Step 3: Launch Autonomous Vehicle Navigation',
      desc: 'The autonomous vehicle departs from Start (8, 2), tracking scheduled waypoints node-by-node with real-time heading orientation and telemetry reporting.',
      actionLabel: 'Start Autonomous Navigation',
      icon: <Car className="w-4 h-4 text-emerald-400" />,
      technicalNote: 'Simulates autonomous waypoint tracking, heading calculation, and transit cost accumulation.',
    },
    {
      step: 4,
      title: 'Step 4: Real-Time Incident Injection (Roadblock)',
      desc: 'Simulates a live operational event: an unexpected structural blockage or traffic incident suddenly obstructs the active route trajectory mid-transit.',
      actionLabel: 'Inject Incident in Route',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      technicalNote: 'Validates system resilience to dynamic topological environment alterations during active navigation.',
    },
    {
      step: 5,
      title: 'Step 5: Autonomous Real-Time Dynamic Replanning',
      desc: 'Vehicle halts immediately, registers the obstruction, and dynamically computes a fresh optimal trajectory from its current node to the destination.',
      actionLabel: 'Trigger Dynamic Replan',
      icon: <RotateCcw className="w-4 h-4 text-indigo-400" />,
      technicalNote: 'Dynamic replanning avoids resetting to the origin, preserving accumulated journey progress and transit energy.',
    },
    {
      step: 6,
      title: 'Step 6: Multi-Algorithm Comparative Evaluation',
      desc: 'Presents the comprehensive 3-way evaluation matrix analyzing explored states, path costs, runtimes, and algorithmic behavior differences.',
      actionLabel: 'Open Comparative Analysis',
      icon: <GitCompare className="w-4 h-4 text-purple-400" />,
      technicalNote: 'Demonstrates why BFS yields suboptimal cost on weighted graphs, and how A* achieves optimality with reduced node expansions over Dijkstra.',
    },
  ];

  const current = tourSteps[currentStep - 1];

  const handleExecuteCurrentStep = () => {
    onStepAction(currentStep);
    if (currentStep < tourSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Autonomous Navigation System Walkthrough
              </h2>
              <p className="text-xs text-slate-400">
                Automated 6-step walkthrough demonstrating core path planning & dynamic replanning capabilities
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

        {/* Step progress pills */}
        <div className="flex items-center justify-between gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {tourSteps.map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`flex-1 py-1 text-center rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                currentStep === s.step
                  ? 'bg-indigo-600 text-white shadow-md'
                  : currentStep > s.step
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {currentStep > s.step ? '✓' : s.step}
            </button>
          ))}
        </div>

        {/* Current Step Card */}
        <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            {current.icon}
            <span>{current.title}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {current.desc}
          </p>

          <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-200">
            <strong>Technical Note:</strong> {current.technicalNote}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-slate-500 font-mono">
            Step {currentStep} of {tourSteps.length}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
              >
                Back
              </button>
            )}

            <button
              onClick={handleExecuteCurrentStep}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer"
            >
              <span>{current.actionLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
