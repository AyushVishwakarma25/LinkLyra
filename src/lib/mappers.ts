import {
  ProfileCardData,
  CardColor,
  CardTemplateType,
} from '../types';
import {
  DbProfile,
} from './firebase';

/**
 * Pure data transformation functions between Firestore document models
 * and frontend application interfaces (UserProfile, ProfileCardData, DbProfile, DbLink).
 * 
 * Includes documented compatibility paths for reading old-shape docs (snake_case)
 * written prior to the data model consolidation migration.
 */

// Raw document input supporting untyped Firestore JSON payloads and legacy snake_case structures
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DocumentInput = Record<string, any>;

/**
 * Converts a Firestore page document (pages/{uid}) and optional user document (users/{uid})
 * into a DbProfile interface used by LinkLyra UI.
 */
export function pageToProfile(
  pageDoc: DocumentInput = {},
  userDoc?: DocumentInput
): DbProfile {
  const uid = pageDoc.userId || pageDoc.id || userDoc?.id || userDoc?.uid || '';
  const username = pageDoc.username || userDoc?.username || '';
  const fullName =
    pageDoc.title ||
    pageDoc.full_name ||
    pageDoc.name ||
    userDoc?.displayName ||
    username ||
    'Creator';

  const avatarUrl =
    pageDoc.avatarUrl ||
    pageDoc.avatar_url ||
    pageDoc.photoURL ||
    pageDoc.profilePhoto ||
    pageDoc.avatar ||
    userDoc?.photoURL ||
    userDoc?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

  return {
    id: uid,
    username,
    full_name: fullName,
    bio: pageDoc.bio || '',
    avatar_url: avatarUrl,
    business_phone: pageDoc.businessPhone || pageDoc.business_phone,
    theme: pageDoc.themeId || pageDoc.theme || 'warm',
    font_family: pageDoc.fontFamily || pageDoc.font_family || 'plus-jakarta',
    button_style: pageDoc.buttonStyle || pageDoc.button_style || 'rounded',
    background_type: pageDoc.backgroundType || pageDoc.background_type || 'color',
    background_value: pageDoc.backgroundValue || pageDoc.background_value || '#FDFBF7',
    card_style: pageDoc.cardStyle || pageDoc.card_style,
    wallpaper_mode: pageDoc.wallpaperMode || pageDoc.wallpaper_mode,
    wallpaper_tint: pageDoc.wallpaperTint !== undefined ? pageDoc.wallpaperTint : pageDoc.wallpaper_tint,
    card_bg_color: pageDoc.cardBgColor || pageDoc.card_bg_color,
    card_text_color: pageDoc.cardTextColor || pageDoc.card_text_color,
    button_color: pageDoc.buttonColor || pageDoc.button_color,
    stickers: pageDoc.stickers || [],
    footer_settings: pageDoc.footerSettings || pageDoc.footer_settings,
    socials: pageDoc.socials || pageDoc.socialLinks || {},
    plan: pageDoc.plan || userDoc?.plan || 'free',
    role: pageDoc.role || '',
    custom_domain: pageDoc.customDomain || pageDoc.custom_domain,
    whiteLabel: pageDoc.whiteLabel,
    accountSettings: pageDoc.accountSettings || userDoc?.accountSettings,
    has_completed_onboarding: pageDoc.hasCompletedOnboarding ?? pageDoc.has_completed_onboarding,
    onboarding_profile: pageDoc.onboardingProfile || pageDoc.onboarding_profile,
    created_at: pageDoc.createdAt,
    updated_at: pageDoc.updatedAt,
  };
}

/**
 * Converts a Firestore link document or DbLink into a frontend ProfileCardData object.
 * Transparently handles both canonical camelCase fields and legacy snake_case fields.
 */
