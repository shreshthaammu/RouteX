import React, { useRef, useState } from 'react';
import { GridCellData, Position } from '../types';
import { GridCell } from './GridCell';
import { posToKey } from '../algorithms/common';

interface GridMapProps {
  grid: GridCellData[][];
  startPos: Position;
  destPos: Position;
  currentStepNode: Position | null;
  frontierKeys: Set<string>;
  exploredKeys: Set<string>;
  path: Position[];
  vehiclePos: Position | null;
  vehicleHeading: number;
  inspectedNode: Position | null;
  fScores?: Record<string, number>;
  gScores?: Record<string, number>;
  hScores?: Record<string, number>;
  onCellMouseDown: (row: number, col: number) => void;
  onCellMouseEnter: (row: number, col: number) => void;
  onCellClick: (row: number, col: number) => void;
}

export const GridMap: React.FC<GridMapProps> = ({
  grid,
  startPos,
  destPos,
  currentStepNode,
  frontierKeys,
  exploredKeys,
  path,
  vehiclePos,
  vehicleHeading,
  inspectedNode,
  fScores,
  gScores,
  hScores,
  onCellMouseDown,
  onCellMouseEnter,
  onCellClick,
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute set of path coordinates & direction mapping for arrows
  const pathSet = new Set<string>();
  const pathDirections = new Map<string, 'up' | 'down' | 'left' | 'right'>();

  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    const key = posToKey(p);
    pathSet.add(key);

    if (i < path.length - 1) {
      const next = path[i + 1];
      const dr = next.row - p.row;
      const dc = next.col - p.col;
      if (dr === -1) pathDirections.set(key, 'up');
      else if (dr === 1) pathDirections.set(key, 'down');
      else if (dc === -1) pathDirections.set(key, 'left');
      else if (dc === 1) pathDirections.set(key, 'right');
    }
  }

  const handleContainerMouseDown = () => {
    setIsMouseDown(true);
  };

  const handleContainerMouseUp = () => {
    setIsMouseDown(false);
  };

  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      onMouseUp={handleContainerMouseUp}
      onMouseLeave={handleContainerMouseUp}
      className="flex flex-col items-center justify-center p-3 bg-slate-950/80 border border-slate-800 rounded-xl shadow-2xl overflow-hidden"
    >
      {/* Map Board */}
      <div
        className="grid gap-[1px] bg-slate-800/80 p-1.5 rounded-lg max-w-full max-h-[68vh] overflow-auto shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          width: cols > 20 ? '100%' : 'auto',
          minWidth: '280px',
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const key = posToKey(cell);
            const isStart = cell.isStart || (startPos.row === r && startPos.col === c);
            const isDestination = cell.isDestination || (destPos.row === r && destPos.col === c);
            const isCurrent =
              currentStepNode !== null && currentStepNode.row === r && currentStepNode.col === c;
            const isFrontier = frontierKeys.has(key);
            const isExplored = exploredKeys.has(key);
            const isPath = pathSet.has(key);
            const isVehicleHere =
              vehiclePos !== null && vehiclePos.row === r && vehiclePos.col === c;
            const isInspected =
              inspectedNode !== null && inspectedNode.row === r && inspectedNode.col === c;
            const pathDir = pathDirections.get(key) || null;

            return (
              <GridCell
                key={`${r}-${c}`}
                cell={cell}
                isStart={isStart}
                isDestination={isDestination}
                isObstacle={cell.isObstacle}
                weight={cell.weight}
                isCurrent={isCurrent}
                isFrontier={isFrontier}
                isExplored={isExplored}
                isPath={isPath}
                isVehicleHere={isVehicleHere}
                vehicleHeading={vehicleHeading}
                isInspected={isInspected}
                pathDirection={pathDir}
                fScore={fScores?.[key]}
                gScore={gScores?.[key]}
                hScore={hScores?.[key]}
                gridSize={rows}
                onMouseDown={() => onCellMouseDown(r, c)}
                onMouseEnter={() => {
                  if (isMouseDown) onCellMouseEnter(r, c);
                }}
                onClick={() => onCellClick(r, c)}
              />
            );
          })
        )}
      </div>

      {/* Visual Legend Bar */}
      <div className="w-full mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-y-1.5 text-[10px] text-slate-400">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-400 shadow-sm" />
            <span>Start</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 border border-rose-400 shadow-sm" />
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-700 border border-slate-600 shadow-sm" />
            <span>Obstacle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500 text-[8px] font-mono flex items-center justify-center font-bold text-amber-200">
              2
            </span>
            <span>Cost 2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-orange-500/50 border border-orange-500 text-[8px] font-mono flex items-center justify-center font-bold text-orange-200">
              5
            </span>
            <span>Cost 5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-700/60 border border-rose-500 text-[8px] font-mono flex items-center justify-center font-bold text-rose-200">
              10
            </span>
            <span>Cost 10</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-700/40 border border-cyan-400/60" />
            <span>Explored</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600/50 border border-indigo-400 animate-pulse" />
            <span>Frontier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-yellow-400/80 border border-yellow-300" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400 border border-amber-300 shadow-sm" />
            <span>Final Path</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-cyan-300">
            <span>🚗 Vehicle</span>
          </div>
        </div>
      </div>
    </div>
  );
};
