import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './firebase';

export type ImageUploadCategory = 'avatar' | 'page_image' | 'card_image' | 'wallpaper';

interface CompressionConfig {
  maxDimension: number;
  quality: number;
}

const CATEGORY_CONFIG: Record<ImageUploadCategory, CompressionConfig> = {
  avatar: { maxDimension: 1024, quality: 0.85 },
  card_image: { maxDimension: 1600, quality: 0.85 },
  page_image: { maxDimension: 1600, quality: 0.85 },
  wallpaper: { maxDimension: 1600, quality: 0.85 },
};

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates file format and size constraints before attempting processing or upload.
 */
export function validateImageFile(file: File): void {
  if (!file || !file.type || !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    throw new Error('Unsupported image format. Please upload a JPEG, PNG, WebP, or GIF image.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image file is too large. Maximum allowed file size is 5 MB.');
  }
}

/**
 * High-performance client-side image downscaler and compressor:
 * - Restricts max dimensions based on target category (avatar max 1024px, card/page/wallpaper max 1600px)
 * - Uses createImageBitmap for hardware acceleration when supported
 * - Falls back to standard Canvas 2D
 * - Converts to optimized WebP format
 */
export async function compressImageFile(
  file: File,
  category: ImageUploadCategory = 'avatar',
  customMaxDimension?: number,
  customQuality?: number
): Promise<File> {
  // Enforce type validation
  validateImageFile(file);

  // If already SVG or tiny image (< 40KB) that doesn't exceed dimensions, return as-is
  if (file.type.includes('svg')) {
    return file;
  }

  const { maxDimension: defaultDim, quality: defaultQual } =
    CATEGORY_CONFIG[category] || CATEGORY_CONFIG.avatar;
  const maxDimension = customMaxDimension || defaultDim;
  const quality = customQuality || defaultQual;

  try {
    // 1. Fast path: createImageBitmap (GPU-accelerated, async)
    if (typeof createImageBitmap === 'function') {
      const bitmap = await createImageBitmap(file);
      let { width, height } = bitmap;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/webp', quality);
        });

        if (blob && (blob.size < file.size || width !== bitmap.width)) {
          return new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now(),
          });
        }
      }
    }
  } catch (err) {
    console.warn('createImageBitmap fast-path error, using standard Canvas fallback:', err);
  }

  // 2. Standard Canvas fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Could not read image for compression.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Could not read file from disk.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Firebase Cloud Storage:
 * - Validates file type and max 5MB size
 * - Downscales client-side (avatar max 1024px, cards/wallpapers max 1600px)
 * - Adheres strictly to storage.rules paths:
 *     - users/{uid}/avatar/** for avatars
 *     - pages/{uid}/images/** for cards, page images, and wallpapers
 * - Throws a friendly error on failure (no base64 data-URL fallback)
 */
export async function uploadImageToStorage(
  file: File,
  type: ImageUploadCategory = 'avatar',
  targetId?: string
): Promise<string> {
  // 1. Validate file format and size
  validateImageFile(file);

  // 2. Compress and downscale on the client first
  const optimizedFile = await compressImageFile(file, type);

  const currentUid = auth.currentUser?.uid;
  if (!currentUid && !targetId) {
    throw new Error('You must be signed in to upload images.');
  }

  const timestamp = Date.now();
  const safeFilename = optimizedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');

  // Adhere to storage.rules: users/{userId}/avatar/** or pages/{pageId}/images/**
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
      contentType: optimizedFile.type || 'image/webp',
      customMetadata: {
        uploadedBy: currentUid || 'unknown',
        uploadedAt: new Date().toISOString(),
      },
    };

    const snapshot = await uploadBytes(storageRef, optimizedFile, metadata);
    return await getDownloadURL(snapshot.ref);
  } catch (error: any) {
    console.error('Storage upload error:', error);
    const message = error?.message || 'Failed to upload image. Please check your network connection and try again.';
    throw new Error(message);
  }
}
