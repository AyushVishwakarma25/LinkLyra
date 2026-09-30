import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  ShieldIcon,
  LockIcon,
} from '@hugeicons/core-free-icons';
import { PrivacyContent } from './PrivacyContent';

export interface PrivacyPageProps {
  onBack: () => void;
  onOpenTerms?: () => void;
  onOpenContact?: () => void;
  onOpenStudio?: () => void;
  onOpenAuth?: () => void;
  currentUser?: any;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({
  onBack,
  onOpenTerms,
  onOpenContact,
  onOpenStudio,
  onOpenAuth,
  currentUser,
}) => {
  const sections = [
    { id: 'collection', title: '1. Information We Collect' },
    { id: 'usage', title: '2. How We Use Information' },
    { id: 'sharing', title: '3. Data Sharing & Zero Selling' },
    { id: 'cookies', title: '4. Cookies & Local Storage' },
    { id: 'your-rights', title: '5. Your Rights (GDPR & DPDP)' },
    { id: 'security', title: '6. Data Security & Storage' },
    { id: 'contact-privacy', title: '7. Contact Privacy Team' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111] flex flex-col font-sans selection:bg-[#4F46E5] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E8E8E4] bg-[#FAFAF7]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
                LL
              </div>
              <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-[#111111]">
                LINKLYRA
              </span>
            </button>
            <span className="hidden sm:inline-block text-zinc-300">/</span>
            <span className="hidden sm:inline-block text-xs font-bold font-mono tracking-wider uppercase text-zinc-500">
              PRIVACY POLICY
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              ← Back to Home
            </button>

            {onOpenTerms && (
              <button
                type="button"
                onClick={onOpenTerms}
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                View Terms of Service
              </button>
            )}

            {currentUser && onOpenStudio ? (
              <button
                type="button"
                onClick={onOpenStudio}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#111111] text-white hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Creator Studio</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            ) : onOpenAuth ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#111111] text-white hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>Create Your Page</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="w-full border-b border-[#E8E8E4] bg-white py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>EFFECTIVE: SEPTEMBER 2026</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-[#666666] max-w-2xl leading-relaxed">
            Your privacy is fundamental to our platform. We never sell your personal data, and we do not track your audience with invasive ad trackers.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
              <span>Zero Data Selling</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
              <span>No Cross-Site Ad Trackers</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
              <HugeiconsIcon icon={ShieldIcon} size={14} />
              <span>GDPR &amp; DPDP Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Table of Contents (Sticky on desktop) */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 space-y-4 p-5 rounded-2xl bg-white border border-[#E8E8E4] shadow-xs">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollTo(section.id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:text-[#111111] hover:bg-zinc-100 transition-colors cursor-pointer truncate"
                  >
                    {section.title}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-2 text-center rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Print Document
                </button>
              </div>
            </div>
          </aside>

          {/* Right Main Content */}
          <main className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#E8E8E4] shadow-xs">
            <PrivacyContent />
          </main>
        </div>
      </div>

      {/* Simple Legal Footer */}
      <footer className="w-full border-t border-[#E8E8E4] bg-white py-8 px-4 sm:px-8 text-center text-xs text-zinc-500 space-y-2">
        <p>© 2026 LinkLyra • A product of Zeper AI. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-zinc-900 transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>·</span>
          {onOpenTerms && (
            <button
              type="button"
              onClick={onOpenTerms}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          )}
          <span>·</span>
          {onOpenContact ? (
            <button
              type="button"
              onClick={onOpenContact}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Contact &amp; Support
            </button>
          ) : (
            <a href="mailto:privacy@linklyra.com" className="hover:text-zinc-900 transition-colors">
              Contact Privacy Officer
            </a>
          )}
        </div>
      </footer>
    </div>
  );
};
