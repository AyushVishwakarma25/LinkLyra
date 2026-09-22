import {
  doc,
  getDocs,
  collection,
  query,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  sanitizeForFirestore,
  handleFirestoreError,
  OperationType,
  DbLink,
  FirestoreLink,
} from './app';

// Flexible payload for link creation and updates supporting both canonical camelCase and legacy snake_case
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LinkPayload = Partial<DbLink> & Partial<FirestoreLink> & Record<string, any>;

export const linksService = {
  // Retrieve all links for a page from canonical subcollection: pages/{pageId}/links
  async getLinks(pageId: string): Promise<DbLink[]> {
    if (!pageId) return [];

    try {
      const linksRef = collection(db, 'pages', pageId, 'links');
      const q = query(linksRef);
      const snap = await getDocs(q);

      const links: DbLink[] = [];
      snap.forEach((d) => {
        const data = d.data() as FirestoreLink & Record<string, unknown>;
        links.push({
          id: d.id,
          profile_id: pageId,
          section_id: data.sectionId || (data as Record<string, any>).section_id || null,
          title: data.title || '',
          subtitle: data.description || (data as Record<string, any>).subtitle || '',
          link_url: data.url || (data as Record<string, any>).link_url || '',
          color: data.color || 'stone',
          logo_url: data.thumbnailUrl || (data as Record<string, any>).logo_url,
          badge_text: data.badgeText || (data as Record<string, any>).badge_text,
          expanded: Boolean(data.expanded),
          is_active: data.isActive !== undefined ? data.isActive : (data as Record<string, any>).is_active !== false,
          clicks: data.clickCount || (data as Record<string, any>).clicks || 0,
          display_order: data.position !== undefined ? data.position : (data as Record<string, any>).display_order ?? 0,
          template_type: data.templateType || (data as Record<string, any>).template_type || (data as Record<string, any>).linkType,
          real_estate: data.realEstate || (data as Record<string, any>).real_estate,
          coaching: data.coaching,
          creator_stats: data.creatorStats || (data as Record<string, any>).creator_stats,
          creator_work: data.creatorWork || (data as Record<string, any>).creator_work,
          featured_work: data.featuredWork || (data as Record<string, any>).featured_work,
          creator_packages: data.creatorPackages || (data as Record<string, any>).creator_packages,
          brand_inquiry: data.brandInquiry || (data as Record<string, any>).brand_inquiry,
          recommendation: data.recommendation,
          client_review: data.clientReview || (data as Record<string, any>).client_review,
          music: data.music,
          podcast: data.podcast,
          is_premium: data.isPremium || (data as Record<string, any>).is_premium,
          custom_whatsapp_phone: data.customWhatsappPhone || (data as Record<string, any>).custom_whatsapp_phone,
          created_at: data.createdAt ? String(data.createdAt) : undefined,
        });
      });

      // Sort stably by display_order / position
      return links.sort((a, b) => a.display_order - b.display_order);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `pages/${pageId}/links`);
      return [];
    }
  },

  // Add link into canonical subcollection: pages/{pageId}/links
  async addLink(
    pageId: string,
    linkData: LinkPayload
  ): Promise<DbLink> {
    const targetPageId = pageId || auth.currentUser?.uid;
    if (!targetPageId) throw new Error('Unauthenticated');

    const newId = `lnk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const position =
      'position' in linkData && typeof linkData.position === 'number'
        ? linkData.position
        : 'display_order' in linkData && typeof linkData.display_order === 'number'
        ? linkData.display_order
        : 0;

    const docPayload: Record<string, any> = {
      id: newId,
      pageId: targetPageId,
      profile_id: targetPageId,
      title: linkData.title || '',
      description: linkData.description || linkData.subtitle || '',
      subtitle: linkData.description || linkData.subtitle || '',
      url: linkData.url || linkData.link_url || '',
      link_url: linkData.url || linkData.link_url || '',
      color: linkData.color || 'stone',
      thumbnailUrl: linkData.thumbnailUrl || linkData.logo_url || '',
      logo_url: linkData.thumbnailUrl || linkData.logo_url || '',
      badgeText: linkData.badgeText || linkData.badge_text || '',
      badge_text: linkData.badgeText || linkData.badge_text || '',
      position,
      display_order: position,
      isActive: linkData.isActive !== undefined ? linkData.isActive : linkData.is_active !== false,
      is_active: linkData.isActive !== undefined ? linkData.isActive : linkData.is_active !== false,
      clickCount: linkData.clickCount || linkData.clicks || 0,
      clicks: linkData.clickCount || linkData.clicks || 0,
      linkType: linkData.templateType || linkData.template_type || linkData.linkType || 'url',
      templateType: linkData.templateType || linkData.template_type || 'url',
      template_type: linkData.templateType || linkData.template_type || 'url',
      sectionId: linkData.sectionId || linkData.section_id || null,
      section_id: linkData.sectionId || linkData.section_id || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (linkData.realEstate || linkData.real_estate) {
      docPayload.realEstate = linkData.realEstate || linkData.real_estate;
      docPayload.real_estate = linkData.real_estate || linkData.realEstate;
    }
    if (linkData.coaching) docPayload.coaching = linkData.coaching;
    if (linkData.creatorStats || linkData.creator_stats) {
      docPayload.creatorStats = linkData.creatorStats || linkData.creator_stats;
      docPayload.creator_stats = linkData.creatorStats || linkData.creator_stats;
    }
    if (linkData.creatorWork || linkData.creator_work) {
      docPayload.creatorWork = linkData.creatorWork || linkData.creator_work;
      docPayload.creator_work = linkData.creatorWork || linkData.creator_work;
    }
    if (linkData.featuredWork || linkData.featured_work) {
      docPayload.featuredWork = linkData.featuredWork || linkData.featured_work;
      docPayload.featured_work = linkData.featuredWork || linkData.featured_work;
    }
    if (linkData.creatorPackages || linkData.creator_packages) {
      docPayload.creatorPackages = linkData.creatorPackages || linkData.creator_packages;
      docPayload.creator_packages = linkData.creatorPackages || linkData.creator_packages;
    }
    if (linkData.brandInquiry || linkData.brand_inquiry) {
      docPayload.brandInquiry = linkData.brandInquiry || linkData.brand_inquiry;
      docPayload.brand_inquiry = linkData.brandInquiry || linkData.brand_inquiry;
    }
    if (linkData.recommendation) docPayload.recommendation = linkData.recommendation;
    if (linkData.clientReview || linkData.client_review) {
      docPayload.clientReview = linkData.clientReview || linkData.client_review;
      docPayload.client_review = linkData.clientReview || linkData.client_review;
    }
    if (linkData.music) docPayload.music = linkData.music;
    if (linkData.podcast) docPayload.podcast = linkData.podcast;
    if (linkData.isPremium !== undefined || linkData.is_premium !== undefined) {
      docPayload.isPremium = linkData.isPremium || linkData.is_premium;
      docPayload.is_premium = linkData.isPremium || linkData.is_premium;
    }
    if (linkData.customWhatsappPhone || linkData.custom_whatsapp_phone) {
      docPayload.customWhatsappPhone = linkData.customWhatsappPhone || linkData.custom_whatsapp_phone;
      docPayload.custom_whatsapp_phone = linkData.customWhatsappPhone || linkData.custom_whatsapp_phone;
    }

    const createdLink: DbLink = {
      id: newId,
      profile_id: targetPageId,
      section_id: docPayload.section_id,
      title: docPayload.title,
      subtitle: docPayload.subtitle,
      link_url: docPayload.link_url,
      color: docPayload.color,
      logo_url: docPayload.logo_url,
      badge_text: docPayload.badge_text,
      expanded: false,
      is_active: docPayload.is_active,
      clicks: 0,
      display_order: position,
      template_type: docPayload.template_type,
      real_estate: docPayload.real_estate,
      coaching: docPayload.coaching,
      creator_stats: docPayload.creator_stats,
      creator_work: docPayload.creator_work,
      featured_work: docPayload.featured_work,
      creator_packages: docPayload.creator_packages,
      brand_inquiry: docPayload.brand_inquiry,
      recommendation: docPayload.recommendation,
      client_review: docPayload.client_review,
      music: docPayload.music,
      podcast: docPayload.podcast,
      is_premium: docPayload.is_premium,
      custom_whatsapp_phone: docPayload.custom_whatsapp_phone,
      created_at: new Date().toISOString(),
    };

    try {
      const linkRef = doc(db, 'pages', targetPageId, 'links', newId);
      await setDoc(linkRef, sanitizeForFirestore(docPayload));
      return createdLink;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `pages/${targetPageId}/links/${newId}`);
      return createdLink;
    }
  },

  // Update link in canonical subcollection: pages/{pageId}/links/{linkId}
  async updateLink(
    pageIdOrLinkId: string,
    linkIdOrUpdates: string | LinkPayload,
    maybeUpdates?: LinkPayload
  ): Promise<void> {
    let pageId = auth.currentUser?.uid || '';
    let linkId: string;
    let rawUpdates: LinkPayload;

    if (typeof linkIdOrUpdates === 'string') {
      pageId = pageIdOrLinkId;
      linkId = linkIdOrUpdates;
      rawUpdates = maybeUpdates || {};
    } else {
      linkId = pageIdOrLinkId;
      rawUpdates = linkIdOrUpdates || {};
    }

    if (!pageId || !linkId) return;

    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (rawUpdates.title !== undefined) updates.title = rawUpdates.title;
    if (rawUpdates.subtitle !== undefined || rawUpdates.description !== undefined) {
      updates.description = rawUpdates.description ?? rawUpdates.subtitle;
      updates.subtitle = rawUpdates.description ?? rawUpdates.subtitle;
    }
    if (rawUpdates.url !== undefined || rawUpdates.link_url !== undefined) {
      updates.url = rawUpdates.url ?? rawUpdates.link_url;
      updates.link_url = rawUpdates.url ?? rawUpdates.link_url;
    }
    if (rawUpdates.color !== undefined) updates.color = rawUpdates.color;
    if (rawUpdates.thumbnailUrl !== undefined || rawUpdates.logo_url !== undefined) {
      updates.thumbnailUrl = rawUpdates.thumbnailUrl ?? rawUpdates.logo_url;
      updates.logo_url = rawUpdates.thumbnailUrl ?? rawUpdates.logo_url;
    }
    if (rawUpdates.badgeText !== undefined || rawUpdates.badge_text !== undefined) {
      updates.badgeText = rawUpdates.badgeText ?? rawUpdates.badge_text;
      updates.badge_text = rawUpdates.badgeText ?? rawUpdates.badge_text;
    }
    if (rawUpdates.isActive !== undefined || rawUpdates.is_active !== undefined) {
      updates.isActive = rawUpdates.isActive ?? rawUpdates.is_active;
      updates.is_active = rawUpdates.isActive ?? rawUpdates.is_active;
    }
    if (rawUpdates.position !== undefined || rawUpdates.display_order !== undefined) {
      updates.position = rawUpdates.position ?? rawUpdates.display_order;
      updates.display_order = rawUpdates.position ?? rawUpdates.display_order;
    }
    if (rawUpdates.sectionId !== undefined || rawUpdates.section_id !== undefined) {
      updates.sectionId = rawUpdates.sectionId ?? rawUpdates.section_id;
      updates.section_id = rawUpdates.sectionId ?? rawUpdates.section_id;
    }
    if (rawUpdates.realEstate !== undefined || rawUpdates.real_estate !== undefined) {
      updates.realEstate = rawUpdates.realEstate ?? rawUpdates.real_estate;
      updates.real_estate = rawUpdates.realEstate ?? rawUpdates.real_estate;
    }
    if (rawUpdates.coaching !== undefined) updates.coaching = rawUpdates.coaching;
    if (rawUpdates.creatorStats !== undefined || rawUpdates.creator_stats !== undefined) {
      updates.creatorStats = rawUpdates.creatorStats ?? rawUpdates.creator_stats;
      updates.creator_stats = rawUpdates.creatorStats ?? rawUpdates.creator_stats;
    }
    if (rawUpdates.creatorWork !== undefined || rawUpdates.creator_work !== undefined) {
      updates.creatorWork = rawUpdates.creatorWork ?? rawUpdates.creator_work;
      updates.creator_work = rawUpdates.creatorWork ?? rawUpdates.creator_work;
    }
    if (rawUpdates.featuredWork !== undefined || rawUpdates.featured_work !== undefined) {
      updates.featuredWork = rawUpdates.featuredWork ?? rawUpdates.featured_work;
      updates.featured_work = rawUpdates.featuredWork ?? rawUpdates.featured_work;
    }
    if (rawUpdates.creatorPackages !== undefined || rawUpdates.creator_packages !== undefined) {
      updates.creatorPackages = rawUpdates.creatorPackages ?? rawUpdates.creator_packages;
      updates.creator_packages = rawUpdates.creatorPackages ?? rawUpdates.creator_packages;
    }
    if (rawUpdates.brandInquiry !== undefined || rawUpdates.brand_inquiry !== undefined) {
      updates.brandInquiry = rawUpdates.brandInquiry ?? rawUpdates.brand_inquiry;
      updates.brand_inquiry = rawUpdates.brandInquiry ?? rawUpdates.brand_inquiry;
    }
    if (rawUpdates.recommendation !== undefined) updates.recommendation = rawUpdates.recommendation;
    if (rawUpdates.clientReview !== undefined || rawUpdates.client_review !== undefined) {
      updates.clientReview = rawUpdates.clientReview ?? rawUpdates.client_review;
      updates.client_review = rawUpdates.clientReview ?? rawUpdates.client_review;
    }
    if (rawUpdates.music !== undefined) updates.music = rawUpdates.music;
    if (rawUpdates.podcast !== undefined) updates.podcast = rawUpdates.podcast;
    if (rawUpdates.isPremium !== undefined || rawUpdates.is_premium !== undefined) {
      updates.isPremium = rawUpdates.isPremium ?? rawUpdates.is_premium;
      updates.is_premium = rawUpdates.isPremium ?? rawUpdates.is_premium;
    }
    if (rawUpdates.customWhatsappPhone !== undefined || rawUpdates.custom_whatsapp_phone !== undefined) {
      updates.customWhatsappPhone = rawUpdates.customWhatsappPhone ?? rawUpdates.custom_whatsapp_phone;
      updates.custom_whatsapp_phone = rawUpdates.customWhatsappPhone ?? rawUpdates.custom_whatsapp_phone;
    }

    try {
      const linkRef = doc(db, 'pages', pageId, 'links', linkId);
      await setDoc(linkRef, sanitizeForFirestore(updates), { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `pages/${pageId}/links/${linkId}`);
    }
  },

  // Delete link from canonical subcollection: pages/{pageId}/links/{linkId}
  async deleteLink(pageIdOrLinkId: string, maybeLinkId?: string): Promise<void> {
    let pageId = auth.currentUser?.uid || '';
    let linkId: string;

    if (maybeLinkId) {
      pageId = pageIdOrLinkId;
      linkId = maybeLinkId;
    } else {
      linkId = pageIdOrLinkId;
    }

    if (!pageId || !linkId) return;

    try {
      await deleteDoc(doc(db, 'pages', pageId, 'links', linkId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `pages/${pageId}/links/${linkId}`);
    }
  },

  // Atomic batch reorder of links in subcollection
  async reorderLinks(pageId: string, linkIds: string[]): Promise<void> {
    if (!pageId || linkIds.length === 0) return;

    const batch = writeBatch(db);
    linkIds.forEach((id, index) => {
      const ref = doc(db, 'pages', pageId, 'links', id);
      batch.update(ref, {
        position: index,
        display_order: index,
        updatedAt: serverTimestamp(),
      });
    });

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `pages/${pageId}/links:reorder`);
    }
  },

  async toggleLinkActive(pageId: string, linkId: string, isActive: boolean): Promise<void> {
    await this.updateLink(pageId, linkId, { isActive, is_active: isActive });
  },
};
