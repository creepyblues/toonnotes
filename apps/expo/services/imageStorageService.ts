/**
 * Image Storage Service
 *
 * Handles uploading, downloading, and managing images in Supabase Storage.
 * Enables cross-platform image sync by replacing local file:// URIs with
 * cloud storage URLs.
 *
 * Storage structure:
 * - note-images/{user_id}/{note_id}/{filename}
 * - design-assets/{user_id}/stickers/{filename}
 * - design-assets/{user_id}/sources/{filename}
 */

import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { decode } from 'base64-arraybuffer';

// Bucket names matching the migration
const NOTE_IMAGES_BUCKET = 'note-images';
const DESIGN_ASSETS_BUCKET = 'design-assets';

// URL patterns for detection
const SUPABASE_STORAGE_PATTERN = /\/storage\/v1\/object\/(public|sign)/;

/**
 * Check if a URI is a local file URI
 */
export function isLocalUri(uri: string | undefined): boolean {
  if (!uri) return false;
  return uri.startsWith('file://') || uri.startsWith('content://');
}

/**
 * Check if a URI is a Supabase Storage URL
 */
export function isStorageUrl(uri: string | undefined): boolean {
  if (!uri) return false;
  return SUPABASE_STORAGE_PATTERN.test(uri) || uri.includes('.supabase.co/storage');
}

/**
 * Generate a unique filename with timestamp
 */
function generateFilename(originalUri: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  // Extract extension from original URI
  const extension = originalUri.split('.').pop()?.toLowerCase() || 'jpg';
  const validExtension = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)
    ? extension
    : 'jpg';

  return `${timestamp}-${random}.${validExtension}`;
}

/**
 * Upload an image to Supabase Storage
 *
 * @param localUri - Local file:// URI to upload
 * @param userId - User ID for folder structure
 * @param noteId - Note ID for organizing note images
 * @returns Storage URL or throws error
 */
export async function uploadNoteImage(
  localUri: string,
  userId: string,
  noteId: string
): Promise<string> {
  if (!isLocalUri(localUri)) {
    // Already a remote URL, return as-is
    return localUri;
  }

  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: 'base64',
    });

    // Generate storage path
    const filename = generateFilename(localUri);
    const storagePath = `${userId}/${noteId}/${filename}`;

    // Determine content type
    const extension = filename.split('.').pop()?.toLowerCase();
    const contentType = extension === 'png' ? 'image/png' : 'image/jpeg';

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(NOTE_IMAGES_BUCKET)
      .upload(storagePath, decode(base64), {
        contentType,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('[ImageStorage] Upload error:', error);
      throw error;
    }

    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(NOTE_IMAGES_BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year

    if (!urlData?.signedUrl) {
      throw new Error('Failed to generate signed URL');
    }

    console.log('[ImageStorage] Uploaded note image:', storagePath);
    return urlData.signedUrl;
  } catch (error) {
    console.error('[ImageStorage] Failed to upload note image:', error);
    throw error;
  }
}

/**
 * Upload a design asset (sticker or source image)
 *
 * @param localUri - Local file:// URI to upload
 * @param userId - User ID for folder structure
 * @param type - Asset type: 'sticker' or 'source'
 * @returns Storage URL or throws error
 */
export async function uploadDesignAsset(
  localUri: string,
  userId: string,
  type: 'sticker' | 'source'
): Promise<string> {
  if (!isLocalUri(localUri)) {
    return localUri;
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: 'base64',
    });

    const filename = generateFilename(localUri);
    const folder = type === 'sticker' ? 'stickers' : 'sources';
    const storagePath = `${userId}/${folder}/${filename}`;

    const extension = filename.split('.').pop()?.toLowerCase();
    const contentType = extension === 'png' ? 'image/png' : 'image/jpeg';

    const { data, error } = await supabase.storage
      .from(DESIGN_ASSETS_BUCKET)
      .upload(storagePath, decode(base64), {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('[ImageStorage] Design asset upload error:', error);
      throw error;
    }

    const { data: urlData } = await supabase.storage
      .from(DESIGN_ASSETS_BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    if (!urlData?.signedUrl) {
      throw new Error('Failed to generate signed URL');
    }

    console.log('[ImageStorage] Uploaded design asset:', storagePath);
    return urlData.signedUrl;
  } catch (error) {
    console.error('[ImageStorage] Failed to upload design asset:', error);
    throw error;
  }
}

/**
 * Migrate an array of image URIs, uploading any local files to Storage
 *
 * @param images - Array of image URIs (local or remote)
 * @param userId - User ID for folder structure
 * @param noteId - Note ID for organizing images
 * @returns Array of storage URLs
 */
export async function migrateNoteImages(
  images: string[] | undefined,
  userId: string,
  noteId: string
): Promise<string[]> {
  if (!images?.length) return [];

  const migrated = await Promise.all(
    images.map(async (uri) => {
      if (isLocalUri(uri)) {
        try {
          return await uploadNoteImage(uri, userId, noteId);
        } catch (error) {
          // If upload fails, keep local URI (better than losing the image)
          console.warn('[ImageStorage] Migration failed, keeping local URI:', uri);
          return uri;
        }
      }
      return uri;
    })
  );

  return migrated;
}

/**
 * Delete images from Storage when a note is permanently deleted
 *
 * @param userId - User ID
 * @param noteId - Note ID
 */
export async function deleteNoteImages(userId: string, noteId: string): Promise<void> {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from(NOTE_IMAGES_BUCKET)
      .list(`${userId}/${noteId}`);

    if (listError) {
      console.error('[ImageStorage] Failed to list files for deletion:', listError);
      return;
    }

    if (!files?.length) return;

    const filePaths = files.map((f) => `${userId}/${noteId}/${f.name}`);
    const { error: deleteError } = await supabase.storage
      .from(NOTE_IMAGES_BUCKET)
      .remove(filePaths);

    if (deleteError) {
      console.error('[ImageStorage] Failed to delete files:', deleteError);
    } else {
      console.log('[ImageStorage] Deleted images for note:', noteId);
    }
  } catch (error) {
    console.error('[ImageStorage] Delete operation failed:', error);
  }
}

/**
 * Refresh a signed URL if it's expired or about to expire
 * (Storage URLs have 1 year expiry, but this is useful for edge cases)
 */
export async function refreshSignedUrl(
  storagePath: string,
  bucket: 'note-images' | 'design-assets' = 'note-images'
): Promise<string | null> {
  try {
    const { data } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    return data?.signedUrl || null;
  } catch (error) {
    console.error('[ImageStorage] Failed to refresh signed URL:', error);
    return null;
  }
}
