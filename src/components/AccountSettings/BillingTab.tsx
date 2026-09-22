import React from 'react';
import { UserProfile } from '../../types';
import { User } from 'firebase/auth';
import { BillingDashboard } from '../BillingDashboard';

export interface BillingTabProps {
  profile: UserProfile;
  currentUser: User | null;
  onOpenUpgradeModal: () => void;
  onProfileUpdate: (updated: Partial<UserProfile>) => void;
}

export const BillingTab: React.FC<BillingTabProps> = ({
  profile,
  currentUser,
  onOpenUpgradeModal,
  onProfileUpdate,
}) => {
  return (
    <BillingDashboard
      profile={profile}
      currentUser={currentUser}
      onOpenUpgradeModal={onOpenUpgradeModal}
      onProfileUpdate={onProfileUpdate}
    />
  );
};
