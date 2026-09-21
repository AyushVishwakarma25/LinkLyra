import React, { useState, useRef, useEffect } from 'react';
import { HugeIcon } from './HugeIcon';
import {
  UserIcon,
  Shield01Icon,
  Notification01Icon,
  GlobeIcon,
  Download01Icon,
  Delete02Icon,
  LockPasswordIcon,
  Mail01Icon,
  CallIcon,
  Tick01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  ArrowUpRight01Icon,
  CrownIcon,
  LaptopIcon,
  Key01Icon,
  RefreshIcon,
  EyeIcon,
  Logout01Icon,
  File01Icon,
  Upload01Icon,
  Alert02Icon,
  Loading03Icon,
  CreditCardIcon,
  Cancel01Icon,
  Settings01Icon,
  ArrowRight01Icon,
  Camera01Icon,
} from '@hugeicons/core-free-icons';
import {
  UserProfile,
  UserAccountSettings,
  SubscriptionRecord,
  PaymentInvoiceRecord,
  SubscriptionPlanType,
} from '../types';
import { User } from 'firebase/auth';
import { profileService, auth } from '../lib/firebase';
import { usePlan } from '../hooks/usePlan';
import { uploadImageToStorage } from '../lib/storage';
import { PLANS_CONFIG } from '../lib/razorpay';
import { BillingDashboard } from './BillingDashboard';
import { Button, ButtonGroup } from './ui';

export type AccountSubTab = 'profile' | 'billing' | 'security' | 'preferences' | 'privacy' | 'data';

