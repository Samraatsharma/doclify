import React, { useState, useEffect } from 'react';
import { FileCode, FileText, Folder, CheckCircle, RefreshCw, Eye, Sparkles, Loader2, Code2 } from 'lucide-react';

export default function FileExplorer({ project, files = [], onFileUpdated }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [tab, setTab] = useState('summary'); // 'summary' | 'code'
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
  }, [files]);

  useEffect(() => {
    if (!selectedFile) return;

    const fetchContent = async () => {
      setLoadingContent(true);
      try {
        const res = await fetch(`/api/projects/${project.id}/file-content?file_path=${encodeURIComponent(selectedFile.path)}`);
        if (res.ok) {
          const data = await res.json();
          setFileContent(data.content || '');
        } else {
          setFileContent('// Failed to load file source preview.');
        }
      } catch (err) {
        setFileContent('// Failed to load file source preview.');
      } finally {
        setLoadingContent(false);
      }
    };

    fetchContent();
  }, [selectedFile, project.id]);

  const handleUpdateFile = async () => {
    if (!selectedFile) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/update-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: selectedFile.path })
      });
      if (res.ok) {
        const data = await res.json();
        if (onFileUpdated) onFileUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const filteredFiles = files.filter(f => 
    f.path.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[720px]">
      {/* File List Pane */}
      <div className="md:col-span-5 glass-panel rounded-2xl p-4 flex flex-col border border-[#27272A] overflow-hidden">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Filter files by path or extension..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-[#09090B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#10B981] transition-colors"
          />
        </div>

        <div className="flex items-center justify-between px-2 pb-2 text-[11px] font-mono text-[#71717A] border-b border-[#27272A]">
          <span>FILES ({filteredFiles.length})</span>
          <span>STAGE-1 CACHE</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 mt-2 pr-1">
          {filteredFiles.map((file) => {
            const isSelected = selectedFile?.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                  isSelected 
                    ? 'bg-[#10B981]/15 text-white border border-[#10B981]/30 shadow-sm' 
                    : 'text-[#A1A1AA] hover:bg-[#27272A]/50 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#10B981]' : 'text-[#71717A]'}`} />
                  <span className="font-mono text-[11.5px] truncate">{file.path}</span>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[10px] text-[#71717A]">
                    {(file.size_bytes / 1024).toFixed(1)}k
                  </span>
                  {file.has_summary ? (
                    <span className="w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-[#10B981]/20" title="Summarized in cache" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#71717A]" title="Not summarized yet" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail / Inspector Pane */}
      <div className="md:col-span-7 glass-panel rounded-2xl p-6 flex flex-col border border-[#27272A] overflow-hidden">
        {selectedFile ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#27272A]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileCode className="w-4 h-4 text-[#10B981]" />
                  <h4 className="text-sm font-medium text-white font-mono">{selectedFile.path}</h4>
                </div>
                <div className="text-xs text-[#A1A1AA]">
                  Type: <span className="text-white font-mono">{selectedFile.extension || 'none'}</span> • Size: <span className="text-white font-mono">{(selectedFile.size_bytes / 1024).toFixed(2)} KB</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleUpdateFile}
                  disabled={updating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors border border-[#3F3F46]"
                >
                  {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-[#10B981]" />}
                  <span>{updating ? 'Updating...' : 'Update File'}</span>
                </button>
              </div>
            </div>

            {/* Toggle View Tabs */}
            <div className="flex gap-2 my-4 border-b border-[#27272A] pb-2">
              <button
                onClick={() => setTab('summary')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  tab === 'summary' 
                    ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' 
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Documentation Summary</span>
              </button>

              <button
                onClick={() => setTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  tab === 'code' 
                    ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' 
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Source Preview</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {tab === 'summary' ? (
                <div className="space-y-4">
                  {selectedFile.has_summary ? (
                    <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-5 relative overflow-hidden">
                      <div className="flex items-center gap-2 text-xs text-[#10B981] font-mono mb-3">
                        <CheckCircle className="w-4 h-4" />
                        <span>STAGE-1 COMPACT CONTEXT CACHE</span>
                      </div>
                      <p className="text-sm text-[#E4E4E7] leading-relaxed whitespace-pre-wrap">
                        {selectedFile.summary}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-16 px-4 bg-[#09090B] rounded-xl border border-dashed border-[#27272A]">
                      <Sparkles className="w-8 h-8 text-[#71717A] mx-auto mb-2" />
                      <div className="text-xs text-white font-medium mb-1">No cached summary yet</div>
                      <p className="text-[11px] text-[#71717A] max-w-sm mx-auto mb-4">
                        Run full documentation analysis or click "Update File" to generate a Stage-1 summary for this file.
                      </p>
                      <button
                        onClick={handleUpdateFile}
                        disabled={updating}
                        className="px-4 py-1.5 rounded-full text-xs bg-[#10B981] text-white font-medium hover:bg-[#059669] transition-colors"
                      >
                        Generate Summary Now
                      </button>
                    </div>
                  )}

                  <div className="text-[11px] text-[#71717A] leading-relaxed">
                    💡 <strong>How it works:</strong> Doclify extracts this file, runs the Stage-1 prompt through the Groq LLM, and caches the 3-4 sentence summary in <code className="text-[#10B981]">.doclify/cache.json</code>.
                  </div>
                </div>
              ) : (
                <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 font-mono text-xs text-[#D4D4D8] overflow-x-auto">
                  {loadingContent ? (
                    <div className="flex items-center gap-2 text-[#71717A] py-8 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
                      <span>Reading file...</span>
                    </div>
                  ) : (
                    <pre><code>{fileContent}</code></pre>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-[#71717A]">
            Select a file to inspect its AI summary
          </div>
        )}
      </div>
    </div>
  );
}
