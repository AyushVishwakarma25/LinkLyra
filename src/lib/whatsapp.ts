import { ProfileCardData } from '../types';

/**
 * Clean and normalize phone numbers for WhatsApp wa.me URLs.
 * Strips formatting (+, spaces, hyphens).
 * Defaulting to India (+91) standard prefix for 10-digit mobile numbers if no country code provided.
 */
export function sanitizeWhatsAppNumber(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // If 10 digits (e.g. 9876543210), prepend India country code 91 by default for localized businesses
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Extracts and formats the industry-specific metadata string for inclusion in the lead message.
 *
 * Real Estate: "Property Type in Location, Price Bracket"
 * Coaching Institute: "Exam Track Track, Batch Timing, Fee Structure"
 */
export function formatIndustryMetadataSummary(card: ProfileCardData): string {
  if (card.templateType === 'real_estate' && card.realEstate) {
    const parts: string[] = [];
    const { propertyType, location, priceBracket } = card.realEstate;
    
    if (propertyType && location) {
      parts.push(`${propertyType} in ${location}`);
    } else if (propertyType) {
      parts.push(propertyType);
    } else if (location) {
      parts.push(location);
    }

    if (priceBracket) {
      parts.push(`Price: ${priceBracket}`);
    }

    return parts.join(', ');
  }

  if (card.templateType === 'coaching_institute' && card.coaching) {
    const parts: string[] = [];
    const { examTrack, batchTiming, feeStructure } = card.coaching;

    if (examTrack) {
      parts.push(`${examTrack} Track`);
    }
    if (batchTiming) {
      parts.push(`Batch: ${batchTiming}`);
    }
    if (feeStructure) {
      parts.push(`Fee: ${feeStructure}`);
    }

    return parts.join(', ');
  }

  // Fallback to subtitle or badge if provided
  if (card.subtitle) {
    return card.subtitle;
  }
  if (card.badgeText) {
    return card.badgeText;
  }

  return '';
}

export interface WhatsAppIntentResult {
  url: string | null;
  hasPhone: boolean;
  businessPhone: string;
  cardTitle: string;
  metadataSummary: string;
  messageText: string;
}

/**
 * Generates the WhatsApp Intent Lead URL following the format:
 * https://wa.me/[business_phone]?text=Hi,%20I%20am%20interested%20in%20[Card_Title]%20([Industry_Specific_Metadata]).%20Please%20share%20more%20details.
 */
export function generateWhatsAppIntentUrl(
  card: ProfileCardData,
  profilePhone?: string
): WhatsAppIntentResult {
  const rawPhone = card.customWhatsappPhone || profilePhone || '';
  const sanitizedPhone = sanitizeWhatsAppNumber(rawPhone);
  const cardTitle = card.title || 'this item';
  const metadataSummary = formatIndustryMetadataSummary(card);

  const messageText = metadataSummary
    ? `Hi, I am interested in ${cardTitle} (${metadataSummary}). Please share more details.`
    : `Hi, I am interested in ${cardTitle}. Please share more details.`;

  const encodedText = encodeURIComponent(messageText);
  const url = sanitizedPhone ? `https://wa.me/${sanitizedPhone}?text=${encodedText}` : null;

  return {
    url,
    hasPhone: Boolean(sanitizedPhone),
    businessPhone: sanitizedPhone,
    cardTitle,
    metadataSummary,
    messageText,
  };
}
