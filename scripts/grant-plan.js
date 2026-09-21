#!/usr/bin/env node
/**
 * scripts/grant-plan.js
 * 
 * Admin CLI tool to grant or change a user's subscription plan directly
 * using the Firebase Admin SDK. This eliminates hardcoded email whitelists.
 * 
 * Usage:
 *   node scripts/grant-plan.js <email> <free|pro|business|agency>
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve firebase-admin from functions or root
let admin;
try {
  admin = require('../functions/node_modules/firebase-admin');
} catch {
  try {
    admin = require('firebase-admin');
  } catch (err) {
    console.error('Error: firebase-admin is not installed. Run "npm install" in the functions/ folder first.');
    process.exit(1);
  }
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('\nUsage: node scripts/grant-plan.js <email> <free|pro|business|agency>');
  console.log('Example: node scripts/grant-plan.js user@example.com agency\n');
  process.exit(1);
}

const email = args[0].toLowerCase().trim();
const plan = args[1].toLowerCase().trim();

const VALID_PLANS = ['free', 'pro', 'business', 'agency'];
if (!VALID_PLANS.includes(plan)) {
  console.error(`Error: Invalid plan "${plan}". Valid plans are: ${VALID_PLANS.join(', ')}`);
  process.exit(1);
}

// Load config for database ID and project ID
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
let projectId = 'zeperai';
let databaseId = undefined;
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    projectId = config.projectId || projectId;
    if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
      databaseId = config.firestoreDatabaseId;
    }
  } catch (e) {
    // ignore
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GCLOUD_PROJECT || projectId,
  });
}

const db = databaseId ? admin.firestore(admin.app(), databaseId) : admin.firestore();

async function run() {
  console.log(`\nLooking up user by email: ${email}...`);
  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
  } catch (err) {
    console.error(`Error: User with email "${email}" not found in Firebase Auth.`);
    process.exit(1);
  }

  const uid = userRecord.uid;
  console.log(`Found user: ${userRecord.displayName || 'No Name'} (UID: ${uid})`);

  const now = new Date();
  const nowIso = now.toISOString();
  const userRef = db.doc(`users/${uid}`);
  const subRef = db.doc(`users/${uid}/subscriptions/current`);

  const credits = plan === 'agency' || plan === 'business' ? 2500 : plan === 'pro' ? 500 : 0;
  const periodEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

  await db.runTransaction(async (tx) => {
    // 1. Update user document plan
    tx.set(
      userRef,
      {
        plan,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 2. Update subscription subcollection
    if (plan === 'free') {
      tx.set(
        subRef,
        {
          userId: uid,
          plan: 'free',
          status: 'canceled',
          creditsRemaining: 0,
          updatedAt: nowIso,
        },
        { merge: true }
      );
    } else {
      tx.set(
        subRef,
        {
          userId: uid,
          plan,
          status: 'active',
          billingCycle: 'yearly',
          amount: 0,
          currency: 'INR',
          startDate: nowIso,
          currentPeriodStart: nowIso,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          creditsRemaining: credits,
          creditsMonthly: credits,
          creditsUsed: 0,
          grantedBy: 'admin-cli',
          updatedAt: nowIso,
        },
        { merge: true }
      );

      // 3. Log credit transaction
      const txId = `ctx_admin_${Date.now()}`;
      const creditTxRef = db.doc(`users/${uid}/credit_transactions/${txId}`);
      tx.set(creditTxRef, {
        id: txId,
        userId: uid,
        type: 'monthly_grant',
        amount: credits,
        description: `Admin grant for plan: ${plan}`,
        balanceAfter: credits,
        createdAt: nowIso,
      });
    }
  });

  console.log(`\nSuccessfully granted plan "${plan}" to ${email} (UID: ${uid})!`);
  console.log(`- users/${uid}.plan: ${plan}`);
  console.log(`- users/${uid}/subscriptions/current: ${plan === 'free' ? 'canceled' : 'active'}`);
  console.log(`- Credits allocated: ${credits}\n`);
}

run().catch((err) => {
  console.error('Failed to grant plan:', err);
  process.exit(1);
});
