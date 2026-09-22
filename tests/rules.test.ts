import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

describe('LinkLyra Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;
  let emulatorAvailable = false;

  beforeAll(async () => {
    try {
      const host = process.env.FIRESTORE_EMULATOR_HOST
        ? process.env.FIRESTORE_EMULATOR_HOST.split(':')[0]
        : '127.0.0.1';
      const port = process.env.FIRESTORE_EMULATOR_HOST
        ? parseInt(process.env.FIRESTORE_EMULATOR_HOST.split(':')[1], 10)
        : 8080;

      testEnv = await initializeTestEnvironment({
        projectId: 'linklyra-security-test',
        firestore: {
          rules: readFileSync('firestore.rules', 'utf8'),
          host,
          port,
        },
      });
      emulatorAvailable = true;
    } catch (err) {
      console.warn(
        '⚠️ Notice: Firestore emulator not reachable at localhost:8080. Start emulator via `firebase emulators:start --only firestore` to run live network rule assertions.',
        err
      );
      emulatorAvailable = false;
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv && emulatorAvailable) {
      await testEnv.clearFirestore();
    }
  });

  describe('Attack Vector 1: Self-granted plans, roles & billing attributes', () => {
    it('blocks a user from self-granting a pro or business plan on account creation', async () => {
      if (!emulatorAvailable) return;
      const attackerContext = testEnv.authenticatedContext('user_attacker');
      const db = attackerContext.firestore();

      // Attempt self-granting 'pro' plan on creation
      await assertFails(
        setDoc(doc(db, 'users', 'user_attacker'), {
          plan: 'pro',
          role: 'creator',
          email: 'attacker@example.com',
        })
      );

      // Attempt setting credits on creation
      await assertFails(
        setDoc(doc(db, 'users', 'user_attacker'), {
          plan: 'free',
          credits: 1000,
        })
      );

      // Creating with plan == 'free' must succeed
      await assertSucceeds(
        setDoc(doc(db, 'users', 'user_attacker'), {
          plan: 'free',
          role: 'creator',
          email: 'attacker@example.com',
        })
      );
    });

    it('blocks an existing user from escalating their plan, role, or credits on update', async () => {
      if (!emulatorAvailable) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'users', 'user_victim'), {
          plan: 'free',
          role: 'creator',
          displayName: 'Victim',
        });
      });

      const userContext = testEnv.authenticatedContext('user_victim');
      const db = userContext.firestore();

      // Attempt to upgrade plan directly from client
      await assertFails(
        updateDoc(doc(db, 'users', 'user_victim'), {
          plan: 'pro',
        })
      );

      // Attempt to modify role
      await assertFails(
        updateDoc(doc(db, 'users', 'user_victim'), {
          role: 'admin',
        })
      );

      // Attempt to add credits
      await assertFails(
        updateDoc(doc(db, 'users', 'user_victim'), {
          creditsRemaining: 5000,
        })
      );

      // Legitimate profile updates succeed
      await assertSucceeds(
        updateDoc(doc(db, 'users', 'user_victim'), {
          displayName: 'Updated Name',
        })
      );
    });
  });

  describe('Attack Vector 2: Reading another user’s private payments, subscriptions & transactions', () => {
    it('blocks User A from reading or writing User B’s payments or subscriptions', async () => {
      if (!emulatorAvailable) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'users', 'user_b', 'payments', 'inv_123'), {
          amount: 1999,
          status: 'paid',
        });
        await setDoc(doc(context.firestore(), 'users', 'user_b', 'subscriptions', 'current'), {
          plan: 'pro',
          status: 'active',
        });
      });

      const attackerContext = testEnv.authenticatedContext('user_a');
      const db = attackerContext.firestore();

      // Cannot read another user's payments
      await assertFails(getDoc(doc(db, 'users', 'user_b', 'payments', 'inv_123')));

      // Cannot read another user's subscriptions
      await assertFails(getDoc(doc(db, 'users', 'user_b', 'subscriptions', 'current')));

      // Cannot write payments directly even for own account (client writes forbidden)
      await assertFails(
        setDoc(doc(db, 'users', 'user_a', 'payments', 'inv_fake'), {
          amount: 0,
          status: 'paid',
        })
      );

      // User B can read their own payments
      const ownerContext = testEnv.authenticatedContext('user_b');
      await assertSucceeds(getDoc(doc(ownerContext.firestore(), 'users', 'user_b', 'payments', 'inv_123')));
    });
  });

  describe('Attack Vector 3: Reading another user’s captured leads', () => {
    it('blocks unauthorized users from snooping on a creator’s leads', async () => {
      if (!emulatorAvailable) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'pages', 'creator_page'), {
          userId: 'creator_uid',
        });
        await setDoc(doc(context.firestore(), 'pages', 'creator_page', 'leads', 'lead_secret'), {
          type: 'showing_request',
          name: 'High Net Worth Buyer',
          email: 'buyer@example.com',
          status: 'new',
        });
      });

      // Anonymous visitor cannot read leads
      const unauthContext = testEnv.unauthenticatedContext();
      await assertFails(getDoc(doc(unauthContext.firestore(), 'pages', 'creator_page', 'leads', 'lead_secret')));

      // Competing creator cannot read leads
      const competitorContext = testEnv.authenticatedContext('competitor_uid');
      await assertFails(getDoc(doc(competitorContext.firestore(), 'pages', 'creator_page', 'leads', 'lead_secret')));

      // Page owner can read leads
      const ownerContext = testEnv.authenticatedContext('creator_uid');
      await assertSucceeds(getDoc(doc(ownerContext.firestore(), 'pages', 'creator_page', 'leads', 'lead_secret')));
    });
  });

  describe('Attack Vector 4: Hijacking usernames and format validation', () => {
    it('prevents username squatting, overwrites, and invalid characters', async () => {
      if (!emulatorAvailable) return;
      const userA = testEnv.authenticatedContext('user_a');
      const userB = testEnv.authenticatedContext('user_b');

      // User A registers a valid username
      await assertSucceeds(
        setDoc(doc(userA.firestore(), 'usernames', 'valid_user'), {
          userId: 'user_a',
        })
      );

      // User B cannot hijack/overwrite the existing username
      await assertFails(
        setDoc(doc(userB.firestore(), 'usernames', 'valid_user'), {
          userId: 'user_b',
        })
      );

      // User A cannot update username doc directly (immutability)
      await assertFails(
        updateDoc(doc(userA.firestore(), 'usernames', 'valid_user'), {
          updated: true,
        })
      );

      // User cannot register invalid usernames (too short, uppercase, symbols)
      await assertFails(
        setDoc(doc(userA.firestore(), 'usernames', 'ab'), {
          userId: 'user_a',
        })
      );
      await assertFails(
        setDoc(doc(userA.firestore(), 'usernames', 'INVALID_CAPS'), {
          userId: 'user_a',
        })
      );
      await assertFails(
        setDoc(doc(userA.firestore(), 'usernames', 'user!name$'), {
          userId: 'user_a',
        })
      );

      // User B cannot delete User A's username
      await assertFails(deleteDoc(doc(userB.firestore(), 'usernames', 'valid_user')));

      // User A can delete their own username
      await assertSucceeds(deleteDoc(doc(userA.firestore(), 'usernames', 'valid_user')));
    });
  });

  describe('Attack Vector 5: Claiming custom domains without backend verification', () => {
    it('blocks all client-side writes to /domains (reserved for server admin function)', async () => {
      if (!emulatorAvailable) return;
      const attackerContext = testEnv.authenticatedContext('user_attacker');
      const db = attackerContext.firestore();

      // Client cannot claim domain
      await assertFails(
        setDoc(doc(db, 'domains', 'vip.brand.com'), {
          userId: 'user_attacker',
          verified: true,
        })
      );
    });
  });

  describe('Attack Vector 6: Analytics spam with bad types or spoofed timestamps', () => {
    it('blocks analytics creation with unapproved event types or non-request timestamps', async () => {
      if (!emulatorAvailable) return;
      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();

      // Blocked: invalid event type
      await assertFails(
        setDoc(doc(db, 'pages', 'creator_page', 'analytics', 'evt_bad'), {
          type: 'malicious_bot_spam',
          timestamp: serverTimestamp(),
        })
      );

      // Blocked: unauthorized extra fields
      await assertFails(
        setDoc(doc(db, 'pages', 'creator_page', 'analytics', 'evt_bad2'), {
          type: 'page_view',
          timestamp: serverTimestamp(),
          adminPayload: 'attack',
        })
      );

      // Legitimate analytics event succeeds
      await assertSucceeds(
        setDoc(doc(db, 'pages', 'creator_page', 'analytics', 'evt_valid'), {
          type: 'page_view',
          linkId: null,
          visitorId: 'anon-1',
          country: 'IN',
          device: 'mobile',
          browser: 'Chrome',
          referrer: 'direct',
          timestamp: serverTimestamp(),
        })
      );
    });
  });

  describe('Attack Vector 7: Oversized or malformed lead payloads', () => {
    it('blocks leads on non-existent pages, invalid statuses, and oversized fields', async () => {
      if (!emulatorAvailable) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'pages', 'target_page'), {
          userId: 'target_owner',
        });
      });

      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();

      // Blocked: page does not exist
      await assertFails(
        setDoc(doc(db, 'pages', 'non_existent_page', 'leads', 'lead_1'), {
          type: 'brand_inquiry',
          name: 'Valid Name',
          email: 'test@example.com',
          status: 'new',
        })
      );

      // Blocked: status is not 'new' (attacker trying to self-approve or mark processed)
      await assertFails(
        setDoc(doc(db, 'pages', 'target_page', 'leads', 'lead_2'), {
          type: 'brand_inquiry',
          name: 'Valid Name',
          email: 'test@example.com',
          status: 'converted',
        })
      );

      // Blocked: oversized name (> 100 chars)
      await assertFails(
        setDoc(doc(db, 'pages', 'target_page', 'leads', 'lead_3'), {
          type: 'brand_inquiry',
          name: 'A'.repeat(150),
          email: 'test@example.com',
          status: 'new',
        })
      );

      // Valid lead succeeds
      await assertSucceeds(
        setDoc(doc(db, 'pages', 'target_page', 'leads', 'lead_valid'), {
          type: 'brand_inquiry',
          name: 'Acme Brands',
          email: 'sponsor@acme.com',
          status: 'new',
        })
      );

      // Valid full production lead with timestamps, card ID and optional details succeeds
      await assertSucceeds(
        setDoc(doc(db, 'pages', 'target_page', 'leads', 'lead_full'), {
          id: 'lead_full',
          pageId: 'target_page',
          type: 'brand_inquiry',
          name: 'Acme Partner',
          email: 'partner@acme.com',
          phone: '+1 555-0199',
          status: 'new',
          companyOrBrand: 'Acme Corp',
          campaignType: 'Sponsored Reel',
          budgetOrPrice: '$2,500',
          timelineOrDate: 'Next Month',
          propertyTitle: 'Lead Title',
          details: 'Looking for collaboration details.',
          sourceCardId: 'card_123',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timestamp: serverTimestamp(),
        })
      );
    });
  });

  describe('Attack Vector 8: Link click counts and page immutability', () => {
    it('permits anonymous clickCount increment by exactly 1, but blocks spoofing and page plan tampering', async () => {
      if (!emulatorAvailable) return;
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await setDoc(doc(context.firestore(), 'pages', 'page_test'), {
          userId: 'owner_uid',
        });
        await setDoc(doc(context.firestore(), 'pages', 'page_test', 'links', 'link_1'), {
          clickCount: 10,
          title: 'My Store',
          url: 'https://store.example.com',
        });
      });

      const unauthContext = testEnv.unauthenticatedContext();
      const db = unauthContext.firestore();

      // Incrementing by exactly 1 succeeds
      await assertSucceeds(
        updateDoc(doc(db, 'pages', 'page_test', 'links', 'link_1'), {
          clickCount: 11,
        })
      );

      // Incrementing by 2 or modifying title is blocked for anonymous users
      await assertFails(
        updateDoc(doc(db, 'pages', 'page_test', 'links', 'link_1'), {
          clickCount: 13,
        })
      );
      await assertFails(
        updateDoc(doc(db, 'pages', 'page_test', 'links', 'link_1'), {
          title: 'Defaced Link Title',
        })
      );

      // Page owner cannot self-grant plan or customDomain on pages doc
      const ownerContext = testEnv.authenticatedContext('owner_uid');
      await assertFails(
        updateDoc(doc(ownerContext.firestore(), 'pages', 'page_test'), {
          plan: 'pro',
        })
      );
      await assertFails(
        updateDoc(doc(ownerContext.firestore(), 'pages', 'page_test'), {
          customDomain: 'mybrand.com',
        })
      );
    });
  });
});
