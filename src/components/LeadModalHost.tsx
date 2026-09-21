import React from 'react';
import { UseLeadModalsReturn } from '../hooks/useLeadModals';
import { UserProfile } from '../types';
import { BrandInquiryModal } from './BrandInquiryModal';
import { ShowingBookingModal } from './ShowingBookingModal';
import { HomeValuationModal } from './HomeValuationModal';
import { MediaKitModal } from './MediaKitModal';
import { MusicBookingModal } from './MusicBookingModal';
import { PodcastSponsorshipModal } from './PodcastSponsorshipModal';

export interface LeadModalHostProps {
  leadModals: UseLeadModalsReturn;
  pageId: string;
  creatorName?: string;
  creatorPhone?: string;
  profile?: UserProfile;
  isPreview?: boolean;
}

export const LeadModalHost: React.FC<LeadModalHostProps> = ({
  leadModals,
  pageId,
  creatorName = 'Creator',
  creatorPhone = '',
  profile,
  isPreview = false,
}) => {
  const { activeModal, selectedPackage, selectedCard, closeModal, openBrandInquiry } = leadModals;

  // Fallback profile if not passed (e.g. on public page)
  const resolvedProfile: UserProfile = profile || {
    id: pageId,
    username: pageId,
    name: creatorName,
    headline: '',
    bio: '',
    avatarUrl: '',
    businessPhone: creatorPhone,
    theme: 'modern_dark',
    plan: 'free',
    cards: [],
  };

  return (
    <>
      {/* Brand Inquiry Modal */}
      <BrandInquiryModal
        isOpen={activeModal === 'brand'}
        onClose={closeModal}
        pageId={pageId}
        creatorName={creatorName}
        creatorPhone={creatorPhone}
        selectedPackage={selectedPackage}
        cardData={selectedCard}
        isPreview={isPreview}
      />

      {/* Showing Booking Modal */}
      <ShowingBookingModal
        isOpen={activeModal === 'showing'}
        onClose={closeModal}
        pageId={pageId}
        agentName={creatorName}
        agentPhone={creatorPhone}
        cardData={selectedCard}
        isPreview={isPreview}
      />

      {/* Home Valuation Modal */}
      <HomeValuationModal
        isOpen={activeModal === 'valuation'}
        onClose={closeModal}
        pageId={pageId}
        agentName={creatorName}
        agentPhone={creatorPhone}
        isPreview={isPreview}
      />

      {/* Media Kit Modal */}
      <MediaKitModal
        isOpen={activeModal === 'media_kit'}
        onClose={closeModal}
        profile={resolvedProfile}
        onOpenInquiry={() => {
          closeModal();
          openBrandInquiry(null, selectedCard || undefined);
        }}
      />

      {/* Music Booking Modal */}
      <MusicBookingModal
        isOpen={activeModal === 'music'}
        onClose={closeModal}
        pageId={pageId}
        artistName={creatorName}
        artistPhone={creatorPhone}
        cardData={selectedCard}
        isPreview={isPreview}
      />

      {/* Podcast Sponsorship Modal */}
      <PodcastSponsorshipModal
        isOpen={activeModal === 'podcast'}
        onClose={closeModal}
        pageId={pageId}
        podcastTitle={selectedCard?.title || creatorName}
        hostName={creatorName}
        hostPhone={creatorPhone}
        cardData={selectedCard}
        isPreview={isPreview}
      />
    </>
  );
};
