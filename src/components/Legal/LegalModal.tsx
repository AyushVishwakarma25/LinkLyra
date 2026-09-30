import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  ShieldIcon,
  File01Icon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
} from '@hugeicons/core-free-icons';
import { TermsContent } from './TermsContent';
import { PrivacyContent } from './PrivacyContent';

export type LegalDocType = 'terms' | 'privacy';

export interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalDocType;
  onOpenStudio?: () => void;
  onOpenAuth?: () => void;
  currentUser?: any;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
  onOpenStudio,
  onOpenAuth,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 flex flex-col max-h-[92vh] z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-zinc-200 bg-[#FAFAF8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-black text-xs">
              LL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-[#111111]">
                  LINKLYRA LEGAL &amp; TRUST
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  UPDATED SEPT 2026
                </span>
              </div>
              <p className="text-xs text-[#666666]">
                Clear, transparent, creator-first terms with 0% platform commission on direct tips.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close legal modal"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Quick Navigation */}
        <div className="px-5 sm:px-8 py-3 bg-white border-b border-zinc-150 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Segmented document toggle */}
          <div className="inline-flex p-1 bg-zinc-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-zinc-600 hover:text-[#111111]'
              }`}
            >
              Terms and Conditions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-zinc-600 hover:text-[#111111]'
              }`}
            >
              Privacy Policy
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              Print / Save PDF
            </button>
            {currentUser && onOpenStudio ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStudio();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#111111] text-white hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Launch Studio</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            ) : onOpenAuth ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#111111] text-white hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Create Your LinkLyra</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 bg-white">
          <div className="max-w-3xl mx-auto">
            {activeTab === 'terms' ? <TermsContent /> : <PrivacyContent />}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-5 sm:px-8 py-3 bg-[#FAFAF8] border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 shrink-0">
          <p>© 2026 LinkLyra • A product of Zeper AI</p>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Questions?</span>
            <a
              href="mailto:support@linklyra.com"
              className="text-[#111111] font-semibold hover:underline"
            >
              support@linklyra.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
