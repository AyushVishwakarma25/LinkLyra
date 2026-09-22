import { describe, it, expect, vi } from 'vitest';
import { useToast } from '../src/context/ToastContext';
import { useConfirm } from '../src/components/ConfirmDialog';
import { ProfileCardData, UserProfile } from '../src/types';

describe('Error Handling UI & In-App Feedback (Toast & Confirm)', () => {
  describe('useToast Fallback & API Contract', () => {
    it('returns a safe fallback object when used outside ToastProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const toast = useToast();
      consoleSpy.mockRestore();

      expect(toast).toBeDefined();
      expect(typeof toast.showToast).toBe('function');
      expect(typeof toast.success).toBe('function');
      expect(typeof toast.error).toBe('function');
      expect(typeof toast.warning).toBe('function');
      expect(typeof toast.info).toBe('function');
      expect(typeof toast.dismissToast).toBe('function');
      expect(Array.isArray(toast.toasts)).toBe(true);

      // Verify safe executions without throwing
      expect(() => toast.showToast('test')).not.toThrow();
      expect(() => toast.success('saved', { label: 'Undo', onClick: () => {} })).not.toThrow();
      expect(() => toast.error('failed', { label: 'Retry', onClick: () => {} })).not.toThrow();
      expect(() => toast.warning('warning')).not.toThrow();
      expect(() => toast.info('info')).not.toThrow();
      expect(() => toast.dismissToast('some_id')).not.toThrow();
    });
  });

  describe('useConfirm Fallback & API Contract', () => {
    it('returns a safe fallback resolving promise when used outside ConfirmProvider', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const confirm = useConfirm();
      consoleSpy.mockRestore();

      expect(typeof confirm).toBe('function');

      const result = await confirm({
        title: 'Delete Item',
        description: 'Are you sure?',
        confirmText: 'Delete',
        isDestructive: true,
      });

      expect(result).toBe(true);
    });
  });

  describe('Optimistic UI Rollback Pattern', () => {
    it('correctly reverts profile state on failed async mutation', async () => {
      const initialProfile: UserProfile = {
        id: 'user_123',
        name: 'Initial Name',
        username: 'testuser',
        headline: 'Creator Headline',
        avatarUrl: 'https://example.com/avatar.jpg',
        cards: [
          { id: 'card_1', title: 'Original Card', linkUrl: 'https://example.com', color: 'purple' },
        ],
      };

      let currentProfile = initialProfile;
      const setProfile = (updater: (prev: UserProfile) => UserProfile) => {
        currentProfile = updater(currentProfile);
      };

      const mockFailedSave = vi.fn().mockRejectedValue(new Error('Network error'));
      const toastErrorMock = vi.fn();

      // Mutation simulation
      const handleUpdateCard = async (savedCard: ProfileCardData) => {
        const prevProfile = currentProfile;

        // 1. Optimistic update
        setProfile((prev) => ({
          ...prev,
          cards: prev.cards.map((c) => (c.id === savedCard.id ? savedCard : c)),
        }));

        expect(currentProfile.cards[0].title).toBe('Updated Card Title');

        // 2. Async operation fails
        try {
          await mockFailedSave();
        } catch {
          // 3. Rollback
          setProfile(() => prevProfile);
          toastErrorMock('Failed to update card', {
            label: 'Retry',
            onClick: () => handleUpdateCard(savedCard),
          });
        }
      };

      await handleUpdateCard({
        id: 'card_1',
        title: 'Updated Card Title',
        linkUrl: 'https://example.com',
        color: 'purple',
      });

      // Assert rollback to initial state
      expect(currentProfile.cards[0].title).toBe('Original Card');
      expect(mockFailedSave).toHaveBeenCalledOnce();
      expect(toastErrorMock).toHaveBeenCalledWith('Failed to update card', expect.objectContaining({
        label: 'Retry',
        onClick: expect.any(Function),
      }));
    });
  });
});
