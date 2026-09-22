import React, { useState, useRef, useEffect } from 'react';
import { HugeIcon } from '../HugeIcon';
import {
  UserIcon,
  Shield01Icon,
  Notification01Icon,
  GlobeIcon,
  Download01Icon,
  CrownIcon,
  EyeIcon,
  Logout01Icon,
  CreditCardIcon,
  Cancel01Icon,
  Settings01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';
import {
  UserProfile,
  UserAccountSettings,
  SubscriptionPlanType,
} from '../../types';
import { User } from 'firebase/auth';
import { profileService, auth, functions } from '../../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { usePlan } from '../../hooks/usePlan';
import { uploadImageToStorage } from '../../lib/storage';
import { PLANS_CONFIG } from '../../lib/razorpay';
import { useToast } from '../../context/ToastContext';

import { ProfileTab } from './ProfileTab';
import { BillingTab } from './BillingTab';
import { SecurityTab } from './SecurityTab';
import { PreferencesTab } from './PreferencesTab';
import { PrivacyTab } from './PrivacyTab';
import { DataTab } from './DataTab';

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
  const toast = useToast();

  // Form states
  const [name, setName] = useState(profile.name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [headline, setHeadline] = useState(profile.headline || '');
  const [businessPhone, setBusinessPhone] = useState(profile.businessPhone || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [_isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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

  // Save feedback state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isUpdatingWhiteLabel, setIsUpdatingWhiteLabel] = useState(false);

  const handleToggleWhiteLabel = async () => {
    if (isUpdatingWhiteLabel) return;
    const targetState = !settings.privacy.hideBranding;
    setIsUpdatingWhiteLabel(true);
    try {
      const setWhiteLabelFn = httpsCallable<{ enabled: boolean }, { success: boolean; whiteLabel: boolean }>(
        functions,
        'setWhiteLabel'
      );
      await setWhiteLabelFn({ enabled: targetState });
      const updated = {
        ...settings,
        privacy: {
          ...settings.privacy,
          hideBranding: targetState,
        },
      };
      handleSavePreferences(updated);
    } catch (err: any) {
      console.error('Failed to update white label setting:', err);
      toast.error(err?.message || 'Failed to update white-label setting. Please ensure you have an active Pro subscription.');
    } finally {
      setIsUpdatingWhiteLabel(false);
    }
  };

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

  const userEmail = currentUser?.email || profile.email || 'user@example.com';
  const { plan: userPlan, isAgency, isPro: isProHook } = usePlan();
  const currentPlan = isAgency ? 'agency' : (userPlan || profile.plan || 'free');
  const _planInfo = PLANS_CONFIG[currentPlan as SubscriptionPlanType] || PLANS_CONFIG.free;
  const isPro = isProHook || isAgency || currentPlan === 'pro' || currentPlan === 'business';
  const isGoogleUser = currentUser?.providerData?.some((p) => p.providerId === 'google.com');

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

            {/* TAB 1: PROFILE & IDENTITY */}
            {activeTab === 'profile' && (
              <ProfileTab
                profile={profile}
                avatarUrl={avatarUrl}
                name={name}
                setName={setName}
                username={username}
                setUsername={setUsername}
                headline={headline}
                setHeadline={setHeadline}
                businessPhone={businessPhone}
                setBusinessPhone={setBusinessPhone}
                isPro={isPro}
                userEmail={userEmail}
                copiedUrl={copiedUrl}
                handleCopyProfileUrl={handleCopyProfileUrl}
                avatarInputRef={avatarInputRef}
                handleAvatarFileSelect={handleAvatarFileSelect}
                handleSaveProfileIdentity={handleSaveProfileIdentity}
                saveStatus={saveStatus}
              />
            )}

            {/* TAB 2: PLANS & BILLING */}
            {activeTab === 'billing' && (
              <BillingTab
                profile={profile}
                currentUser={currentUser}
                onOpenUpgradeModal={() => onOpenProModal && onOpenProModal('Pro Plan Upgrade')}
                onProfileUpdate={onUpdateProfile}
              />
            )}

            {/* TAB 3: SECURITY & LOGIN */}
            {activeTab === 'security' && (
              <SecurityTab
                isGoogleUser={isGoogleUser}
                userEmail={userEmail}
                currentUser={currentUser}
                isSendingVerification={isSendingVerification}
                verificationSent={verificationSent}
                handleSendVerificationEmail={handleSendVerificationEmail}
                passwordSuccess={passwordSuccess}
                passwordError={passwordError}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                handlePasswordUpdate={handlePasswordUpdate}
                isUpdatingPassword={isUpdatingPassword}
                isSendingReset={isSendingReset}
                resetEmailSent={resetEmailSent}
                handleSendPasswordResetEmail={handleSendPasswordResetEmail}
              />
            )}

            {/* TAB 4: PREFERENCES & NOTIFICATIONS */}
            {activeTab === 'preferences' && (
              <PreferencesTab
                settings={settings}
                handleSavePreferences={handleSavePreferences}
                prefSaveFeedback={prefSaveFeedback}
              />
            )}

            {/* TAB 5: PRIVACY, SEO & CUSTOM DOMAINS */}
            {activeTab === 'privacy' && (
              <PrivacyTab
                settings={settings}
                setSettings={setSettings}
                handleSavePreferences={handleSavePreferences}
                isPro={isPro}
                isUpdatingWhiteLabel={isUpdatingWhiteLabel}
                handleToggleWhiteLabel={handleToggleWhiteLabel}
                onOpenProModal={onOpenProModal}
              />
            )}

            {/* TAB 6: DATA EXPORT & DANGER ZONE */}
            {activeTab === 'data' && (
              <DataTab
                profile={profile}
                currentUser={currentUser}
                onSignOut={onSignOut}
                onOpenProModal={onOpenProModal}
                onResetLinks={onResetLinks}
                settings={settings}
                isGoogleUser={isGoogleUser}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
