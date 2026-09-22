import * as crypto from 'crypto';
import * as dns from 'dns';
import * as admin from 'firebase-admin';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import Razorpay from 'razorpay';
import { SERVER_PLANS, SELLER_CONFIG } from './config';
import {
  CreateOrderRequest,
  VerifyPaymentRequest,
  ConsumeCreditsRequest,
  ClaimDomainRequest,
  ReleaseDomainRequest,
} from './types';

admin.initializeApp();
const db = admin.firestore();

// Secrets
const razorpayKeyId = defineSecret('RAZORPAY_KEY_ID');
const razorpayKeySecret = defineSecret('RAZORPAY_KEY_SECRET');
const razorpayWebhookSecret = defineSecret('RAZORPAY_WEBHOOK_SECRET');
const emailApiKey = defineSecret('EMAIL_API_KEY');

function getRazorpayInstance(): Razorpay {
  return new Razorpay({
    key_id: razorpayKeyId.value(),
    key_secret: razorpayKeySecret.value(),
  });
}

function getFinancialYear(date: Date): string {
  const month = date.getMonth(); // 0 = Jan, 3 = April
  const year = date.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  const endYear = (startYear + 1) % 100;
  return `${startYear}-${String(endYear).padStart(2, '0')}`;
}

// -------------------------------------------------------------
// 1. Callable: createCheckoutOrder
// -------------------------------------------------------------
export const createCheckoutOrder = onCall(
  { secrets: [razorpayKeyId, razorpayKeySecret] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to create a checkout order.');
    }

    const uid = request.auth.uid;
    const { plan, billingCycle } = (request.data || {}) as CreateOrderRequest;

    const planConfig = SERVER_PLANS[plan];
    if (!planConfig) {
      throw new HttpsError('invalid-argument', `Invalid plan requested: ${plan}`);
    }

    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
      throw new HttpsError('invalid-argument', `Invalid billing cycle: ${billingCycle}`);
    }

    const priceINR = billingCycle === 'yearly' ? planConfig.priceYearlyINR : planConfig.priceMonthlyINR;
    const amountInPaise = priceINR * 100;

    const rzp = getRazorpayInstance();
    try {
      const order = await rzp.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${uid.slice(0, 8)}_${Date.now()}`,
        notes: {
          uid,
          plan,
          cycle: billingCycle,
        },
      });

      return {
        orderId: order.id,
        amount: amountInPaise,
        currency: 'INR',
      };
    } catch (err: any) {
      console.error('Failed to create Razorpay order:', err);
      throw new HttpsError('internal', err?.message || 'Failed to create payment order with Razorpay.');
    }
  }
);

// -------------------------------------------------------------
// 2. Callable: verifyPayment
// -------------------------------------------------------------
export const verifyPayment = onCall(
  { secrets: [razorpayKeyId, razorpayKeySecret] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to verify payment.');
    }

    const uid = request.auth.uid;
    const { order_id, payment_id, signature } = (request.data || {}) as VerifyPaymentRequest;

    if (!order_id || !payment_id || !signature) {
      throw new HttpsError('invalid-argument', 'Missing order_id, payment_id, or signature.');
    }

    // 1. Verify HMAC SHA256 signature
    const keySecret = razorpayKeySecret.value();
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      console.warn(`Tampered signature detected for user ${uid}, order ${order_id}`);
      throw new HttpsError('permission-denied', 'Invalid payment signature. Verification failed.');
    }

    // 2. Fetch payment from Razorpay to verify status, amount, and notes
    const rzp = getRazorpayInstance();
    let payment: any;
    try {
      payment = await rzp.payments.fetch(payment_id);
    } catch (err: any) {
      console.error('Failed to fetch payment from Razorpay API:', err);
      throw new HttpsError('internal', 'Could not verify payment status with gateway.');
    }

    if (!payment || (payment.status !== 'captured' && payment.status !== 'authorized')) {
      throw new HttpsError('failed-precondition', `Payment status is ${payment?.status || 'unknown'}. Must be captured.`);
    }

    if (payment.notes?.uid && payment.notes.uid !== uid) {
      throw new HttpsError('permission-denied', 'Payment does not belong to the calling user.');
    }

    const plan = (payment.notes?.plan || 'pro') as 'pro' | 'business';
    const cycle = (payment.notes?.cycle || 'monthly') as 'monthly' | 'yearly';
    const planConfig = SERVER_PLANS[plan] || SERVER_PLANS.pro;

    const paymentDocRef = db.doc(`users/${uid}/payments/${payment_id}`);

    // 3. Idempotent check: if payment doc already exists, return existing success
    const existingPaymentSnap = await paymentDocRef.get();
    if (existingPaymentSnap.exists) {
      return {
        success: true,
        plan,
        invoiceNumber: existingPaymentSnap.data()?.invoiceNumber,
        message: 'Payment was already processed.',
      };
    }

    // 4. Atomic Firestore Transaction: subscription, sequential invoice, plan update, credits
    const now = new Date();
    const nowIso = now.toISOString();
    const currentPeriodStart = nowIso;
    const currentPeriodEnd = new Date(
      now.getTime() + (cycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
    ).toISOString();

    const fy = getFinancialYear(now);
    const counterRef = db.doc(`system/invoices_${fy}`);
    const subRef = db.doc(`users/${uid}/subscriptions/current`);
    const userRef = db.doc(`users/${uid}`);

    let generatedInvoiceNumber = '';

    await db.runTransaction(async (tx) => {
      const counterSnap = await tx.get(counterRef);
      const nextCount = (counterSnap.data()?.count || 0) + 1;
      generatedInvoiceNumber = `INV/${fy}/${String(nextCount).padStart(6, '0')}`;
      tx.set(counterRef, { count: nextCount, updatedAt: nowIso }, { merge: true });

      // Subscription record
      tx.set(
        subRef,
        {
          userId: uid,
          plan,
          status: 'active',
          billingCycle: cycle,
          amount: payment.amount / 100,
          currency: payment.currency,
          startDate: nowIso,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: false,
          razorpayPaymentId: payment_id,
          razorpayOrderId: order_id,
          creditsRemaining: planConfig.creditsMonthly,
          creditsMonthly: planConfig.creditsMonthly,
          creditsUsed: 0,
          updatedAt: nowIso,
        },
        { merge: true }
      );

      // Payment invoice record
      tx.set(paymentDocRef, {
        id: payment_id,
        userId: uid,
        invoiceNumber: generatedInvoiceNumber,
        planName: planConfig.name,
        billingCycle: cycle,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: 'captured',
        razorpayPaymentId: payment_id,
        razorpayOrderId: order_id,
        paymentMethod: payment.method || 'Razorpay',
        paidAt: nowIso,
        seller: SELLER_CONFIG,
      });

      // Update user plan
      tx.set(
        userRef,
        {
          plan,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Record monthly credit grant transaction
      const txId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const creditTxRef = db.doc(`users/${uid}/credit_transactions/${txId}`);
      tx.set(creditTxRef, {
        id: txId,
        userId: uid,
        type: 'monthly_grant',
        amount: planConfig.creditsMonthly,
        description: `Monthly allowance for ${planConfig.name}`,
        balanceAfter: planConfig.creditsMonthly,
        createdAt: nowIso,
      });
    });

    return {
      success: true,
      plan,
      invoiceNumber: generatedInvoiceNumber,
    };
  }
);

// -------------------------------------------------------------
// 3. HTTP: razorpayWebhook
// -------------------------------------------------------------
export const razorpayWebhook = onRequest(
  { secrets: [razorpayWebhookSecret, razorpayKeyId, razorpayKeySecret] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = razorpayWebhookSecret.value();

    if (!signature || !webhookSecret) {
      res.status(400).send('Missing webhook signature or unconfigured secret');
      return;
    }

    const rawBody = (req as any).rawBody;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Invalid Razorpay webhook signature');
      res.status(400).send('Invalid signature');
      return;
    }

    const event = req.body;
    const eventId = event?.event_id || `evt_${Date.now()}`;

    // Idempotency guard for webhook events
    const eventRef = db.doc(`system/webhook_events/${eventId}`);
    const eventSnap = await eventRef.get();
    if (eventSnap.exists) {
      res.status(200).json({ status: 'already_processed' });
      return;
    }

    await eventRef.set({
      processedAt: new Date().toISOString(),
      type: event.event,
    });

    const paymentEntity = event?.payload?.payment?.entity;
    const uid = paymentEntity?.notes?.uid;

    if (!uid) {
      res.status(200).json({ status: 'ignored_no_uid' });
      return;
    }

    try {
      if (event.event === 'payment.captured') {
        const paymentId = paymentEntity.id;
        const paymentDocRef = db.doc(`users/${uid}/payments/${paymentId}`);
        const existing = await paymentDocRef.get();

        if (!existing.exists) {
          const plan = (paymentEntity.notes?.plan || 'pro') as 'pro' | 'business';
          const cycle = (paymentEntity.notes?.cycle || 'monthly') as 'monthly' | 'yearly';
          const planConfig = SERVER_PLANS[plan] || SERVER_PLANS.pro;

          const now = new Date();
          const nowIso = now.toISOString();
          const fy = getFinancialYear(now);
          const counterRef = db.doc(`system/invoices_${fy}`);
          const subRef = db.doc(`users/${uid}/subscriptions/current`);
          const userRef = db.doc(`users/${uid}`);

          await db.runTransaction(async (tx) => {
            const counterSnap = await tx.get(counterRef);
            const nextCount = (counterSnap.data()?.count || 0) + 1;
            const invoiceNumber = `INV/${fy}/${String(nextCount).padStart(6, '0')}`;
            tx.set(counterRef, { count: nextCount, updatedAt: nowIso }, { merge: true });

            tx.set(
              subRef,
              {
                userId: uid,
                plan,
                status: 'active',
                billingCycle: cycle,
                amount: paymentEntity.amount / 100,
                currency: paymentEntity.currency,
                startDate: nowIso,
                currentPeriodStart: nowIso,
                currentPeriodEnd: new Date(
                  now.getTime() + (cycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
                ).toISOString(),
                cancelAtPeriodEnd: false,
                razorpayPaymentId: paymentId,
                razorpayOrderId: paymentEntity.order_id,
                creditsRemaining: planConfig.creditsMonthly,
                creditsMonthly: planConfig.creditsMonthly,
                creditsUsed: 0,
                updatedAt: nowIso,
              },
              { merge: true }
            );

            tx.set(paymentDocRef, {
              id: paymentId,
              userId: uid,
              invoiceNumber,
              planName: planConfig.name,
              billingCycle: cycle,
              amount: paymentEntity.amount / 100,
              currency: paymentEntity.currency,
              status: 'captured',
              razorpayPaymentId: paymentId,
              razorpayOrderId: paymentEntity.order_id,
              paymentMethod: paymentEntity.method || 'Razorpay',
              paidAt: nowIso,
              seller: SELLER_CONFIG,
            });

            tx.set(userRef, { plan, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
          });
        }
      } else if (event.event === 'payment.failed') {
        const paymentId = paymentEntity.id;
        await db.doc(`users/${uid}/payments/${paymentId}`).set(
          {
            id: paymentId,
            userId: uid,
            status: 'failed',
            failedAt: new Date().toISOString(),
            errorDescription: paymentEntity.error_description || 'Payment failed',
          },
          { merge: true }
        );
      } else if (event.event === 'refund.processed') {
        // Downgrade subscription on refund
        await db.doc(`users/${uid}`).set(
          { plan: 'free', updatedAt: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        );
        await db.doc(`users/${uid}/subscriptions/current`).set(
          { status: 'refunded', updatedAt: new Date().toISOString() },
          { merge: true }
        );
      }

      res.status(200).json({ status: 'ok' });
    } catch (err) {
      console.error('Error handling Razorpay webhook:', err);
      res.status(500).send('Internal Server Error');
    }
  }
);

// -------------------------------------------------------------
// 4. Scheduled: dailySubscriptionExpiry
// -------------------------------------------------------------
export const dailySubscriptionExpiry = onSchedule('every 24 hours', async () => {
  const nowIso = new Date().toISOString();
  console.log(`Running daily subscription expiry sweep at ${nowIso}`);

  try {
    const expiredSnap = await db
      .collectionGroup('subscriptions')
      .where('status', '==', 'active')
      .where('currentPeriodEnd', '<', nowIso)
      .get();

    if (expiredSnap.empty) {
      console.log('No expired subscriptions found.');
      return;
    }

    console.log(`Found ${expiredSnap.size} expired subscriptions to downgrade.`);

    const batch = db.batch();
    expiredSnap.forEach((docSnap) => {
      const sub = docSnap.data();
      const userId = sub.userId || docSnap.ref.parent.parent?.id;

      if (userId) {
        batch.update(docSnap.ref, {
          status: 'expired',
          updatedAt: nowIso,
        });
        batch.set(
          db.doc(`users/${userId}`),
          {
            plan: 'free',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }
    });

    await batch.commit();
    console.log('Successfully completed daily subscription expiry sweep.');
  } catch (err) {
    console.error('Error during daily subscription expiry sweep:', err);
  }
});

// -------------------------------------------------------------
// 5. Callable: cancelSubscription
// -------------------------------------------------------------
export const cancelSubscription = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be signed in to cancel subscription.');
  }

  const uid = request.auth.uid;
  const subRef = db.doc(`users/${uid}/subscriptions/current`);

  const snap = await subRef.get();
  if (!snap.exists) {
    throw new HttpsError('not-found', 'No active subscription found.');
  }

  await subRef.set(
    {
      cancelAtPeriodEnd: true,
      canceledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return { success: true, message: 'Subscription will cancel at the end of the current period.' };
});

// -------------------------------------------------------------
// 6. Callable: consumeCredits
// -------------------------------------------------------------
export const consumeCredits = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be signed in to consume credits.');
  }

  const uid = request.auth.uid;
  const { amount, reason } = (request.data || {}) as ConsumeCreditsRequest;

  if (typeof amount !== 'number' || amount <= 0) {
    throw new HttpsError('invalid-argument', 'Amount must be a positive number.');
  }

  const subRef = db.doc(`users/${uid}/subscriptions/current`);
  let updatedBalance = 0;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(subRef);
    if (!snap.exists) {
      throw new HttpsError('failed-precondition', 'No subscription record found.');
    }

    const data = snap.data() || {};
    const remaining = data.creditsRemaining ?? 0;

    if (remaining < amount) {
      throw new HttpsError('failed-precondition', `Insufficient credits. Required: ${amount}, Available: ${remaining}`);
    }

    updatedBalance = remaining - amount;
    const used = (data.creditsUsed ?? 0) + amount;

    tx.update(subRef, {
      creditsRemaining: updatedBalance,
      creditsUsed: used,
      updatedAt: new Date().toISOString(),
    });

    const txId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const creditTxRef = db.doc(`users/${uid}/credit_transactions/${txId}`);
    tx.set(creditTxRef, {
      id: txId,
      userId: uid,
      type: 'consumption',
      amount: -amount,
      reason: reason || 'AI Feature Usage',
      balanceAfter: updatedBalance,
      createdAt: new Date().toISOString(),
    });
  });

  return {
    success: true,
    creditsRemaining: updatedBalance,
  };
});

// -------------------------------------------------------------
// 7. Callable: deleteAccount
// -------------------------------------------------------------
export const deleteAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be signed in to delete their account.');
  }

  const uid = request.auth.uid;

  try {
    // 1. Delete Firestore user-owned root documents and recursive subcollections
    // users/{uid} (leads, subscriptions, invoices, credit_transactions, etc.)
    await db.recursiveDelete(db.doc(`users/${uid}`));
    // pages/{uid} (leads, analytics, links, sections, etc.)
    await db.recursiveDelete(db.doc(`pages/${uid}`));
    // profiles/{uid}
    await db.recursiveDelete(db.doc(`profiles/${uid}`));

    // 2. Delete claimed usernames
    const usernamesSnap = await db.collection('usernames').where('uid', '==', uid).get();
    for (const doc of usernamesSnap.docs) {
      await doc.ref.delete();
    }

    // 3. Delete claimed custom domains
    const domainsSnap = await db.collection('domains').where('uid', '==', uid).get();
    for (const doc of domainsSnap.docs) {
      await doc.ref.delete();
    }

    // 4. Delete Storage files
    try {
      const bucket = admin.storage().bucket();
      await bucket.deleteFiles({ prefix: `users/${uid}/` });
      await bucket.deleteFiles({ prefix: `pages/${uid}/` });
    } catch (storageErr) {
      console.warn(`Storage cleanup error for user ${uid}:`, storageErr);
    }

    // 5. Delete Firebase Auth user record
    await admin.auth().deleteUser(uid);

    return { success: true };
  } catch (err: any) {
    console.error(`Account deletion failed for ${uid}:`, err);
    throw new HttpsError('internal', err?.message || 'Failed to completely delete account.');
  }
});

// -------------------------------------------------------------
// 8. Callable: claimCustomDomain
// -------------------------------------------------------------
export const claimCustomDomain = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be signed in to claim a custom domain.');
  }

  const uid = request.auth.uid;
  const { domain: rawDomain } = (request.data || {}) as ClaimDomainRequest;

  if (!rawDomain || typeof rawDomain !== 'string') {
    throw new HttpsError('invalid-argument', 'A valid domain name is required.');
  }

  // Normalize domain
  const cleanDomain = rawDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '');

  const DOMAIN_REGEX = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  if (!DOMAIN_REGEX.test(cleanDomain)) {
    throw new HttpsError('invalid-argument', 'Invalid domain name format.');
  }

  // Disallow platform domains
  if (
    cleanDomain === 'linklyra.com' ||
    cleanDomain.endsWith('.linklyra.com') ||
    cleanDomain === 'linklyra.app' ||
    cleanDomain.endsWith('.linklyra.app') ||
    cleanDomain.endsWith('.web.app') ||
    cleanDomain.endsWith('.firebaseapp.com') ||
    cleanDomain === 'localhost'
  ) {
    throw new HttpsError('invalid-argument', 'Platform domains cannot be claimed as custom domains.');
  }

  // 1. Verify user's subscription / plan
  const userSnap = await db.doc(`users/${uid}`).get();
  const userData = userSnap.data() || {};
  const plan = userData.plan || 'free';

  if (plan !== 'pro' && plan !== 'business' && plan !== 'agency') {
    throw new HttpsError('permission-denied', 'Custom domains are available on Pro, Business, or Agency plans.');
  }

  // 2. Verify DNS CNAME record
  const cnameTarget = (process.env.CUSTOM_DOMAIN_CNAME_TARGET || 'cname.linklyra.app')
    .toLowerCase()
    .replace(/\.$/, '');

  if (process.env.NODE_ENV !== 'test' && process.env.SKIP_DNS_CHECK !== 'true') {
    try {
      const records = await dns.promises.resolveCname(cleanDomain);
      const isConfigured = records.some((r) => r.toLowerCase().replace(/\.$/, '') === cnameTarget);
      if (!isConfigured) {
        throw new HttpsError(
          'failed-precondition',
          `CNAME record for ${cleanDomain} does not point to ${cnameTarget}. Found: ${records.join(', ')}`
        );
      }
    } catch (dnsErr: any) {
      if (dnsErr instanceof HttpsError) throw dnsErr;
      throw new HttpsError(
        'failed-precondition',
        `DNS CNAME verification failed. Please ensure a CNAME record pointing to ${cnameTarget} is set up.`
      );
    }
  }

  // 3. Check for collisions
  const domainRef = db.doc(`domains/${cleanDomain}`);
  const domainSnap = await domainRef.get();
  if (domainSnap.exists) {
    const existingData = domainSnap.data();
    if (existingData?.uid && existingData.uid !== uid) {
      throw new HttpsError('already-exists', 'This domain is already claimed by another account.');
    }
  }

  // 4. Batch commit
  const batch = db.batch();
  batch.set(domainRef, {
    domain: cleanDomain,
    uid,
    status: 'verified',
    createdAt: domainSnap.exists ? domainSnap.data()?.createdAt || new Date().toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  batch.set(db.doc(`pages/${uid}`), { customDomain: cleanDomain }, { merge: true });
  batch.set(db.doc(`profiles/${uid}`), { custom_domain: cleanDomain }, { merge: true });

  await batch.commit();

  return { success: true, domain: cleanDomain };
});

// -------------------------------------------------------------
// 9. Callable: releaseCustomDomain
// -------------------------------------------------------------
export const releaseCustomDomain = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be signed in to release a domain.');
  }

  const uid = request.auth.uid;
  const { domain: rawDomain } = (request.data || {}) as ReleaseDomainRequest;

  if (rawDomain && typeof rawDomain === 'string') {
    const cleanDomain = rawDomain.trim().toLowerCase();
    const domainRef = db.doc(`domains/${cleanDomain}`);
    const domainSnap = await domainRef.get();

    if (domainSnap.exists && domainSnap.data()?.uid === uid) {
      await domainRef.delete();
    }
  } else {
    // Release all domains owned by this user
    const domainsSnap = await db.collection('domains').where('uid', '==', uid).get();
    for (const d of domainsSnap.docs) {
      await d.ref.delete();
    }
  }

  // Remove customDomain field from page and profile
  const batch = db.batch();
  batch.set(
    db.doc(`pages/${uid}`),
    { customDomain: admin.firestore.FieldValue.delete() },
    { merge: true }
  );
  batch.set(
    db.doc(`profiles/${uid}`),
    { custom_domain: admin.firestore.FieldValue.delete() },
    { merge: true }
  );
  await batch.commit();

  return { success: true };
});

// -------------------------------------------------------------
// 10. Firestore Trigger: onLeadCreated
// -------------------------------------------------------------
interface EmailProvider {
  sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<boolean>;
}

class RestEmailProvider implements EmailProvider {
  constructor(private apiKey: string) {}

  async sendEmail(params: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
    if (!this.apiKey) {
      console.log('[EmailProvider] EMAIL_API_KEY unset; skipping email.');
      return false;
    }

    try {
      if (this.apiKey.startsWith('re_') || this.apiKey.startsWith('resend_')) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'LinkLyra Inquiries <notifications@linklyra.com>',
            to: [params.to],
            subject: params.subject,
            html: params.html,
            text: params.text,
          }),
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error('[EmailProvider] Resend API error:', res.status, errText);
          return false;
        }
        return true;
      } else if (this.apiKey.startsWith('SG.')) {
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: params.to }] }],
            from: { email: 'notifications@linklyra.com', name: 'LinkLyra Inquiries' },
            subject: params.subject,
            content: [
              { type: 'text/plain', value: params.text },
              { type: 'text/html', value: params.html },
            ],
          }),
        });
        if (!res.ok) {
          const errText = await res.text();
          console.error('[EmailProvider] SendGrid API error:', res.status, errText);
          return false;
        }
        return true;
      } else {
        console.log(`[EmailProvider] Generic API key configured; simulated email sent to ${params.to}`);
        return true;
      }
    } catch (err) {
      console.error('[EmailProvider] Delivery exception:', err);
      return false;
    }
  }
}

export const onLeadCreated = onDocumentCreated(
  {
    document: 'pages/{pageId}/leads/{leadId}',
    secrets: [emailApiKey],
  },
  async (event) => {
    const { pageId, leadId } = event.params;
    const snap = event.data;
    if (!snap) {
      console.log(`[onLeadCreated] No data snapshot for lead ${leadId}`);
      return;
    }

    const leadData = snap.data();
    if (!leadData) return;

    // 1. Resolve owner userId
    let ownerUid = pageId;
    const pageSnap = await db.doc(`pages/${pageId}`).get();
    if (pageSnap.exists) {
      const pageData = pageSnap.data();
      if (pageData?.userId) {
        ownerUid = pageData.userId;
      }
    }

    // 2. Resolve owner user email and notification preferences
    const userSnap = await db.doc(`users/${ownerUid}`).get();
    const userData = userSnap.exists ? userSnap.data() : null;

    let ownerEmail = userData?.email;
    if (!ownerEmail) {
      try {
        const authUser = await admin.auth().getUser(ownerUid);
        ownerEmail = authUser.email;
      } catch (e) {
        console.warn(`[onLeadCreated] Could not fetch Auth user for uid ${ownerUid}:`, e);
      }
    }

    if (!ownerEmail) {
      console.log(`[onLeadCreated] No destination email for user ${ownerUid}; skipping email notification.`);
      return;
    }

    // 3. Check notification settings
    const accountSettings = userData?.accountSettings;
    const emailNotifs = accountSettings?.emailNotifications || userData?.emailNotifications;
    if (emailNotifs && emailNotifs.newLeads === false) {
      console.log(`[onLeadCreated] User ${ownerUid} has disabled newLeads email notifications.`);
      return;
    }

    // 4. Throttle bursts (30s window per user)
    const throttleRef = db.doc(`users/${ownerUid}/private_meta/lead_email_throttle`);
    const throttleSnap = await throttleRef.get();
    const lastSentAtMs = throttleSnap.exists ? (throttleSnap.data()?.lastSentAtMs || 0) : 0;
    const nowMs = Date.now();

    if (nowMs - lastSentAtMs < 30000) {
      console.log(`[onLeadCreated] Burst throttle active for user ${ownerUid} (${nowMs - lastSentAtMs}ms < 30000ms); skipping email.`);
      return;
    }

    // Update throttle timestamp
    await throttleRef.set({ lastSentAtMs: nowMs }, { merge: true });

    // 5. Check EMAIL_API_KEY secret
    let apiKey = '';
    try {
      apiKey = emailApiKey.value() || '';
    } catch {
      // secret unset
    }

    if (!apiKey) {
      console.log(`[onLeadCreated] EMAIL_API_KEY secret is unset or empty; notification for lead ${leadId} logged but not emailed.`);
      return;
    }

    // 6. Send email via provider
    const provider = new RestEmailProvider(apiKey);
    const leadTypeLabel = leadData.type ? String(leadData.type).replace(/_/g, ' ').toUpperCase() : 'NEW INQUIRY';
    const subject = `[LinkLyra] New Lead: ${leadData.name || 'New Client'} (${leadTypeLabel})`;

    const textContent = `
New Inbound Inquiry on LinkLyra

Name: ${leadData.name || 'N/A'}
Email: ${leadData.email || 'N/A'}
Phone: ${leadData.phone || 'N/A'}
Company / Brand: ${leadData.companyOrBrand || 'N/A'}
Type: ${leadTypeLabel}
Budget / Price: ${leadData.budgetOrPrice || 'N/A'}
Timeline / Date: ${leadData.timelineOrDate || 'N/A'}
Package / Deliverable: ${leadData.selectedPackageName || leadData.campaignType || leadData.propertyTitle || 'N/A'}

Details / Message:
${leadData.details || 'No message provided.'}

View and manage all your leads in your LinkLyra Studio CRM:
https://linklyra.web.app
    `.trim();

    const htmlContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1C1E22; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 16px;">
  <div style="border-bottom: 2px solid #5E4BF7; padding-bottom: 16px; margin-bottom: 20px;">
    <span style="font-size: 11px; font-weight: 800; color: #5E4BF7; letter-spacing: 0.1em; text-transform: uppercase;">LINKLYRA INBOUND LEAD</span>
    <h2 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #1C1E22;">New ${leadTypeLabel}</h2>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #737882; width: 140px;">Contact Name:</td>
      <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1C1E22;">${leadData.name || 'N/A'}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #737882;">Email Address:</td>
      <td style="padding: 8px 0; font-size: 13px; font-weight: 600;"><a href="mailto:${leadData.email}" style="color: #5E4BF7; text-decoration: none;">${leadData.email || 'N/A'}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #737882;">Phone Number:</td>
      <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1C1E22;">${leadData.phone || 'N/A'}</td>
    </tr>
    ${leadData.companyOrBrand ? `
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #737882;">Company / Brand:</td>
      <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1C1E22;">${leadData.companyOrBrand}</td>
    </tr>` : ''}
    ${leadData.budgetOrPrice ? `
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #737882;">Budget / Value:</td>
      <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1C1E22;">${leadData.budgetOrPrice}</td>
    </tr>` : ''}
    ${leadData.timelineOrDate ? `
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #737882;">Timeline / Date:</td>
      <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #1C1E22;">${leadData.timelineOrDate}</td>
    </tr>` : ''}
  </table>

  ${leadData.details ? `
  <div style="background-color: #FAF8F5; border: 1px solid #eaeaea; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
    <span style="font-size: 10px; font-weight: 700; color: #737882; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">Inquiry Message & Brief</span>
    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #1C1E22; white-space: pre-wrap;">${leadData.details}</p>
  </div>` : ''}

  <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f0f0f0;">
    <a href="https://linklyra.web.app" style="display: inline-block; background-color: #1C1E22; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none;">Open Inquiries CRM</a>
  </div>
</div>
    `.trim();

    await provider.sendEmail({
      to: ownerEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`[onLeadCreated] Successfully processed notification for lead ${leadId} to ${ownerEmail}`);
  }
);

