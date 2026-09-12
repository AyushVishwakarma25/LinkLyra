import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './firebase';

/**
 * Uploads an image file to Firebase Cloud Storage using the exact Linktree architecture:
 * - Profile pictures: `/users/{userId}/avatar/{filename}`
 * - Page assets/thumbnails: `/pages/{pageId}/images/{filename}`
 * 
 * Falls back to resilient base64 DataURL if storage is offline or experiencing permission limits.
 */
export async function uploadImageToStorage(
  file: File,
  type: 'avatar' | 'page_image' = 'avatar',
  targetId?: string
): Promise<string> {
  const currentUid = auth.currentUser?.uid || 'anonymous';
  const timestamp = Date.now();
  const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

  let path = '';
  if (type === 'avatar') {
    const userId = targetId || currentUid;
    path = `users/${userId}/avatar/${timestamp}_${safeFilename}`;
  } else {
    const pageId = targetId || currentUid;
    path = `pages/${pageId}/images/${timestamp}_${safeFilename}`;
  }

  try {
    const storageRef = ref(storage, path);
    const metadata = {
      contentType: file.type || 'image/jpeg',
      customMetadata: {
        uploadedBy: currentUid,
        uploadedAt: new Date().toISOString(),
      },
    };

    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage upload notice, using client data URL fallback:', error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to data URL'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
