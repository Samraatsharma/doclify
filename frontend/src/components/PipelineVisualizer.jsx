import React, { useState } from 'react';
import { Layers, FileCode, Cpu, Database, FileText, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

const stages = [
  {
    id: 'discovery',
    icon: FileCode,
    name: '1. File Discovery',
    short: 'Scanner & .gitignore',
    desc: 'Scans the directory tree using pathspec to respect user .gitignore and built-in rules, filtering non-code files and enforcing the 1MB limit.',
    badge: 'Stage 0'
  },
  {
    id: 'extraction',
    icon: Layers,
    name: '2. Context Engineering',
    short: 'Chunking & Notebook AST',
    desc: 'Reads source files and converts Jupyter Notebooks (.ipynb) code cells into clean Python streams. Large files (>40k chars) are chunked systematically.',
    badge: 'Context Prep'
  },
  {
    id: 'agents',
    icon: Cpu,
    name: '3. Batch AI Summarizers',
    short: 'Groq LLM (3-4 Sentences)',
    desc: 'Executes Stage-1 LLM generation via Groq API. Generates high-density, 3-4 sentence summaries capturing purpose, pipeline location, and interfaces.',
    badge: 'Stage 1 Map'
  },
  {
    id: 'cache',
    icon: Database,
    name: '4. Knowledge Cache',
    short: '.doclify/cache.json',
    desc: 'Persists per-file summaries in local JSON cache. Stale keys are cleaned and unchanged files bypass redundant LLM API calls on subsequent updates.',
    badge: 'Zero-Cost Sync'
  },
  {
    id: 'synthesis',
    icon: FileText,
    name: '5. Final Synthesis',
    short: 'README.md Generation',
    desc: 'Aggregates all cached file summaries and prompts the Principal Documentation LLM to synthesize a cohesive, production-ready product README.',
    badge: 'Stage 2 Reduce'
  }
];

export default function PipelineVisualizer() {
  const [activeStage, setActiveStage] = useState(stages[2]);

  return (
    <div className="w-full max-w-6xl mx-auto my-16 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] border border-[#27272A] text-xs text-[#10B981] font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>REAL DOCLIFY AGENTIC ARCHITECTURE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-2 font-display">
          How Doclify Thinks
        </h2>
        <p className="text-[#A1A1AA] text-sm sm:text-base max-w-2xl mx-auto">
          A multi-stage map-reduce pipeline engineered to turn entire codebases into structured technical knowledge without blowing LLM context windows.
        </p>
      </div>

      {/* Interactive Pipeline Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        {stages.map((st, idx) => {
          const Icon = st.icon;
          const isSelected = activeStage.id === st.id;
          return (
            <button
              key={st.id}
              onClick={() => setActiveStage(st)}
              className={`text-left p-4 rounded-xl transition-all duration-200 relative group border ${
                isSelected 
                  ? 'bg-[#18181B] border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.12)]' 
                  : 'bg-[#18181B]/50 border-[#27272A] hover:border-[#3F3F46] hover:bg-[#18181B]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#27272A] text-[#A1A1AA] group-hover:text-white'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                  {st.badge}
                </span>
              </div>
              <div className="font-medium text-xs text-white mb-1">{st.name}</div>
              <div className="text-[11px] text-[#A1A1AA] truncate">{st.short}</div>

              {idx < stages.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#3F3F46] pointer-events-none">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Stage Detail Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#27272A] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 radial-glow-subtle pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                {activeStage.badge}
              </span>
              <h3 className="text-xl font-medium text-white font-display">
                {activeStage.name}
              </h3>
            </div>
            <p className="text-sm text-[#D4D4D8] leading-relaxed">
              {activeStage.desc}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#09090B] border border-[#27272A] px-4 py-3 rounded-xl w-full md:w-auto">
            <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
            <div className="text-xs">
              <div className="text-white font-medium">Deterministic & Cached</div>
              <div className="text-[#71717A] text-[11px]">100% CLI & API compatible</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
