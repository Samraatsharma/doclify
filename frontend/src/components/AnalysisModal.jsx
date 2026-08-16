import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Loader2, Terminal, ArrowRight, X } from 'lucide-react';

export default function AnalysisModal({ isOpen, onClose, project, model, onComplete }) {
  const [phase, setPhase] = useState('starting');
  const [progress, setProgress] = useState(0.05);
  const [currentMessage, setCurrentMessage] = useState('Connecting to Doclify Engine...');
  const [logs, setLogs] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [finalReadme, setFinalReadme] = useState('');
  const [isTpdQuota, setIsTpdQuota] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !project) return;

    // Reset state
    setPhase('starting');
    setProgress(0.05);
    setCurrentMessage('Starting Doclify agent pipeline...');
    setLogs(['[Doclify Engine] Pipeline initiated for project: ' + project.name]);
    setIsDone(false);
    setHasError(false);
    setIsTpdQuota(false);
    setFinalReadme('');

    const queryParams = model ? `?model=${encodeURIComponent(model)}` : '';
    const url = `/api/projects/${project.id}/analyze${queryParams}`;

    const controller = new AbortController();

    const startStream = async () => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // keep remaining partial line

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              try {
                const data = JSON.parse(trimmed.slice(5).trim());
                if (data.phase) setPhase(data.phase);
                if (data.progress !== undefined) setProgress(data.progress);
                if (data.is_tpd) setIsTpdQuota(true);
                if (data.message) {
                  setCurrentMessage(data.message);
                  setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${data.message}`]);
                }
                if (data.phase === 'complete') {
                  setIsDone(true);
                  if (data.readme) setFinalReadme(data.readme);
                  if (onComplete) onComplete(data);
                }
                if (data.phase === 'error') {
                  setHasError(true);
                  setIsDone(true);
                  if (data.is_tpd || data.message?.includes('daily token limit')) {
                    setIsTpdQuota(true);
                  }
                }
              } catch (parseErr) {
                // Heartbeat or non-json message
              }
            }
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setHasError(true);
          setIsDone(true);
          setCurrentMessage(`Analysis Error: ${err.message}`);
          setLogs((prev) => [...prev, `[ERROR] ${err.message}`]);
        }
      }
    };

    startStream();

    return () => {
      controller.abort();
    };
  }, [isOpen, project, model]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A] bg-[#121215]">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${
              isTpdQuota 
                ? 'bg-yellow-500/20 text-yellow-400' 
                : hasError 
                ? 'bg-red-500/20 text-red-400' 
                : isDone 
                ? 'bg-[#10B981]/20 text-[#10B981]' 
                : 'bg-[#10B981]/20 text-[#10B981] animate-pulse'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white font-display">
                {isDone ? (isTpdQuota ? 'Quota Limit Paused' : hasError ? 'Analysis Failed' : 'Documentation Ready') : 'Doclify Multi-Stage Analysis'}
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                {project.name} • {model || 'Default LLM'}
              </p>
            </div>
          </div>

          {isDone && (
            <button 
              onClick={onClose}
              className="text-[#71717A] hover:text-white p-1 rounded-lg hover:bg-[#27272A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar & Status */}
        <div className="p-6 border-b border-[#27272A] bg-[#18181B]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-mono text-[#D4D4D8] flex items-center gap-2">
              {!isDone && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#10B981]" />}
              {currentMessage}
            </span>
            <span className="font-mono text-[#10B981] font-medium">
              {Math.round(progress * 100)}%
            </span>
          </div>

          <div className="w-full bg-[#09090B] h-2 rounded-full overflow-hidden border border-[#27272A]">
            <div 
              className={`h-full transition-all duration-300 ${
                isTpdQuota ? 'bg-yellow-500' : hasError ? 'bg-red-500' : isDone ? 'bg-[#10B981]' : 'bg-gradient-to-r from-[#10B981] to-[#34D399]'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, progress * 100))}%` }}
            />
          </div>

          {/* TPD Quota Alert Banner */}
          {isTpdQuota && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-2.5 text-xs text-yellow-300 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-200">Groq Daily Token Allowance Reached</div>
                <div className="text-yellow-300/80 mt-0.5 leading-relaxed">
                  Completed summaries have been safely preserved in local cache. You can resume analysis once the daily quota resets or select another model in Config & Model.
                </div>
              </div>
            </div>
          )}

          {/* Phase Badge Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] font-mono">
            {['discovery', 'extracting', 'summarizing', 'synthesizing', 'complete'].map((p) => {
              const active = phase === p;
              const past = 
                (p === 'discovery' && phase !== 'starting') ||
                (p === 'extracting' && (phase === 'summarizing' || phase === 'cache_saved' || phase === 'synthesizing' || phase === 'complete')) ||
                (p === 'summarizing' && (phase === 'cache_saved' || phase === 'synthesizing' || phase === 'complete')) ||
                (p === 'synthesizing' && phase === 'complete');

              return (
                <div 
                  key={p} 
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors border ${
                    active 
                      ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]' 
                      : past 
                      ? 'bg-[#27272A]/50 border-transparent text-[#A1A1AA]' 
                      : 'bg-transparent border-[#27272A] text-[#71717A]'
                  }`}
                >
                  {past && <CheckCircle2 className="w-3 h-3 text-[#10B981]" />}
                  {active && <Loader2 className="w-3 h-3 animate-spin text-[#10B981]" />}
                  <span className="capitalize">{p}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal Stream Output */}
        <div className="p-6 bg-[#09090B]">
          <div className="flex items-center justify-between text-xs text-[#71717A] mb-2 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" />
              <span>EXECUTION TRACE</span>
            </div>
            <span>STREAMING</span>
          </div>

          <div className="bg-[#121215] border border-[#27272A] rounded-xl p-4 font-mono text-xs text-[#D4D4D8] h-48 overflow-y-auto space-y-1.5">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log.includes('ERROR') ? (
                  <span className="text-red-400">{log}</span>
                ) : log.includes('Analyzing') ? (
                  <span className="text-[#34D399]">{log}</span>
                ) : log.includes('Generated') || log.includes('successfully') ? (
                  <span className="text-[#10B981] font-semibold">{log}</span>
                ) : (
                  <span>{log}</span>
                )}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-[#121215] border-t border-[#27272A] flex items-center justify-between">
          <div className="text-xs text-[#71717A]">
            {isDone ? (hasError ? 'Check API keys or logs' : 'All artifacts saved to .doclify/') : 'Do not close this modal while agents are running.'}
          </div>

          {isDone ? (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium bg-white text-[#18181B] hover:bg-[#10B981] hover:text-white transition-all shadow-md font-sans"
            >
              <span>View Documentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#10B981] font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Agents Working...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
