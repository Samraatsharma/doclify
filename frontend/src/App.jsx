import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ArrowRight, ArrowUpRight, FileCode, Layers, Cpu, 
  Database, FileText, CheckCircle2, Terminal, Shield, RefreshCw, Plus 
} from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HeroCanvas from './components/HeroCanvas';
import PipelineVisualizer from './components/PipelineVisualizer';
import Dashboard from './components/Dashboard';
import ProjectWorkspace from './components/ProjectWorkspace';
import ProjectCreateModal from './components/ProjectCreateModal';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard' | 'workspace'
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [health, setHealth] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const pipelineRef = useRef(null);

  const fetchHealthAndProjects = async () => {
    try {
      const [healthRes, projectsRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/projects')
      ]);

      if (healthRes.ok) {
        const hData = await healthRes.json();
        setHealth(hData);
      }

      if (projectsRes.ok) {
        const pData = await projectsRes.json();
        setProjects(pData.projects || []);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    fetchHealthAndProjects();
  }, []);

  const handleSelectProject = (proj) => {
    setSelectedProject(proj);
    setView('workspace');
  };

  const handleProjectCreated = (newProj) => {
    fetchHealthAndProjects();
    setSelectedProject(newProj);
    setView('workspace');
  };

  const handleProjectDeleted = (deletedId) => {
    setProjects(prev => prev.filter(p => p.id !== deletedId));
    setView('dashboard');
    setSelectedProject(null);
    fetchHealthAndProjects();
  };

  const scrollToPipeline = () => {
    if (view !== 'landing') setView('landing');
    setTimeout(() => {
      pipelineRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col selection:bg-[#10B981]/30 selection:text-[#10B981]">
      <Navbar 
        health={health}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onNavigateHome={() => setView('landing')}
        onNavigateProjects={() => setView('dashboard')}
        onScrollToPipeline={scrollToPipeline}
      />

      <main className="flex-1">
        {view === 'workspace' && selectedProject ? (
          <ProjectWorkspace 
            project={selectedProject}
            onBack={() => setView('dashboard')}
            onProjectDeleted={handleProjectDeleted}
          />
        ) : view === 'dashboard' ? (
          <Dashboard 
            projects={projects}
            onSelectProject={handleSelectProject}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        ) : (
          /* Landing Page View */
          <div>
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center justify-center pt-16 pb-24 overflow-hidden">
              <HeroCanvas />

              <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
                
                {/* Version badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#10B981] shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>DOCLIFY v0.2.2 • GROQ ACCELERATED</span>
                </div>

                {/* Main Headline (DESIGN.md / Verdant style) */}
                <h1 className="text-5xl sm:text-7xl font-light text-white tracking-[-0.05em] font-display leading-[1.08] max-w-4xl mx-auto">
                  Your codebase. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-400">
                    Understood.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-[#A1A1AA] font-light max-w-2xl mx-auto leading-relaxed font-sans">
                  AI-powered codebase intelligence that turns complex software projects into clear, living documentation. Multi-stage agentic synthesis with zero context loss.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
                  <button
                    onClick={() => {
                      if (projects.length > 0) {
                        handleSelectProject(projects[0]);
                      } else {
                        setIsCreateModalOpen(true);
                      }
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-medium bg-white text-[#18181B] hover:bg-[#10B981] hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] font-sans"
                  >
                    <span>Analyze a project</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={scrollToPipeline}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-[#18181B]/80 hover:bg-[#27272A] text-[#D4D4D8] hover:text-white transition-all border border-[#27272A] font-sans"
                  >
                    <span>See how it works</span>
                  </button>
                </div>

                {/* Quick Stats Banner */}
                <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
                  <div className="glass-card p-4 rounded-xl border border-[#27272A]">
                    <div className="text-[11px] font-mono text-[#71717A]">TOKEN EFFICIENCY</div>
                    <div className="text-xl font-light text-white font-display mt-0.5">2-Stage Map-Reduce</div>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-[#27272A]">
                    <div className="text-[11px] font-mono text-[#71717A]">CACHE REUSE</div>
                    <div className="text-xl font-light text-[#10B981] font-display mt-0.5">Zero API Waste</div>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-[#27272A]">
                    <div className="text-[11px] font-mono text-[#71717A]">CLI ENGINE</div>
                    <div className="text-xl font-light text-white font-display mt-0.5">100% Preserved</div>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-[#27272A]">
                    <div className="text-[11px] font-mono text-[#71717A]">INFERENCE SPEED</div>
                    <div className="text-xl font-light text-[#34D399] font-display mt-0.5">Groq LPUs</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pipeline Visualizer Section */}
            <section ref={pipelineRef} className="py-16 border-t border-[#27272A]/80 bg-[#09090B]">
              <PipelineVisualizer />
            </section>

            {/* Feature Highlights Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-light text-white font-display tracking-tight mb-2">
                  Engineered for Real Engineering Teams
                </h2>
                <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl mx-auto">
                  From individual developers documenting weekend projects to software teams maintaining living architectural context.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-7 border border-[#27272A] space-y-3">
                  <div className="p-2.5 rounded-xl bg-[#10B981]/15 text-[#10B981] w-fit">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-medium text-white font-display">Smart File Extraction</h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    Respects <code className="text-[#10B981]">.gitignore</code> rules, skips binaries and dependencies, and intelligently parses Jupyter Notebooks (<code className="text-[#10B981]">.ipynb</code>) into executable code streams.
                  </p>
                </div>

                <div className="glass-card rounded-2xl p-7 border border-[#27272A] space-y-3">
                  <div className="p-2.5 rounded-xl bg-[#10B981]/15 text-[#10B981] w-fit">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-medium text-white font-display">Local JSON Knowledge Cache</h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    Summaries are stored in <code className="text-[#10B981]">.doclify/cache.json</code>. When you modify a single file, only that file's summary is recomputed, eliminating redundant API costs.
                  </p>
                </div>

                <div className="glass-card rounded-2xl p-7 border border-[#27272A] space-y-3">
                  <div className="p-2.5 rounded-xl bg-[#10B981]/15 text-[#10B981] w-fit">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-medium text-white font-display">Dual CLI & Web Interface</h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    Run <code className="text-[#10B981]">doclify run</code> directly in your terminal, or use the Verdant-styled web dashboard for interactive visual documentation and live SSE progress streaming.
                  </p>
                </div>
              </div>

              {/* Call to action card */}
              <div className="mt-16 glass-panel rounded-3xl p-8 sm:p-12 border border-[#27272A] text-center relative overflow-hidden">
                <div className="absolute inset-0 radial-glow-hero pointer-events-none" />
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-light text-white font-display">
                    Ready to turn your codebase into living documentation?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A1AA]">
                    Launch Doclify on your local machine with a single click or command.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium bg-white text-[#18181B] hover:bg-[#10B981] hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] font-sans"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />

      {/* Project Creation Modal */}
      <ProjectCreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
