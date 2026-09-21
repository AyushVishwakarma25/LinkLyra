import React from 'react';
import { HugeIcon } from './HugeIcon';
import {
  Cancel01Icon,
  Download01Icon,
  SentIcon,
  ViewIcon,
  Analytics01Icon,
  Award01Icon,
  File01Icon,
  UserGroupIcon,
  TradeUpIcon,
} from '@hugeicons/core-free-icons';
import { UserProfile } from '../types';

export interface MediaKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onOpenInquiry?: () => void;
}

export const MediaKitModal: React.FC<MediaKitModalProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenInquiry,
}) => {
  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    // Printable / One-sheet download action
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col print:border-none print:shadow-none print:max-h-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-stone-900 via-purple-950 to-stone-900 text-white relative print:bg-none print:text-black">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors print:hidden"
            title="Close"
          >
            <HugeIcon icon={Cancel01Icon} size={20} className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-400/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <HugeIcon icon={File01Icon} size={14} className="w-3.5 h-3.5" />
            Official Creator Media Kit 2026
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={profile.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-purple-400/30 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{profile.name}</h1>
                <span className="p-1 rounded-full bg-white/10 text-white text-xs">
                  <HugeIcon icon={Award01Icon} size={16} className="w-4 h-4" />
                </span>
              </div>
              <p className="text-sm text-purple-200 mt-0.5 font-medium">{profile.headline || 'Content Creator & UGC Strategist'}</p>
              <p className="text-xs text-stone-300 mt-1">Niche: Tech, Design, Productivity & SaaS</p>
            </div>
          </div>
        </div>

        {/* Media Kit Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-stone-800 text-sm">
          {/* Key Audience Metrics Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
              <HugeIcon icon={Analytics01Icon} size={16} className="w-4 h-4 text-purple-600" />
              Audience & Reach Analytics
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-center">
                <HugeIcon icon={UserGroupIcon} size={20} className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <span className="text-xl sm:text-2xl font-bold text-stone-900 block">82,400+</span>
                <span className="text-[11px] text-stone-500 font-medium">Total Followers</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-center">
                <HugeIcon icon={TradeUpIcon} size={20} className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="text-xl sm:text-2xl font-bold text-stone-900 block">4.82%</span>
                <span className="text-[11px] text-stone-500 font-medium">Avg Engagement</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-center">
                <HugeIcon icon={ViewIcon} size={20} className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                <span className="text-xl sm:text-2xl font-bold text-stone-900 block">1.2M+</span>
                <span className="text-[11px] text-stone-500 font-medium">Monthly Views</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-center">
                <HugeIcon icon={TradeUpIcon} size={20} className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-xl sm:text-2xl font-bold text-stone-900 block">12.4%</span>
                <span className="text-[11px] text-stone-500 font-medium">Avg Click Rate</span>
              </div>
            </div>
          </div>

          {/* Demographics & Formats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2 text-purple-900">
                Primary Demographics
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700">
                <li className="flex justify-between">
                  <span>Age 18 - 34:</span>
                  <span className="font-semibold text-stone-900">74%</span>
                </li>
                <li className="flex justify-between">
                  <span>Top Countries:</span>
                  <span className="font-semibold text-stone-900">India (52%), US (28%), UK (12%)</span>
                </li>
                <li className="flex justify-between">
                  <span>Gender Split:</span>
                  <span className="font-semibold text-stone-900">62% Male / 38% Female</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-black/10">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2">
                Deliverables & Turnaround
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700">
                <li className="flex justify-between">
                  <span>Turnaround Time:</span>
                  <span className="font-semibold text-stone-900">3 - 5 Business Days</span>
                </li>
                <li className="flex justify-between">
                  <span>Revisions Included:</span>
                  <span className="font-semibold text-stone-900">2 Rounds per Deliverable</span>
                </li>
                <li className="flex justify-between">
                  <span>Usage Rights:</span>
                  <span className="font-semibold text-stone-900">Organic + 30 Days Paid Ad Rights</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Past Partnerships */}
          <div>
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2 text-stone-500">
              Trusted By Global & Regional Brands
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Notion', 'Samsung', 'Loom', 'Plum Goodness', 'Figma', 'Skillshare', 'Boat Audio'].map((b) => (
                <span key={b} className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 text-xs font-semibold">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-3 flex flex-col sm:flex-row gap-3 print:hidden">
            {onOpenInquiry && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInquiry();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
              >
                <HugeIcon icon={SentIcon} size={16} className="w-4 h-4" />
                Inquire For Brand Deals
              </button>
            )}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm transition-colors"
            >
              <HugeIcon icon={Download01Icon} size={16} className="w-4 h-4" />
              Download PDF / Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
