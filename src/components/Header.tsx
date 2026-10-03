import React from 'react';
import { 
  Car, 
  GitCompare, 
  Network, 
  PlayCircle, 
  BookOpen, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { AlgorithmType, VehicleStatus } from '../types';

interface HeaderProps {
  algorithm: AlgorithmType;
  vehicleStatus: VehicleStatus;
  isSimulating: boolean;
  isGraphMode: boolean;
  onToggleGraphMode: () => void;
  onOpenComparison: () => void;
  onOpenTour: () => void;
  onOpenAbout: () => void;
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  algorithm,
  vehicleStatus,
  isSimulating,
  isGraphMode,
  onToggleGraphMode,
  onOpenComparison,
  onOpenTour,
  onOpenAbout,
  onResetAll,
}) => {
  const getStatusBadge = () => {
    switch (vehicleStatus) {
      case 'navigating':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Vehicle Navigating
          </span>
        );
      case 'blocked_replanning':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-bounce">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            ⚠️ Route Blocked: Replanning
          </span>
        );
      case 'reached':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Destination Reached
          </span>
        );
      default:
        if (isSimulating) {
          return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Exploring Graph ({algorithm.toUpperCase()})
            </span>
          );
        }
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            Ready / Standby
          </span>
        );
    }
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Car className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  ROUTEX
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-medium">
                  NAV-LAB
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Autonomous Vehicle Intelligent Path Planning & Real-Time Replanning
              </p>
            </div>
          </div>

          <div className="md:hidden">
            {getStatusBadge()}
          </div>
        </div>

        {/* Center / Status */}
        <div className="hidden md:flex items-center gap-3">
          {getStatusBadge()}
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            Algo: <strong className="text-cyan-400">{algorithm.toUpperCase()}</strong>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
          {/* System Walkthrough */}
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition cursor-pointer"
            title="Interactive System Walkthrough"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>System Tour</span>
          </button>

          {/* Compare Algorithms */}
          <button
            onClick={onOpenComparison}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-600/50 hover:text-white transition cursor-pointer"
            title="Compare BFS vs Dijkstra vs A* side-by-side"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare (3-Way)</span>
          </button>

          {/* Toggle Road Graph Mode */}
          <button
            onClick={onToggleGraphMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
              isGraphMode
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Switch between Grid Map and Road Graph Network"
          >
            <Network className="w-3.5 h-3.5" />
            <span>{isGraphMode ? 'Grid Map' : 'Road Graph'}</span>
          </button>

          {/* Reset All */}
          <button
            onClick={onResetAll}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            title="Reset Environment & Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Technical Documentation */}
          <button
            onClick={onOpenAbout}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            title="System Architecture & Technical Documentation"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
