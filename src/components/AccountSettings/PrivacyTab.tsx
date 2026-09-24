import React from 'react';
import { HugeIcon } from '../HugeIcon';
import { CrownIcon, Tick01Icon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { UserAccountSettings } from '../../types';

export interface PrivacyTabProps {
  settings: UserAccountSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserAccountSettings>>;
  handleSavePreferences: (newSettings: UserAccountSettings) => Promise<void> | void;
  isPro: boolean;
  isUpdatingWhiteLabel: boolean;
  handleToggleWhiteLabel: () => Promise<void> | void;
  onOpenProModal?: (lockedFeatureName?: string) => void;
}

export const PrivacyTab: React.FC<PrivacyTabProps> = ({
  settings,
  setSettings,
  handleSavePreferences,
  isPro,
  isUpdatingWhiteLabel,
  handleToggleWhiteLabel,
  onOpenProModal,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#1C1E22]">Search Engine Indexing & Privacy</h3>
          <p className="text-xs text-[#737882] mt-0.5">
            Control whether search engines like Google and Bing can discover and index your public profile.
          </p>
        </div>

        <div className="space-y-3 divide-y divide-black/5">
          <div className="pt-2 first:pt-0 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#1C1E22]">
                Show page in Google search
              </p>
              <p className="text-[11px] text-[#737882]">
                When enabled, your profile can be found by people searching for your name or handle online.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = {
                  ...settings,
                  privacy: {
                    ...settings.privacy,
                    searchEngineIndexing: !settings.privacy.searchEngineIndexing,
                  },
                };
                handleSavePreferences(updated);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                settings.privacy.searchEngineIndexing ? 'bg-[#5E4BF7]' : 'bg-black/20'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.privacy.searchEngineIndexing ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#1C1E22]">
                Visitor Cookie Notice Banner
              </p>
              <p className="text-[11px] text-[#737882]">
                Display a subtle GDPR / CCPA cookie consent banner on your public mobile page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = {
                  ...settings,
                  privacy: {
                    ...settings.privacy,
                    cookieConsentBanner: !settings.privacy.cookieConsentBanner,
                  },
                };
                handleSavePreferences(updated);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                settings.privacy.cookieConsentBanner ? 'bg-[#5E4BF7]' : 'bg-black/20'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.privacy.cookieConsentBanner ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* White-Labeling Branding Control */}
          <div className="pt-3 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-[#1C1E22]">
                  Remove "Powered by LinkLyra" Branding
                </p>
                <span className="px-1.5 py-0.2 bg-[#F8BA38] text-[#191A1E] font-black text-[9px] rounded-xs">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[#737882]">
                100% white-label your public profile for clean agency and executive branding.
              </p>
            </div>
            {isPro ? (
              <button
                type="button"
                disabled={isUpdatingWhiteLabel}
                onClick={handleToggleWhiteLabel}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  isUpdatingWhiteLabel ? 'opacity-60 cursor-wait' : 'cursor-pointer'
                } ${settings.privacy.hideBranding ? 'bg-[#5E4BF7]' : 'bg-black/20'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.privacy.hideBranding ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenProModal && onOpenProModal('White-Label Branding')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#5E4BF7]/10 text-[#5E4BF7] hover:bg-[#5E4BF7]/20 transition-colors flex items-center gap-1"
              >
                <HugeIcon icon={CrownIcon} size={12} className="w-3 h-3 text-[#F8BA38]" />
                <span>Unlock</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Custom Domain Configuration */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1C1E22]">Custom Domain Mapping</h3>
              <span className="px-1.5 py-0.2 bg-[#F8BA38] text-[#191A1E] font-black text-[9px] rounded-xs">
                PRO
              </span>
            </div>
            <p className="text-xs text-[#737882] mt-0.5">
              Connect your own branded domain (e.g., <code className="font-mono text-[#5E4BF7]">links.yourbrand.com</code>).
            </p>
          </div>
        </div>

        {isPro ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1E22] mb-1.5">
                Your Branded Domain or Subdomain
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={settings.privacy.customDomain || ''}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      privacy: {
                        ...settings.privacy,
                        customDomain: e.target.value.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, ''),
                      },
                    });
                  }}
                  placeholder="e.g. links.yourdomain.com or bio.yourbrand.com"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-mono text-[#1C1E22] focus:outline-none focus:border-[#5E4BF7]"
                />
                <button
                  type="button"
                  onClick={() => handleSavePreferences(settings)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1C1E22] hover:bg-black text-white shadow-xs flex items-center justify-center gap-1.5"
                >
                  <HugeIcon icon={Tick01Icon} size={14} className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save & Bind Domain</span>
                </button>
              </div>
            </div>

            {settings.privacy.customDomain && (
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-950 font-mono">
                      https://{settings.privacy.customDomain}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ACTIVE & MAPPED
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Direct domain resolution is active and securely connected.
                  </p>
                </div>

                <a
                  href={`/?domain=${settings.privacy.customDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-300 flex items-center justify-center gap-1 shadow-2xs transition-colors shrink-0"
                >
                  <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
                  <span>Test Live URL</span>
                </a>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-black/5 text-xs text-[#737882] space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[#1C1E22] font-sans">Required DNS Records at your Registrar:</p>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Auto-SSL Protected</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-black/5">
                  <span className="text-[10px] text-[#737882] font-sans block mb-1">For Subdomain (e.g. links.domain.com):</span>
                  <span>CNAME <strong className="text-[#1C1E22]">links</strong> → <strong className="text-[#5E4BF7]">cname.linklyra.app</strong></span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-black/5">
                  <span className="text-[10px] text-[#737882] font-sans block mb-1">For Root Apex (e.g. domain.com):</span>
                  <span>A Record <strong className="text-[#1C1E22]">@</strong> → <strong className="text-[#5E4BF7]">76.76.21.21</strong></span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-black/5 flex items-center justify-between gap-3">
            <p className="text-xs text-[#737882]">
              Connect your personal domain with automatic SSL encryption and instant routing on Pro.
            </p>
            <button
              type="button"
              onClick={() => onOpenProModal && onOpenProModal('Custom Domain Mapping')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white shrink-0 shadow-2xs"
            >
              Unlock Custom Domains
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
