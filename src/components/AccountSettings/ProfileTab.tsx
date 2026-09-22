import React from 'react';
import { HugeIcon } from '../HugeIcon';
import {
  Camera01Icon,
  Copy01Icon,
  Tick01Icon,
  CallIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { UserProfile } from '../../types';

export interface ProfileTabProps {
  profile: UserProfile;
  avatarUrl: string;
  name: string;
  setName: (val: string) => void;
  username: string;
  setUsername: (val: string) => void;
  headline: string;
  setHeadline: (val: string) => void;
  businessPhone: string;
  setBusinessPhone: (val: string) => void;
  isPro: boolean;
  userEmail: string;
  copiedUrl: boolean;
  handleCopyProfileUrl: () => void;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  handleAvatarFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfileIdentity: (e: React.FormEvent) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  avatarUrl,
  name,
  setName,
  username,
  setUsername,
  headline,
  setHeadline,
  businessPhone,
  setBusinessPhone,
  isPro,
  userEmail,
  copiedUrl,
  handleCopyProfileUrl,
  avatarInputRef,
  handleAvatarFileSelect,
  handleSaveProfileIdentity,
  saveStatus,
}) => {
  return (
    <form onSubmit={handleSaveProfileIdentity} className="space-y-6">
      {/* Account Summary Banner */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={name || 'Creator'}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md bg-black/5"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1C1E22] text-white flex items-center justify-center shadow-xs hover:bg-black transition-colors cursor-pointer"
                title="Upload new avatar (Max 2MB)"
              >
                <HugeIcon icon={Camera01Icon} size={12} className="w-3 h-3 text-white" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1C1E22]">{name || 'Creator Name'}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isPro ? 'bg-[#F8BA38] text-[#191A1E]' : 'bg-black/5 text-[#737882]'
                  }`}
                >
                  {profile.plan || 'Free'} Plan
                </span>
              </div>
              <p className="text-xs font-mono text-[#5E4BF7] font-semibold mt-0.5">
                linklyra.com/@{username || 'username'}
              </p>
              <p className="text-[11px] text-[#737882] mt-0.5">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleCopyProfileUrl}
              className="px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-bold text-[#1C1E22] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              {copiedUrl ? <HugeIcon icon={Tick01Icon} size={14} className="w-3.5 h-3.5 text-emerald-600" /> : <HugeIcon icon={Copy01Icon} size={14} className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Link Copied' : 'Copy Profile Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6 shadow-2xs space-y-5">
        <div>
          <h3 className="text-sm font-bold text-[#1C1E22]">Creator Public Information</h3>
          <p className="text-xs text-[#737882] mt-0.5">
            This information appears on your public mobile page and Google search snippet.
          </p>
        </div>

        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarFileSelect}
          className="hidden"
        />

        {/* Grid Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Display Name */}
          <div>
            <label className="block text-xs font-bold text-[#1C1E22] mb-1.5">
              Full Name / Brand Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ayush Sharma"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-[#1C1E22] focus:outline-none focus:border-[#5E4BF7] focus:ring-1 focus:ring-[#5E4BF7] transition-all"
            />
          </div>

          {/* Username / Handle */}
          <div>
            <label className="block text-xs font-bold text-[#1C1E22] mb-1.5">
              Username Handle (Slug)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#737882]">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="username"
                required
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-mono text-[#1C1E22] focus:outline-none focus:border-[#5E4BF7] focus:ring-1 focus:ring-[#5E4BF7] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bio & Headline */}
        <div>
          <label className="block text-xs font-bold text-[#1C1E22] mb-1.5">
            Biography & Headline
          </label>
          <textarea
            rows={3}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Architecture Designer & Content Creator based in Mumbai. Sharing daily design insights."
            className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-[#1C1E22] focus:outline-none focus:border-[#5E4BF7] focus:ring-1 focus:ring-[#5E4BF7] transition-all resize-none"
          />
        </div>

        {/* WhatsApp Contact */}
        <div className="pt-2 border-t border-black/5">
          <label className="block text-xs font-bold text-[#1C1E22] mb-1.5">
            WhatsApp Number
          </label>
          <div className="relative">
            <HugeIcon icon={CallIcon} size={16} className="w-4 h-4 text-[#1C1E22] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-[#1C1E22] focus:outline-none focus:border-[#1C1E22] focus:ring-1 focus:ring-[#1C1E22] transition-all font-mono"
            />
          </div>
          <p className="text-[11px] text-[#737882] mt-1">
            Allows visitors to message or send inquiries directly to your WhatsApp.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1C1E22] hover:bg-black text-white shadow-xs transition-all active:scale-95 flex items-center gap-2"
          >
            {saveStatus === 'saving' ? (
              <HugeIcon icon={Loading03Icon} size={14} className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <HugeIcon icon={Tick01Icon} size={14} className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
