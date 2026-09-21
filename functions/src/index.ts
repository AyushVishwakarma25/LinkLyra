import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import Razorpay from 'razorpay';
import { SERVER_PLANS, SELLER_CONFIG } from './config';
import { CreateOrderRequest, VerifyPaymentRequest, ConsumeCreditsRequest } from './types';

admin.initializeApp();
const db = admin.firestore();

// Secrets
const razorpayKeyId = defineSecret('RAZORPAY_KEY_ID');
const razorpayKeySecret = defineSecret('RAZORPAY_KEY_SECRET');
const razorpayWebhookSecret = defineSecret('RAZORPAY_WEBHOOK_SECRET');

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
