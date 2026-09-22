import React, { useState } from 'react';
import { HugeIcon } from '../HugeIcon';
import {
  Download01Icon,
  File01Icon,
  Alert02Icon,
  RefreshIcon,
  Delete02Icon,
  Loading03Icon,
  Tick01Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';
import { UserProfile, UserAccountSettings } from '../../types';
import {
  User,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { profileService } from '../../lib/firebase';
import { downloadLeadsCsv } from '../../lib/csvExport';
import { Button, ButtonGroup } from '../ui';
import { useToast } from '../../context/ToastContext';

export interface DataTabProps {
  profile: UserProfile;
  currentUser: User | null;
  onSignOut: () => void;
  onOpenProModal?: (lockedFeatureName?: string) => void;
  onResetLinks?: () => void;
  settings: UserAccountSettings;
  isGoogleUser?: boolean;
}

export const DataTab: React.FC<DataTabProps> = ({
  profile,
  currentUser,
  onSignOut,
  onOpenProModal,
  onResetLinks,
  settings,
  isGoogleUser,
}) => {
  const toast = useToast();

  // Data Export States
  const [isExportingData, setIsExportingData] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Danger zone modal states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteReauthPassword, setDeleteReauthPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleFullDataExport = async () => {
    setIsExportingData(true);
    try {
      const userInvoices = currentUser?.uid ? await profileService.getPaymentInvoices(currentUser.uid).catch(() => []) : [];
      const exportObject = {
        exportDate: new Date().toISOString(),
        version: '2.0',
        account: {
          id: currentUser?.uid || profile.id,
          name: profile.name,
          username: profile.username,
          headline: profile.headline,
          email: currentUser?.email || profile.email,
          businessPhone: profile.businessPhone,
          avatarUrl: profile.avatarUrl,
          plan: profile.plan,
          createdAt: profile.createdAt,
        },
        themeConfig: profile.themeConfig,
        accountSettings: settings,
        cards: profile.cards,
        sections: profile.sections,
        socialIcons: profile.socialIcons,
        invoices: userInvoices,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `linklyra_archive_${profile.username}_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExportingData(false);
    }
  };

  const handleExportLeadsCsv = async () => {
    const isAgency = profile.plan === 'agency' || (profile as any).role === 'agency';
    const isBusiness = profile.plan === 'business';

    if (!isAgency && !isBusiness) {
      if (onOpenProModal) {
        onOpenProModal('Lead CRM CSV Export');
      } else {
        toast.warning('Exporting Lead CRM to CSV requires the Business or Agency plan.');
      }
      return;
    }

    const pageId = profile.id || currentUser?.uid || profile.username;
    if (!pageId) {
      toast.error('Account ID not found.');
      return;
    }

    try {
      const leads = await profileService.getLeads(pageId);
      if (!leads || leads.length === 0) {
        toast.info('No inbound leads or inquiries to export yet.');
        return;
      }
      downloadLeadsCsv(leads, profile.username || 'creator');
    } catch (err: any) {
      console.error('Error exporting leads CSV:', err);
      toast.error('Failed to export leads: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleDeleteAccountFinal = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    if (!currentUser) return;

    setDeleteError(null);
    setIsDeletingAccount(true);

    try {
      // 1. Re-authenticate first
      const isGoogle = currentUser.providerData?.some((p) => p.providerId === 'google.com');
      if (isGoogle) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await reauthenticateWithPopup(currentUser, provider);
      } else {
        if (!deleteReauthPassword) {
          throw new Error('Please enter your current password to confirm account deletion.');
        }
        if (!currentUser.email) {
          throw new Error('No user email associated with this account.');
        }
        const credential = EmailAuthProvider.credential(currentUser.email, deleteReauthPassword);
        await reauthenticateWithCredential(currentUser, credential);
      }

      // 2. Call Cloud Function via deleteUserAccount
      await profileService.deleteUserAccount(currentUser.uid);

      // 3. Sign out and reload
      onSignOut();
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      let msg = err.message || 'Could not complete account deletion.';
      if (msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
        msg = 'Incorrect password. Re-authentication failed.';
      } else if (msg.includes('auth/popup-closed-by-user')) {
        msg = 'Google re-authentication was cancelled. Please try again.';
      }
      setDeleteError(msg);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#1C1E22]">Data Portability & Archives</h3>
          <p className="text-xs text-[#737882] mt-0.5">
            Export complete backups of your creator links, theme styling, analytics logs, and leads.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full JSON Export */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-black/5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <HugeIcon icon={Download01Icon} size={16} className="w-4 h-4 text-[#5E4BF7]" />
                <p className="text-xs font-bold text-[#1C1E22]">Complete Account Archive (JSON)</p>
              </div>
              <p className="text-[11px] text-[#737882] mt-1">
                Includes all links, sections, theme configs, analytics events, and invoices.
              </p>
            </div>
            <button
              type="button"
              disabled={isExportingData}
              onClick={handleFullDataExport}
              className="w-full py-2 rounded-xl text-xs font-bold bg-white border border-black/10 hover:bg-black/5 text-[#1C1E22] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              {isExportingData ? (
                <HugeIcon icon={Loading03Icon} size={14} className="w-3.5 h-3.5 animate-spin" />
              ) : exportSuccess ? (
                <HugeIcon icon={Tick01Icon} size={14} className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <HugeIcon icon={Download01Icon} size={14} className="w-3.5 h-3.5 text-[#5E4BF7]" />
              )}
              <span>{exportSuccess ? 'Export Downloaded!' : 'Download JSON Bundle'}</span>
            </button>
          </div>

          {/* CSV Leads Export */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-black/5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <HugeIcon icon={File01Icon} size={16} className="w-4 h-4 text-emerald-600" />
                <p className="text-xs font-bold text-[#1C1E22]">Export Leads & Inquiries (CSV)</p>
              </div>
              <p className="text-[11px] text-[#737882] mt-1">
                Tabular spreadsheet format compatible with Microsoft Excel and Google Sheets.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportLeadsCsv}
              className="w-full py-2 rounded-xl text-xs font-bold bg-white border border-black/10 hover:bg-black/5 text-[#1C1E22] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <HugeIcon icon={File01Icon} size={14} className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Leads CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-5 sm:p-6 shadow-2xs space-y-5">
        <div>
          <div className="flex items-center gap-2 text-rose-700">
            <HugeIcon icon={Alert02Icon} size={16} className="w-4 h-4 text-rose-700" />
            <h3 className="text-sm font-bold">Danger Zone</h3>
          </div>
          <p className="text-xs text-rose-600/80 mt-0.5">
            Irreversible actions. Please proceed with caution.
          </p>
        </div>

        <div className="space-y-4 divide-y divide-rose-200/60">
          {/* Reset Links */}
          <div className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#1C1E22]">Reset All Profile Links</p>
              <p className="text-[11px] text-[#737882]">
                Clears your custom card stack and restores the starter cards template.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-rose-300 bg-white text-rose-600 hover:bg-rose-50 shadow-2xs transition-colors self-start sm:self-auto"
            >
              Reset Links
            </button>
          </div>

          {/* Permanent Delete Account */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-rose-700">Permanently Delete Account</p>
              <p className="text-[11px] text-[#737882]">
                Permanently delete your profile, username, subscriptions, and all cloud database records.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors self-start sm:self-auto"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-black/10 max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <HugeIcon icon={RefreshIcon} size={20} className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1C1E22]">Reset Profile Cards?</h4>
              <p className="text-xs text-[#737882] mt-1">
                This will reset your current link cards back to default starter items. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <ButtonGroup variant="secondary" size="sm">
                <Button
                  variant="ghost"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (onResetLinks) onResetLinks();
                    setShowResetConfirm(false);
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                >
                  <span>Confirm Reset</span>
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-black/10 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <HugeIcon icon={Delete02Icon} size={24} className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-rose-700">Delete Account & Data</h4>
              <p className="text-xs text-[#737882] mt-1.5 leading-relaxed">
                This will permanently delete your LinkLyra user account (<strong className="text-[#1C1E22]">@{profile.username}</strong>), release your username slug, cancel active subscriptions, and permanently erase all stored analytics and lead logs.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1C1E22]">
                Type <span className="font-mono text-rose-600 font-black">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 rounded-xl border border-rose-300 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {!isGoogleUser && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1C1E22]">
                  Enter current password to verify identity:
                </label>
                <input
                  type="password"
                  value={deleteReauthPassword}
                  onChange={(e) => setDeleteReauthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            )}

            {isGoogleUser && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-[#737882]">
                A Google sign-in window will confirm your ownership before deletion is executed.
              </div>
            )}

            {deleteError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium flex items-center gap-1.5">
                <HugeIcon icon={AlertCircleIcon} size={14} className="w-3.5 h-3.5 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <ButtonGroup variant="secondary" size="sm">
                <Button
                  variant="ghost"
                  disabled={isDeletingAccount}
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmationText('');
                    setDeleteReauthPassword('');
                    setDeleteError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  disabled={
                    deleteConfirmationText !== 'DELETE' ||
                    (!isGoogleUser && !deleteReauthPassword) ||
                    isDeletingAccount
                  }
                  onClick={handleDeleteAccountFinal}
                >
                  {isDeletingAccount && <HugeIcon icon={Loading03Icon} size={14} className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDeletingAccount ? 'Deleting...' : 'Permanently Delete'}</span>
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
