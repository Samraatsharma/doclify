import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { SectionDivider } from "./components/SectionDivider";
import { ProblemStory } from "./components/ProblemStory";
import { MemoryField } from "./components/MemoryField";
import { HowItWorks } from "./components/HowItWorks";
import { InteractiveSearchDemo } from "./components/InteractiveSearchDemo";
import { VoiceExperience } from "./components/VoiceExperience";
import { AmbientDesktop } from "./components/AmbientDesktop";
import { ShortcutVisual } from "./components/ShortcutVisual";
import { PrivacyArchitecture } from "./components/PrivacyArchitecture";
import { MacExperience } from "./components/MacExperience";
import { DownloadSection } from "./components/DownloadSection";
import { WindowsTeaser } from "./components/WindowsTeaser";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { TryReviaModal } from "./components/TryReviaModal";
import { LegalModal, type LegalDocType } from "./components/LegalModal";

export function App() {
  const [tryReviaOpen, setTryReviaOpen] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDocType | null>(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#privacy-policy") {
        setLegalDoc("privacy");
      } else if (hash === "#terms-of-service" || hash === "#terms") {
        setLegalDoc("terms");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-canvas)" }}>
      {/* Editorial Floating Navbar */}
      <Navbar
        onOpenTryRevia={() => setTryReviaOpen(true)}
      />

      {/* Main Cinematic Product Journey */}
      <main style={{ flex: 1 }}>
        {/* 01 · HERO & MEMORY CORE (LIGHT / WARM IVORY) */}
        <Hero
          onOpenTryRevia={() => setTryReviaOpen(true)}
          onExploreStory={() => {
            const el = document.getElementById("story");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* Sculpted transition into Problem Story */}
        <SectionDivider
          variant="wave-light-to-dark"
          fromBg="#fcfbf9"
          toBg="#f4f2ec"
          height={72}
        />

        {/* 02 · THE PROBLEM STORY / THE COGNITIVE GAP (SOFT LINEN) */}
        <ProblemStory />

        {/* Deep architectural transition into Dark Universe */}
        <SectionDivider
          variant="wave-light-to-dark"
          fromBg="#f4f2ec"
          toBg="#090c12"
          height={100}
        />

        {/* 03 · THE MEMORY FIELD (DARK CINEMATIC CONSTELLATION) */}
        <MemoryField />

        {/* Sculpted wave rising back into Light */}
        <SectionDivider
          variant="wave-dark-to-light"
          fromBg="#090c12"
          toBg="#fcfbf9"
          height={96}
        />

        {/* 04 · HOW REVIA WORKS (LIGHT WARM CANVAS) */}
        <HowItWorks />

        {/* 05 · INTERACTIVE CAPSULE SEARCH DEMO (PURE PAPER LIGHT) */}
        <InteractiveSearchDemo />

        {/* Elliptical transition into Voice */}
        <SectionDivider
          variant="elliptical-arch"
          fromBg="#ffffff"
          toBg="#0f131c"
          height={88}
        />

        {/* 06 · AMBIENT VOICE EXPERIENCE (DEEP GRAPHITE) */}
        <VoiceExperience />

        {/* Curved boundary returning to Ambient Desktop */}
        <SectionDivider
          variant="wave-dark-to-light"
          fromBg="#0f131c"
          toBg="#f7f5f0"
          height={92}
        />

        {/* 07 · AMBIENT DESKTOP UTILITY (LIGHT WARM IVORY) */}
        <AmbientDesktop />

        {/* 08 · THE ⌃ ⌃ SHORTCUT VISUAL (TACTILE STUDIO WARM SAND) */}
        <ShortcutVisual />

        {/* Architectural transition into Privacy Blueprint */}
        <SectionDivider
          variant="wave-light-to-dark"
          fromBg="#ebe8df"
          toBg="#090c12"
          height={96}
        />

        {/* 09 · PRIVACY & LOCAL ARCHITECTURE (DEEP MIDNIGHT BLUEPRINT) */}
        <PrivacyArchitecture />

        {/* Smooth horizon rise to Mac Native & Distribution */}
        <SectionDivider
          variant="horizon-rise"
          fromBg="#090c12"
          toBg="#fcfbf9"
          height={80}
        />

        {/* 10 · MAC NATIVE ENGINEERING (LIGHT WARM CANVAS) */}
        <MacExperience />

        {/* 11 · DOWNLOAD SECTION (DIRECT ZIP & VERIFIED ARTIFACT) */}
        <DownloadSection />

        {/* 12 · WINDOWS ROADMAP TEASER */}
        <WindowsTeaser />

        {/* 13 · TECHNICAL FAQ */}
        <FAQ />
      </main>

      {/* Global Interactive Simulation Sandbox Modal */}
      <TryReviaModal
        isOpen={tryReviaOpen}
        onClose={() => setTryReviaOpen(false)}
      />

      {/* Legal & Compliance Modal (Privacy Policy & Terms of Service) */}
      <LegalModal
        isOpen={legalDoc !== null}
        docType={legalDoc || "privacy"}
        onClose={() => {
          setLegalDoc(null);
          if (window.location.hash.toLowerCase().includes("privacy-policy") || window.location.hash.toLowerCase().includes("terms")) {
            history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        }}
        onSwitchDoc={(type) => setLegalDoc(type)}
      />

      {/* Editorial Colophon Footer */}
      <Footer
        onOpenPrivacy={() => setLegalDoc("privacy")}
        onOpenTerms={() => setLegalDoc("terms")}
      />
    </div>
  );
}

export default App;
