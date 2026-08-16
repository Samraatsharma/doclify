import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Sparkles, RefreshCw, FileCode, CheckCircle, Clock, 
  Layers, Settings, Code, ExternalLink, Cpu, Trash2, ShieldCheck, Database
} from 'lucide-react';
import FileExplorer from './FileExplorer';
import ReadmeViewer from './ReadmeViewer';
import AnalysisModal from './AnalysisModal';
import PipelineVisualizer from './PipelineVisualizer';

export default function ProjectWorkspace({ project, onBack, onProjectDeleted }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'files' | 'readme' | 'settings'
  const [projectData, setProjectData] = useState(project);
  const [filesData, setFilesData] = useState([]);
  const [readmeData, setReadmeData] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(project.config?.llm?.model || 'llama-3.3-70b-versatile');
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProjectDetails = async () => {
    try {
      const [projRes, filesRes, readmeRes, modelsRes] = await Promise.all([
        fetch(`/api/projects/${project.id}`),
        fetch(`/api/projects/${project.id}/files`),
        fetch(`/api/projects/${project.id}/readme`),
        fetch('/api/models')
      ]);

      if (projRes.ok) {
        const data = await projRes.json();
        setProjectData(data);
        if (data.config?.llm?.model) setSelectedModel(data.config.llm.model);
      }
      if (filesRes.ok) {
        const data = await filesRes.json();
        setFilesData(data.files || []);
      }
      if (readmeRes.ok) {
        const data = await readmeRes.json();
        setReadmeData(data);
      }
      if (modelsRes.ok) {
        const data = await modelsRes.json();
        setModels(data.models || []);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [project.id]);

  const handleModelChange = async (newModel) => {
    setSelectedModel(newModel);
    try {
      await fetch('/api/config/default-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: newModel, project_id: project.id })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (project.id === 'current') return;
    if (confirm(`Are you sure you want to remove project "${projectData.name}" from Doclify?`)) {
      try {
        const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
        if (res.ok) {
          if (onProjectDeleted) onProjectDeleted(project.id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const hasSummaries = Boolean(projectData.stats?.cached_summaries_count > 0);
  const isDocReady = hasSummaries && Boolean(readmeData?.exists || projectData.stats?.has_readme);

  return (
    <div className="min-h-screen bg-[#09090B] pb-24">
      {/* Workspace Sub-Nav Header */}
      <div className="border-b border-[#27272A] bg-[#121215]/90 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] text-[#A1A1AA] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-medium text-white font-display tracking-tight">
                  {projectData.name}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${
                  isDocReady 
                    ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' 
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDocReady ? 'bg-[#10B981]' : 'bg-yellow-400 animate-ping'}`} />
                  {isDocReady ? 'DOCUMENTED' : 'NEEDS ANALYSIS'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#71717A] mt-0.5 font-mono">
                <span className="truncate max-w-xs">{projectData.path}</span>
                <span>•</span>
                <span>{projectData.stats?.files_count || filesData.length} files</span>
                <span>•</span>
                <span>{projectData.stats?.cached_summaries_count || 0} cached summaries</span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            {/* Model Selector Pill */}
            <div className="flex items-center gap-1.5 bg-[#18181B] border border-[#27272A] rounded-full px-3 py-1.5 text-xs text-[#D4D4D8]">
              <Cpu className="w-3.5 h-3.5 text-[#10B981]" />
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-mono"
              >
                {models.length > 0 ? (
                  models.map(m => <option key={m.id} value={m.id} className="bg-[#18181B]">{m.id}</option>)
                ) : (
                  <option value={selectedModel} className="bg-[#18181B]">{selectedModel}</option>
                )}
              </select>
            </div>

            <button
              onClick={() => setIsAnalysisOpen(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium bg-[#10B981] hover:bg-[#059669] text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] font-sans"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hasSummaries ? 'Re-Analyze Codebase' : 'Analyze Codebase'}</span>
            </button>

            {project.id !== 'current' && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-full bg-[#18181B] border border-[#27272A] hover:border-red-800/60 text-[#71717A] hover:text-red-400 transition-colors"
                title="Remove Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-6 text-xs font-medium border-t border-[#27272A]/50">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'files', label: 'Files & AI Cache', icon: FileCode, count: filesData.length },
            { id: 'readme', label: 'README.md', icon: Code },
            { id: 'settings', label: 'Config & Model', icon: Settings }
          ].map(t => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 py-3 border-b-2 transition-colors ${
                  isSel 
                    ? 'border-[#10B981] text-white' 
                    : 'border-transparent text-[#71717A] hover:text-[#D4D4D8]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-[#10B981]' : ''}`} />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className="text-[10px] bg-[#27272A] px-1.5 py-0.2 rounded-full text-[#A1A1AA]">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card rounded-2xl p-5 border border-[#27272A]">
                <div className="flex items-center justify-between text-[#71717A] text-xs font-mono mb-2">
                  <span>DISCOVERED FILES</span>
                  <FileCode className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="text-3xl font-light text-white font-display">
                  {projectData.stats?.files_count || filesData.length}
                </div>
                <div className="text-[11px] text-[#A1A1AA] mt-1 font-mono">Respecting .gitignore</div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-[#27272A]">
                <div className="flex items-center justify-between text-[#71717A] text-xs font-mono mb-2">
                  <span>CACHED SUMMARIES</span>
                  <Database className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="text-3xl font-light text-white font-display">
                  {projectData.stats?.cached_summaries_count || 0}
                </div>
                <div className="text-[11px] text-[#A1A1AA] mt-1 font-mono">Stage-1 compact summaries</div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-[#27272A]">
                <div className="flex items-center justify-between text-[#71717A] text-xs font-mono mb-2">
                  <span>ACTIVE LLM</span>
                  <Cpu className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="text-base font-medium text-white truncate font-mono mt-1">
                  {selectedModel}
                </div>
                <div className="text-[11px] text-[#A1A1AA] mt-1">Via Groq Acceleration</div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-[#27272A]">
                <div className="flex items-center justify-between text-[#71717A] text-xs font-mono mb-2">
                  <span>ARTIFACT VERSIONS</span>
                  <Clock className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="text-3xl font-light text-white font-display">
                  {projectData.stats?.version_count || 0}
                </div>
                <div className="text-[11px] text-[#A1A1AA] mt-1 font-mono">In .doclify/generated_artifacts/</div>
              </div>
            </div>

            {/* Pipeline Visualizer */}
            <PipelineVisualizer />
          </div>
        )}

        {activeTab === 'files' && (
          <div className="animate-in fade-in duration-200">
            <FileExplorer 
              project={projectData} 
              files={filesData} 
              onFileUpdated={fetchProjectDetails} 
            />
          </div>
        )}

        {activeTab === 'readme' && (
          <div className="animate-in fade-in duration-200">
            <ReadmeViewer 
              project={projectData} 
              readmeData={readmeData} 
              onTriggerAnalyze={() => setIsAnalysisOpen(true)} 
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl glass-panel rounded-2xl p-8 border border-[#27272A] space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-medium text-white font-display mb-1">Configuration & Model</h3>
              <p className="text-xs text-[#A1A1AA]">Manage doclify.yaml settings and Groq LLM model selection.</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#27272A]">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-2">
                  Default LLM Model
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {models.map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleModelChange(m.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        selectedModel === m.id 
                          ? 'bg-[#10B981]/15 border-[#10B981] text-white shadow-sm' 
                          : 'bg-[#09090B] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                      }`}
                    >
                      <div className="font-mono text-xs font-medium text-white">{m.id}</div>
                      <div className="text-[11px] text-[#71717A] mt-0.5">
                        {m.developer} • Context: {m.context} • Max Out: {m.max_output}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#27272A]">
                <label className="block text-xs font-medium text-[#A1A1AA] mb-2">
                  Active doclify.yaml Configuration
                </label>
                <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 font-mono text-xs text-[#D4D4D8]">
                  <pre>{JSON.stringify(projectData.config, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real-time SSE Analysis Modal */}
      <AnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => {
          setIsAnalysisOpen(false);
          fetchProjectDetails();
        }}
        project={projectData}
        model={selectedModel}
        onComplete={() => {
          fetchProjectDetails();
        }}
      />
    </div>
  );
}