export function linkToCard(linkDoc: DocumentInput = {}): ProfileCardData {
  const id = linkDoc.id || '';
  const title = linkDoc.title || '';
  const subtitle = linkDoc.description || linkDoc.subtitle || '';
  const linkUrl = linkDoc.url || linkDoc.link_url || '';
  const color = (linkDoc.color as CardColor) || 'stone';
  const logoSrc = linkDoc.thumbnailUrl || linkDoc.logo_url || '';
  const badgeText = linkDoc.badgeText || linkDoc.badge_text || '';
  const expanded = Boolean(linkDoc.expanded);
  const isActive = linkDoc.isActive !== undefined ? linkDoc.isActive : linkDoc.is_active !== false;
  const clicks = linkDoc.clickCount || linkDoc.clicks || 0;
  const templateType = (linkDoc.templateType || linkDoc.template_type || linkDoc.linkType || 'url') as CardTemplateType;
  const sectionId = linkDoc.sectionId || linkDoc.section_id || undefined;

  // Real Estate mapping (supports canonical camelCase & legacy snake_case)
  const rawRE = linkDoc.realEstate || linkDoc.real_estate;
  const realEstate = rawRE
    ? {
        propertyName: rawRE.propertyName || rawRE.property_name || title,
        location: rawRE.location || '',
        priceBracket: rawRE.priceBracket || rawRE.price_bracket || '',
        propertyType: rawRE.propertyType || rawRE.property_type || '',
        statusTag: rawRE.statusTag || rawRE.status_tag,
        specs: rawRE.specs,
        brochureUrl: rawRE.brochureUrl || rawRE.brochure_url,
        virtualTourUrl: rawRE.virtualTourUrl || rawRE.virtual_tour_url,
        showingBooking: rawRE.showingBooking || rawRE.showing_booking,
      }
    : undefined;

  // Coaching mapping
  const rawCoach = linkDoc.coaching;
  const coaching = rawCoach
    ? {
        courseName: rawCoach.courseName || rawCoach.course_name || title,
        examTrack: rawCoach.examTrack || rawCoach.exam_track || '',
        batchTiming: rawCoach.batchTiming || rawCoach.batch_timing || '',
        feeStructure: rawCoach.feeStructure || rawCoach.fee_structure || '',
        admissionOpen: rawCoach.admissionOpen ?? rawCoach.admission_open,
        syllabusBrochureUrl: rawCoach.syllabusBrochureUrl || rawCoach.syllabus_brochure_url,
        customAdmissionPhone: rawCoach.customAdmissionPhone || rawCoach.custom_admission_phone,
      }
    : undefined;

  return {
    id,
    sectionId,
    title,
    subtitle,
    linkUrl,
    color,
    logoSrc,
    badgeText,
    expanded,
    isActive,
    clicks,
    templateType,
    isPremium: linkDoc.isPremium || linkDoc.is_premium || Boolean(templateType?.startsWith('music_') || templateType?.startsWith('podcast_')),
    realEstate,
    coaching,
    creatorStats: linkDoc.creatorStats || linkDoc.creator_stats,
    creatorWork: linkDoc.creatorWork || linkDoc.creator_work,
    featuredWork: linkDoc.featuredWork || linkDoc.featured_work,
    creatorPackages: linkDoc.creatorPackages || linkDoc.creator_packages,
    brandInquiry: linkDoc.brandInquiry || linkDoc.brand_inquiry,
    recommendation: linkDoc.recommendation,
    clientReview: linkDoc.clientReview || linkDoc.client_review,
    music: linkDoc.music,
    podcast: linkDoc.podcast,
    customWhatsappPhone: linkDoc.customWhatsappPhone || linkDoc.custom_whatsapp_phone,
  };
}

/**
 * Converts a frontend ProfileCardData object into a canonical Firestore link document
 * for persistence in pages/{uid}/links/{linkId}.
 * 
 * Writes canonical camelCase fields while preserving secondary compatibility aliases
 * so both new and legacy query patterns succeed without requiring an immediate database migration.
 */
