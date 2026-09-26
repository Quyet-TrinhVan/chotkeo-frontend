/**
 * File Validation Utility for Avatar Upload
 *
 * Supported formats: image/jpeg, image/png, image/webp
 * Max size: 100MB (104,857,600 bytes)
 */

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_AVATAR_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  normalizedMimeType?: AllowedMimeType;
}

/**
 * Normalizes and validates mime type from file extension or provided mimeType
 */
export function validateAvatarFile(
  fileName?: string | null,
  mimeType?: string | null,
  sizeBytes?: number | null
): FileValidationResult {
  // 1. Determine mimeType
  let resolvedMime: string | undefined = mimeType?.toLowerCase();

  if (!resolvedMime && fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'jpg' || ext === 'jpeg') resolvedMime = 'image/jpeg';
    else if (ext === 'png') resolvedMime = 'image/png';
    else if (ext === 'webp') resolvedMime = 'image/webp';
  }

  // Fallback for image/jpg
  if (resolvedMime === 'image/jpg') {
    resolvedMime = 'image/jpeg';
  }

  // 2. Validate MIME type
  if (!resolvedMime || !ALLOWED_MIME_TYPES.includes(resolvedMime as AllowedMimeType)) {
    return {
      valid: false,
      error: 'Định dạng ảnh chưa được hỗ trợ.',
    };
  }

  // 3. Validate file size if provided
  if (sizeBytes !== undefined && sizeBytes !== null && sizeBytes > MAX_AVATAR_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Ảnh vượt quá dung lượng cho phép.',
    };
  }

  return {
    valid: true,
    normalizedMimeType: resolvedMime as AllowedMimeType,
  };
}
