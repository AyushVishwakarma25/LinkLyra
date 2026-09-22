import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import {
  OnboardingProfile,
  GeneratedCardConfig,
  ProfileCardData,
} from '../types';
import {
  generateOnboardingRecommendations,
  RecommendationResult,
} from './onboardingConfig';
import {
  db,
  profileService,
  sanitizeForFirestore,
  handleFirestoreError,
  OperationType,
  DbProfile,
} from './firebase';

export interface OnboardingCompletionResult {
  success: boolean;
  profile: OnboardingProfile;
  createdCardsCount: number;
  message?: string;
}

export interface OnboardingEligibility {
  needsOnboarding: boolean;
  status: 'new_user' | 'completed' | 'grandfathered_existing_user';
  reason: string;
}

export const ONBOARDING_VERSION = 1;

/**
 * Checks whether a given user needs to undergo onboarding.
 * CRITICAL: Existing users who already have cards or completed previous onboarding
 * are strictly exempt and grandfathered in so their layout is never disrupted.
 */
export async function checkUserOnboardingEligibility(
  userId: string,
  currentProfile: DbProfile | null,
  existingCardsCount: number
): Promise<OnboardingEligibility> {
  if (!userId) {
    return {
      needsOnboarding: false,
      status: 'completed',
      reason: 'No authenticated user ID provided',
    };
  }

  // 1. Check if user already completed the new onboarding
  if (currentProfile?.onboarding_profile?.onboardingCompleted === true) {
    return {
      needsOnboarding: false,
      status: 'completed',
      reason: 'User has completed onboarding profile',
    };
  }

  // 2. Check legacy completion flag
  if (currentProfile?.has_completed_onboarding === true) {
    return {
      needsOnboarding: false,
      status: 'completed',
      reason: 'User has legacy onboarding completed flag',
    };
  }

  // 3. Check existing user cards protection (grandfathering)
  // If the user already has created cards, NEVER force them into onboarding
  if (existingCardsCount > 0) {
    return {
      needsOnboarding: false,
      status: 'grandfathered_existing_user',
      reason: 'Existing user with active cards is grandfathered in to prevent disruption',
    };
  }

  // 4. Also check Firestore directly if existingCardsCount was passed as 0 or unknown
  try {
    const existingLinksSnap = await getDocs(collection(db, 'pages', userId, 'links')).catch(() => null);
    if (existingLinksSnap && !existingLinksSnap.empty) {
      return {
        needsOnboarding: false,
        status: 'grandfathered_existing_user',
        reason: 'Existing links detected in Firestore; user is protected',
      };
    }
  } catch (err) {
    console.warn('[OnboardingService] Could not check remote links count:', err);
  }

  // 5. User is genuinely new
  return {
    needsOnboarding: true,
    status: 'new_user',
    reason: 'New user with no existing setup or cards',
  };
}

/**
 * Converts a GeneratedCardConfig into a runtime ProfileCardData compatible with
 * existing card schemas without breaking or replacing existing schemas.
 */
export function convertConfigToProfileCard(
  config: GeneratedCardConfig,
  order: number
): ProfileCardData {
  return {
    id: config.id,
    title: config.title,
    subtitle: config.subtitle || '',
    linkUrl: config.linkUrl,
    color: config.color,
    badgeText: config.badgeText,
    expanded: true,
    isActive: config.isActive,
    clicks: 0,
    position: order,
    templateType: config.templateType,
    // Embed existing card domain sub-objects
    realEstate: config.realEstate,
    showingBooking: config.showingBooking,
    homeValuation: config.homeValuation,
    clientReview: config.clientReview,
    creatorWork: config.creatorWork,
    creatorStats: config.creatorStats,
    featuredWork: config.featuredWork,
    creatorPackages: config.creatorPackages,
    brandInquiry: config.brandInquiry,
    recommendation: config.recommendation,
    mediaKit: config.mediaKit,
    coaching: config.coaching,
    music: config.music,
    podcast: config.podcast,
  };
}

/**
 * Idempotently saves the onboarding profile and generates initial cards.
 * If called multiple times, it merges safely and avoids duplicating cards.
 */
