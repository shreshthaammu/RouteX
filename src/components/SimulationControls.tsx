import React from 'react';
import { 
  AlertOctagon, 
  Car, 
  FastForward, 
  Flame, 
  Pause, 
  Play, 
  RotateCcw, 
  SkipBack, 
  SkipForward 
} from 'lucide-react';
import { VehicleStatus } from '../types';

interface SimulationControlsProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onResetSearch: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentStepIndex: number;
  totalSteps: number;
  onScrubStep: (index: number) => void;
  hasPath: boolean;
  vehicleStatus: VehicleStatus;
  onDriveVehicle: () => void;
  onInjectRoadblock: () => void;
  onInjectDynamicTraffic: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying,
  onPlayToggle,
  onStepForward,
  onStepBackward,
  onResetSearch,
  speed,
  onSpeedChange,
  currentStepIndex,
  totalSteps,
  onScrubStep,
  hasPath,
  vehicleStatus,
  onDriveVehicle,
  onInjectRoadblock,
  onInjectDynamicTraffic,
}) => {
  const speedOptions = [0.25, 0.5, 1, 2, 5];

  const isVehicleDriving = vehicleStatus === 'navigating';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg space-y-3">
      {/* Upper Bar: Main Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Play / Step Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onResetSearch}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700 transition cursor-pointer"
            title="Reset Search Steps"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onStepBackward}
            disabled={isPlaying || currentStepIndex <= 0}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700 disabled:opacity-40 transition cursor-pointer"
            title="Step Backward"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs transition shadow-lg cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Search</span>
              </>
            )}
          </button>

          <button
            onClick={onStepForward}
            disabled={isPlaying || (totalSteps > 0 && currentStepIndex >= totalSteps - 1)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border border-slate-700 disabled:opacity-40 transition cursor-pointer"
            title="Step Forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-500 px-1 font-mono">Speed:</span>
          {speedOptions.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition cursor-pointer ${
                speed === s
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Step scrubber timeline */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] text-slate-400">
          <span className="font-mono">
            Search Progress: Step <strong className="text-cyan-400">{Math.min(currentStepIndex + 1, totalSteps)}</strong> of <strong className="text-slate-300">{totalSteps}</strong>
          </span>
          <span className="font-mono text-slate-500">
            {totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 0}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={Math.max(0, totalSteps - 1)}
          value={currentStepIndex}
          onChange={(e) => onScrubStep(parseInt(e.target.value, 10))}
          className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
          disabled={isPlaying || totalSteps === 0}
        />
      </div>

      {/* Autonomous Driving & Dynamic Replanning Actions */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        {/* Drive Vehicle Button */}
        <button
          onClick={onDriveVehicle}
          disabled={!hasPath || isVehicleDriving}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-md cursor-pointer ${
            hasPath && !isVehicleDriving
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              : 'bg-slate-800/70 text-slate-500 border border-slate-700/50 cursor-not-allowed'
          }`}
          title={hasPath ? 'Launch Autonomous Vehicle navigation' : 'Find a valid route first'}
        >
          <Car className="w-4 h-4" />
          <span>
            {isVehicleDriving ? 'Navigating Along Path...' : 'Drive Autonomous Vehicle 🚗'}
          </span>
        </button>

        {/* Dynamic Roadblock & Cost Change triggers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onInjectRoadblock}
            disabled={!isVehicleDriving && !hasPath}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
              isVehicleDriving || hasPath
                ? 'bg-rose-950/60 text-rose-300 border-rose-700/60 hover:bg-rose-900/80 hover:text-white'
                : 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title="Inject an unexpected roadblock directly ahead of the vehicle to trigger autonomous replanning"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Block Next Road (Replan)</span>
          </button>

          <button
            onClick={onInjectDynamicTraffic}
            disabled={!isVehicleDriving && !hasPath}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
              isVehicleDriving || hasPath
                ? 'bg-amber-950/60 text-amber-300 border-amber-700/60 hover:bg-amber-900/80 hover:text-white'
                : 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
            title="Inject heavy traffic (cost 10) ahead of the vehicle"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Traffic Spike (+10)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
