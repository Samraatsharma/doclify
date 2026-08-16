import React, { useState } from 'react';
import { FileText, Copy, Download, RefreshCw, Check, Clock, History, Sparkles, Code2, Eye } from 'lucide-react';

export default function ReadmeViewer({ project, readmeData, onTriggerAnalyze }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('rendered'); // 'rendered' | 'raw'
  const [selectedVersion, setSelectedVersion] = useState(null);

  const currentContent = selectedVersion ? selectedVersion.content : (readmeData?.content || '');
  const exists = Boolean(readmeData?.exists || readmeData?.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}-README.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simple clean markdown-to-HTML parser
  const renderMarkdown = (md) => {
    if (!md) return '';
    let html = md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
      .replace(/\n\n/gim, '<p></p>');

    return html;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-[#27272A] relative overflow-hidden">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#27272A]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-white font-display">README.md</h3>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                {exists ? 'GENERATED' : 'NOT GENERATED'}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              {readmeData?.last_updated ? `Last generated ${new Date(readmeData.last_updated * 1000).toLocaleString()}` : 'No previous generation found'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Rendered vs Raw toggle */}
          <div className="flex bg-[#09090B] border border-[#27272A] rounded-full p-0.5">
            <button
              onClick={() => setViewMode('rendered')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === 'rendered' ? 'bg-[#27272A] text-white' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === 'raw' ? 'bg-[#27272A] text-white' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            disabled={!exists}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors border border-[#3F3F46] disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!exists}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[#27272A] hover:bg-[#3F3F46] text-white transition-colors border border-[#3F3F46] disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={onTriggerAnalyze}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#10B981] hover:bg-[#059669] text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] font-sans"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate README</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {exists ? (
          viewMode === 'rendered' ? (
            <div 
              className="prose-doclify max-w-none text-[#D4D4D8] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(currentContent) }}
            />
          ) : (
            <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-5 font-mono text-xs text-[#D4D4D8] overflow-x-auto">
              <pre className="whitespace-pre-wrap leading-relaxed">{currentContent}</pre>
            </div>
          )
        ) : (
          <div className="text-center py-20 px-4 bg-[#09090B]/60 rounded-xl border border-dashed border-[#27272A]">
            <Sparkles className="w-10 h-10 text-[#10B981] mx-auto mb-3 animate-pulse" />
            <h4 className="text-lg font-medium text-white mb-1 font-display">No README Generated Yet</h4>
            <p className="text-xs text-[#A1A1AA] max-w-md mx-auto mb-6">
              Run Doclify's multi-stage AI analysis to extract code, summarize each component, and synthesize a polished GitHub README.
            </p>
            <button
              onClick={onTriggerAnalyze}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium bg-white text-[#18181B] hover:bg-[#10B981] hover:text-white transition-all shadow-lg font-sans"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Documentation Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Artifact Version History */}
      {readmeData?.history && readmeData.history.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#27272A]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#71717A] mb-3">
            <History className="w-3.5 h-3.5" />
            <span>VERSIONED ARTIFACT HISTORY (.doclify/generated_artifacts/)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {readmeData.history.map((hist) => (
              <div 
                key={hist.filename}
                className="flex items-center gap-2 bg-[#09090B] border border-[#27272A] px-3 py-1.5 rounded-lg text-xs font-mono text-[#A1A1AA]"
              >
                <Clock className="w-3 h-3 text-[#10B981]" />
                <span>{hist.filename}</span>
                <span className="text-[10px] text-[#71717A]">({(hist.size_bytes / 1024).toFixed(1)}k)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
