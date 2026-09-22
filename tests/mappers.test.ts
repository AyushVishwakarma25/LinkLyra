import { describe, it, expect } from 'vitest';
import { pageToProfile, linkToCard, cardToLinkDoc } from '../src/lib/mappers';
import { ProfileCardData } from '../src/types';

describe('Data Mappers (mappers.ts)', () => {
  describe('pageToProfile', () => {
    it('maps canonical camelCase FirestorePage document correctly', () => {
      const canonicalPage = {
        userId: 'user_123',
        username: 'ayush',
        title: 'Ayush Vishwakarma',
        bio: 'Building LinkLyra',
        avatarUrl: 'https://example.com/avatar.jpg',
        themeId: 'creator',
        fontFamily: 'Plus Jakarta Sans',
        buttonStyle: 'rounded',
        backgroundType: 'color',
        backgroundValue: '#FAF8F5',
        cardStyle: 'glass',
        wallpaperMode: 'fill',
        wallpaperTint: 40,
        cardBgColor: '#191A1E',
        cardTextColor: '#FFFFFF',
        buttonColor: '#5E4BF7',
        stickers: ['🚀', '✨'],
        footerSettings: { showPoweredBy: true },
        businessPhone: '+91 9876543210',
        customDomain: 'ayush.com',
        whiteLabel: true,
        socials: { twitter: 'ayush' },
        plan: 'pro',
        role: 'creator',
      };

      const profile = pageToProfile(canonicalPage);

      expect(profile.id).toBe('user_123');
      expect(profile.username).toBe('ayush');
      expect(profile.full_name).toBe('Ayush Vishwakarma');
      expect(profile.bio).toBe('Building LinkLyra');
      expect(profile.avatar_url).toBe('https://example.com/avatar.jpg');
      expect(profile.theme).toBe('creator');
      expect(profile.font_family).toBe('Plus Jakarta Sans');
      expect(profile.button_style).toBe('rounded');
      expect(profile.background_type).toBe('color');
      expect(profile.background_value).toBe('#FAF8F5');
      expect(profile.card_style).toBe('glass');
      expect(profile.wallpaper_mode).toBe('fill');
      expect(profile.wallpaper_tint).toBe(40);
      expect(profile.card_bg_color).toBe('#191A1E');
      expect(profile.card_text_color).toBe('#FFFFFF');
      expect(profile.button_color).toBe('#5E4BF7');
      expect(profile.stickers).toEqual(['🚀', '✨']);
      expect(profile.footer_settings).toEqual({ showPoweredBy: true });
      expect(profile.business_phone).toBe('+91 9876543210');
      expect(profile.custom_domain).toBe('ayush.com');
      expect(profile.whiteLabel).toBe(true);
      expect(profile.socials).toEqual({ twitter: 'ayush' });
      expect(profile.plan).toBe('pro');
    });

    it('maps legacy snake_case DbProfile document compatibility path', () => {
      const legacyProfile = {
        id: 'legacy_user',
        username: 'sarah',
        full_name: 'Sarah Connor',
        bio: 'Resistance leader',
        avatar_url: 'https://example.com/sarah.jpg',
        theme: 'dark',
        font_family: 'inter',
        button_style: 'pill',
        background_type: 'gradient',
        background_value: 'linear-gradient(135deg, #1C1E22, #000000)',
        business_phone: '+1 555-0199',
        custom_domain: 'sarah.me',
        card_style: 'solid',
        wallpaper_mode: 'fit',
        wallpaper_tint: 50,
        card_bg_color: '#000000',
        card_text_color: '#EEEEEE',
        button_color: '#FF0055',
        footer_settings: { showPoweredBy: false },
        socials: { instagram: 'sarah' },
        plan: 'business',
      };

      const profile = pageToProfile(legacyProfile);

      expect(profile.id).toBe('legacy_user');
      expect(profile.username).toBe('sarah');
      expect(profile.full_name).toBe('Sarah Connor');
      expect(profile.avatar_url).toBe('https://example.com/sarah.jpg');
      expect(profile.theme).toBe('dark');
      expect(profile.font_family).toBe('inter');
      expect(profile.button_style).toBe('pill');
      expect(profile.background_type).toBe('gradient');
      expect(profile.business_phone).toBe('+1 555-0199');
      expect(profile.custom_domain).toBe('sarah.me');
      expect(profile.plan).toBe('business');
    });

    it('falls back gracefully to user document fields if page fields are missing', () => {
      const emptyPage = { id: 'usr_abc', username: 'alex' };
      const userDoc = {
        displayName: 'Alex Rivers',
        photoURL: 'https://example.com/alex.jpg',
        plan: 'pro',
      };

      const profile = pageToProfile(emptyPage, userDoc);

      expect(profile.id).toBe('usr_abc');
      expect(profile.username).toBe('alex');
      expect(profile.full_name).toBe('Alex Rivers');
      expect(profile.avatar_url).toBe('https://example.com/alex.jpg');
      expect(profile.plan).toBe('pro');
    });
  });

  describe('linkToCard', () => {
    it('maps canonical camelCase FirestoreLink to ProfileCardData', () => {
      const canonicalLink = {
        id: 'link_1',
        sectionId: 'sec_1',
        title: 'Modern Luxury Penthouse',
        description: 'Downtown skyline views',
        url: 'https://example.com/penthouse',
        color: 'rose',
        thumbnailUrl: 'https://example.com/img.jpg',
        badgeText: 'Featured',
        expanded: true,
        isActive: true,
        clickCount: 142,
        linkType: 'real_estate',
        templateType: 'real_estate',
        realEstate: {
          propertyName: 'Sky Villa',
          location: 'New York, NY',
          priceBracket: '$3.5M',
          propertyType: 'Penthouse',
        },
      };

      const card = linkToCard(canonicalLink);

      expect(card.id).toBe('link_1');
      expect(card.sectionId).toBe('sec_1');
      expect(card.title).toBe('Modern Luxury Penthouse');
      expect(card.subtitle).toBe('Downtown skyline views');
      expect(card.linkUrl).toBe('https://example.com/penthouse');
      expect(card.color).toBe('rose');
      expect(card.logoSrc).toBe('https://example.com/img.jpg');
      expect(card.badgeText).toBe('Featured');
      expect(card.expanded).toBe(true);
      expect(card.isActive).toBe(true);
      expect(card.clicks).toBe(142);
      expect(card.templateType).toBe('real_estate');
      expect(card.realEstate?.propertyName).toBe('Sky Villa');
      expect(card.realEstate?.location).toBe('New York, NY');
      expect(card.realEstate?.priceBracket).toBe('$3.5M');
    });

    it('maps legacy snake_case DbLink compatibility path', () => {
      const legacyLink = {
        id: 'link_old_99',
        section_id: 'sec_legacy',
        title: 'IIT-JEE Masterclass',
        subtitle: 'Comprehensive 2-year cohort',
        link_url: 'https://coaching.com/iit',
        color: 'amber',
        logo_url: 'https://coaching.com/logo.png',
        badge_text: 'Admissions Open',
        expanded: false,
        is_active: true,
        clicks: 85,
        template_type: 'coaching_institute',
        coaching: {
          course_name: 'JEE Advanced Batch',
          exam_track: 'Engineering',
          batch_timing: 'Morning 8 AM',
          fee_structure: '$1,200',
        },
        custom_whatsapp_phone: '+919988776655',
      };

      const card = linkToCard(legacyLink);

      expect(card.id).toBe('link_old_99');
      expect(card.sectionId).toBe('sec_legacy');
      expect(card.title).toBe('IIT-JEE Masterclass');
      expect(card.subtitle).toBe('Comprehensive 2-year cohort');
      expect(card.linkUrl).toBe('https://coaching.com/iit');
      expect(card.color).toBe('amber');
      expect(card.logoSrc).toBe('https://coaching.com/logo.png');
      expect(card.badgeText).toBe('Admissions Open');
      expect(card.clicks).toBe(85);
      expect(card.templateType).toBe('coaching_institute');
      expect(card.coaching?.courseName).toBe('JEE Advanced Batch');
      expect(card.coaching?.examTrack).toBe('Engineering');
      expect(card.coaching?.batchTiming).toBe('Morning 8 AM');
      expect(card.customWhatsappPhone).toBe('+919988776655');
    });
  });

  describe('cardToLinkDoc', () => {
    it('converts ProfileCardData into canonical Firestore document with compatibility mirrors', () => {
      const card: ProfileCardData = {
        id: 'card_demo_1',
        sectionId: 'sec_alpha',
        title: 'Latest Single "Midnight"',
        subtitle: 'Available on all streaming platforms',
        linkUrl: 'https://spotify.com/track/123',
        color: 'blue',
        logoSrc: 'https://spotify.com/cover.jpg',
        badgeText: 'New Release',
        expanded: false,
        isActive: true,
        clicks: 350,
        templateType: 'music_latest_release',
        isPremium: true,
        customWhatsappPhone: '+1234567890',
      };

      const doc = cardToLinkDoc(card, 2, 'page_user_1');

      // Canonical camelCase fields
      expect(doc.title).toBe('Latest Single "Midnight"');
      expect(doc.description).toBe('Available on all streaming platforms');
      expect(doc.url).toBe('https://spotify.com/track/123');
      expect(doc.color).toBe('blue');
      expect(doc.thumbnailUrl).toBe('https://spotify.com/cover.jpg');
      expect(doc.badgeText).toBe('New Release');
      expect(doc.position).toBe(2);
      expect(doc.isActive).toBe(true);
      expect(doc.templateType).toBe('music_latest_release');
      expect(doc.sectionId).toBe('sec_alpha');
      expect(doc.isPremium).toBe(true);
      expect(doc.customWhatsappPhone).toBe('+1234567890');

      // Compatibility mirrors
      expect(doc.subtitle).toBe('Available on all streaming platforms');
      expect(doc.link_url).toBe('https://spotify.com/track/123');
      expect(doc.logo_url).toBe('https://spotify.com/cover.jpg');
      expect(doc.badge_text).toBe('New Release');
      expect(doc.display_order).toBe(2);
      expect(doc.is_active).toBe(true);
      expect(doc.template_type).toBe('music_latest_release');
      expect(doc.section_id).toBe('sec_alpha');
      expect(doc.pageId).toBe('page_user_1');
      expect(doc.profile_id).toBe('page_user_1');
    });
  });
});
