import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  setDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  auth,
  db,
  functions,
  handleFirestoreError,
  OperationType,
} from './app';
import {
  SubscriptionRecord,
  PaymentInvoiceRecord,
  CreditTransactionRecord,
} from '../../types';

export const billingService = {
  // Read current active subscription from canonical path: users/{userId}/subscriptions/current
  async getSubscriptionStatus(userId: string): Promise<SubscriptionRecord | null> {
    const targetUid = userId || auth.currentUser?.uid;
    if (!targetUid) return null;

    try {
      const subRef = doc(db, 'users', targetUid, 'subscriptions', 'current');
      const snap = await getDoc(subRef);
      if (snap.exists()) {
        return snap.data() as SubscriptionRecord;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${targetUid}/subscriptions/current`);
      return null;
    }
  },

  async getUserSubscription(userId: string): Promise<SubscriptionRecord | null> {
    return this.getSubscriptionStatus(userId);
  },

  // Save or update subscription record
  async saveUserSubscription(userId: string, data: Partial<SubscriptionRecord>): Promise<SubscriptionRecord> {
    const now = new Date().toISOString();
    const periodEnd = data.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const record: SubscriptionRecord = {
      id: 'current',
      userId,
      plan: data.plan || 'pro',
      status: data.status || 'active',
      billingCycle: data.billingCycle || 'monthly',
      amount: data.amount ?? 499,
      currency: data.currency || 'INR',
      startDate: data.startDate || now,
      currentPeriodStart: data.currentPeriodStart || now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      canceledAt: data.canceledAt,
      razorpaySubscriptionId: data.razorpaySubscriptionId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpayOrderId: data.razorpayOrderId,
      razorpaySignature: data.razorpaySignature,
      creditsMonthly: data.creditsMonthly ?? (data.plan === 'business' ? 2500 : 500),
      creditsRemaining: data.creditsRemaining ?? (data.plan === 'business' ? 2500 : 500),
      creditsUsed: data.creditsUsed ?? 0,
      createdAt: data.createdAt || now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'users', userId, 'subscriptions', 'current'), record);
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}/subscriptions/current`);
      return record;
    }
  },

  // Read payments / invoices from canonical path: users/{userId}/payments
  async getInvoices(userId: string): Promise<PaymentInvoiceRecord[]> {
    const targetUid = userId || auth.currentUser?.uid;
    if (!targetUid) return [];

    try {
      const paymentsRef = collection(db, 'users', targetUid, 'payments');
      const snap = await getDocs(query(paymentsRef));

      const invoices: PaymentInvoiceRecord[] = [];
      snap.forEach((d) => {
        invoices.push(d.data() as PaymentInvoiceRecord);
      });

      return invoices.sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `users/${targetUid}/payments`);
      return [];
    }
  },

  async getPaymentInvoices(userId: string): Promise<PaymentInvoiceRecord[]> {
    return this.getInvoices(userId);
  },

  async recordPaymentInvoice(userId: string, invoice: Omit<PaymentInvoiceRecord, 'id'>): Promise<PaymentInvoiceRecord> {
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const fullInvoice: PaymentInvoiceRecord = {
      id: invoiceId,
      ...invoice,
    };

    try {
      await setDoc(doc(db, 'users', userId, 'payments', invoiceId), fullInvoice);
      return fullInvoice;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${userId}/payments/${invoiceId}`);
      return fullInvoice;
    }
  },

  // Read credit transactions from canonical path: users/{userId}/credit_transactions
  async getCreditTransactions(userId: string): Promise<CreditTransactionRecord[]> {
    const targetUid = userId || auth.currentUser?.uid;
    if (!targetUid) return [];

    try {
      const txRef = collection(db, 'users', targetUid, 'credit_transactions');
      const snap = await getDocs(query(txRef));

      const transactions: CreditTransactionRecord[] = [];
      snap.forEach((d) => {
        transactions.push(d.data() as CreditTransactionRecord);
      });

      return transactions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `users/${targetUid}/credit_transactions`);
      return [];
    }
  },

  async logCreditTransaction(
    userId: string,
    type: 'monthly_grant' | 'top_up' | 'ai_generation' | 'lead_export' | 'custom_domain' | 'bonus',
    amount: number,
    description: string,
    currentBalance: number
  ): Promise<CreditTransactionRecord> {
    const txId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newBalance = Math.max(0, currentBalance + amount);
    const tx: CreditTransactionRecord = {
      id: txId,
      userId,
      type,
      amount,
      description,
      balanceAfter: newBalance,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', userId, 'credit_transactions', txId), tx);
      await updateDoc(doc(db, 'users', userId, 'subscriptions', 'current'), {
        creditsRemaining: newBalance,
        ...(amount < 0 ? { creditsUsed: increment(Math.abs(amount)) } : {}),
      }).catch((err) => {
        console.error('Failed to update subscription credits remaining:', err);
      });
      return tx;
    } catch (err) {
      console.warn('Notice: logging credit transaction:', err);
      return tx;
    }
  },

  async consumeCredits(
    amount: number,
    reason?: string
  ): Promise<{ success: boolean; creditsRemaining: number }> {
    const consumeCreditsFn = httpsCallable<{ amount: number; reason?: string }, { success: boolean; creditsRemaining: number }>(
      functions,
      'consumeCredits'
    );
    const result = await consumeCreditsFn({ amount, reason });
    return result.data;
  },

  async cancelSubscription(_userId?: string): Promise<{ success: boolean; message: string }> {
    const cancelFn = httpsCallable<void, { success: boolean; message: string }>(
      functions,
      'cancelSubscription'
    );
    const result = await cancelFn();
    return result.data;
  },
};
