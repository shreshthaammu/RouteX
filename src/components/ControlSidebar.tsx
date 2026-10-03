import React, { useState } from 'react';
import { 
  Building2, 
  Dices, 
  Eraser, 
  Flag, 
  MapPin, 
  RotateCcw, 
  Sliders, 
  Trash2, 
  ShieldAlert, 
  Truck
} from 'lucide-react';
import { CellWeight, Position, Scenario } from '../types';
import { PRESET_SCENARIOS } from '../data/scenarios';

export type ToolMode = 
  | 'start' 
  | 'destination' 
  | 'obstacle' 
  | 'weight_1' 
  | 'weight_2' 
  | 'weight_5' 
  | 'weight_10' 
  | 'eraser';

interface ControlSidebarProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  selectedTool: ToolMode;
  onSelectTool: (tool: ToolMode) => void;
  startPos: Position;
  destPos: Position;
  obstacleCount: number;
  weightedCellCount: number;
  onLoadScenario: (scenario: Scenario) => void;
  onGenerateRandom: (density: number, variation: 'low' | 'medium' | 'high') => void;
  onClearObstacles: () => void;
  onClearWeights: () => void;
  onResetGrid: () => void;
  disabled?: boolean;
}

export const ControlSidebar: React.FC<ControlSidebarProps> = ({
  gridSize,
  onGridSizeChange,
  selectedTool,
  onSelectTool,
  startPos,
  destPos,
  obstacleCount,
  weightedCellCount,
  onLoadScenario,
  onGenerateRandom,
  onClearObstacles,
  onClearWeights,
  onResetGrid,
  disabled = false,
}) => {
  const [randomDensity, setRandomDensity] = useState<number>(0.2);
  const [costVariation, setCostVariation] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('urban-traffic');

  const tools: { id: ToolMode; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    {
      id: 'start',
      label: 'Vehicle Start',
      icon: <MapPin className="w-3.5 h-3.5" />,
      color: 'bg-emerald-600/30 text-emerald-400 border-emerald-500/50',
      desc: 'Set Start Location',
    },
    {
      id: 'destination',
      label: 'Target Destination',
      icon: <Flag className="w-3.5 h-3.5" />,
      color: 'bg-rose-600/30 text-rose-400 border-rose-500/50',
      desc: 'Set Destination Point',
    },
    {
      id: 'obstacle',
      label: 'Roadblock (Wall)',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      color: 'bg-slate-700/80 text-slate-200 border-slate-600',
      desc: 'Impassable barrier',
    },
    {
      id: 'weight_1',
      label: 'Clear Road (Cost 1)',
      icon: <span className="font-mono text-xs font-bold">1</span>,
      color: 'bg-slate-800 text-slate-300 border-slate-700',
      desc: 'Normal transit speed',
    },
    {
      id: 'weight_2',
      label: 'Moderate (Cost 2)',
      icon: <span className="font-mono text-xs font-bold text-amber-400">2</span>,
      color: 'bg-amber-950/40 text-amber-400 border-amber-700/50',
      desc: 'Medium traffic delay',
    },
    {
      id: 'weight_5',
      label: 'Heavy (Cost 5)',
      icon: <span className="font-mono text-xs font-bold text-orange-400">5</span>,
      color: 'bg-orange-950/40 text-orange-400 border-orange-700/50',
      desc: 'Heavy congestion bottleneck',
    },
    {
      id: 'weight_10',
      label: 'Extreme (Cost 10)',
      icon: <Truck className="w-3.5 h-3.5 text-red-400" />,
      color: 'bg-rose-950/40 text-rose-400 border-rose-700/50',
      desc: 'Severe gridlock zone',
    },
    {
      id: 'eraser',
      label: 'Eraser',
      icon: <Eraser className="w-3.5 h-3.5" />,
      color: 'bg-slate-800 text-slate-400 border-slate-700',
      desc: 'Clear to normal',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-4 shadow-lg">
      {/* Interactive Brush Tools */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            Interactive Map Painter
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Click or Drag</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {tools.map((t) => {
            const isActive = selectedTool === t.id;
            return (
              <button
                key={t.id}
                disabled={disabled}
                onClick={() => onSelectTool(t.id)}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border text-left transition cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-indigo-400 shadow-md ' + t.color
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={t.desc}
              >
                <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-900/80 shrink-0">
                  {t.icon}
                </div>
                <div className="overflow-hidden">
                  <div className="truncate text-[11px] font-semibold">{t.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coordinate Telemetry */}
      <div className="bg-slate-950/70 rounded-lg p-2.5 border border-slate-800/80 text-[11px] space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Start:
          </span>
          <span className="font-mono text-emerald-300 font-semibold">
            ({startPos.row}, {startPos.col})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Destination:
          </span>
          <span className="font-mono text-rose-300 font-semibold">
            ({destPos.row}, {destPos.col})
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-500">
          <span>Obstacles: <strong className="text-slate-300">{obstacleCount}</strong></span>
          <span>Weighted Roads: <strong className="text-amber-300">{weightedCellCount}</strong></span>
        </div>
      </div>

      {/* Prebuilt Scenarios */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            Prebuilt Scenarios
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Presets</span>
        </div>

        <select
          disabled={disabled}
          value={selectedScenarioId}
          onChange={(e) => {
            setSelectedScenarioId(e.target.value);
            const found = PRESET_SCENARIOS.find((s) => s.id === e.target.value);
            if (found) onLoadScenario(found);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
        >
          {PRESET_SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.tag})
            </option>
          ))}
        </select>
        
        {/* Scenario description */}
        <p className="mt-1 text-[10px] text-slate-400 italic leading-snug">
          {PRESET_SCENARIOS.find((s) => s.id === selectedScenarioId)?.description}
        </p>
      </div>

      {/* Random Map Generator */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            Random Generator
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Procedural</span>
        </div>

        <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Obstacle Density:</span>
              <span className="font-mono text-cyan-400 font-bold">{Math.round(randomDensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.4"
              step="0.05"
              value={randomDensity}
              onChange={(e) => setRandomDensity(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded"
              disabled={disabled}
            />
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Traffic Variation:</span>
            <div className="grid grid-cols-3 gap-1">
              {(['low', 'medium', 'high'] as const).map((v) => (
                <button
                  key={v}
                  disabled={disabled}
                  onClick={() => setCostVariation(v)}
                  className={`py-1 text-[10px] uppercase font-mono rounded border transition cursor-pointer ${
                    costVariation === v
                      ? 'bg-amber-600/40 text-amber-300 border-amber-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={disabled}
            onClick={() => onGenerateRandom(randomDensity, costVariation)}
            className="w-full mt-1 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            Generate Environment
          </button>
        </div>
      </div>

      {/* Grid Dimension */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Grid Scale
          </span>
          <span className="font-mono text-xs text-indigo-400 font-semibold">{gridSize} × {gridSize}</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {[10, 15, 18, 20, 25].map((size) => (
            <button
              key={size}
              disabled={disabled}
              onClick={() => onGridSizeChange(size)}
              className={`py-1 text-[11px] font-mono rounded border transition cursor-pointer ${
                gridSize === size
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {size}×{size}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Reset Tools */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            disabled={disabled}
            onClick={onClearObstacles}
            className="py-1 px-2 text-[10px] font-medium rounded bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Clear Walls
          </button>
          <button
            disabled={disabled}
            onClick={onClearWeights}
            className="py-1 px-2 text-[10px] font-medium rounded bg-slate-950 text-slate-400 hover:text-amber-400 border border-slate-800 hover:border-amber-900 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Costs
          </button>
        </div>
        <button
          disabled={disabled}
          onClick={onResetGrid}
          className="w-full py-1 px-2 text-[10px] font-medium rounded bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
        >
          Clear Everything to Blank
        </button>
      </div>
    </div>
  );
};
