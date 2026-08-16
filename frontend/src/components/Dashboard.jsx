import React, { useState } from 'react';
import { 
  Plus, FolderGit2, FileText, ArrowUpRight, Sparkles, Clock, 
  Layers, CheckCircle, AlertCircle, Database, ChevronRight 
} from 'lucide-react';

export default function Dashboard({ projects = [], onSelectProject, onOpenCreateModal }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-light text-white font-display tracking-tight">
            Codebase Projects
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            Manage your connected software repositories and live documentation pipelines.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-white text-[#18181B] hover:bg-[#10B981] hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] font-sans shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => {
          const stats = proj.stats || {};
          const isDocumented = Boolean(stats.has_readme);
          const langKeys = Object.keys(stats.languages || {}).slice(0, 4);

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj)}
              className="glass-card rounded-2xl p-6 border border-[#27272A] cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 radial-glow-subtle opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div>
                {/* Status & Type Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isDocumented ? 'bg-[#10B981] ring-4 ring-[#10B981]/15' : 'bg-yellow-400 animate-ping'}`} />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                      {isDocumented ? 'Ready' : 'Needs Analysis'}
                    </span>
                  </div>

                  {proj.is_active_repo && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                      ACTIVE REPO
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-medium text-white group-hover:text-[#10B981] transition-colors font-display tracking-tight mb-1 flex items-center justify-between">
                  <span>{proj.name}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#71717A] group-hover:text-[#10B981] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </h3>

                <p className="text-xs text-[#71717A] font-mono truncate mb-4">
                  {proj.path}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="pt-4 border-t border-[#27272A]/70 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A]">
                    <div className="text-[#71717A] text-[10px]">FILES</div>
                    <div className="text-white font-medium text-sm mt-0.5">{stats.files_count || 0}</div>
                  </div>

                  <div className="bg-[#09090B] p-2.5 rounded-xl border border-[#27272A]">
                    <div className="text-[#71717A] text-[10px]">CACHED</div>
                    <div className="text-[#10B981] font-medium text-sm mt-0.5">{stats.cached_summaries_count || 0}</div>
                  </div>
                </div>

                {/* Language Pills */}
                {langKeys.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {langKeys.map(lang => (
                      <span key={lang} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#27272A]/60 text-[#A1A1AA]">
                        {lang}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty add project card */}
        <button
          onClick={onOpenCreateModal}
          className="border-2 border-dashed border-[#27272A] hover:border-[#10B981]/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all bg-[#09090B]/40 hover:bg-[#18181B]/40 min-h-[260px] group"
        >
          <div className="p-3 rounded-full bg-[#18181B] group-hover:bg-[#10B981]/15 text-[#71717A] group-hover:text-[#10B981] mb-3 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-sm font-medium text-white mb-1">Import Codebase</div>
          <div className="text-xs text-[#71717A] max-w-xs">
            Connect local directory, upload ZIP, or clone GitHub repo.
          </div>
        </button>
      </div>
    </div>
  );
}