export async function completeUserOnboarding(
  userId: string,
  onboardingData: Partial<OnboardingProfile>,
  options: {
    createCards?: boolean;
    recommendationResult?: RecommendationResult;
  } = {}
): Promise<OnboardingCompletionResult> {
  if (!userId) {
    throw new Error('Cannot complete onboarding: user ID is required.');
  }

  const { createCards = true, recommendationResult } = options;

  // 1. Generate recommendations if not pre-supplied
  const recommendations =
    recommendationResult ||
    generateOnboardingRecommendations({
      role: onboardingData.primaryRole || 'other',
      goals: onboardingData.goals || [],
      primaryCTA: onboardingData.primaryCTA || 'whatsapp_chat',
      fullName: onboardingData.fullName,
      whatsapp: onboardingData.whatsapp,
      country: onboardingData.country,
      roleData: onboardingData.roleData,
    });

  // 2. Build final strongly typed OnboardingProfile document
  const finalProfile: OnboardingProfile = {
    onboardingCompleted: true,
    onboardingVersion: ONBOARDING_VERSION,
    fullName: onboardingData.fullName || 'Creator',
    username: (onboardingData.username || `user_${userId.slice(0, 6)}`).toLowerCase().trim(),
    profilePhoto: onboardingData.profilePhoto || '',
    bio: onboardingData.bio || '',
    country: onboardingData.country || 'US',
    whatsapp: onboardingData.whatsapp || '',
    primaryRole: onboardingData.primaryRole || 'other',
    goals: onboardingData.goals || [],
    leadSources: onboardingData.leadSources || [],
    primaryCTA: onboardingData.primaryCTA || 'whatsapp_chat',
    roleData: onboardingData.roleData || {},
    generatedCardSet: recommendations.recommendedCards,
    completedAt: new Date().toISOString(),
  };

  try {
    // 3. Persist onboarding profile to `users/{userId}`, `pages/{userId}`, and `profiles/{userId}`
    const sanitizedOnboarding = sanitizeForFirestore(finalProfile);

    // Write to users/{userId}
    await setDoc(
      doc(db, 'users', userId),
      {
        displayName: finalProfile.fullName,
        username: finalProfile.username,
        hasCompletedOnboarding: true,
        onboardingProfile: sanitizedOnboarding,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Write to profiles/{userId}
    await setDoc(
      doc(db, 'profiles', userId),
      {
        id: userId,
        full_name: finalProfile.fullName,
        username: finalProfile.username,
        bio: finalProfile.bio,
        avatar_url: finalProfile.profilePhoto,
        business_phone: finalProfile.whatsapp,
        theme: recommendations.suggestedTheme,
        page_archetype: recommendations.pageArchetype,
        has_completed_onboarding: true,
        onboarding_profile: sanitizedOnboarding,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );

    // Write to pages/{userId}
    await setDoc(
      doc(db, 'pages', userId),
      sanitizeForFirestore({
        userId,
        username: finalProfile.username,
        title: finalProfile.fullName,
        bio: finalProfile.bio,
        avatarUrl: finalProfile.profilePhoto,
        businessPhone: finalProfile.whatsapp,
        themeId: recommendations.suggestedTheme,
        isPublished: true,
        updatedAt: serverTimestamp(),
      }),
      { merge: true }
    );

    // 4. Idempotent Card Generation
    let createdCardsCount = 0;
    if (createCards) {
      // Check existing cards first to prevent duplicate card creation if user re-submits
      const existingSnap = await getDocs(collection(db, 'pages', userId, 'links')).catch(() => null);
      const existingCount = existingSnap ? existingSnap.size : 0;

      if (existingCount === 0) {
        // Safe to generate initial cards
        for (let i = 0; i < recommendations.recommendedCards.length; i++) {
          const cardConfig = recommendations.recommendedCards[i];
          const runtimeCard = convertConfigToProfileCard(cardConfig, i);

          await profileService
            .addLink(userId, {
              title: runtimeCard.title,
              subtitle: runtimeCard.subtitle,
              link_url: runtimeCard.linkUrl,
              color: runtimeCard.color,
              badge_text: runtimeCard.badgeText,
              expanded: true,
              is_active: runtimeCard.isActive ?? true,
              display_order: i,
              template_type: runtimeCard.templateType,
              real_estate: runtimeCard.realEstate,
              coaching: runtimeCard.coaching,
              creator_stats: runtimeCard.creatorStats,
              creator_work: runtimeCard.creatorWork,
              featured_work: runtimeCard.featuredWork,
              creator_packages: runtimeCard.creatorPackages,
              brand_inquiry: runtimeCard.brandInquiry,
              recommendation: runtimeCard.recommendation,
              client_review: runtimeCard.clientReview,
              music: runtimeCard.music,
              podcast: runtimeCard.podcast,
              is_premium: cardConfig.isPremium,
              custom_whatsapp_phone: cardConfig.customWhatsappPhone,
            })
            .catch((cardErr) => {
              console.error(`[OnboardingService] Warning: Could not create card ${cardConfig.title}:`, cardErr);
            });
          createdCardsCount++;
        }
      } else {
        console.log(`[OnboardingService] User already has ${existingCount} card(s). Skipping card recreation to protect user data.`);
      }
    }

    return {
      success: true,
      profile: finalProfile,
      createdCardsCount,
      message: 'Onboarding completed successfully and persisted idempotently.',
    };
  } catch (err: unknown) {
    console.error('[OnboardingService] Failed to persist onboarding profile to Firestore:', err);
    // Explicitly handle failure: do NOT mask or falsely report success
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/onboarding`);
    const message = err instanceof Error ? err.message : 'Failed to save onboarding configuration. Please check your connection.';
    throw new Error(message);
  }
}

/**
 * Retrieves the stored OnboardingProfile for a given user.
 */
export async function getStoredOnboardingProfile(userId: string): Promise<OnboardingProfile | null> {
  if (!userId) return null;

  try {
    const userDocSnap = await getDoc(doc(db, 'users', userId));
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      if (data?.onboardingProfile) {
        return data.onboardingProfile as OnboardingProfile;
      }
    }

    const profileSnap = await getDoc(doc(db, 'profiles', userId));
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      if (data?.onboarding_profile) {
        return data.onboarding_profile as OnboardingProfile;
      }
    }
  } catch (err) {
    console.error('[OnboardingService] Error fetching stored onboarding profile:', err);
  }

  return null;
}
