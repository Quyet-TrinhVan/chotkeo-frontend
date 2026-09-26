/**
 * Avatar Upload Orchestration Service
 *
 * Implements the complete multi-step upload pipeline:
 * 1. Validate MIME and size
 * 2. Calculate authentic SHA-256
 * 3. POST /api/v1/uploads (create presigned upload session)
 * 4. PUT directly to presigned storage URL (no Bearer token)
 * 5. POST /api/v1/uploads/{uploadId}/complete
 * 6. PATCH /api/v1/me (attach MediaAsset to user profile with If-Match)
 */

import { uploadApi } from '../../../api/uploadApi';
import { profileApi } from '../../../api/profileApi';
import { USE_MOCKS } from '../../../api/client';
import { MediaAsset, UserProfile } from '../../../types/api';
import { validateAvatarFile, MAX_AVATAR_SIZE_BYTES } from '../utils/fileValidation';
import { calculateFileSha256 } from '../utils/fileHash';

export type UploadStepStatus =
  | 'IDLE'
  | 'PREPARING' // Validating & computing hash
  | 'UPLOADING' // Direct presigned PUT
  | 'COMPLETING' // Finalizing upload session
  | 'UPDATING_PROFILE'; // PATCH /me

export interface UploadAvatarParams {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  currentUser: UserProfile;
  onProgress?: (status: UploadStepStatus, message: string) => void;
}

export interface UploadAvatarResult {
  mediaAsset: MediaAsset;
  updatedProfile: UserProfile;
}

function resolveETag(profile: UserProfile): string {
  if ((profile as any)._etag) {
    return (profile as any)._etag;
  }
  const version = profile.version ?? 1;
  return `"user-profile-${version}"`;
}

export const avatarUploadService = {
  /**
   * Runs the complete upload avatar pipeline.
   * Throws localized, user-friendly Vietnamese errors.
   */
  async uploadAvatar({
    uri,
    fileName,
    mimeType,
    fileSize,
    currentUser,
    onProgress,
  }: UploadAvatarParams): Promise<UploadAvatarResult> {
    // ==========================================
    // 1. Initial Validation
    // ==========================================
    const validation = validateAvatarFile(fileName, mimeType, fileSize);
    if (!validation.valid || !validation.normalizedMimeType) {
      throw new Error(validation.error || 'Định dạng ảnh chưa được hỗ trợ.');
    }
    const resolvedMime = validation.normalizedMimeType;

    // ==========================================
    // 2. Prepare & Compute SHA-256
    // ==========================================
    onProgress?.('PREPARING', 'Đang chuẩn bị ảnh...');

    let hashResult;
    try {
      hashResult = await calculateFileSha256(uri);
    } catch {
      throw new Error('Không thể đọc dữ liệu ảnh. Vui lòng thử lại.');
    }

    if (hashResult.sizeBytes > MAX_AVATAR_SIZE_BYTES) {
      throw new Error('Ảnh vượt quá dung lượng cho phép.');
    }

    const cleanFileName =
      fileName && fileName.trim().length > 0
        ? fileName.trim()
        : `avatar_${Date.now()}.${resolvedMime === 'image/png' ? 'png' : resolvedMime === 'image/webp' ? 'webp' : 'jpg'}`;

    // ==========================================
    // 3. Create Presigned Upload Session
    // ==========================================
    let uploadSession;
    try {
      uploadSession = await uploadApi.createUploadSession({
        purpose: 'AVATAR',
        fileName: cleanFileName,
        contentType: resolvedMime,
        sizeBytes: hashResult.sizeBytes,
        sha256: hashResult.sha256,
      });
    } catch {
      throw new Error('Không thể chuẩn bị tải ảnh. Vui lòng thử lại.');
    }

    if (!uploadSession?.uploadUrl || !uploadSession?.id) {
      throw new Error('Không thể chuẩn bị tải ảnh. Vui lòng thử lại.');
    }

    // ==========================================
    // 4. Direct PUT to Presigned URL
    // ==========================================
    onProgress?.('UPLOADING', 'Đang tải ảnh...');

    let etag = '';
    if (USE_MOCKS || uploadSession.uploadUrl.includes('mock-storage')) {
      // Simulate direct storage upload in mock mode
      await new Promise((r) => setTimeout(r, 600));
      etag = `"mock-etag-${Date.now()}"`;
    } else {
      try {
        const headers: Record<string, string> = {
          'Content-Type': resolvedMime,
          ...(uploadSession.requiredHeaders || {}),
        };

        const putResponse = await fetch(uploadSession.uploadUrl, {
          method: 'PUT',
          headers,
          body: hashResult.arrayBuffer,
        });

        if (!putResponse.ok) {
          throw new Error(`Storage returned ${putResponse.status}`);
        }

        const rawEtag =
          putResponse.headers.get('ETag') ||
          putResponse.headers.get('etag') ||
          putResponse.headers.get('Etag');

        if (rawEtag) {
          etag = rawEtag.trim();
        } else {
          etag = `"${hashResult.sha256.substring(0, 32)}"`;
        }
      } catch {
        throw new Error('Tải ảnh thất bại. Vui lòng thử lại.');
      }
    }

    // ==========================================
    // 5. Complete Upload Session
    // ==========================================
    onProgress?.('COMPLETING', 'Đang tải ảnh...');

    let mediaAsset: MediaAsset;
    try {
      mediaAsset = await uploadApi.completeUpload(uploadSession.id, {
        etag: etag.replace(/"/g, '') || hashResult.sha256,
      });
    } catch {
      throw new Error('Không thể hoàn tất tải ảnh.');
    }

    if (!mediaAsset?.id || mediaAsset.status !== 'READY') {
      throw new Error('Không thể hoàn tất tải ảnh.');
    }

    // ==========================================
    // 6. Attach MediaAsset to Profile (PATCH /me)
    // ==========================================
    onProgress?.('UPDATING_PROFILE', 'Đang cập nhật ảnh đại diện...');

    let updatedProfile: UserProfile;
    const initialIfMatch = resolveETag(currentUser);

    try {
      updatedProfile = await profileApi.updateProfile(
        { avatar: mediaAsset.id },
        initialIfMatch
      );
    } catch (patchErr: any) {
      // Check if ETag is stale (HTTP 412 Precondition Failed)
      if (patchErr?.status === 412 || patchErr?.problem?.status === 412) {
        try {
          // Re-fetch current user profile to obtain fresh ETag
          const freshUser = await profileApi.getProfile();
          const freshIfMatch = resolveETag(freshUser);
          updatedProfile = await profileApi.updateProfile(
            { avatar: mediaAsset.id },
            freshIfMatch
          );
        } catch {
          throw new Error('Ảnh đã được tải lên nhưng chưa thể cập nhật hồ sơ. Vui lòng thử lại.');
        }
      } else {
        throw new Error('Ảnh đã được tải lên nhưng chưa thể cập nhật hồ sơ. Vui lòng thử lại.');
      }
    }

    return {
      mediaAsset,
      updatedProfile,
    };
  },
};
