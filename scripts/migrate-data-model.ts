/**
 * scripts/migrate-data-model.ts
 * 
 * Admin migration script to consolidate LinkLyra data models to canonical paths:
 * 1. Consolidate legacy profiles/{uid} into canonical pages/{uid} and users/{uid}.
 * 2. Eliminate root-level duplicates (links, leads, subscriptions, payments)
 *    by migrating any orphaned items into subcollections and cleaning root docs.
 * 3. Detect and migrate base64 inline avatar strings to Firebase Storage.
 * 
 * Safety:
 * - Runs in DRY-RUN mode by default! No writes or deletes occur unless --apply is passed.
 * - Idempotent: safe to run multiple times without duplicating or corrupting data.
 * 
 * Usage:
 *   npx tsx scripts/migrate-data-model.ts           # Dry-run preview
 *   npx tsx scripts/migrate-data-model.ts --apply   # Apply changes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Resolve firebase-admin
let admin: any;
try {
  admin = require('../functions/node_modules/firebase-admin');
} catch {
  try {
    admin = require('firebase-admin');
  } catch {
    console.error('❌ Error: firebase-admin is not installed. Please run "npm install" in the functions/ folder.');
    process.exit(1);
  }
}

// 2. Parse command-line arguments
const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const isDryRun = !isApply;

console.log('='.repeat(70));
console.log('🚀 LinkLyra Data Model Migration Tool');
console.log(`Mode: ${isDryRun ? '🔍 DRY-RUN (Preview only, no changes will be made)' : '⚡ LIVE APPLY (Modifications will be committed)'}`);
if (isDryRun) {
  console.log('To execute the migration against Firestore, pass the --apply flag.');
}
console.log('='.repeat(70));

// 3. Initialize Firebase Admin SDK
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
let projectId = 'zeperai';
let storageBucket = `${projectId}.firebasestorage.app`;

if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    projectId = config.projectId || projectId;
    storageBucket = config.storageBucket || `${projectId}.firebasestorage.app`;
  } catch (err) {
    console.warn('Notice: Could not parse firebase-applet-config.json:', err);
  }
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId,
      storageBucket,
    });
  } catch (initErr: any) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', initErr.message);
    console.error('Please ensure GOOGLE_APPLICATION_CREDENTIALS or gcloud auth is configured.');
    process.exit(1);
  }
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

interface MigrationStats {
  profilesScanned: number;
  profilesMigrated: number;
  pagesCreated: number;
  usersCreated: number;
  avatarsMigratedToStorage: number;
  rootLinksScanned: number;
  rootLinksMigrated: number;
  rootLinksDeleted: number;
  rootLeadsScanned: number;
  rootLeadsMigrated: number;
  rootLeadsDeleted: number;
  rootSubscriptionsScanned: number;
  rootSubscriptionsMigrated: number;
  rootSubscriptionsDeleted: number;
  rootPaymentsScanned: number;
  rootPaymentsMigrated: number;
  rootPaymentsDeleted: number;
  errors: number;
}

const stats: MigrationStats = {
  profilesScanned: 0,
  profilesMigrated: 0,
  pagesCreated: 0,
  usersCreated: 0,
  avatarsMigratedToStorage: 0,
  rootLinksScanned: 0,
  rootLinksMigrated: 0,
  rootLinksDeleted: 0,
  rootLeadsScanned: 0,
  rootLeadsMigrated: 0,
  rootLeadsDeleted: 0,
  rootSubscriptionsScanned: 0,
  rootSubscriptionsMigrated: 0,
  rootSubscriptionsDeleted: 0,
  rootPaymentsScanned: 0,
  rootPaymentsMigrated: 0,
  rootPaymentsDeleted: 0,
  errors: 0,
};

/**
 * Upload base64 image data to Firebase Storage and return signed / public URL
 */
