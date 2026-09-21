import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';

/**
 * Re-implement pure logic functions matching functions/src/index.ts
 * for fast, deterministic unit testing in vitest.
 */

function verifyHmacSignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return generatedSignature === signature;
}

function verifyWebhookSignature(rawBody: string, signature: string, webhookSecret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
}

function getFinancialYear(date: Date): string {
  const month = date.getMonth(); // 0 = Jan, 3 = April
  const year = date.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  const endYear = (startYear + 1) % 100;
  return `${startYear}-${String(endYear).padStart(2, '0')}`;
}

describe('Server-Side Billing Verification & Logic', () => {
  const TEST_SECRET = 'rzp_test_secret_key_12345';
  const WEBHOOK_SECRET = 'whsec_test_secret_67890';

  describe('1. HMAC Payment Signature Verification', () => {
    it('successfully validates authentic Razorpay HMAC signature', () => {
      const orderId = 'order_test_998877';
      const paymentId = 'pay_test_112233';
      const validSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = verifyHmacSignature(orderId, paymentId, validSignature, TEST_SECRET);
      expect(isValid).toBe(true);
    });

    it('rejects tampered payment ID or order ID', () => {
      const orderId = 'order_test_998877';
      const paymentId = 'pay_test_112233';
      const validSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Attacker tries to submit a different payment ID
      const isTamperedPayment = verifyHmacSignature(orderId, 'pay_test_attacker_altered', validSignature, TEST_SECRET);
      expect(isTamperedPayment).toBe(false);

      // Attacker tries to submit a different order ID
      const isTamperedOrder = verifyHmacSignature('order_test_other_order', paymentId, validSignature, TEST_SECRET);
      expect(isTamperedOrder).toBe(false);
    });

    it('rejects signature generated with an incorrect secret', () => {
      const orderId = 'order_test_998877';
      const paymentId = 'pay_test_112233';
      const fakeSignature = crypto
        .createHmac('sha256', 'wrong_secret_key')
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = verifyHmacSignature(orderId, paymentId, fakeSignature, TEST_SECRET);
      expect(isValid).toBe(false);
    });
  });

  describe('2. Webhook Signature Verification', () => {
    it('successfully verifies genuine Razorpay webhook payload', () => {
      const rawPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_live_445566',
              amount: 19900,
              currency: 'INR',
              notes: { uid: 'user_123', plan: 'pro', cycle: 'monthly' },
            },
          },
        },
      });

      const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(rawPayload)
        .digest('hex');

      const isVerified = verifyWebhookSignature(rawPayload, signature, WEBHOOK_SECRET);
      expect(isVerified).toBe(true);
    });

    it('rejects modified webhook payload with genuine signature', () => {
      const rawPayload = JSON.stringify({ event: 'payment.captured', amount: 19900 });
      const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(rawPayload)
        .digest('hex');

      const tamperedPayload = JSON.stringify({ event: 'payment.captured', amount: 99900 });
      const isVerified = verifyWebhookSignature(tamperedPayload, signature, WEBHOOK_SECRET);
      expect(isVerified).toBe(false);
    });
  });

  describe('3. Indian Financial Year Calculation', () => {
    it('computes correct FY for months April through December', () => {
      // April 15, 2026 -> FY 2026-27
      expect(getFinancialYear(new Date(2026, 3, 15))).toBe('2026-27');
      // Dec 31, 2026 -> FY 2026-27
      expect(getFinancialYear(new Date(2026, 11, 31))).toBe('2026-27');
    });

    it('computes correct FY for months January through March', () => {
      // January 10, 2027 -> FY 2026-27
      expect(getFinancialYear(new Date(2027, 0, 10))).toBe('2026-27');
      // March 31, 2027 -> FY 2026-27
      expect(getFinancialYear(new Date(2027, 2, 31))).toBe('2026-27');
    });

    it('advances FY properly across financial year transitions', () => {
      // March 31, 2026 -> FY 2025-26
      expect(getFinancialYear(new Date(2026, 2, 31))).toBe('2025-26');
      // April 1, 2026 -> FY 2026-27
      expect(getFinancialYear(new Date(2026, 3, 1))).toBe('2026-27');
    });
  });

  describe('4. Sequential Invoice Number Formatting', () => {
    it('formats sequential numbers with FY and zero-padded 6 digits', () => {
      const fy = '2026-27';
      const formatInvoice = (count: number) => `INV/${fy}/${String(count).padStart(6, '0')}`;

      expect(formatInvoice(1)).toBe('INV/2026-27/000001');
      expect(formatInvoice(42)).toBe('INV/2026-27/000042');
      expect(formatInvoice(10050)).toBe('INV/2026-27/010050');
    });
  });

  describe('5. Idempotency & Expiry Sweeps', () => {
    it('detects already processed payment to prevent double billing / credit grants', () => {
      const processedPayments = new Set<string>();
      const processPayment = (paymentId: string) => {
        if (processedPayments.has(paymentId)) {
          return { status: 'already_processed' };
        }
        processedPayments.add(paymentId);
        return { status: 'success' };
      };

      expect(processPayment('pay_12345').status).toBe('success');
      expect(processPayment('pay_12345').status).toBe('already_processed');
      expect(processPayment('pay_67890').status).toBe('success');
    });

    it('correctly filters expired subscriptions where currentPeriodEnd is in past', () => {
      const now = new Date('2026-09-21T14:00:00Z');
      const subscriptions = [
        { id: 'sub_1', status: 'active', currentPeriodEnd: '2026-09-20T00:00:00Z' }, // expired
        { id: 'sub_2', status: 'active', currentPeriodEnd: '2026-10-21T00:00:00Z' }, // active
        { id: 'sub_3', status: 'canceled', currentPeriodEnd: '2026-09-15T00:00:00Z' }, // already canceled
      ];

      const expired = subscriptions.filter(
        (sub) => sub.status === 'active' && new Date(sub.currentPeriodEnd) < now
      );

      expect(expired).toHaveLength(1);
      expect(expired[0].id).toBe('sub_1');
    });
  });
});
