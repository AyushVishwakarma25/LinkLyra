import React from 'react';
import { HugeIcon } from '../HugeIcon';
import { Tick01Icon } from '@hugeicons/core-free-icons';
import { UserAccountSettings } from '../../types';

export interface PreferencesTabProps {
  settings: UserAccountSettings;
  handleSavePreferences: (newSettings: UserAccountSettings) => Promise<void> | void;
  prefSaveFeedback: string | null;
}

export const PreferencesTab: React.FC<PreferencesTabProps> = ({
  settings,
  handleSavePreferences,
  prefSaveFeedback,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6 shadow-2xs space-y-5">
        <div>
          <h3 className="text-sm font-bold text-[#1C1E22]">Notification Channels</h3>
          <p className="text-xs text-[#737882] mt-0.5">
            Control how and when LinkLyra alerts you about new leads, traffic spikes, and product announcements.
          </p>
        </div>

        <div className="space-y-3.5 divide-y divide-black/5">
          {/* Instant Lead Inquiries */}
          <div className="pt-3 first:pt-0 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#1C1E22]">
                Instant Lead & Inquiry Alerts
              </p>
              <p className="text-[11px] text-[#737882]">
                Get notified the moment a visitor requests consultation or clicks your direct inquiry card.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = {
                  ...settings,
                  emailNotifications: {
                    ...settings.emailNotifications,
                    newLeads: !settings.emailNotifications.newLeads,
                  },
                };
                handleSavePreferences(updated);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                settings.emailNotifications.newLeads ? 'bg-[#5E4BF7]' : 'bg-black/20'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.emailNotifications.newLeads ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Weekly Analytics Digest */}
          <div className="pt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#1C1E22]">
                Weekly visitor & click summary
              </p>
              <p className="text-[11px] text-[#737882]">
                Receive a weekly performance summary with top-performing links and visitor breakdown.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = {
                  ...settings,
                  emailNotifications: {
                    ...settings.emailNotifications,
                    weeklyDigest: !settings.emailNotifications.weeklyDigest,
                  },
                };
                handleSavePreferences(updated);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                settings.emailNotifications.weeklyDigest ? 'bg-[#5E4BF7]' : 'bg-black/20'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.emailNotifications.weeklyDigest ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Billing Receipts */}
          <div className="pt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#1C1E22]">
                Billing Invoices & Renewal Receipts
              </p>
              <p className="text-[11px] text-[#737882]">
                Receive automated PDF receipt copies upon renewal or upgrade payments.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = {
                  ...settings,
                  emailNotifications: {
                    ...settings.emailNotifications,
                    billingAlerts: !settings.emailNotifications.billingAlerts,
                  },
                };
                handleSavePreferences(updated);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                settings.emailNotifications.billingAlerts ? 'bg-[#5E4BF7]' : 'bg-black/20'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.emailNotifications.billingAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Localization & Timezone */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#1C1E22]">Regional & Currency Formatting</h3>
          <p className="text-xs text-[#737882] mt-0.5">
            Set your preferred timezone and display currency for dashboard stats.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1C1E22] mb-1.5">
              Currency Display
            </label>
            <select
              value={settings.preferences.currency}
              onChange={(e) => {
                const updated = {
                  ...settings,
                  preferences: {
                    ...settings.preferences,
                    currency: e.target.value as 'INR' | 'USD',
                  },
                };
                handleSavePreferences(updated);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1C1E22] focus:outline-none focus:border-[#5E4BF7]"
            >
              <option value="INR">₹ INR (Indian Rupee)</option>
              <option value="USD">$ USD (US Dollar)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1E22] mb-1.5">
              Primary Timezone
            </label>
            <select
              value={settings.preferences.timezone}
              onChange={(e) => {
                const updated = {
                  ...settings,
                  preferences: {
                    ...settings.preferences,
                    timezone: e.target.value,
                  },
                };
                handleSavePreferences(updated);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1C1E22] focus:outline-none focus:border-[#5E4BF7]"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">America/New_York (EST -5:00)</option>
              <option value="Europe/London">Europe/London (GMT +0:00)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1E22] mb-1.5">
              Date Format
            </label>
            <select
              value={settings.preferences.dateFormat}
              onChange={(e) => {
                const updated = {
                  ...settings,
                  preferences: {
                    ...settings.preferences,
                    dateFormat: e.target.value as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD',
                  },
                };
                handleSavePreferences(updated);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1C1E22] focus:outline-none focus:border-[#5E4BF7]"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (14/09/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (09/14/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-14)</option>
            </select>
          </div>
        </div>
      </div>

      {prefSaveFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <HugeIcon icon={Tick01Icon} size={16} className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{prefSaveFeedback}</span>
        </div>
      )}
    </div>
  );
};
