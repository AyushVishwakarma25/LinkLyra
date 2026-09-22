import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  storage,
  handleFirestoreError,
  OperationType,
} from './app';

export const storageService = {
  // Upload user avatar into canonical path: users/{userId}/avatar
  async uploadAvatar(userId: string, file: File | Blob): Promise<string> {
    if (!userId) throw new Error('User ID is required to upload an avatar.');

    try {
      const ext = file instanceof File ? file.name.split('.').pop() || 'jpg' : 'jpg';
      const storageRef = ref(storage, `users/${userId}/avatar_${Date.now()}.${ext}`);
      const snap = await uploadBytes(storageRef, file, {
        contentType: file.type || 'image/jpeg',
      });
      return await getDownloadURL(snap.ref);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `storage:users/${userId}/avatar`);
      throw err;
    }
  },

  // Upload general media into canonical path: pages/{pageId}/media
  async uploadMedia(pageId: string, file: File | Blob, prefix = 'media'): Promise<string> {
    if (!pageId) throw new Error('Page ID is required to upload media.');

    try {
      const ext = file instanceof File ? file.name.split('.').pop() || 'jpg' : 'jpg';
      const storageRef = ref(storage, `pages/${pageId}/${prefix}_${Date.now()}.${ext}`);
      const snap = await uploadBytes(storageRef, file, {
        contentType: file.type || 'image/jpeg',
      });
      return await getDownloadURL(snap.ref);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `storage:pages/${pageId}/${prefix}`);
      throw err;
    }
  },
};
