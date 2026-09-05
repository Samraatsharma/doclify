import React, { useState, useEffect } from "react";
import { CONFIG } from "../config";
import { Download, Sparkles, Menu, X } from "lucide-react";

interface NavbarProps {
  onOpenTryRevia: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTryRevia,
  onNavigateSection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        padding: isScrolled ? "12px 0" : "20px 0",
        background: isScrolled ? "rgba(252, 251, 249, 0.88)" : "transparent",
        backdropFilter: isScrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: isScrolled ? "blur(16px)" : "none",
        borderBottom: isScrolled ? "1px solid rgba(17, 20, 26, 0.08)" : "1px solid transparent",
        boxShadow: isScrolled ? "0 4px 20px rgba(17, 20, 26, 0.03)" : "none",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Brand Logo & Editorial Wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "var(--text-ink)",
          }}
        >
          {/* Micro Memory Core Icon */}
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #c7d2fe 60%, #6366f1 100%)",
              boxShadow: "0 2px 8px rgba(99, 102, 241, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff" }} />
          </div>
          
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "19px",
                letterSpacing: "-0.03em",
                color: "var(--text-ink)",
              }}
            >
              REVIA
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--text-muted)",
                padding: "2px 5px",
                background: "rgba(17, 20, 26, 0.05)",
                borderRadius: "4px",
              }}
            >
              v1.5
            </span>
          </div>
        </a>

        {/* Desktop Minimal Navigation Links */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
          }}
          className="desktop-nav"
        >
          <button
            onClick={() => scrollToSection("story")}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-body)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-body)")}
          >
            The Gap
          </button>

          <button
            onClick={() => scrollToSection("memory-field")}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-body)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-body)")}
          >
            Memory Field
          </button>

          <button
            onClick={() => scrollToSection("how-it-works")}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-body)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-body)")}
          >
            How It Works
          </button>

          <button
            onClick={() => scrollToSection("search-demo")}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-body)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-body)")}
          >
            Interactive Demo
          </button>

          <button
            onClick={() => scrollToSection("privacy")}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-body)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-body)")}
          >
            Local Privacy
          </button>
        </nav>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Try Simulator Pill */}
          <button
            onClick={onOpenTryRevia}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(17, 20, 26, 0.04)",
              border: "1px solid var(--border-light-subtle)",
              borderRadius: "10px",
              padding: "7px 14px",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-lead)",
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(17, 20, 26, 0.08)";
              e.currentTarget.style.borderColor = "var(--border-light-medium)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(17, 20, 26, 0.04)";
              e.currentTarget.style.borderColor = "var(--border-light-subtle)";
            }}
          >
            <Sparkles size={14} color="#6366f1" />
            <span className="hide-mobile">Simulator</span>
          </button>

          {/* Primary Direct Download Button */}
          <a
            href={CONFIG.releaseDownloadUrl}
            download={CONFIG.zipFilename}
            className="btn-dark"
            style={{
              padding: "8px 18px",
              fontSize: "13.5px",
              borderRadius: "10px",
            }}
          >
            <Download size={14} />
            <span>Download for Mac</span>
          </a>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "var(--text-ink)",
              cursor: "pointer",
              padding: "6px",
            }}
            className="mobile-hamburger"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: "#ffffff",
            borderBottom: "1px solid var(--border-light-subtle)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <button
            onClick={() => scrollToSection("story")}
            style={{
              background: "none",
              border: "none",
              textAlign: "left",
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-ink)",
              cursor: "pointer",
              padding: "8px 0",
            }}
          >
            The Gap
          </button>
          <button
            onClick={() => scrollToSection("memory-field")}
            style={{
              background: "none",
              border: "none",
              textAlign: "left",
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-ink)",
              cursor: "pointer",
              padding: "8px 0",
            }}
          >
            Memory Field
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            style={{
              background: "none",
              border: "none",
              textAlign: "left",
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-ink)",
              cursor: "pointer",
              padding: "8px 0",
            }}
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection("search-demo")}
            style={{
              background: "none",
              border: "none",
              textAlign: "left",
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-ink)",
              cursor: "pointer",
              padding: "8px 0",
            }}
          >
            Interactive Demo
          </button>
          <button
            onClick={() => scrollToSection("privacy")}
            style={{
              background: "none",
              border: "none",
              textAlign: "left",
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-ink)",
              cursor: "pointer",
              padding: "8px 0",
            }}
          >
            Local Privacy
          </button>
          <button
            onClick={() => scrollToSection("download")}
            style={{
              background: "none",
              border: "none",
              textAlign: "left",
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--accent-violet)",
              cursor: "pointer",
              padding: "8px 0",
            }}
          >
            Download Revia (Apple Silicon)
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-hamburger {
            display: flex !important;
          }
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
