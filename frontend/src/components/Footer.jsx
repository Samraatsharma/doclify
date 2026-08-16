import React from 'react';
import { Terminal, Github, Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#27272A] bg-[#09090B] py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#71717A]">
        
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          </div>
          <span className="font-display font-medium text-white tracking-tight">DOCLIFY</span>
          <span>—</span>
          <span>Your codebase. Understood.</span>
        </div>

        <div className="flex items-center gap-6 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-[#10B981]" />
            <span>CLI + Web Unified Engine</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-[#10B981]" />
            <span>Zero Data Leakage Sandbox</span>
          </span>
        </div>

        <div className="text-[11px]">
          GNU AGPL v3.0 • Built with Groq & FastAPI
        </div>
      </div>
    </footer>
  );
}
