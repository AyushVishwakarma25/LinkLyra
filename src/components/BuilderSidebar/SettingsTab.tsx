import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle01Icon,
  Loading03Icon,
  Upload01Icon,
  Share01Icon,
  Tick01Icon,
  FloppyDiskIcon,
} from '@hugeicons/core-free-icons';
import { UserProfile, SocialLinks } from '../../types';
import { isValidExternalUrl, createMailtoUrl, createWhatsAppUrl } from '../../lib/url';

export interface SettingsTabProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  isUploadingAvatar: boolean;
  avatarUploadError: string | null;
  avatarFileInputRef: React.RefObject<HTMLInputElement | null>;
  handleAvatarFileUpload: (file: File) => void;
  handleSocialChange: (key: keyof SocialLinks, value: string) => void;
  handleTriggerSave: () => void;
  isSaving: boolean;
  justSaved: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  profile,
  onUpdateProfile,
  isUploadingAvatar,
  avatarUploadError,
  avatarFileInputRef,
  handleAvatarFileUpload,
  handleSocialChange,
  handleTriggerSave,
  isSaving,
  justSaved,
}) => {
  return (
    <div className="space-y-4 max-w-full">
      {/* Top Settings Summary Bar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-[#1C1E22] flex items-center gap-1.5">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-emerald-600 shrink-0" />
            <span>Profile Identity & Details</span>
          </h3>
          <p className="text-[11px] text-[#737882] mt-0.5 truncate">
            Changes preview in real-time. Save anytime from the top bar.
          </p>
        </div>
      </div>

      <div className="space-y-3.5 max-w-full">
        {/* Profile Photo / Avatar Upload */}
        <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-2.5">
          <label className="text-xs font-bold text-[#1C1E22] block">
            Profile Photo
          </label>
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-black/10 bg-black/5 shrink-0">
              <img
                src={
                  profile.avatarUrl && profile.avatarUrl.trim() !== ''
                    ? profile.avatarUrl
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <HugeiconsIcon icon={Loading03Icon} size={20} className="text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <input
                type="file"
                ref={avatarFileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAvatarFileUpload(e.target.files[0]);
                  }
                }}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={() => avatarFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#1C1E22] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <HugeiconsIcon icon={Upload01Icon} size={14} />
                <span>{isUploadingAvatar ? 'Uploading...' : 'Upload Image'}</span>
              </button>
              <p className="text-[10px] text-[#737882]">Max 2MB (PNG, JPG, WebP)</p>
              {avatarUploadError && (
                <p className="text-[10px] font-semibold text-rose-600 animate-fadeIn">{avatarUploadError}</p>
              )}
              <input
                type="url"
                value={profile.avatarUrl}
                onChange={(e) => onUpdateProfile({ avatarUrl: e.target.value })}
                placeholder="Or paste image URL"
                className="w-full px-2.5 py-1 bg-black/5 rounded-lg border border-black/10 text-[11px] font-mono text-[#1C1E22] focus:outline-none focus:ring-1 focus:ring-[#5E4BF7]"
              />
            </div>
          </div>
        </div>

        {/* Display Name and Username Handle in a clean responsive 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#1C1E22] block mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onUpdateProfile({ name: e.target.value })}
              className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#1C1E22] block mb-1">
              Handle / Username (Public URL)
            </label>
            <div className="flex items-center min-w-0">
              <span className="px-3 py-2 bg-black/5 border border-r-0 border-black/10 rounded-l-xl text-xs font-bold text-[#737882] shrink-0">
                /
              </span>
              <input
                type="text"
                value={profile.username}
                onChange={(e) =>
                  onUpdateProfile({
                    username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                  })
                }
                className="flex-1 min-w-0 px-3 py-2 bg-white rounded-r-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                placeholder="username"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#1C1E22] block mb-1">
            Bio / Headline
          </label>
          <input
            type="text"
            value={profile.headline}
            onChange={(e) => onUpdateProfile({ headline: e.target.value })}
            className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
            placeholder="Creator, Designer, Developer, Founder"
          />
        </div>

        {/* WhatsApp Contact Box */}
        <div className="p-3.5 bg-[#1C1E22] text-white rounded-2xl border border-black/10 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-white">
              <HugeiconsIcon icon={Share01Icon} size={15} className="text-white/80" />
              <span>WhatsApp Contact</span>
            </div>
            {profile.businessPhone ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-white font-semibold text-[10px]">
                <HugeiconsIcon icon={Tick01Icon} size={11} className="text-white" />
                <span>Connected</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-medium text-[10px]">
                Optional
              </span>
            )}
          </div>

          <div>
            <label className="text-[11px] font-semibold text-white/90 block mb-1">
              WhatsApp Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={profile.businessPhone || ''}
                onChange={(e) => onUpdateProfile({ businessPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-white/10 rounded-xl border border-white/15 text-white placeholder-white/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 shadow-xs font-mono"
              />
            </div>
            <p className="text-[10px] text-white/60 mt-1.5 leading-normal">
              Allows visitors to message or send inquiries directly to your WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Social Icons Editor in a responsive 2-column layout */}
      <div className="pt-3 border-t border-black/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#1C1E22]">Social Links</h3>
            <p className="text-[11px] text-[#737882]">
              Add handles to display icons directly beneath your bio
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
              WhatsApp (Phone or Chat Link)
            </label>
            <input
              type="text"
              placeholder="+1234567890 or https://wa.me/..."
              value={profile.socials?.whatsapp || ''}
              onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
              className={`w-full px-3 py-1.5 bg-white rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 ${
                profile.socials?.whatsapp && !createWhatsAppUrl(profile.socials.whatsapp)
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-black/10 focus:ring-[#1C1E22]'
              }`}
            />
            {profile.socials?.whatsapp && !createWhatsAppUrl(profile.socials.whatsapp) && (
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">⚠️ Please enter a valid phone number or wa.me link</p>
            )}
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
              Instagram
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/username"
              value={profile.socials?.instagram || ''}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
              className={`w-full px-3 py-1.5 bg-white rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 ${
                profile.socials?.instagram && !isValidExternalUrl(profile.socials.instagram)
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-black/10 focus:ring-[#5E4BF7]'
              }`}
            />
            {profile.socials?.instagram && !isValidExternalUrl(profile.socials.instagram) && (
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">⚠️ Please enter a valid URL (e.g. instagram.com/name)</p>
            )}
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
              X (Twitter)
            </label>
            <input
              type="url"
              placeholder="https://x.com/yourhandle"
              value={profile.socials?.twitter || ''}
              onChange={(e) => handleSocialChange('twitter', e.target.value)}
              className={`w-full px-3 py-1.5 bg-white rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 ${
                profile.socials?.twitter && !isValidExternalUrl(profile.socials.twitter)
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-black/10 focus:ring-[#5E4BF7]'
              }`}
            />
            {profile.socials?.twitter && !isValidExternalUrl(profile.socials.twitter) && (
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">⚠️ Please enter a valid URL</p>
            )}
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
              YouTube
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/@channel"
              value={profile.socials?.youtube || ''}
              onChange={(e) => handleSocialChange('youtube', e.target.value)}
              className={`w-full px-3 py-1.5 bg-white rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 ${
                profile.socials?.youtube && !isValidExternalUrl(profile.socials.youtube)
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-black/10 focus:ring-[#5E4BF7]'
              }`}
            />
            {profile.socials?.youtube && !isValidExternalUrl(profile.socials.youtube) && (
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">⚠️ Please enter a valid URL</p>
            )}
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
              LinkedIn
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={profile.socials?.linkedin || ''}
              onChange={(e) => handleSocialChange('linkedin', e.target.value)}
              className={`w-full px-3 py-1.5 bg-white rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 ${
                profile.socials?.linkedin && !isValidExternalUrl(profile.socials.linkedin)
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-black/10 focus:ring-[#5E4BF7]'
              }`}
            />
            {profile.socials?.linkedin && !isValidExternalUrl(profile.socials.linkedin) && (
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">⚠️ Please enter a valid URL</p>
            )}
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
              GitHub
            </label>
            <input
              type="url"
              placeholder="https://github.com/username"
              value={profile.socials?.github || ''}
              onChange={(e) => handleSocialChange('github', e.target.value)}
              className={`w-full px-3 py-1.5 bg-white rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 ${
                profile.socials?.github && !isValidExternalUrl(profile.socials.github)
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-black/10 focus:ring-[#5E4BF7]'
              }`}
            />
            {profile.socials?.github && !isValidExternalUrl(profile.socials.github) && (
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">⚠️ Please enter a valid URL</p>
            )}
          </div>

          <div>
            <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
              Email
            </label>
            <input
              type="email"
              placeholder="you@domain.com"
              value={profile.socials?.email || ''}
              onChange={(e) => handleSocialChange('email', e.target.value)}
              className={`w-full px-3 py-1.5 bg-white rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 ${
                profile.socials?.email && !createMailtoUrl(profile.socials.email)
                  ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                  : 'border-black/10 focus:ring-[#5E4BF7]'
              }`}
            />
            {profile.socials?.email && !createMailtoUrl(profile.socials.email) && (
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">⚠️ Please enter a valid email address</p>
            )}
          </div>
        </div>
      </div>

      {/* Dedicated Save Progress Footer Section */}
      <div className="pt-4 border-t border-black/10 mt-6 sticky bottom-0 bg-white/95 backdrop-blur-md py-3 z-10">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#1C1E22] flex items-center gap-1.5">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} className="text-emerald-600 shrink-0" />
              <span>Save profile & links</span>
            </div>
            <p className="text-[11px] text-[#737882] truncate">
              Persist your bio, handle, WhatsApp routing, and social accounts.
            </p>
          </div>
          <button
            id="save-settings-button"
            type="button"
            onClick={handleTriggerSave}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer shrink-0 ${
              justSaved
                ? 'bg-emerald-600 text-white'
                : isSaving
                ? 'bg-stone-200 text-stone-600'
                : 'bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white active:scale-95'
            }`}
          >
            {isSaving ? (
              <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin" />
            ) : justSaved ? (
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} />
            ) : (
              <HugeiconsIcon icon={FloppyDiskIcon} size={15} />
            )}
            <span>{isSaving ? 'Saving Changes...' : justSaved ? 'Settings Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