// -------------------------------------------------------------
// 10. Firestore Trigger: aggregateAnalyticsEvent
// Aggregates raw analytics events into daily summary documents
// pages/{pageId}/stats/{yyyy-mm-dd}
// -------------------------------------------------------------
export const aggregateAnalyticsEvent = onDocumentCreated(
  'pages/{pageId}/analytics/{eventId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    if (!data) return;

    const pageId = event.params.pageId;
    if (!pageId) return;

    // Determine YYYY-MM-DD from timestamp or fallback to current UTC date
    let dateKey: string;
    try {
      const ts = data.timestamp
        ? typeof data.timestamp.toDate === 'function'
          ? data.timestamp.toDate()
          : new Date(data.timestamp)
        : new Date();
      dateKey = ts.toISOString().split('T')[0];
    } catch {
      dateKey = new Date().toISOString().split('T')[0];
    }

    const statsRef = db.doc(`pages/${pageId}/stats/${dateKey}`);
    const updates: Record<string, any> = {
      date: dateKey,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const eventType = data.type;
    if (eventType === 'page_view') {
      updates.views = admin.firestore.FieldValue.increment(1);
    } else if (eventType === 'link_click') {
      updates.clicks = admin.firestore.FieldValue.increment(1);
      if (data.linkId && typeof data.linkId === 'string') {
        const cleanLinkId = data.linkId.replace(/[\.\/\[\]]/g, '_').slice(0, 100);
        updates[`linkClicks.${cleanLinkId}`] = admin.firestore.FieldValue.increment(1);
      }
    } else if (eventType) {
      // Conversion / lead event
      updates.conversions = admin.firestore.FieldValue.increment(1);
      const cleanType = String(eventType).replace(/[\.\/\[\]]/g, '_').slice(0, 50);
      updates[`eventTypes.${cleanType}`] = admin.firestore.FieldValue.increment(1);
    }

    if (data.device && typeof data.device === 'string') {
      const dev = ['mobile', 'desktop', 'tablet'].includes(data.device.toLowerCase())
        ? data.device.toLowerCase()
        : 'mobile';
      updates[`devices.${dev}`] = admin.firestore.FieldValue.increment(1);
    }

    if (data.browser && typeof data.browser === 'string') {
      const cleanBrowser = data.browser.replace(/[\.\/\[\]]/g, '_').slice(0, 40);
      updates[`browsers.${cleanBrowser}`] = admin.firestore.FieldValue.increment(1);
    }

    if (data.referrer && typeof data.referrer === 'string') {
      let ref = data.referrer;
      try {
        if (ref.startsWith('http')) {
          ref = new URL(ref).hostname.replace(/^www\./, '');
        }
      } catch {}
      const cleanRef = ref.replace(/[\.\/\[\]]/g, '_').slice(0, 60) || 'direct';
      updates[`referrers.${cleanRef}`] = admin.firestore.FieldValue.increment(1);
    }

    if (data.country && typeof data.country === 'string') {
      const cleanCountry = data.country.replace(/[\.\/\[\]]/g, '_').slice(0, 10);
      updates[`countries.${cleanCountry}`] = admin.firestore.FieldValue.increment(1);
    }

    try {
      await statsRef.set(updates, { merge: true });
      console.log(`[aggregateAnalyticsEvent] Aggregated event ${event.params.eventId} for page ${pageId} on ${dateKey}`);
    } catch (err) {
      console.error(`[aggregateAnalyticsEvent] Error aggregating event for page ${pageId}:`, err);
    }
  }
);

