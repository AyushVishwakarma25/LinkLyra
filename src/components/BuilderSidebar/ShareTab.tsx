import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Share01Icon,
  Copy01Icon,
  Tick01Icon,
  ArrowUpRight01Icon,
  QrCodeIcon,
} from '@hugeicons/core-free-icons';
import { UserProfile } from '../../types';

export interface ShareTabProps {
  profile: UserProfile;
  getPublicUrl: () => string;
  handleCopyLink: () => void;
  copied: boolean;
  onOpenPublicView: () => void;
}

export const ShareTab: React.FC<ShareTabProps> = ({
  profile,
  getPublicUrl,
  handleCopyLink,
  copied,
  onOpenPublicView,
}) => {
  return (
    <div className="space-y-4 max-w-full">
      <div>
        <h3 className="text-xs font-bold text-[#1C1E22]">Public Link & QR Code</h3>
        <p className="text-[11px] text-[#737882] mt-0.5">
          Share your LinkCards URL on bios, resumes, and socials
        </p>
      </div>

      {/* Share URL Box */}
      <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-2.5 max-w-full">
        <label className="text-[10px] font-bold text-[#737882] uppercase tracking-wider block">
          Your Link in Bio URL
        </label>
        <div className="flex items-center gap-1.5 min-w-0">
          <input
            type="text"
            readOnly
            value={getPublicUrl()}
            className="flex-1 min-w-0 px-2.5 py-2 bg-black/5 rounded-xl text-xs font-mono text-[#1C1E22] border border-black/10 select-all truncate"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 bg-[#1C1E22] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-2xs shrink-0"
          >
            {copied ? <HugeiconsIcon icon={Tick01Icon} size={14} className="text-emerald-400" /> : <HugeiconsIcon icon={Copy01Icon} size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenPublicView}
          className="w-full py-2.5 px-3 bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all"
        >
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="shrink-0" />
          <span>Open Full Visitor Page</span>
        </button>
      </div>

      {/* QR Code generator */}
      <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-2xs text-center space-y-2.5">
        <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#1C1E22]">
          <HugeiconsIcon icon={QrCodeIcon} size={16} className="text-[#5E4BF7] shrink-0" />
          <span>Instant QR Code</span>
        </div>
        <div className="w-36 h-36 mx-auto p-2 bg-white rounded-2xl border border-black/10 shadow-xs flex items-center justify-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
              getPublicUrl()
            )}`}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};
