import React, { useState } from 'react';
import { ROAD_GRAPH_SCENARIOS } from '../data/scenarios';
import { runGraphAlgorithm, GraphAlgorithmResult } from '../algorithms/graphAlgorithms';
import { AlgorithmType, GraphEdge, GraphNode } from '../types';
import { AlertCircle, CheckCircle, Navigation, Play, RotateCcw } from 'lucide-react';

interface RoadGraphViewProps {
  algorithm: AlgorithmType;
}

export const RoadGraphView: React.FC<RoadGraphViewProps> = ({ algorithm }) => {
  const scenario = ROAD_GRAPH_SCENARIOS[0];
  const [nodes, setNodes] = useState<GraphNode[]>(scenario.nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(scenario.edges);
  const [result, setResult] = useState<GraphAlgorithmResult | null>(null);

  const handleToggleEdgeBlock = (edgeId: string) => {
    setEdges((prev) =>
      prev.map((e) => (e.id === edgeId ? { ...e, blocked: !e.blocked } : e))
    );
    setResult(null);
  };

  const handleRunAlgorithm = () => {
    const res = runGraphAlgorithm(
      nodes,
      edges,
      scenario.startNodeId,
      scenario.destNodeId,
      algorithm
    );
    setResult(res);
  };

  const handleResetGraph = () => {
    setEdges(scenario.edges);
    setResult(null);
  };

  const pathEdgeSet = new Set<string>();
  if (result && result.path.length > 1) {
    for (let i = 0; i < result.path.length - 1; i++) {
      const u = result.path[i];
      const v = result.path[i + 1];
      pathEdgeSet.add(`${u}-${v}`);
      pathEdgeSet.add(`${v}-${u}`);
    }
  }

  const exploredNodeSet = new Set<string>(result?.exploredNodes || []);
  const pathNodeSet = new Set<string>(result?.path || []);

  const nodeMap = new Map<string, GraphNode>(nodes.map((n) => [n.id, n]));

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-2xl space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            Metropolitan Intersections Network (Graph Representation)
          </h2>
          <p className="text-xs text-slate-400">
            Adjacency-list road network graph. Click any road edge to toggle construction roadblocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAlgorithm}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run {algorithm.toUpperCase()} on Graph</span>
          </button>

          <button
            onClick={handleResetGraph}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700 transition cursor-pointer"
            title="Reset Graph"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full h-[450px] bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
        <svg className="w-full h-full">
          {/* Grid background pattern */}
          <defs>
            <pattern id="graph-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#graph-grid)" />

          {/* Edges */}
          {edges.map((edge) => {
            const u = nodeMap.get(edge.from);
            const v = nodeMap.get(edge.to);
            if (!u || !v) return null;

            const isPathEdge = pathEdgeSet.has(`${edge.from}-${edge.to}`);
            const isBlocked = edge.blocked;

            const midX = `${(u.x + v.x) / 2}%`;
            const midY = `${(u.y + v.y) / 2}%`;

            let strokeColor = '#334155'; // default slate-700
            let strokeWidth = '3';
            let strokeDasharray = 'none';

            if (isBlocked) {
              strokeColor = '#ef4444'; // red-500
              strokeDasharray = '6,4';
            } else if (isPathEdge) {
              strokeColor = '#f59e0b'; // amber-500 path
              strokeWidth = '5';
            }

            return (
              <g key={edge.id} className="cursor-pointer group" onClick={() => handleToggleEdgeBlock(edge.id)}>
                <line
                  x1={`${u.x}%`}
                  y1={`${u.y}%`}
                  x2={`${v.x}%`}
                  y2={`${v.y}%`}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />

                {/* Edge weight badge */}
                <circle cx={midX} cy={midY} r="12" fill="#0f172a" stroke={isBlocked ? '#ef4444' : isPathEdge ? '#f59e0b' : '#475569'} strokeWidth="1.5" />
                <text
                  x={midX}
                  y={midY}
                  dominantBaseline="central"
                  textAnchor="middle"
                  fill={isBlocked ? '#f87171' : isPathEdge ? '#fef08a' : '#94a3b8'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {isBlocked ? '✕' : edge.weight}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isStart = node.id === scenario.startNodeId;
            const isDest = node.id === scenario.destNodeId;
            const isPathNode = pathNodeSet.has(node.id);
            const isExplored = exploredNodeSet.has(node.id);

            let nodeFill = '#1e293b';
            let nodeStroke = '#64748b';
            let textColor = '#cbd5e1';

            if (isStart) {
              nodeFill = '#059669';
              nodeStroke = '#34d399';
              textColor = '#a7f3d0';
            } else if (isDest) {
              nodeFill = '#e11d48';
              nodeStroke = '#fb7185';
              textColor = '#fecdd3';
            } else if (isPathNode) {
              nodeFill = '#d97706';
              nodeStroke = '#fbbf24';
              textColor = '#fef08a';
            } else if (isExplored) {
              nodeFill = '#0e7490';
              nodeStroke = '#22d3ee';
            }

            return (
              <g key={node.id} className="transition-all duration-200">
                <circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r={isStart || isDest ? '18' : '14'}
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth="2.5"
                  className="shadow-lg"
                />
                <text
                  x={`${node.x}%`}
                  y={`${node.y}%`}
                  dominantBaseline="central"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isStart || isDest ? '11' : '9'}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {isStart ? 'S' : isDest ? 'D' : node.id.split('_')[1] || node.id}
                </text>
                {/* Node label */}
                <text
                  x={`${node.x}%`}
                  y={`${node.y + 6}%`}
                  dominantBaseline="hanging"
                  textAnchor="middle"
                  fill={textColor}
                  fontSize="10"
                  fontWeight="600"
                  className="drop-shadow-md"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-sm p-2 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Start Node
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Dest Node
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Optimal Path
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-rose-500 border-dashed border-rose-500"></span> Blocked Road (Click to toggle)
          </span>
        </div>
      </div>

      {/* Result Metrics */}
      {result && (
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {result.path.length > 0 ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span className="font-semibold text-slate-200">
              {result.path.length > 0
                ? `Route Found via ${result.path.length} Junctions`
                : 'No Connected Route (Obstacles Blocked Destination)'}
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-300">
            <div>Total Road Cost: <strong className="text-amber-300">{result.totalCost}</strong></div>
            <div>Junction Hops: <strong className="text-cyan-300">{result.hopCount}</strong></div>
            <div>Explored Junctions: <strong className="text-indigo-300">{result.exploredNodes.length}</strong></div>
            <div>Compute: <strong className="text-slate-400">{result.executionTimeMs} ms</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};