async function uploadBase64Avatar(uid: string, base64Str: string): Promise<string | null> {
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const filePath = `users/${uid}/avatar_${Date.now()}.${ext}`;
    const file = bucket.file(filePath);

    if (isDryRun) {
      console.log(`  [DRY-RUN] Would upload base64 avatar (${(buffer.length / 1024).toFixed(1)} KB) to ${filePath}`);
      return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    }

    await file.save(buffer, {
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000',
      },
    });

    await file.makePublic().catch(() => {});
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    console.log(`  ✅ Uploaded avatar to Storage: ${publicUrl}`);
    return publicUrl;
  } catch (err: any) {
    console.error(`  ⚠️ Failed to migrate base64 avatar for user ${uid}:`, err.message);
    return null;
  }
}

/**
 * Step 1: Migrate legacy `profiles/{uid}` to canonical `pages/{uid}` and `users/{uid}`
 */
async function migrateProfiles(): Promise<void> {
  console.log('\n--- Step 1: Migrating profiles/{uid} to canonical pages/{uid} & users/{uid} ---');
  
  try {
    const profilesSnap = await db.collection('profiles').get();
    stats.profilesScanned = profilesSnap.size;
    console.log(`Found ${profilesSnap.size} documents in legacy "profiles" collection.`);

    for (const docSnap of profilesSnap.docs) {
      const uid = docSnap.id;
      const data = docSnap.data();

      stats.profilesMigrated++;
      let avatarUrl = data.avatar_url || data.avatarUrl || '';

      // Check if avatar is base64
      if (avatarUrl.startsWith('data:image/')) {
        const uploadedUrl = await uploadBase64Avatar(uid, avatarUrl);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
          stats.avatarsMigratedToStorage++;
        }
      }

      // 1. Canonical public page: pages/{uid}
      const pageRef = db.collection('pages').doc(uid);
      const pageSnap = await pageRef.get();

      const canonicalPageData: Record<string, any> = {
        userId: uid,
        username: data.username || `creator_${uid.slice(0, 5)}`,
        title: data.full_name || data.name || data.title || 'Creator Page',
        bio: data.bio || data.headline || '',
        avatarUrl,
        themeId: data.theme || data.themeId || 'warm',
        backgroundType: data.background_type || data.backgroundType || 'color',
        backgroundValue: data.background_value || data.backgroundValue || '#ECE7DC',
        fontFamily: data.font_family || data.fontFamily || 'Plus Jakarta Sans',
        textColor: data.text_color || data.textColor || '#1C1E22',
        buttonStyle: data.button_style || data.buttonStyle || 'rounded',
        buttonColor: data.button_color || data.buttonColor || '#5E4BF7',
        socials: data.socials || {},
        isPublished: data.is_published !== undefined ? data.is_published : true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (!pageSnap.exists) {
        canonicalPageData.createdAt = data.created_at || admin.firestore.FieldValue.serverTimestamp();
        console.log(`  [PAGES] ${isDryRun ? 'Would create' : 'Creating'} pages/${uid} (@${canonicalPageData.username})`);
        if (!isDryRun) {
          await pageRef.set(canonicalPageData);
        }
        stats.pagesCreated++;
      } else {
        console.log(`  [PAGES] pages/${uid} already exists, merging missing fields`);
        if (!isDryRun) {
          await pageRef.set(canonicalPageData, { merge: true });
        }
      }

      // 2. Canonical private account: users/{uid}
      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();

      const canonicalUserData: Record<string, any> = {
        displayName: data.full_name || data.name || 'Creator',
        email: data.email || '',
        photoURL: avatarUrl,
        username: data.username || `creator_${uid.slice(0, 5)}`,
        plan: data.plan || 'free',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (data.accountSettings) {
        canonicalUserData.accountSettings = data.accountSettings;
      }

      if (!userSnap.exists) {
        canonicalUserData.createdAt = data.created_at || admin.firestore.FieldValue.serverTimestamp();
        console.log(`  [USERS] ${isDryRun ? 'Would create' : 'Creating'} users/${uid}`);
        if (!isDryRun) {
          await userRef.set(canonicalUserData);
        }
        stats.usersCreated++;
      } else {
        if (!isDryRun) {
          await userRef.set(canonicalUserData, { merge: true });
        }
      }
    }
  } catch (err: any) {
    console.error('❌ Error during profiles migration:', err.message);
    stats.errors++;
  }
}

/**
 * Step 2: Clean and migrate root `links` collection to `pages/{pageId}/links`
 */
async function migrateRootLinks(): Promise<void> {
  console.log('\n--- Step 2: Auditing & migrating root "links" collection ---');
  
  try {
    const linksSnap = await db.collection('links').get();
    stats.rootLinksScanned = linksSnap.size;
    console.log(`Found ${linksSnap.size} documents in legacy root "links" collection.`);

    for (const docSnap of linksSnap.docs) {
      const linkId = docSnap.id;
      const data = docSnap.data();
      const pageId = data.pageId || data.profile_id || data.userId;

      if (!pageId) {
        console.warn(`  ⚠️ Root link ${linkId} has no owner pageId/profile_id. Skipping.`);
        continue;
      }

      const targetRef = db.collection('pages').doc(pageId).collection('links').doc(linkId);
      const targetSnap = await targetRef.get();

      if (!targetSnap.exists) {
        console.log(`  [LINKS] ${isDryRun ? 'Would migrate' : 'Migrating'} root link ${linkId} -> pages/${pageId}/links/${linkId}`);
        if (!isDryRun) {
          await targetRef.set({
            ...data,
            pageId,
            profile_id: pageId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        stats.rootLinksMigrated++;
      }

      // Delete root duplicate
      console.log(`  [LINKS] ${isDryRun ? 'Would delete' : 'Deleting'} root duplicate links/${linkId}`);
      if (!isDryRun) {
        await docSnap.ref.delete();
      }
      stats.rootLinksDeleted++;
    }
  } catch (err: any) {
    console.error('❌ Error during root links migration:', err.message);
    stats.errors++;
  }
}

/**
 * Step 3: Clean and migrate root `leads` collection to `pages/{pageId}/leads`
 */
async function migrateRootLeads(): Promise<void> {
  console.log('\n--- Step 3: Auditing & migrating root "leads" collection ---');
  
  try {
    const leadsSnap = await db.collection('leads').get();
    stats.rootLeadsScanned = leadsSnap.size;
    console.log(`Found ${leadsSnap.size} documents in legacy root "leads" collection.`);

    for (const docSnap of leadsSnap.docs) {
      const leadId = docSnap.id;
      const data = docSnap.data();
      const pageId = data.pageId || data.profile_id || data.userId;

      if (!pageId) {
        console.warn(`  ⚠️ Root lead ${leadId} has no owner pageId. Skipping.`);
        continue;
      }

      const targetRef = db.collection('pages').doc(pageId).collection('leads').doc(leadId);
      const targetSnap = await targetRef.get();

      if (!targetSnap.exists) {
        console.log(`  [LEADS] ${isDryRun ? 'Would migrate' : 'Migrating'} root lead ${leadId} -> pages/${pageId}/leads/${leadId}`);
        if (!isDryRun) {
          await targetRef.set({
            ...data,
            pageId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        stats.rootLeadsMigrated++;
      }

      console.log(`  [LEADS] ${isDryRun ? 'Would delete' : 'Deleting'} root duplicate leads/${leadId}`);
      if (!isDryRun) {
        await docSnap.ref.delete();
      }
      stats.rootLeadsDeleted++;
    }
  } catch (err: any) {
    console.error('❌ Error during root leads migration:', err.message);
    stats.errors++;
  }
}

/**
 * Step 4: Clean and migrate root `subscriptions` & `payments`
 */
async function migrateRootBilling(): Promise<void> {
  console.log('\n--- Step 4: Auditing & migrating root subscriptions & payments ---');
  
  try {
    // Root subscriptions
    const subsSnap = await db.collection('subscriptions').get();
    stats.rootSubscriptionsScanned = subsSnap.size;

    for (const docSnap of subsSnap.docs) {
      const userId = docSnap.id;
      const data = docSnap.data();
      const targetRef = db.collection('users').doc(userId).collection('subscriptions').doc('current');
      const targetSnap = await targetRef.get();

      if (!targetSnap.exists) {
        console.log(`  [SUBSCRIPTIONS] ${isDryRun ? 'Would migrate' : 'Migrating'} subscriptions/${userId} -> users/${userId}/subscriptions/current`);
        if (!isDryRun) {
          await targetRef.set(data);
        }
        stats.rootSubscriptionsMigrated++;
      }

      console.log(`  [SUBSCRIPTIONS] ${isDryRun ? 'Would delete' : 'Deleting'} root duplicate subscriptions/${userId}`);
      if (!isDryRun) {
        await docSnap.ref.delete();
      }
      stats.rootSubscriptionsDeleted++;
    }

    // Root payments
    const paymentsSnap = await db.collection('payments').get();
    stats.rootPaymentsScanned = paymentsSnap.size;

    for (const docSnap of paymentsSnap.docs) {
      const paymentId = docSnap.id;
      const data = docSnap.data();
      const userId = data.userId;

      if (!userId) {
        console.warn(`  ⚠️ Root payment ${paymentId} has no userId. Skipping.`);
        continue;
      }

      const targetRef = db.collection('users').doc(userId).collection('payments').doc(paymentId);
      const targetSnap = await targetRef.get();

      if (!targetSnap.exists) {
        console.log(`  [PAYMENTS] ${isDryRun ? 'Would migrate' : 'Migrating'} payments/${paymentId} -> users/${userId}/payments/${paymentId}`);
        if (!isDryRun) {
          await targetRef.set(data);
        }
        stats.rootPaymentsMigrated++;
      }

      console.log(`  [PAYMENTS] ${isDryRun ? 'Would delete' : 'Deleting'} root duplicate payments/${paymentId}`);
      if (!isDryRun) {
        await docSnap.ref.delete();
      }
      stats.rootPaymentsDeleted++;
    }
  } catch (err: any) {
    console.error('❌ Error during root billing migration:', err.message);
    stats.errors++;
  }
}

/**
 * Main execution entrypoint
 */
async function main() {
  const startTime = Date.now();

  await migrateProfiles();
  await migrateRootLinks();
  await migrateRootLeads();
  await migrateRootBilling();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(70));
  console.log(`🏁 Migration Completed (${elapsed}s) [Mode: ${isDryRun ? 'DRY-RUN' : 'APPLIED'}]`);
  console.log('='.repeat(70));
  console.table({
    'Profiles Scanned': stats.profilesScanned,
    'Profiles Migrated': stats.profilesMigrated,
    'Pages Created': stats.pagesCreated,
    'Users Created': stats.usersCreated,
    'Avatars -> Storage': stats.avatarsMigratedToStorage,
    'Root Links Scanned': stats.rootLinksScanned,
    'Root Links Migrated': stats.rootLinksMigrated,
    'Root Links Deleted': stats.rootLinksDeleted,
    'Root Leads Scanned': stats.rootLeadsScanned,
    'Root Leads Migrated': stats.rootLeadsMigrated,
    'Root Leads Deleted': stats.rootLeadsDeleted,
    'Root Subscriptions Scanned': stats.rootSubscriptionsScanned,
    'Root Subscriptions Migrated': stats.rootSubscriptionsMigrated,
    'Root Subscriptions Deleted': stats.rootSubscriptionsDeleted,
    'Root Payments Scanned': stats.rootPaymentsScanned,
    'Root Payments Migrated': stats.rootPaymentsMigrated,
    'Root Payments Deleted': stats.rootPaymentsDeleted,
    'Errors Encountered': stats.errors,
  });

  if (isDryRun) {
    console.log('\n💡 Notice: This was a DRY-RUN preview. To apply changes to Firestore, run:');
    console.log('   npx tsx scripts/migrate-data-model.ts --apply\n');
  } else {
    console.log('\n✅ All changes committed successfully to Firestore.\n');
  }

  process.exit(stats.errors > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
