import React from 'react';
import { 
  Activity, 
  BatteryCharging, 
  Compass, 
  Gauge, 
  Milestone, 
  RefreshCw, 
  Route 
} from 'lucide-react';
import { VehicleTelemetry } from '../types';

interface TelemetryHUDProps {
  telemetry: VehicleTelemetry;
  totalPathLength: number;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  telemetry,
  totalPathLength,
}) => {
  const getStatusColor = () => {
    switch (telemetry.status) {
      case 'navigating':
        return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40';
      case 'blocked_replanning':
        return 'text-amber-400 border-amber-500/50 bg-amber-950/40 animate-pulse';
      case 'reached':
        return 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-900/60';
    }
  };

  const progressPercent = totalPathLength > 1 
    ? Math.min(100, Math.round((telemetry.pathIndex / (totalPathLength - 1)) * 100))
    : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                telemetry.status === 'navigating' ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                telemetry.status === 'navigating'
                  ? 'bg-emerald-500'
                  : telemetry.status === 'blocked_replanning'
                  ? 'bg-amber-500'
                  : 'bg-slate-500'
              }`}
            />
          </span>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Vehicle Telemetry & HUD
          </h3>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${getStatusColor()}`}
        >
          {telemetry.status.replace('_', ' ')}
        </span>
      </div>

      {/* Grid of Telemetry Sensors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Current Position */}
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
            <Milestone className="w-3 h-3 text-cyan-400" />
            <span>Waypoint Pos</span>
          </div>
          <div className="font-mono text-cyan-300 font-bold text-sm">
            ({telemetry.currentPosition.row}, {telemetry.currentPosition.col})
          </div>
          <div className="text-[10px] text-slate-500">
            Node {telemetry.pathIndex + 1} of {Math.max(1, totalPathLength)}
          </div>
        </div>

        {/* Heading & Gyro */}
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
            <Compass className="w-3 h-3 text-indigo-400" />
            <span>Heading Bearing</span>
          </div>
          <div className="font-mono text-indigo-300 font-bold text-sm flex items-center gap-1">
            <span>{telemetry.heading}°</span>
            <span
              className="inline-block transform transition-transform"
              style={{ transform: `rotate(${telemetry.heading}deg)` }}
            >
              ➜
            </span>
          </div>
          <div className="text-[10px] text-slate-500">
            {telemetry.heading === 0 ? 'East' : telemetry.heading === 90 ? 'South' : telemetry.heading === 180 ? 'West' : 'North'}
          </div>
        </div>

        {/* Accumulated Transit Cost */}
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
            <Gauge className="w-3 h-3 text-amber-400" />
            <span>Transit Cost Expended</span>
          </div>
          <div className="font-mono text-amber-300 font-bold text-sm">
            {telemetry.accumulatedCost}
          </div>
          <div className="text-[10px] text-slate-500">Weighted road cost</div>
        </div>

        {/* Replan Count */}
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
            <RefreshCw className="w-3 h-3 text-rose-400" />
            <span>Dynamic Replans</span>
          </div>
          <div className="font-mono text-rose-300 font-bold text-sm">
            {telemetry.replanCount}
          </div>
          <div className="text-[10px] text-slate-500">Obstacle adaptations</div>
        </div>
      </div>

      {/* Route Journey Progress Bar */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/60">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
          <span>Route Traversal: {telemetry.pathIndex} / {Math.max(0, totalPathLength - 1)} Hops</span>
          <span className="text-cyan-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 h-full transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
