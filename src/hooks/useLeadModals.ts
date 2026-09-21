import { useState, useCallback } from 'react';
import { ProfileCardData, CollaborationPackageItem } from '../types';

export type LeadModalType = 'brand' | 'showing' | 'valuation' | 'media_kit' | 'music' | 'podcast' | null;

export interface UseLeadModalsReturn {
  activeModal: LeadModalType;
  selectedPackage: CollaborationPackageItem | null;
  selectedCard: ProfileCardData | null;
  openBrandInquiry: (pkg?: CollaborationPackageItem | null, card?: ProfileCardData) => void;
  openShowing: (card?: ProfileCardData) => void;
  openValuation: (card?: ProfileCardData) => void;
  openMediaKit: (card?: ProfileCardData) => void;
  openMusicBooking: (card?: ProfileCardData) => void;
  openPodcastSponsor: (card?: ProfileCardData) => void;
  closeModal: () => void;
}

export function useLeadModals(): UseLeadModalsReturn {
  const [activeModal, setActiveModal] = useState<LeadModalType>(null);
  const [selectedPackage, setSelectedPackage] = useState<CollaborationPackageItem | null>(null);
  const [selectedCard, setSelectedCard] = useState<ProfileCardData | null>(null);

  const openBrandInquiry = useCallback((pkg?: CollaborationPackageItem | null, card?: ProfileCardData) => {
    setSelectedPackage(pkg || null);
    setSelectedCard(card || null);
    setActiveModal('brand');
  }, []);

  const openShowing = useCallback((card?: ProfileCardData) => {
    setSelectedCard(card || null);
    setActiveModal('showing');
  }, []);

  const openValuation = useCallback((card?: ProfileCardData) => {
    setSelectedCard(card || null);
    setActiveModal('valuation');
  }, []);

  const openMediaKit = useCallback((card?: ProfileCardData) => {
    setSelectedCard(card || null);
    setActiveModal('media_kit');
  }, []);

  const openMusicBooking = useCallback((card?: ProfileCardData) => {
    setSelectedCard(card || null);
    setActiveModal('music');
  }, []);

  const openPodcastSponsor = useCallback((card?: ProfileCardData) => {
    setSelectedCard(card || null);
    setActiveModal('podcast');
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedPackage(null);
    setSelectedCard(null);
  }, []);

  return {
    activeModal,
    selectedPackage,
    selectedCard,
    openBrandInquiry,
    openShowing,
    openValuation,
    openMediaKit,
    openMusicBooking,
    openPodcastSponsor,
    closeModal,
  };
}
