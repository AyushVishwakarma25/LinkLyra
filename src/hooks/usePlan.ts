import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth, functions } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

export type PlanType = 'free' | 'pro' | 'business' | 'agency';

export interface UsePlanReturn {
  plan: PlanType;
  isPro: boolean;
  isBusiness: boolean;
  isAgency: boolean;
  expiresAt: number | null;
  isExpired: boolean;
  loading: boolean;
  user: User | null;
  refreshPlan: (force?: boolean) => Promise<PlanType>;
}

/**
 * usePlan Hook (Alternate Architecture):
 * Evaluates subscription entitlements cryptographically from Firebase Auth Custom Claims (JWT).
 * Provides zero-database-read entitlement verification, exact-second expiration detection,
 * and server-synchronized token refresh.
 */
export function usePlan(): UsePlanReturn {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [plan, setPlan] = useState<PlanType>('free');
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const resolveEntitlements = useCallback(async (currentUser: User, forceServerSync = false): Promise<PlanType> => {
    try {
      // 1. Read cryptographic JWT Custom Claims directly from Firebase Auth token
      const tokenResult = await currentUser.getIdTokenResult(forceServerSync);
      const claims = tokenResult.claims;
      const claimPlan = (claims.plan as PlanType) || (claims.pro ? 'pro' : undefined);
      const claimExpiresAt = typeof claims.expiresAt === 'number' ? claims.expiresAt : null;

      const nowSec = Math.floor(Date.now() / 1000);
      const isClaimExpired = claimExpiresAt ? nowSec > claimExpiresAt : false;

      if (claimPlan && !isClaimExpired) {
        setPlan(claimPlan);
        setExpiresAt(claimExpiresAt);
        setLoading(false);
        return claimPlan;
      }

      // 2. If claims indicate expired or unpopulated, invoke server sync callable
      if (forceServerSync || isClaimExpired || !claimPlan) {
        try {
          const syncFn = httpsCallable(functions, 'syncUserEntitlements');
          const res = (await syncFn()) as { data?: { entitlements?: { plan?: PlanType; expiresAt?: number } } };
          const syncedClaims = res.data?.entitlements;
          if (syncedClaims?.plan) {
            // Force refresh local token after server updated custom claims
            await currentUser.getIdToken(true);
            setPlan(syncedClaims.plan);
            setExpiresAt(syncedClaims.expiresAt || null);
            setLoading(false);
            return syncedClaims.plan;
          }
        } catch {
          // If server sync fails, fallback to direct Firestore read
        }
      }

      // 3. Fallback: Direct Firestore read
      const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
      if (userSnap.exists()) {
        const rawPlan = userSnap.data()?.plan;
        const resolved = (rawPlan === 'pro' || rawPlan === 'business' || rawPlan === 'agency') ? rawPlan : 'free';
        setPlan(resolved);
        setLoading(false);
        return resolved;
      }

      setPlan('free');
      setLoading(false);
      return 'free';
    } catch (err) {
      console.warn('[usePlan] Could not evaluate token claims:', err);
      setPlan('free');
      setLoading(false);
      return 'free';
    }
  }, []);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setPlan('free');
        setExpiresAt(null);
        setLoading(false);
      } else {
        await resolveEntitlements(currentUser, false);
      }
    });
    return () => unsubAuth();
  }, [resolveEntitlements]);

  const refreshPlan = useCallback(async (force = true): Promise<PlanType> => {
    if (!auth.currentUser) {
      setPlan('free');
      return 'free';
    }
    setLoading(true);
    return resolveEntitlements(auth.currentUser, force);
  }, [resolveEntitlements]);

  const nowSec = Math.floor(Date.now() / 1000);
  const isExpired = expiresAt ? nowSec > expiresAt : false;
  const effectivePlan: PlanType = isExpired ? 'free' : plan;

  const isPro = effectivePlan === 'pro' || effectivePlan === 'business' || effectivePlan === 'agency';
  const isBusiness = effectivePlan === 'business' || effectivePlan === 'agency';
  const isAgency = effectivePlan === 'agency';

  return {
    plan: effectivePlan,
    isPro,
    isBusiness,
    isAgency,
    expiresAt,
    isExpired,
    loading,
    user,
    refreshPlan,
  };
}
