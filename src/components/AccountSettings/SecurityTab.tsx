import React from 'react';
import { HugeIcon } from '../HugeIcon';
import {
  Mail01Icon,
  Loading03Icon,
  Tick01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  LockPasswordIcon,
  LaptopIcon,
} from '@hugeicons/core-free-icons';
import { User } from 'firebase/auth';

export interface SecurityTabProps {
  isGoogleUser?: boolean;
  userEmail: string;
  currentUser: User | null;
  isSendingVerification: boolean;
  verificationSent: boolean;
  handleSendVerificationEmail: () => void;
  passwordSuccess: string | null;
  passwordError: string | null;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  handlePasswordUpdate: (e: React.FormEvent) => void;
  isUpdatingPassword: boolean;
  isSendingReset: boolean;
  resetEmailSent: boolean;
  handleSendPasswordResetEmail: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  isGoogleUser,
  userEmail,
  currentUser,
  isSendingVerification,
  verificationSent,
  handleSendVerificationEmail,
  passwordSuccess,
  passwordError,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handlePasswordUpdate,
  isUpdatingPassword,
  isSendingReset,
  resetEmailSent,
  handleSendPasswordResetEmail,
}) => {
  return (
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
  );
};