// -------------------------------------------------------------
// 10. Callable: setWhiteLabel
// -------------------------------------------------------------
export const setWhiteLabel = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in to configure white-label branding.');
  }

  const uid = request.auth.uid;
  const enabled = Boolean(request.data?.enabled);

  // Verify user's actual subscription plan in Firestore
  const userSnap = await db.doc(`users/${uid}`).get();
  const userData = userSnap.data();
  const plan = userData?.plan || 'free';

  if (enabled && plan !== 'pro' && plan !== 'business' && plan !== 'agency') {
    throw new HttpsError(
      'permission-denied',
      'White-label branding requires an active Pro or Business subscription.'
    );
  }

  // Update pages/{uid} with server authority
  const pageRef = db.doc(`pages/${uid}`);
  await pageRef.set(
    {
      whiteLabel: enabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Also sync to profiles/{uid} if present
  const profileRef = db.doc(`profiles/${uid}`);
  const profileSnap = await profileRef.get();
  if (profileSnap.exists) {
    await profileRef.set({ whiteLabel: enabled }, { merge: true });
  }

  return { success: true, whiteLabel: enabled };
});

// -------------------------------------------------------------
// 11. HTTP Function: renderProfileMeta (SEO & Social Crawlers)
// -------------------------------------------------------------
export const renderProfileMeta = onRequest({ cors: false }, async (req, res) => {
  const urlPath = req.path.replace(/^\/+/, '').replace(/\/+$/, '');

  // Guard against static assets if accidentally routed
  if (/\.(js|css|png|jpg|jpeg|svg|ico|json|woff2?|map|webp)$/i.test(urlPath)) {
    res.status(404).send('Not found');
    return;
  }

  const hostname = (req.hostname || '').toLowerCase();
  const isPlatform =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.run.app') ||
    hostname.endsWith('.web.app') ||
    hostname.endsWith('.firebaseapp.com') ||
    hostname.endsWith('.ai.studio');

  let usernameOrDomain = '';
  if (!isPlatform && hostname) {
    usernameOrDomain = hostname;
  } else {
    // Check query params ?user= or ?u= or path segment
    const qUser = (req.query.user || req.query.u || req.query.domain || req.query.d) as string | undefined;
    if (qUser && typeof qUser === 'string') {
      usernameOrDomain = qUser.toLowerCase().trim();
    } else {
      const segments = urlPath.split('/').filter(Boolean);
      if (segments.length > 0) {
        if (segments[0] === 'app' && segments[1]) {
          usernameOrDomain = segments[1].toLowerCase().trim();
        } else {
          usernameOrDomain = segments[0].toLowerCase().trim();
        }
      }
    }
  }

  const reserved = new Set([
    'admin', 'api', 'app', 'login', 'signup', 'studio', 'dashboard',
    'pricing', 'terms', 'privacy', 'settings', 'billing', 'explore',
    'landing', 'help', 'support', 'assets', 'static', 'index.html', 'creator'
  ]);

  let title = 'LinkLyra - The Link-in-Bio for Modern Creators';
  let description = 'Create a high-converting, dynamic bio page with direct lead capture, multi-platform media routing, and real-time analytics.';
  let image = 'https://linklyra.web.app/og-preview.png';
  let canonicalUrl = `https://linklyra.web.app/${usernameOrDomain}`;

  if (usernameOrDomain && !reserved.has(usernameOrDomain)) {
    try {
      let pageData: any = null;

      // Check if domain
      if (usernameOrDomain.includes('.')) {
        const domainSnap = await db.doc(`domains/${usernameOrDomain}`).get();
        if (domainSnap.exists) {
          const uid = domainSnap.data()?.userId || domainSnap.data()?.pageId;
          if (uid) {
            const pageSnap = await db.doc(`pages/${uid}`).get();
            if (pageSnap.exists) pageData = pageSnap.data();
          }
        }
      }

      // Check username lookup
      if (!pageData) {
        const usernameSnap = await db.doc(`usernames/${usernameOrDomain}`).get();
        if (usernameSnap.exists) {
          const uid = usernameSnap.data()?.userId || usernameSnap.data()?.pageId;
          if (uid) {
            const pageSnap = await db.doc(`pages/${uid}`).get();
            if (pageSnap.exists) pageData = pageSnap.data();
          }
        }
      }

      // Query pages collection fallback
      if (!pageData) {
        const pageQuery = await db.collection('pages').where('username', '==', usernameOrDomain).limit(1).get();
        if (!pageQuery.empty) {
          pageData = pageQuery.docs[0].data();
        }
      }

      if (pageData) {
        const name = pageData.title || pageData.name || usernameOrDomain;
        title = `${name} (@${usernameOrDomain}) | LinkLyra`;
        description = pageData.bio || `Check out @${usernameOrDomain}'s official links, projects, and updates on LinkLyra.`;
        if (pageData.avatarUrl) {
          image = pageData.avatarUrl;
        }
        canonicalUrl = `https://linklyra.web.app/${usernameOrDomain}`;
      } else {
        title = `Profile Not Found (@${usernameOrDomain}) | LinkLyra`;
        description = `The page @${usernameOrDomain} does not exist yet. Claim your custom username on LinkLyra.`;
      }
    } catch (e) {
      console.error('[renderProfileMeta] Error fetching page:', e);
    }
  }

  // Escape HTML entities in metadata strings
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeCanonical = escapeHtml(canonicalUrl);

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDesc}" />
    <link rel="canonical" href="${safeCanonical}" />

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="LinkLyra" />
    <meta property="og:url" content="${safeCanonical}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${safeCanonical}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />

    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <script type="module" crossorigin src="/assets/index.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).send(html);
});


