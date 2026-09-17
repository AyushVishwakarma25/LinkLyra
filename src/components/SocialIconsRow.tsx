import React from 'react';
import { SocialLinks } from '../types';
import { BRAND_LOGOS } from '../data';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon, GlobeIcon } from '@hugeicons/core-free-icons';

export interface SocialIconsRowProps {
  socials?: SocialLinks;
  isDark?: boolean;
}

export const SocialIconsRow: React.FC<SocialIconsRowProps> = ({ socials, isDark = false }) => {
  if (!socials) return null;

  const items: { key: keyof SocialLinks; url?: string; logo?: string; icon?: React.ReactNode; label: string }[] = [
    { key: 'twitter', url: socials.twitter, logo: BRAND_LOGOS.x, label: 'X / Twitter' },
    { key: 'youtube', url: socials.youtube, logo: BRAND_LOGOS.youtube, label: 'YouTube' },
    { key: 'instagram', url: socials.instagram, logo: BRAND_LOGOS.instagram, label: 'Instagram' },
    { key: 'github', url: socials.github, logo: BRAND_LOGOS.github, label: 'GitHub' },
    { key: 'linkedin', url: socials.linkedin, logo: BRAND_LOGOS.linkedin, label: 'LinkedIn' },
    { key: 'spotify', url: socials.spotify, logo: BRAND_LOGOS.spotify, label: 'Spotify' },
    { key: 'discord', url: socials.discord, logo: BRAND_LOGOS.discord, label: 'Discord' },
    {
      key: 'email',
      url: socials.email ? (socials.email.startsWith('mailto:') ? socials.email : `mailto:${socials.email}`) : undefined,
      icon: <HugeiconsIcon icon={Mail01Icon} size={14} className="text-[#1C1E22]" />,
      label: 'Email',
    },
    {
      key: 'website',
      url: socials.website,
      icon: <HugeiconsIcon icon={GlobeIcon} size={14} className="text-[#1C1E22]" />,
      label: 'Website',
    },
  ];

  const activeItems = items.filter((item) => item.url && item.url.trim() !== '');

  if (activeItems.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {activeItems.map((item) => (
        <a
          key={item.key}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          title={item.label}
          onClick={(e) => e.stopPropagation()}
          className="w-9 h-9 rounded-full bg-white border border-black/10 shadow-2xs flex items-center justify-center p-2 hover:scale-110 active:scale-95 transition-all hover:shadow-xs"
        >
          {item.logo ? (
            <img src={item.logo} alt={item.label} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          ) : (
            item.icon
          )}
        </a>
      ))}
    </div>
  );
};
