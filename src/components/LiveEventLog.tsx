import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

interface LiveEventLogProps {
  logs: string[];
  onClearLogs: () => void;
}

export const LiveEventLog: React.FC<LiveEventLogProps> = ({ logs, onClearLogs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col h-56">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          Live Algorithm Event Stream
        </h3>
        <button
          onClick={onClearLogs}
          className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 transition cursor-pointer"
          title="Clear Logs"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[10px] text-slate-300 overflow-y-auto space-y-1 select-text"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">No events logged yet. Execute algorithm to view trace events.</div>
        ) : (
          logs.map((log, idx) => {
            let textColor = 'text-slate-400';
            if (log.includes('Goal') || log.includes('reached')) textColor = 'text-emerald-300 font-semibold';
            else if (log.includes('Relax') || log.includes('updated')) textColor = 'text-amber-300';
            else if (log.includes('Terminated') || log.includes('Blocked')) textColor = 'text-rose-400 font-bold';
            else if (log.includes('Open Set') || log.includes('Queue')) textColor = 'text-cyan-300';

            return (
              <div key={idx} className={`leading-relaxed border-b border-slate-900/50 pb-0.5 ${textColor}`}>
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
