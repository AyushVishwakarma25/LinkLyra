import React, { useState } from 'react';
import { HugeIcon } from './HugeIcon';
import {
  Cancel01Icon,
  LockIcon,
  Mail01Icon,
  UserIcon,
  Login01Icon,
  UserAdd01Icon,
  Logout01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  CloudIcon,
  Settings01Icon,
} from '@hugeicons/core-free-icons';
import { profileService, auth } from '../lib/firebase';
import { User } from 'firebase/auth';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess: (user: User | null) => void;
  onSignOut?: () => void;
  onOpenAccountSettings?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onSignOut,
  onOpenAccountSettings,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const result = await profileService.signInWithGoogle();
      setSuccessMsg('Signed in with Google successfully!');
      onAuthSuccess(result.user);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      let msg = err.message || 'Failed to sign in with Google. Please try again.';
      if (msg.includes('auth/popup-closed-by-user')) {
        msg = 'Sign-in popup was closed before completing. Please try again.';
      } else if (msg.includes('auth/popup-blocked')) {
        msg = 'Popup was blocked by your browser. Please allow popups for this site.';
      } else if (msg.includes('auth/operation-not-allowed')) {
        msg = 'Google Sign-in is temporarily unavailable. Please try again or use your email.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email || !password || !fullName || !username) {
          throw new Error('Please fill in all required fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        const user = await profileService.signUp(email, password, fullName, username.trim().toLowerCase());
        setSuccessMsg('Account created successfully!');
        onAuthSuccess(user);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        const user = await profileService.signIn(email, password);
        setSuccessMsg('Welcome back! Signed in successfully.');
        onAuthSuccess(user);
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'An error occurred during sign in.';
      if (msg.includes('auth/operation-not-allowed')) {
        msg = 'Please use "Continue with Google" above to sign in instantly.';
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password. Please verify your credentials.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'This email is already in use. Please switch to "Sign In" instead.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (msg.includes('auth/user-not-found')) {
        msg = 'No account found with this email. Please click "Create Account" below.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await profileService.signOut();
      if (onSignOut) onSignOut();
      onAuthSuccess(null);
      setSuccessMsg('Signed out successfully.');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#F5F2EB] w-full max-w-md rounded-[32px] border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#5E4BF7] flex items-center justify-center text-white font-bold text-xs">
              <HugeIcon icon={LockIcon} size={16} className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1C1E22]">
                {currentUser ? 'Your Account' : mode === 'signin' ? 'Sign In to LinkCards' : 'Create an Account'}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-[#737882]">
                <HugeIcon icon={CloudIcon} size={12} className="w-3 h-3 text-[#5E4BF7]" />
                <span>Secure Cloud Sync</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#737882] hover:text-[#1C1E22] transition-colors"
          >
            <HugeIcon icon={Cancel01Icon} size={20} className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700">
              <HugeIcon icon={AlertCircleIcon} size={16} className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2 text-xs text-emerald-700">
              <HugeIcon icon={CheckmarkCircle01Icon} size={16} className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#5E4BF7] text-white flex items-center justify-center mx-auto text-xl font-bold shadow-sm">
                {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C1E22]">
                  {currentUser.displayName || 'LinkCards Creator'}
                </h3>
                <p className="text-xs text-[#737882]">{currentUser.email}</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-black/5 text-left text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#737882]">Auth Provider:</span>
                  <span className="font-semibold text-[#1C1E22]">
                    {currentUser.providerData[0]?.providerId === 'google.com' ? 'Google Account' : 'Email/Password'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#737882]">Sync Status:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <HugeIcon icon={CloudIcon} size={12} className="w-3 h-3" />
                    <span>Saved online</span>
                  </span>
                </div>
              </div>

              {onOpenAccountSettings && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAccountSettings();
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#1C1E22] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                >
                  <HugeIcon icon={Settings01Icon} size={16} className="w-4 h-4 text-[#F8BA38]" />
                  <span>Open Account & Security Settings</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <HugeIcon icon={Logout01Icon} size={16} className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            /* Sign in / Sign up form */
            <div className="space-y-4">
              {/* Google One-Click Sign In */}
              <div>
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[11px] font-bold text-[#1C1E22]">Recommended Method</span>
                  <span className="text-[10px] font-bold text-[#5E4BF7] bg-[#5E4BF7]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <HugeIcon icon={CheckmarkCircle01Icon} size={10} className="w-2.5 h-2.5" />
                    <span>Instant 1-Click</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white hover:bg-black/5 border-2 border-[#5E4BF7]/30 hover:border-[#5E4BF7] rounded-2xl font-bold text-xs text-[#1C1E22] flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-black/10" />
                <span className="text-[10px] font-bold text-[#737882] uppercase tracking-wider">
                  or email
                </span>
                <div className="flex-1 h-px bg-black/10" />
              </div>

              {/* Mode switch pills */}
              <div className="grid grid-cols-2 gap-1 bg-black/5 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === 'signin' ? 'bg-white text-[#1C1E22] shadow-xs' : 'text-[#737882]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === 'signup' ? 'bg-white text-[#1C1E22] shadow-xs' : 'text-[#737882]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <HugeIcon icon={UserIcon} size={16} className="w-4 h-4 text-[#737882] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-white rounded-2xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                        Handle / Username
                      </label>
                      <div className="flex items-center">
                        <span className="px-3 py-2.5 bg-black/5 border border-r-0 border-black/10 rounded-l-2xl text-xs font-bold text-[#737882]">
                          @
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                          className="flex-1 px-3 py-2.5 bg-white rounded-r-2xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7]"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-bold text-[#1C1E22] block mb-1">Email</label>
                  <div className="relative">
                    <HugeIcon icon={Mail01Icon} size={16} className="w-4 h-4 text-[#737882] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white rounded-2xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1C1E22] block mb-1">Password</label>
                  <div className="relative">
                    <HugeIcon icon={LockIcon} size={16} className="w-4 h-4 text-[#737882] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white rounded-2xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#1C1E22] hover:bg-black text-white text-xs font-bold rounded-2xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 mt-2"
                >
                  {mode === 'signin' ? <HugeIcon icon={Login01Icon} size={16} className="w-4 h-4" /> : <HugeIcon icon={UserAdd01Icon} size={16} className="w-4 h-4" />}
                  <span>{loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Free Account'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
