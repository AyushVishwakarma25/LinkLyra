import { UserProfile, ProfileCardData } from '../../types';
import { User } from 'firebase/auth';
import { AccountSubTab } from '../AccountSettings';

export type SidebarTabKey =
  | 'links'
  | 'leads'
  | 'appearance'
  | 'analytics'
  | 'settings'
  | 'profile'
  | 'billing'
  | 'share';

export interface BuilderSidebarProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onManualSave?: () => Promise<void> | void;
  onAddCard: () => void;
  onEditCard: (card: ProfileCardData) => void;
  onDeleteCard: (id: string) => void;
  onMoveCard: (index: number, direction: 'up' | 'down') => void;
  onToggleCardActive: (id: string) => void;
  onOpenPublicView: () => void;
  onOpenAuth?: () => void;
  currentUser?: User | null;
  activeSidebarTab?: SidebarTabKey;
  onTabChange?: (tab: SidebarTabKey) => void;
  onOpenAccountSettings?: (initialTab?: AccountSubTab) => void;
  onAddSection?: (title: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onOpenProModal?: (lockedFeatureName?: string) => void;
  onSignOut?: () => void;
  onResetLinks?: () => void;
  onOpenOnboarding?: () => void;
}
