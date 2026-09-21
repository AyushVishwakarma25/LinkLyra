import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export type PlanType = 'free' | 'pro' | 'business' | 'agency';

export interface UsePlanReturn {
  plan: PlanType;
  isPro: boolean;
  isBusiness: boolean;
  isAgency: boolean;
  loading: boolean;
  user: User | null;
}

/**
 * usePlan Hook:
 * Single source of truth for the authenticated user's active billing plan.
 * Listens in real-time to users/{uid}.plan in Firestore.
 */
export function usePlan(): UsePlanReturn {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [plan, setPlan] = useState<PlanType>('free');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setPlan('free');
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setPlan('free');
      setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    const unsubSnapshot = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawPlan = snapshot.data()?.plan;
          if (rawPlan === 'pro' || rawPlan === 'business' || rawPlan === 'agency') {
            setPlan(rawPlan);
          } else {
            setPlan('free');
          }
        } else {
          setPlan('free');
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Could not read user plan from Firestore:', error);
        setLoading(false);
      }
    );

    return () => unsubSnapshot();
  }, [user]);

  const isPro = plan === 'pro' || plan === 'business' || plan === 'agency';
  const isBusiness = plan === 'business' || plan === 'agency';
  const isAgency = plan === 'agency';

  return {
    plan,
    isPro,
    isBusiness,
    isAgency,
    loading,
    user,
  };
}
