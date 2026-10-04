import React, { Suspense, lazy } from 'react';
import { CardTemplateType, ProfileCardData } from '../../types';
import { ProfileCardProps } from '../ProfileCard';
import { CardSkeleton } from './CardSkeleton';
import { CardErrorBoundary } from './CardErrorBoundary';
import { StandardCard } from './StandardCard';

// -------------------------------------------------------------
// Dynamic Code-Split Specialized Cards
// -------------------------------------------------------------
const LazyRealEstateCard = lazy(() =>
  import('./RealEstateCard').then((m) => ({ default: m.RealEstateCard }))
);
const LazyCreatorStatsCard = lazy(() =>
  import('./CreatorStatsCard').then((m) => ({ default: m.CreatorStatsCard }))
);
const LazyCollaborationPackagesCard = lazy(() =>
  import('./CollaborationPackagesCard').then((m) => ({ default: m.CollaborationPackagesCard }))
);
const LazyFeaturedWorkCard = lazy(() =>
  import('./FeaturedWorkCard').then((m) => ({ default: m.FeaturedWorkCard }))
);
const LazyWorkWithMeCard = lazy(() =>
  import('./WorkWithMeCard').then((m) => ({ default: m.WorkWithMeCard }))
);
const LazyAffiliateCard = lazy(() =>
  import('./AffiliateCard').then((m) => ({ default: m.AffiliateCard }))
);
const LazyClientReviewsCard = lazy(() =>
  import('./ClientReviewsCard').then((m) => ({ default: m.ClientReviewsCard }))
);
const LazyHomeValuationCard = lazy(() =>
  import('./HomeValuationCard').then((m) => ({ default: m.HomeValuationCard }))
);

// Musician Specialized Cards
const LazySmartMusicCard = lazy(() =>
  import('./MusicianCards').then((m) => ({ default: m.SmartMusicCard }))
);
const LazyMusicLatestReleaseCard = lazy(() =>
  import('./MusicianCards').then((m) => ({ default: m.MusicLatestReleaseCard }))
);
const LazyMusicStreamingHubCard = lazy(() =>
  import('./MusicianCards').then((m) => ({ default: m.MusicStreamingHubCard }))
);
const LazyMusicBookMeCard = lazy(() =>
  import('./MusicianCards').then((m) => ({ default: m.MusicBookMeCard }))
);
const LazyMusicUpcomingShowsCard = lazy(() =>
  import('./MusicianCards').then((m) => ({ default: m.MusicUpcomingShowsCard }))
);
const LazyMusicPlayerCard = lazy(() =>
  import('./MusicianCards').then((m) => ({ default: m.MusicPlayerCard }))
);
const LazyMusicMerchCard = lazy(() =>
  import('./MusicianCards').then((m) => ({ default: m.MusicMerchCard }))
);
const LazyMusicPressKitCard = lazy(() =>
  import('./MusicianCards').then((m) => ({ default: m.MusicPressKitCard }))
);
const LazyMusicBookingInquiryCard = lazy(() =>
  import('./MusicianCards').then((m) => ({ default: m.MusicBookingInquiryCard }))
);

// Podcaster Specialized Cards
const LazyPodcastSponsorMeCard = lazy(() =>
  import('./PodcasterCards').then((m) => ({ default: m.PodcastSponsorMeCard }))
);
const LazyPodcastLatestEpisodeCard = lazy(() =>
  import('./PodcasterCards').then((m) => ({ default: m.PodcastLatestEpisodeCard }))
);
const LazyPodcastListenOnCard = lazy(() =>
  import('./PodcasterCards').then((m) => ({ default: m.PodcastListenOnCard }))
);
const LazyPodcastWatchOnYouTubeCard = lazy(() =>
  import('./PodcasterCards').then((m) => ({ default: m.PodcastWatchOnYouTubeCard }))
);
const LazyPodcastArchiveCard = lazy(() =>
  import('./PodcasterCards').then((m) => ({ default: m.PodcastArchiveCard }))
);
const LazyPodcastNewsletterCard = lazy(() =>
  import('./PodcasterCards').then((m) => ({ default: m.PodcastNewsletterCard }))
);
const LazyPodcastStatsCard = lazy(() =>
  import('./PodcasterCards').then((m) => ({ default: m.PodcastStatsCard }))
);
const LazyPodcastSponsorInquiryCard = lazy(() =>
  import('./PodcasterCards').then((m) => ({ default: m.PodcastSponsorInquiryCard }))
);

