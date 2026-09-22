import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PlusSignIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Edit01Icon,
  Delete01Icon,
  Copy01Icon,
  ViewIcon,
  Link01Icon,
  Folder01Icon,
  FolderAddIcon,
  Mail01Icon,
} from '@hugeicons/core-free-icons';
import { UserProfile, ProfileCardData } from '../../types';
import { Button } from '../ui';
import { COLOR_CONFIG } from '../ProfileCard';
import { CardThumbnailBadge } from './CardThumbnailBadge';
import { SidebarTabKey } from './types';

export interface LinksTabProps {
  profile: UserProfile;
  onAddCard: () => void;
  onEditCard: (card: ProfileCardData) => void;
  onDeleteCard: (id: string) => void;
  onMoveCard: (index: number, direction: 'up' | 'down') => void;
  onToggleCardActive: (id: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  setTab: (tab: SidebarTabKey) => void;
  avatarFileInputRef: React.RefObject<HTMLInputElement | null>;
  showAddSection: boolean;
  setShowAddSection: (val: boolean) => void;
  newSectionTitle: string;
  setNewSectionTitle: (val: string) => void;
  handleCreateSectionSubmit: (e: React.FormEvent) => void;
  activeCardMenuId: string | null;
  setActiveCardMenuId: (val: string | null) => void;
}

export const LinksTab: React.FC<LinksTabProps> = ({
  profile,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onMoveCard,
  onToggleCardActive,
  onDeleteSection,
  setTab,
  avatarFileInputRef,
  showAddSection,
  setShowAddSection,
  newSectionTitle,
  setNewSectionTitle,
  handleCreateSectionSubmit,
  activeCardMenuId,
  setActiveCardMenuId,
}) => {
  return (
    <div className="space-y-4 max-w-full">
      {/* Minimalist Profile Hero Header (Matching Reference Design) */}
      <div className="flex items-center gap-3.5 p-3 sm:p-3.5 bg-white rounded-2xl border border-stone-200/80 shadow-2xs">
        <div
          onClick={() => avatarFileInputRef.current?.click()}
          className="relative w-12 h-12 rounded-full overflow-hidden border border-stone-200 bg-stone-100 shrink-0 cursor-pointer group"
          title="Change profile avatar"
        >
          <img
            src={
              profile.avatarUrl && profile.avatarUrl.trim() !== ''
                ? profile.avatarUrl
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
            }
            alt={profile.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <HugeiconsIcon icon={Edit01Icon} size={14} className="text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-[#1C1E22] truncate leading-tight">
            {profile.name || 'Ayush Vishwakarma'}
          </h3>
          <p className="text-xs text-[#737882] mt-0.5 leading-snug break-words">
            {profile.headline || 'Host of The Founders'}
          </p>

          {/* Social icons row */}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => setTab('settings')}
              className="w-6 h-6 rounded-full bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] flex items-center justify-center transition-colors text-[11px]"
              title="LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setTab('settings')}
              className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 text-[#1C1E22] flex items-center justify-center transition-colors text-[11px]"
              title="Email / Contact"
            >
              <HugeiconsIcon icon={Mail01Icon} size={13} />
            </button>

            <button
              type="button"
              onClick={() => setTab('settings')}
              className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 text-[#1C1E22] flex items-center justify-center transition-colors"
              title="Add or edit social profiles"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Minimalist Action Buttons Row (Image matching) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={() => setShowAddSection(!showAddSection)}
          className="w-full min-h-[44px] py-2.5 px-4 bg-stone-100 hover:bg-stone-200/80 active:bg-stone-200 text-[#1C1E22] rounded-full text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-black/5 touch-manipulation active:scale-95 cursor-pointer"
        >
          <HugeiconsIcon icon={FolderAddIcon} size={15} />
          <span>Add Collection</span>
        </button>

        <button
          type="button"
          onClick={onAddCard}
          className="w-full min-h-[44px] py-2.5 px-4 bg-[#1C1E22] hover:bg-black active:bg-[#0E0F11] text-white rounded-full text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs touch-manipulation active:scale-95 cursor-pointer"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={15} />
          <span>Add Link</span>
        </button>
      </div>

      {/* Quick Inline Section Creator */}
      {showAddSection && (
        <form
          onSubmit={handleCreateSectionSubmit}
          className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1C1E22] block">
              Create Collection / Section Header
            </label>
            <button
              type="button"
              onClick={() => setShowAddSection(false)}
              className="text-xs text-[#737882] hover:text-[#1C1E22] cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              required
              placeholder="e.g. Featured Deals, Courses, Socials..."
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-[#1C1E22] focus:outline-none focus:ring-1 focus:ring-black"
            />
            <Button type="submit" variant="primary" size="sm" className="rounded-xl">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {['Featured Deals', 'Courses & Batches', 'My Portfolio', 'Social Profiles'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setNewSectionTitle(tag)}
                className="px-2 py-0.5 rounded-full bg-white border border-stone-200 text-[10px] font-semibold text-[#737882] hover:text-[#1C1E22] cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </form>
      )}

      {/* Existing Sections List (if any) */}
      {profile.sections && profile.sections.length > 0 && (
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#737882]">
            <span>Collections ({profile.sections.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.sections.map((sec) => (
              <span
                key={sec.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-xl border border-stone-200 text-xs font-bold text-[#1C1E22] shadow-2xs"
              >
                <HugeiconsIcon icon={Folder01Icon} size={12} className="text-[#1C1E22]" />
                <span>{sec.title}</span>
                {onDeleteSection && (
                  <button
                    type="button"
                    onClick={() => onDeleteSection(sec.id)}
                    className="text-[#737882] hover:text-red-600 ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Link Cards List (Minimalist Clean Cards matching Image) */}
      <div className="space-y-3 max-w-full">
        {profile.cards.length === 0 ? (
          <div className="text-center py-10 px-4 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-2.5 shadow-xs border border-stone-200 text-[#1C1E22]">
              <HugeiconsIcon icon={Link01Icon} size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#1C1E22]">No links created yet</h3>
            <p className="text-xs text-[#737882] mt-1 mb-3.5 max-w-xs mx-auto">
              Add social media, portfolio, newsletter, or external links.
            </p>
            <button
              type="button"
              onClick={onAddCard}
              className="px-5 py-2.5 bg-[#1C1E22] text-white rounded-full text-xs font-bold hover:bg-black transition-colors cursor-pointer"
            >
              + Add Link
            </button>
          </div>
        ) : (
          profile.cards.map((card, index) => {
            const cardTheme = COLOR_CONFIG[card.color] || COLOR_CONFIG.purple;
            const isFirst = index === 0;
            const isLast = index === profile.cards.length - 1;
            const isMenuOpen = activeCardMenuId === card.id;

            return (
              <div
                key={card.id}
                className={`group relative p-3.5 sm:p-4 rounded-[22px] sm:rounded-[24px] border transition-all max-w-full ${
                  card.isActive !== false
                    ? 'bg-white border-stone-200/90 shadow-2xs hover:border-stone-300'
                    : 'bg-stone-50/60 border-dashed border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3 min-w-0">
                  {/* Left: Soft Rounded Icon Box with Gallery fallback */}
                  <CardThumbnailBadge card={card} cardTheme={cardTheme} />

                  {/* Middle: Title & Subtitle (Clicks / URL) */}
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEditCard(card)}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-[#1C1E22] truncate leading-tight">
                        {card.title}
                      </h4>
                      {card.badgeText && (
                        <span className="px-1.5 py-0.5 rounded-full bg-stone-100 text-[#1C1E22] font-semibold text-[9px] truncate max-w-[80px]">
                          {card.badgeText}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#737882] truncate font-normal mt-0.5">
                      {card.clicks || 0} clicks
                      {card.linkUrl && (
                        <span className="ml-1 text-stone-400">
                          • {card.linkUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Right: Three Dots Action Menu Button */}
                  <div className="relative shrink-0 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveCardMenuId(isMenuOpen ? null : card.id)}
                      className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full hover:bg-stone-100 active:bg-stone-200 text-[#737882] hover:text-[#1C1E22] flex items-center justify-center transition-colors touch-manipulation cursor-pointer"
                      title="More options"
                      aria-label="More options for this card"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>

                    {/* Sleek Floating Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-1.5 z-30 animate-fadeIn text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCardMenuId(null);
                            onEditCard(card);
                          }}
                          className="w-full min-h-[40px] px-3.5 py-2.5 text-left text-[#1C1E22] hover:bg-stone-50 active:bg-stone-100 flex items-center gap-2 font-medium touch-manipulation cursor-pointer"
                        >
                          <HugeiconsIcon icon={Edit01Icon} size={15} className="text-stone-500" />
                          <span>Edit Card</span>
                        </button>

                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => {
                            setActiveCardMenuId(null);
                            onMoveCard(index, 'up');
                          }}
                          className="w-full min-h-[40px] px-3.5 py-2.5 text-left text-[#1C1E22] hover:bg-stone-50 active:bg-stone-100 flex items-center gap-2 font-medium disabled:opacity-30 disabled:pointer-events-none touch-manipulation cursor-pointer"
                        >
                          <HugeiconsIcon icon={ArrowUp01Icon} size={15} className="text-stone-500" />
                          <span>Move Up</span>
                        </button>

                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => {
                            setActiveCardMenuId(null);
                            onMoveCard(index, 'down');
                          }}
                          className="w-full min-h-[40px] px-3.5 py-2.5 text-left text-[#1C1E22] hover:bg-stone-50 active:bg-stone-100 flex items-center gap-2 font-medium disabled:opacity-30 disabled:pointer-events-none touch-manipulation cursor-pointer"
                        >
                          <HugeiconsIcon icon={ArrowDown01Icon} size={15} className="text-stone-500" />
                          <span>Move Down</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveCardMenuId(null);
                            onToggleCardActive(card.id);
                          }}
                          className="w-full min-h-[40px] px-3.5 py-2.5 text-left text-[#1C1E22] hover:bg-stone-50 active:bg-stone-100 flex items-center gap-2 font-medium touch-manipulation cursor-pointer"
                        >
                          <HugeiconsIcon icon={ViewIcon} size={15} className="text-stone-500" />
                          <span>{card.isActive !== false ? 'Hide Link' : 'Show Link'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveCardMenuId(null);
                            if (card.linkUrl) {
                              navigator.clipboard.writeText(card.linkUrl);
                            }
                          }}
                          className="w-full min-h-[40px] px-3.5 py-2.5 text-left text-[#1C1E22] hover:bg-stone-50 active:bg-stone-100 flex items-center gap-2 font-medium touch-manipulation cursor-pointer"
                        >
                          <HugeiconsIcon icon={Copy01Icon} size={15} className="text-stone-500" />
                          <span>Copy URL</span>
                        </button>

                        <div className="h-px bg-stone-100 my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            setActiveCardMenuId(null);
                            onDeleteCard(card.id);
                          }}
                          className="w-full min-h-[40px] px-3.5 py-2.5 text-left text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center gap-2 font-medium touch-manipulation cursor-pointer"
                        >
                          <HugeiconsIcon icon={Delete01Icon} size={15} />
                          <span>Delete Card</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
