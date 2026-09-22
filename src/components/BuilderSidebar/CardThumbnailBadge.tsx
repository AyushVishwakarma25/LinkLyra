import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MusicNote01Icon,
  Mic01Icon,
  Building01Icon,
  GalleryThumbnailsIcon,
} from '@hugeicons/core-free-icons';
import { ProfileCardData } from '../../types';

export const CardThumbnailBadge: React.FC<{ card: ProfileCardData; cardTheme: any }> = ({
  card,
  cardTheme,
}) => {
  const [imgError, setImgError] = useState(false);
  const hasValidLogo = Boolean(card.logoSrc && card.logoSrc.trim() !== '' && !imgError);

  const renderFallbackIcon = () => {
    const t = card.templateType || '';
    if (t.startsWith('music_') || t === 'music_smart_card') {
      return <HugeiconsIcon icon={MusicNote01Icon} size={18} />;
    }
    if (t.startsWith('podcast_') || t === 'podcast_sponsor_me') {
      return <HugeiconsIcon icon={Mic01Icon} size={18} />;
    }
    if (t === 'real_estate') {
      return <HugeiconsIcon icon={Building01Icon} size={18} />;
    }
    return <HugeiconsIcon icon={GalleryThumbnailsIcon} size={18} />;
  };

  return (
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-stone-200/80 bg-stone-50 text-[#1C1E22] transition-transform group-hover:scale-105 overflow-hidden"
      style={{
        backgroundColor: hasValidLogo ? '#ffffff' : `${cardTheme?.bgHex || '#5E4BF7'}15`,
        color: cardTheme?.bgHex || '#5E4BF7',
      }}
    >
      {hasValidLogo ? (
        <img
          src={card.logoSrc}
          alt=""
          className="w-6 h-6 object-contain"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        renderFallbackIcon()
      )}
    </div>
  );
};
