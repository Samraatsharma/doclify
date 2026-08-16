import React from 'react';
import { Sparkles, Terminal, Plus, Github, Layers } from 'lucide-react';

export default function Navbar({ health, onOpenCreateModal, onNavigateHome, onNavigateProjects, onScrollToPipeline }) {
  return (
    <nav className="border-b border-[#27272A] bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center group-hover:border-[#10B981] transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />
            </div>
            <span className="text-lg font-medium text-white tracking-tight font-display">
              DOCLIFY
            </span>
          </button>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-5 text-xs text-[#A1A1AA]">
            <button onClick={onNavigateProjects} className="hover:text-white transition-colors">
              Projects
            </button>
            <button onClick={onScrollToPipeline} className="hover:text-white transition-colors">
              Agent Architecture
            </button>
            <a 
              href="https://github.com/KalyanM45/Doclify" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Right Status & Action */}
        <div className="flex items-center gap-3">
          {/* Health Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#D4D4D8]">
            <span className={`w-1.5 h-1.5 rounded-full ${health?.has_api_key ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]' : 'bg-yellow-400'}`} />
            <span>{health?.has_api_key ? 'Groq Active' : 'API Key Missing'}</span>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-white text-[#18181B] hover:bg-[#10B981] hover:text-white transition-all shadow-sm font-sans"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