export function cardToLinkDoc(
  card: ProfileCardData,
  position = 0,
  pageId?: string
): Record<string, unknown> {
  const linkDoc: Record<string, unknown> = {
    title: card.title || '',
    description: card.subtitle || '',
    url: card.linkUrl || '',
    color: card.color || 'stone',
    thumbnailUrl: card.logoSrc || '',
    icon: card.icon || '',
    badgeText: card.badgeText || '',
    position,
    isActive: card.isActive !== false,
    linkType: card.templateType || 'url',
    templateType: card.templateType || 'url',
    clickCount: card.clicks || 0,
    sectionId: card.sectionId || null,

    // Secondary legacy aliases for backwards compatibility
    subtitle: card.subtitle || '',
    link_url: card.linkUrl || '',
    logo_url: card.logoSrc || '',
    badge_text: card.badgeText || '',
    display_order: position,
    is_active: card.isActive !== false,
    template_type: card.templateType || 'url',
    clicks: card.clicks || 0,
    section_id: card.sectionId || null,
  };

  if (pageId) {
    linkDoc.pageId = pageId;
    linkDoc.profile_id = pageId;
  }

  if (card.isPremium !== undefined) {
    linkDoc.isPremium = card.isPremium;
    linkDoc.is_premium = card.isPremium;
  }

  if (card.customWhatsappPhone) {
    linkDoc.customWhatsappPhone = card.customWhatsappPhone;
    linkDoc.custom_whatsapp_phone = card.customWhatsappPhone;
  }

  if (card.realEstate) {
    linkDoc.realEstate = {
      propertyName: card.realEstate.propertyName,
      location: card.realEstate.location,
      priceBracket: card.realEstate.priceBracket,
      propertyType: card.realEstate.propertyType,
      statusTag: card.realEstate.statusTag,
      specs: card.realEstate.specs,
      brochureUrl: card.realEstate.brochureUrl,
      virtualTourUrl: card.realEstate.virtualTourUrl,
      showingBooking: card.realEstate.showingBooking,
    };
    linkDoc.real_estate = {
      property_name: card.realEstate.propertyName,
      location: card.realEstate.location,
      price_bracket: card.realEstate.priceBracket,
      property_type: card.realEstate.propertyType,
      status_tag: card.realEstate.statusTag,
      specs: card.realEstate.specs,
      brochure_url: card.realEstate.brochureUrl,
      virtual_tour_url: card.realEstate.virtualTourUrl,
      showing_booking: card.realEstate.showingBooking,
    };
  }

  if (card.coaching) {
    linkDoc.coaching = {
      courseName: card.coaching.courseName,
      examTrack: card.coaching.examTrack,
      batchTiming: card.coaching.batchTiming,
      feeStructure: card.coaching.feeStructure,
      admissionOpen: card.coaching.admissionOpen,
      syllabusBrochureUrl: card.coaching.syllabusBrochureUrl,
      customAdmissionPhone: card.coaching.customAdmissionPhone,
      // Legacy mirror
      course_name: card.coaching.courseName,
      exam_track: card.coaching.examTrack,
      batch_timing: card.coaching.batchTiming,
      fee_structure: card.coaching.feeStructure,
      admission_open: card.coaching.admissionOpen,
      syllabus_brochure_url: card.coaching.syllabusBrochureUrl,
      custom_admission_phone: card.coaching.customAdmissionPhone,
    };
  }

  if (card.creatorStats) {
    linkDoc.creatorStats = card.creatorStats;
    linkDoc.creator_stats = card.creatorStats;
  }
  if (card.creatorWork) {
    linkDoc.creatorWork = card.creatorWork;
    linkDoc.creator_work = card.creatorWork;
  }
  if (card.featuredWork) {
    linkDoc.featuredWork = card.featuredWork;
    linkDoc.featured_work = card.featuredWork;
  }
  if (card.creatorPackages) {
    linkDoc.creatorPackages = card.creatorPackages;
    linkDoc.creator_packages = card.creatorPackages;
  }
  if (card.brandInquiry) {
    linkDoc.brandInquiry = card.brandInquiry;
    linkDoc.brand_inquiry = card.brandInquiry;
  }
  if (card.recommendation) {
    linkDoc.recommendation = card.recommendation;
  }
  if (card.clientReview) {
    linkDoc.clientReview = card.clientReview;
    linkDoc.client_review = card.clientReview;
  }
  if (card.music) {
    linkDoc.music = card.music;
  }
  if (card.podcast) {
    linkDoc.podcast = card.podcast;
  }

  return linkDoc;
}