// Creator Video & Live Tour Cards
const LazyVideoSpotlightCard = lazy(() =>
  import('./CreatorSpecializedCards').then((m) => ({ default: m.VideoSpotlightCard }))
);
const LazyTipSupportCard = lazy(() =>
  import('./CreatorSpecializedCards').then((m) => ({ default: m.TipSupportCard }))
);
const LazyLiveTourCard = lazy(() =>
  import('./CreatorSpecializedCards').then((m) => ({ default: m.LiveTourCard }))
);

export interface CardRegistryContext {
  props: ProfileCardProps;
  cardData: ProfileCardData;
  radiusClass: string;
  isWhatsAppLink: boolean;
  handleOpenLead: (e: React.MouseEvent) => void;
}

export function renderRegisteredCard(ctx: CardRegistryContext): React.ReactNode {
  const { props, cardData, radiusClass, isWhatsAppLink, handleOpenLead } = ctx;
  const templateType = props.templateType || 'standard';

  // Fast-path: Standard and default cards render synchronously without lazy chunk fetch
  if (templateType === 'standard' || templateType === 'custom_link' || templateType === 'lead_capture' || templateType === 'coaching_institute') {
    return (
      <StandardCard
        {...props}
        isWhatsAppLink={isWhatsAppLink}
        handleOpenLead={handleOpenLead}
      />
    );
  }

  const fallback = (
    <StandardCard
      {...props}
      isWhatsAppLink={isWhatsAppLink}
      handleOpenLead={handleOpenLead}
    />
  );

  const skeletonHeight =
    templateType === 'real_estate'
      ? 'h-80'
      : templateType === 'creator_stats' || templateType === 'creator_packages'
      ? 'h-48'
      : 'h-24';

  return (
    <CardErrorBoundary fallback={fallback}>
      <Suspense fallback={<CardSkeleton buttonStyle={props.buttonStyle} heightClass={skeletonHeight} />}>
        {(() => {
          switch (templateType) {
            case 'real_estate':
              return (
                <LazyRealEstateCard
                  {...props}
                  cardData={cardData}
                  handleOpenLead={handleOpenLead}
                />
              );
            case 'creator_stats':
              return (
                <LazyCreatorStatsCard
                  {...props}
                  cardData={cardData}
                  handleOpenLead={handleOpenLead}
                />
              );
            case 'creator_packages':
              return (
                <LazyCollaborationPackagesCard
                  {...props}
                  cardData={cardData}
                  handleOpenLead={handleOpenLead}
                />
              );
            case 'featured_work':
              return (
                <LazyFeaturedWorkCard
                  {...props}
                  cardData={cardData}
                  handleOpenLead={handleOpenLead}
                />
              );
            case 'work_with_me':
              return (
                <LazyWorkWithMeCard
                  {...props}
                  cardData={cardData}
                  handleOpenLead={handleOpenLead}
                />
              );
            case 'recommendation':
              return (
                <LazyAffiliateCard
                  {...props}
                  cardData={cardData}
                  handleOpenLead={handleOpenLead}
                />
              );
            case 'client_reviews':
              return <LazyClientReviewsCard {...props} />;
            case 'home_valuation':
              return (
                <LazyHomeValuationCard
                  {...props}
                  handleOpenLead={handleOpenLead}
                />
              );

            // Musician Domain
            case 'music_smart_card':
              return (
                <LazySmartMusicCard
                  card={cardData}
                  interactive={props.interactive}
                  onLinkClick={props.onLinkClick}
                />
              );
            case 'music_latest_release':
              return (
                <LazyMusicLatestReleaseCard
                  card={cardData}
                  interactive={props.interactive}
                  onLinkClick={props.onLinkClick}
                />
              );
            case 'music_streaming_hub':
              return (
                <LazyMusicStreamingHubCard
                  card={cardData}
                  interactive={props.interactive}
                  onLinkClick={props.onLinkClick}
                />
              );
            case 'music_book_me':
              return (
                <LazyMusicBookMeCard
                  card={cardData}
                  interactive={props.interactive}
                  onOpenMusicBookingModal={props.onOpenMusicBookingModal}
                />
              );
            case 'music_upcoming_shows':
              return (
                <LazyMusicUpcomingShowsCard
                  card={cardData}
                  interactive={props.interactive}
                />
              );
            case 'music_player':
              return (
                <LazyMusicPlayerCard
                  card={cardData}
                  interactive={props.interactive}
                />
              );
            case 'music_merch':
              return (
                <LazyMusicMerchCard
                  card={cardData}
                  interactive={props.interactive}
                />
              );
            case 'music_press_kit':
              return (
                <LazyMusicPressKitCard
                  card={cardData}
                  interactive={props.interactive}
                />
              );
            case 'music_booking_inquiry':
              return (
                <LazyMusicBookingInquiryCard
                  card={cardData}
                  interactive={props.interactive}
                  onOpenMusicBookingModal={props.onOpenMusicBookingModal}
                />
              );

            // Podcaster Domain
            case 'podcast_sponsor_me':
              return (
                <LazyPodcastSponsorMeCard
                  card={cardData}
                  interactive={props.interactive}
                  onOpenPodcastSponsorModal={props.onOpenPodcastSponsorModal}
                />
              );
            case 'podcast_latest_episode':
              return (
                <LazyPodcastLatestEpisodeCard
                  card={cardData}
                  interactive={props.interactive}
                  onLinkClick={props.onLinkClick}
                />
              );
            case 'podcast_listen_on':
              return (
                <LazyPodcastListenOnCard
                  card={cardData}
                  interactive={props.interactive}
                />
              );
            case 'podcast_youtube':
              return (
                <LazyPodcastWatchOnYouTubeCard
                  card={cardData}
                  interactive={props.interactive}
                />
              );
            case 'podcast_archive':
              return (
                <LazyPodcastArchiveCard
                  card={cardData}
                  interactive={props.interactive}
                />
              );
            case 'podcast_newsletter':
              return (
                <LazyPodcastNewsletterCard
                  card={cardData}
                  interactive={props.interactive}
                />
              );
            case 'podcast_stats':
              return (
                <LazyPodcastStatsCard
                  card={cardData}
                  interactive={props.interactive}
                />
              );
            case 'podcast_sponsor_inquiry':
              return (
                <LazyPodcastSponsorInquiryCard
                  card={cardData}
                  interactive={props.interactive}
                  onOpenPodcastSponsorModal={props.onOpenPodcastSponsorModal}
                />
              );

            // Specialized Creator Domain
            case 'video_spotlight':
            case 'youtube':
            case 'instagram':
              return (
                <LazyVideoSpotlightCard
                  card={cardData}
                  interactive={props.interactive}
                  onLinkClick={props.onLinkClick}
                  radiusClass={radiusClass}
                />
              );
            case 'tip_support':
              return (
                <LazyTipSupportCard
                  card={cardData}
                  interactive={props.interactive}
                  onLinkClick={props.onLinkClick}
                  radiusClass={radiusClass}
                />
              );
            case 'live_tour':
              return (
                <LazyLiveTourCard
                  card={cardData}
                  interactive={props.interactive}
                  onLinkClick={props.onLinkClick}
                  radiusClass={radiusClass}
                />
              );

            default:
              return fallback;
          }
        })()}
      </Suspense>
    </CardErrorBoundary>
  );
}
