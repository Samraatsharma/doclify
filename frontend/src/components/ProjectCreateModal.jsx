import React, { useState } from 'react';
import { X, FolderOpen, UploadCloud, Github, AlertCircle, Loader2, Check } from 'lucide-react';

export default function ProjectCreateModal({ isOpen, onClose, onProjectCreated }) {
  const [tab, setTab] = useState('local'); // 'local' | 'upload' | 'github'
  const [localPath, setLocalPath] = useState('');
  const [projectName, setProjectName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (tab === 'local') {
        if (!localPath.trim()) throw new Error('Please enter a valid directory path.');
        res = await fetch('/api/projects/create/local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: localPath.trim(), name: projectName.trim() || undefined })
        });
      } else if (tab === 'upload') {
        if (!selectedFile) throw new Error('Please select a ZIP file to upload.');
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (projectName.trim()) formData.append('name', projectName.trim());

        res = await fetch('/api/projects/create/upload', {
          method: 'POST',
          body: formData
        });
      } else if (tab === 'github') {
        if (!githubUrl.trim()) throw new Error('Please enter a GitHub repository URL.');
        res = await fetch('/api/projects/create/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: githubUrl.trim(), name: projectName.trim() || undefined })
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to create project.');
      }

      onProjectCreated(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
          <div>
            <h3 className="text-lg font-medium text-white font-display">Add Project</h3>
            <p className="text-xs text-[#A1A1AA]">Import a codebase for AI documentation & intelligence</p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#71717A] hover:text-white p-1 rounded-lg hover:bg-[#27272A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-3 gap-1 p-2 m-4 bg-[#09090B] rounded-xl border border-[#27272A]">
          <button
            type="button"
            onClick={() => { setTab('local'); setError(null); }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === 'local' 
                ? 'bg-[#18181B] text-white shadow border border-[#3F3F46]' 
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Local Path</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('upload'); setError(null); }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === 'upload' 
                ? 'bg-[#18181B] text-white shadow border border-[#3F3F46]' 
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>ZIP Upload</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('github'); setError(null); }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === 'github' 
                ? 'bg-[#18181B] text-white shadow border border-[#3F3F46]' 
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub URL</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
              Project Display Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. My Fastapi Service"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#10B981] transition-colors"
            />
          </div>

          {tab === 'local' && (
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                Absolute or Relative Directory Path
              </label>
              <input
                type="text"
                required
                placeholder="e.g. /Users/samraat/projects/analytics-engine"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#10B981] transition-colors"
              />
              <p className="text-[11px] text-[#71717A] mt-1.5">
                Doclify will scan the directory and generate a <code className="text-[#10B981]">doclify.yaml</code> config.
              </p>
            </div>
          )}

          {tab === 'upload' && (
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                Codebase ZIP Archive
              </label>
              <div className="border-2 border-dashed border-[#27272A] hover:border-[#3F3F46] rounded-xl p-6 text-center cursor-pointer bg-[#09090B] transition-colors relative">
                <input
                  type="file"
                  accept=".zip"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="w-8 h-8 text-[#10B981] mx-auto mb-2" />
                <div className="text-xs text-white font-medium">
                  {selectedFile ? selectedFile.name : 'Click to browse or drop ZIP file here'}
                </div>
                <div className="text-[11px] text-[#71717A] mt-1">Maximum 50MB archive size</div>
              </div>
            </div>
          )}

          {tab === 'github' && (
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                GitHub Repository URL
              </label>
              <input
                type="url"
                required
                placeholder="https://github.com/owner/repository"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-[#09090B] border border-[#27272A] rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#10B981] transition-colors"
              />
              <p className="text-[11px] text-[#71717A] mt-1.5">
                Public repositories only. Clones repository shallowly into workspace sandbox.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-full text-xs font-medium text-[#A1A1AA] hover:text-white bg-transparent hover:bg-[#27272A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium bg-white text-[#18181B] hover:bg-[#10B981] hover:text-white transition-all shadow-md font-sans"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Import Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
