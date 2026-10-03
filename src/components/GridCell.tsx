import React from 'react';
import { Flag, MapPin, Truck } from 'lucide-react';
import { CellWeight, GridCellData, Position } from '../types';

interface GridCellProps {
  cell: GridCellData;
  isStart: boolean;
  isDestination: boolean;
  isObstacle: boolean;
  weight: CellWeight;
  isCurrent: boolean;
  isFrontier: boolean;
  isExplored: boolean;
  isPath: boolean;
  isVehicleHere: boolean;
  vehicleHeading?: number;
  isInspected: boolean;
  pathDirection?: 'up' | 'down' | 'left' | 'right' | null;
  fScore?: number;
  gScore?: number;
  hScore?: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  gridSize: number;
}

export const GridCell: React.FC<GridCellProps> = React.memo(({
  cell,
  isStart,
  isDestination,
  isObstacle,
  weight,
  isCurrent,
  isFrontier,
  isExplored,
  isPath,
  isVehicleHere,
  vehicleHeading = 0,
  isInspected,
  pathDirection,
  fScore,
  onMouseDown,
  onMouseEnter,
  onClick,
  gridSize,
}) => {
  // Compute cell classes
  let baseBg = 'bg-slate-900/90';
  let borderClass = 'border-slate-800/80';
  let content = null;

  if (isObstacle) {
    baseBg = 'bg-slate-800 border-slate-700 shadow-inner';
  } else if (weight === 2) {
    baseBg = 'bg-amber-950/25 border-amber-900/40';
  } else if (weight === 5) {
    baseBg = 'bg-orange-950/35 border-orange-900/50';
  } else if (weight === 10) {
    baseBg = 'bg-rose-950/45 border-rose-900/60';
  }

  // Algorithm states (priority: Current > Path > Frontier > Explored)
  let searchOverlay = null;

  if (isCurrent) {
    searchOverlay = (
      <div className="absolute inset-0 bg-yellow-400/50 border-2 border-yellow-300 z-20 animate-pulse shadow-lg shadow-yellow-500/50" />
    );
  } else if (isPath) {
    searchOverlay = (
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/50 to-orange-500/60 border border-amber-400/80 z-10 shadow-md shadow-amber-500/30 flex items-center justify-center">
        {pathDirection && (
          <span
            className="text-amber-200 font-bold select-none text-[10px]"
            style={{
              transform: `rotate(${
                pathDirection === 'up'
                  ? -90
                  : pathDirection === 'down'
                  ? 90
                  : pathDirection === 'left'
                  ? 180
                  : 0
              }deg)`,
            }}
          >
            ➜
          </span>
        )}
      </div>
    );
  } else if (isFrontier) {
    searchOverlay = (
      <div className="absolute inset-0 bg-indigo-600/35 border border-indigo-400/60 z-10 animate-pulse" />
    );
  } else if (isExplored) {
    searchOverlay = (
      <div className="absolute inset-0 bg-cyan-700/25 border border-cyan-500/30 transition-colors duration-200" />
    );
  }

  // Weight badge or icon
  if (weight > 1 && !isObstacle && !isStart && !isDestination) {
    content = (
      <span
        className={`absolute bottom-0.5 right-0.5 font-mono text-[8px] font-bold px-1 rounded leading-none select-none z-15 ${
          weight === 10
            ? 'bg-rose-900/90 text-rose-200 border border-rose-700'
            : weight === 5
            ? 'bg-orange-900/90 text-orange-200 border border-orange-700'
            : 'bg-amber-900/90 text-amber-200 border border-amber-700'
        }`}
      >
        {weight}
      </span>
    );
  }

  // Start Icon
  if (isStart) {
    content = (
      <div className="absolute inset-0 flex items-center justify-center z-30 bg-emerald-600/40 border-2 border-emerald-400">
        <MapPin className="w-3/5 h-3/5 text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] fill-emerald-500" />
      </div>
    );
  }

  // Destination Icon
  if (isDestination) {
    content = (
      <div className="absolute inset-0 flex items-center justify-center z-30 bg-rose-600/40 border-2 border-rose-400 animate-pulse">
        <Flag className="w-3/5 h-3/5 text-rose-300 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)] fill-rose-500" />
      </div>
    );
  }

  // Vehicle Icon
  if (isVehicleHere) {
    content = (
      <div
        className="absolute inset-0 flex items-center justify-center z-40 transition-transform duration-150"
        style={{ transform: `rotate(${vehicleHeading}deg)` }}
      >
        <div className="relative w-4/5 h-4/5 bg-slate-900 rounded-md border-2 border-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-400/80">
          <span className="text-xs select-none">🚗</span>
          {/* Headlights beam */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-4 bg-gradient-to-r from-yellow-300/60 to-transparent clip-triangle" />
        </div>
      </div>
    );
  }

  // Obstacle diagonal hatch
  const obstacleHatch = isObstacle ? (
    <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(45deg,#334155,#334155_3px,#0f172a_3px,#0f172a_6px)]" />
  ) : null;

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`relative select-none border transition-[background-color,border-color] duration-100 cursor-pointer overflow-hidden aspect-square ${baseBg} ${borderClass} ${
        isInspected ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-950 z-30' : ''
      }`}
      title={`Node (${cell.row}, ${cell.col}) - Weight: ${weight}${
        isObstacle ? ' [WALL]' : ''
      }${fScore !== undefined ? ` [f=${fScore}]` : ''}`}
    >
      {obstacleHatch}
      {searchOverlay}
      {content}
    </div>
  );
});

GridCell.displayName = 'GridCell';
