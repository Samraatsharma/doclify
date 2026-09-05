import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "What is Revia?",
    a: "Revia is a private, local-first desktop memory assistant for Mac. It indexes a local read-only snapshot of your browsing history and lets you find anything you remember seeing using natural language concepts, topics, and timeframes, rather than needing to remember exact keywords or URLs.",
  },
  {
    q: "Does Revia work offline?",
    a: "Yes. Core memory storage, FTS5 full-text indexing, and dense vector semantic embeddings (via on-device FastEmbed ONNX) run 100% locally on your Mac without requiring an internet connection.",
  },
  {
    q: "Where is my browsing memory stored?",
    a: "All indexed memory and vector embeddings are stored strictly inside your local macOS user application directory at ~/Library/Application Support/com.revia.app/revia.db. It is never uploaded to external servers.",
  },
  {
    q: "Does Revia upload my browsing history to the cloud?",
    a: "No. Revia never uploads your browsing history, page titles, or search queries to any cloud database or telemetry service. Revia does not even require an account to use.",
  },
  {
    q: "Does Revia require an OpenAI or third-party AI API key?",
    a: "No. Revia operates an embedded local quantized model directly through its compiled Rust backend. No subscriptions, API keys, or cloud usage fees are required.",
  },
  {
    q: "Which browsers are currently supported?",
    a: "Revia currently indexes Google Chrome history. Chrome is read via a safe, locked temporary copy so your active browser session is never interrupted. Additional sources are actively in development.",
  },
  {
    q: "Is Revia free?",
    a: "Yes. The current Revia v1.5 release is completely free to download and use on your Mac.",
  },
  {
    q: "Which Macs are supported?",
    a: "Revia is currently compiled natively for Apple Silicon (M1, M2, M3, M4) running macOS 12.0 Monterey or later.",
  },
  {
    q: "How do I summon Revia?",
    a: "Press Double-Tap Control (⌃ ⌃) from any active application (Chrome, Finder, Terminal, VS Code). The compact Revia capsule floats near the top-right of your active screen with the search field instantly focused.",
  },
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      style={{
        padding: "100px 0 110px 0",
        backgroundColor: "var(--bg-canvas)",
        position: "relative",
      }}
    >
      <div className="container" style={{ maxWidth: "800px" }}>
        {/* Section Sub-badge */}
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11.5px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent-violet)",
              background: "#ffffff",
              padding: "5px 14px",
              borderRadius: "20px",
              border: "1px solid var(--border-light-medium)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            11 // Verified Specifications
          </span>
        </div>

        {/* Narrative Headline */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 className="headline-editorial" style={{ marginBottom: "16px" }}>
            Frequently Asked Questions
          </h2>
          <p className="lead-paragraph">
            Honest architectural answers about local memory, privacy, and system performance.
          </p>
        </div>

        {/* Accordion List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                style={{
                  background: "#ffffff",
                  border: isOpen ? "1.5px solid var(--border-light-strong)" : "1px solid var(--border-light-subtle)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: isOpen ? "var(--shadow-md)" : "var(--shadow-sm)",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{
                    width: "100%",
                    padding: "20px 24px",
                    background: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "16px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "15.5px",
                      fontWeight: 700,
                      color: "var(--text-ink)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      color: "var(--text-muted)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.22s ease",
                      flexShrink: 0,
                    }}
                  />
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: "0 24px 22px 24px",
                      fontSize: "14px",
                      lineHeight: 1.65,
                      color: "var(--text-body)",
                      borderTop: "1px solid var(--border-light-hairline)",
                      paddingTop: "16px",
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