export interface AccountSettingsProps {
  profile: UserProfile;
  currentUser: User | null;
  isOpen?: boolean;
  initialTab?: AccountSubTab;
  onClose?: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSignOut: () => void;
  onOpenProModal?: (lockedFeatureName?: string) => void;
  onOpenPublicView?: () => void;
  onResetLinks?: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  profile,
  currentUser,
  isOpen = true,
  initialTab = 'profile',
  onClose,
  onUpdateProfile,
  onSignOut,
  onOpenProModal,
  onOpenPublicView,
  onResetLinks,
}) => {
  const [activeTab, setActiveTab] = useState<AccountSubTab>(initialTab);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Form states
  const [name, setName] = useState(profile.name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [headline, setHeadline] = useState(profile.headline || '');
  const [businessPhone, setBusinessPhone] = useState(profile.businessPhone || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Account settings preferences state
  const [settings, setSettings] = useState<UserAccountSettings>(() => {
    return (
      profile.accountSettings || {
        emailNotifications: {
          newLeads: true,
          weeklyDigest: true,
          productUpdates: false,
          billingAlerts: true,
        },
        whatsappNotifications: {
          newLeads: true,
        },
        preferences: {
          timezone: 'Asia/Kolkata',
          currency: 'INR',
          dateFormat: 'DD/MM/YYYY',
          dashboardTheme: 'light',
        },
        privacy: {
          searchEngineIndexing: true,
          cookieConsentBanner: false,
          hideBranding: profile.plan === 'pro' || profile.plan === 'business',
          customDomain: profile.customDomain || '',
        },
      }
    );
  });

  // Password & Security States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Reset Email Trigger States
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Email verification states
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Data Export States
  const [isExportingData, setIsExportingData] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Save feedback state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Danger zone modal states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Sync initial tab when changed from props
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Keep internal states in sync with external profile updates
  useEffect(() => {
    setName(profile.name || '');
    setUsername(profile.username || '');
    setHeadline(profile.headline || '');
    setBusinessPhone(profile.businessPhone || '');
    setAvatarUrl(profile.avatarUrl || '');
    if (profile.accountSettings) {
      setSettings(profile.accountSettings);
    }
  }, [profile]);

  const handleCopyProfileUrl = () => {
    const url = `${window.location.origin}?user=${username || profile.username}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveStatus('error');
      setStatusMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSaveStatus('error');
      setStatusMessage('Image exceeds 2MB. Please upload an image under 2MB for fast loading.');
      return;
    }

    setIsUploadingAvatar(true);
    setStatusMessage(null);
    try {
      const url = await uploadImageToStorage(file, 'avatar', currentUser?.uid);
      setAvatarUrl(url);
      onUpdateProfile({ avatarUrl: url });
      setSaveStatus('saved');
      setStatusMessage('Avatar updated and compressed successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setSaveStatus('error');
      setStatusMessage('Could not upload photo. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfileIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setStatusMessage(null);

    const cleanUsername = (username || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    try {
      const updates: Partial<UserProfile> = {
        name: name.trim(),
        username: cleanUsername || profile.username,
        headline: headline.trim(),
        businessPhone: businessPhone.trim(),
        avatarUrl,
        accountSettings: settings,
      };

      onUpdateProfile(updates);

      if (currentUser) {
        await profileService.updateProfile(currentUser.uid, {
          full_name: name.trim(),
          username: cleanUsername || profile.username,
          bio: headline.trim(),
          business_phone: businessPhone.trim(),
          avatar_url: avatarUrl,
        });
      }

      setSaveStatus('saved');
      setStatusMessage('Account profile details updated!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save profile details:', err);
      setSaveStatus('error');
      setStatusMessage('Could not save details to cloud. Check network connection.');
    }
  };

  const [prefSaveFeedback, setPrefSaveFeedback] = useState<string | null>(null);

  const handleSavePreferences = async (newSettings: UserAccountSettings) => {
    setSettings(newSettings);
    onUpdateProfile({
      accountSettings: newSettings,
      customDomain: newSettings.privacy?.customDomain || '',
    });
    if (currentUser) {
      await profileService.updateAccountSettings(currentUser.uid, newSettings);
    }
    setPrefSaveFeedback('Preferences & notifications saved!');
    setTimeout(() => setPrefSaveFeedback(null), 3000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (auth.currentUser) {
        await profileService.updateAccountPassword(newPassword);
        setPasswordSuccess('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordSuccess('Password updated locally (Active session)!');
      }
    } catch (err: any) {
      console.error('Password update error:', err);
      setPasswordError(err.message || 'Failed to update password. Please re-authenticate.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSendPasswordResetEmail = async () => {
    const email = currentUser?.email || profile.email;
    if (!email) {
      setPasswordError('No email associated with this account.');
      return;
    }

    setIsSendingReset(true);
    try {
      await profileService.sendPasswordReset(email);
      setResetEmailSent(true);
      setPasswordSuccess(`Password reset email sent to ${email}`);
    } catch (err: any) {
      console.error('Failed to send reset email:', err);
      setPasswordError(err.message || 'Failed to send reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!currentUser) return;
    setIsSendingVerification(true);
    try {
      await profileService.sendVerificationEmail();
      setVerificationSent(true);
    } catch (err: any) {
      console.error('Verification email error:', err);
    } finally {
      setIsSendingVerification(false);
    }
  };

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

  const handleExportLeadsCsv = () => {
    const csvHeader = 'Timestamp,Name,Email,Phone,InquiryType,Message,Status\n';
    const sampleRows = [
      `"${new Date().toISOString()}","Aarav Mehta","aarav@example.com","+91 9876543210","Design Consultation","Looking for UI/UX redesign proposal.","New Lead"`,
      `"${new Date(Date.now() - 86400000).toISOString()}","Priya Sharma","priya.s@agency.in","+91 9811223344","Brand Collaboration","Interested in sponsored campaign.","Contacted"`,
    ].join('\n');

    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `linklyra_leads_${profile.username}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDeleteAccountFinal = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setIsDeletingAccount(true);

    try {
      if (currentUser?.uid) {
        await profileService.deleteUserAccount(currentUser.uid);
      }
      onSignOut();
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      alert('Could not complete account deletion: ' + (err.message || 'Please sign in again first.'));
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  const userEmail = currentUser?.email || profile.email || 'user@example.com';
  const { plan: userPlan, isAgency, isPro: isProHook } = usePlan();
  const currentPlan = isAgency ? 'agency' : (userPlan || profile.plan || 'free');
  const planInfo = PLANS_CONFIG[currentPlan as SubscriptionPlanType] || PLANS_CONFIG.free;
  const isPro = isProHook || isAgency || currentPlan === 'pro' || currentPlan === 'business';
  const isGoogleUser = currentUser?.providerData?.some((p) => p.providerId === 'google.com');

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return isoStr;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-[#FAF8F5] w-full max-w-5xl max-h-[94dvh] sm:max-h-[92vh] rounded-t-[32px] sm:rounded-3xl border border-black/10 shadow-2xl flex flex-col overflow-hidden animate-scaleUp pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-white shrink-0">
          <div className="w-12 h-1 bg-stone-300 rounded-full" />
        </div>
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-b border-black/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5E4BF7] text-white flex items-center justify-center shadow-xs">
              <HugeIcon icon={Settings01Icon} size={20} className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#1C1E22] tracking-tight">
                  Account & Settings Hub
                </h2>
                {isAgency ? (
                  <span className="px-2.5 py-0.5 bg-[#1C1E22] text-[#F8BA38] font-black text-[10px] rounded-full flex items-center gap-1 shadow-xs tracking-wide border border-black/10">
                    <HugeIcon icon={CrownIcon} size={12} className="w-3 h-3 text-[#F8BA38]" />
                    <span>AGENCY VIP ACCESS</span>
                  </span>
                ) : isPro ? (
                  <span className="px-2 py-0.5 bg-[#F8BA38] text-[#191A1E] font-black text-[10px] rounded-sm flex items-center gap-1">
                    <HugeIcon icon={CrownIcon} size={12} className="w-3 h-3 text-[#191A1E]" />
                    <span>PRO CREATOR</span>
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-[#737882]">
                Manage your public creator profile, subscription, Razorpay billing, and security.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPublicView && (
              <button
                type="button"
                onClick={onOpenPublicView}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-bold text-[#1C1E22] transition-colors"
              >
                <HugeIcon icon={EyeIcon} size={14} className="w-3.5 h-3.5 text-[#5E4BF7]" />
                <span>View Live Link</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#737882] hover:text-[#1C1E22] transition-colors"
                title="Close settings"
              >
                <HugeIcon icon={Cancel01Icon} size={20} className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Left Sub-Navigation + Right Content Panels */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sub Navigation Bar (Sidebar on desktop, Top scroll on mobile) */}
          <div className="w-full md:w-60 bg-white border-b md:border-b-0 md:border-r border-black/10 p-3 md:p-4 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 md:w-full ${
                activeTab === 'profile'
                  ? 'bg-[#5E4BF7] text-white shadow-xs'
                  : 'text-[#737882] hover:bg-black/5 hover:text-[#1C1E22]'
              }`}
            >
              <HugeIcon icon={UserIcon} size={16} className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Profile & Bio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 md:w-full ${
                activeTab === 'billing'
                  ? 'bg-[#5E4BF7] text-white shadow-xs'
                  : 'text-[#737882] hover:bg-black/5 hover:text-[#1C1E22]'
              }`}
            >
              <HugeIcon icon={CreditCardIcon} size={16} className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Plans & Billing</span>
              {isPro && (
                <span className={`px-1.5 py-0.2 rounded-xs text-[9px] font-black ${
                  activeTab === 'billing' ? 'bg-white text-[#5E4BF7]' : 'bg-[#F8BA38] text-[#191A1E]'
                }`}>
                  PRO
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 md:w-full ${
                activeTab === 'security'
                  ? 'bg-[#5E4BF7] text-white shadow-xs'
                  : 'text-[#737882] hover:bg-black/5 hover:text-[#1C1E22]'
              }`}
            >
              <HugeIcon icon={Shield01Icon} size={16} className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Security & Login</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 md:w-full ${
                activeTab === 'preferences'
                  ? 'bg-[#5E4BF7] text-white shadow-xs'
                  : 'text-[#737882] hover:bg-black/5 hover:text-[#1C1E22]'
              }`}
            >
              <HugeIcon icon={Notification01Icon} size={16} className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Preferences & Alerts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 md:w-full ${
                activeTab === 'privacy'
                  ? 'bg-[#5E4BF7] text-white shadow-xs'
                  : 'text-[#737882] hover:bg-black/5 hover:text-[#1C1E22]'
              }`}
            >
              <HugeIcon icon={GlobeIcon} size={16} className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Privacy & Domains</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 md:w-full ${
                activeTab === 'data'
                  ? 'bg-[#5E4BF7] text-white shadow-xs'
                  : 'text-[#737882] hover:bg-black/5 hover:text-[#1C1E22]'
              }`}
            >
              <HugeIcon icon={Download01Icon} size={16} className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Data & Danger Zone</span>
            </button>

            {/* Sign Out Button at Bottom of Sidebar */}
            <div className="hidden md:block mt-auto pt-4 border-t border-black/10">
              <button
                type="button"
                onClick={onSignOut}
                className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <HugeIcon icon={Logout01Icon} size={16} className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
            {/* Status Feedback Toast */}
            {saveStatus === 'saved' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between gap-2 shadow-2xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <HugeIcon icon={CheckmarkCircle01Icon} size={16} className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{statusMessage || 'Changes saved successfully!'}</span>
                </div>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 shadow-2xs animate-fadeIn">
                <HugeIcon icon={AlertCircleIcon} size={16} className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{statusMessage || 'An error occurred while saving.'}</span>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 1: PROFILE & IDENTITY */}
            {/* ======================================================== */}
            {activeTab === 'profile' && (
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
            )}

            {/* ======================================================== */}
            {/* TAB 2: OPTIMIZED PLANS & BILLING */}
            {/* ======================================================== */}
            {activeTab === 'billing' && (
              <BillingDashboard
                profile={profile}
                currentUser={currentUser}
                onOpenUpgradeModal={() => onOpenProModal && onOpenProModal('Pro Plan Upgrade')}
                onProfileUpdate={onUpdateProfile}
              />
            )}

            {/* ======================================================== */}
            {/* TAB 3: SECURITY & LOGIN */}
            {/* ======================================================== */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Auth Provider & Verification Status Card */}
                <div className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1E22]">Account Sign-In</h3>
                    <p className="text-xs text-[#737882] mt-0.5">
                      Manage your linked login method, email verification, and security.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-xs font-bold shadow-2xs shrink-0">
                        {isGoogleUser ? (
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                        ) : (
                          <HugeIcon icon={Mail01Icon} size={20} className="w-5 h-5 text-[#5E4BF7]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1C1E22]">
                            {isGoogleUser ? 'Google Account' : 'Email & Password'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            Connected
                          </span>
                        </div>
                        <p className="text-[11px] text-[#737882]">{userEmail}</p>
                      </div>
                    </div>

                    {currentUser && !currentUser.emailVerified && !isGoogleUser && (
                      <button
                        type="button"
                        disabled={isSendingVerification || verificationSent}
                        onClick={handleSendVerificationEmail}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-black/10 hover:bg-black/5 text-[#1C1E22] flex items-center gap-1.5 shadow-2xs"
                      >
                        {isSendingVerification ? (
                          <HugeIcon icon={Loading03Icon} size={14} className="w-3.5 h-3.5 animate-spin" />
                        ) : verificationSent ? (
                          <HugeIcon icon={Tick01Icon} size={14} className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <HugeIcon icon={Mail01Icon} size={14} className="w-3.5 h-3.5 text-[#5E4BF7]" />
                        )}
                        <span>{verificationSent ? 'Verification Sent!' : 'Verify Email'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Password Update Card */}
                <div className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1E22]">Password & Credentials</h3>
                    <p className="text-xs text-[#737882] mt-0.5">
                      Update your account password or trigger an official password reset link.
                    </p>
                  </div>

                  {passwordSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <HugeIcon icon={CheckmarkCircle01Icon} size={16} className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}
                  {passwordError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                      <HugeIcon icon={AlertCircleIcon} size={16} className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordUpdate} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1C1E22] mb-1.5">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-[#1C1E22] focus:outline-none focus:border-[#5E4BF7] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1C1E22] mb-1.5">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs text-[#1C1E22] focus:outline-none focus:border-[#5E4BF7] transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        disabled={isSendingReset}
                        onClick={handleSendPasswordResetEmail}
                        className="text-xs font-bold text-[#5E4BF7] hover:underline flex items-center gap-1"
                      >
                        {isSendingReset ? (
                          <HugeIcon icon={Loading03Icon} size={14} className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <HugeIcon icon={Mail01Icon} size={14} className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {resetEmailSent
                            ? 'Reset link sent to your inbox!'
                            : 'Send Password Reset Email'}
                        </span>
                      </button>

                      <button
                        type="submit"
                        disabled={isUpdatingPassword || !newPassword}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1C1E22] hover:bg-black text-white shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isUpdatingPassword ? (
                          <HugeIcon icon={Loading03Icon} size={14} className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <HugeIcon icon={LockPasswordIcon} size={14} className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Active Sessions Log */}
                <div className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#1C1E22]">Active Sessions & Devices</h3>
                      <p className="text-xs text-[#737882] mt-0.5">
                        Devices currently authenticated to your LinkLyra Creator account.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      1 Active Session
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center text-[#1C1E22]">
                        <HugeIcon icon={LaptopIcon} size={16} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#1C1E22]">
                            Current Browser ({navigator.userAgent.includes('Mac') ? 'macOS' : 'Windows / Linux'})
                          </p>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[11px] text-[#737882]">
                          Active Now • HTTPS Encrypted Session
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Current
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: PREFERENCES & NOTIFICATIONS */}
            {/* ======================================================== */}
            {activeTab === 'preferences' && (
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
            )}

            {/* ======================================================== */}
            {/* TAB 5: PRIVACY, SEO & CUSTOM DOMAINS */}
            {/* ======================================================== */}
            {activeTab === 'privacy' && (
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
                          onClick={() => {
                            const updated = {
                              ...settings,
                              privacy: {
                                ...settings.privacy,
                                hideBranding: !settings.privacy.hideBranding,
                              },
                            };
                            handleSavePreferences(updated);
                          }}
                          className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                            settings.privacy.hideBranding ? 'bg-[#5E4BF7]' : 'bg-black/20'
                          }`}
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
                        Connect your own branded domain (e.g., <code className="font-mono text-[#5E4BF7]">links.ayush.design</code>).
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
                            placeholder="e.g. links.yourdomain.com or bio.ayush.design"
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
            )}

            {/* ======================================================== */}
            {/* TAB 6: DATA EXPORT & DANGER ZONE */}
            {/* ======================================================== */}
            {activeTab === 'data' && (
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
              </div>
            )}
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

            <div className="flex items-center justify-end gap-2 pt-2">
              <ButtonGroup variant="secondary" size="sm">
                <Button
                  variant="ghost"
                  disabled={isDeletingAccount}
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmationText('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  disabled={deleteConfirmationText !== 'DELETE' || isDeletingAccount}
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
