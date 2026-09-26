/**
 * Upload & Media Assets API Service
 * Implements Section 3.2 of FE_API_INTEGRATION_GUIDE.md
 */

import { apiClient, generateIdempotencyKey, USE_MOCKS, generateUUID } from './client';
import {
  UploadCreate,
  UploadSession,
  UploadComplete,
  MediaAsset,
  ResourceResponse,
  UUID,
} from '../types/api';

export const uploadApi = {
  /**
   * POST /api/v1/uploads
   * Creates a new presigned upload session
   */
  async createUploadSession(payload: UploadCreate): Promise<UploadSession> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 400));
      const mockSession: UploadSession = {
        id: generateUUID(),
        uploadUrl: 'https://mock-storage.chotkeo.vn/uploads/mock-avatar',
        requiredHeaders: {
          'x-amz-acl': 'public-read',
        },
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        limits: {
          maxSizeBytes: 100 * 1024 * 1024,
        },
      };
      return mockSession;
    }

    const response = await apiClient<ResourceResponse<UploadSession>>('/uploads', {
      method: 'POST',
      idempotencyKey: generateIdempotencyKey('upload-session'),
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  /**
   * POST /api/v1/uploads/{uploadId}/complete
   * Finalizes the upload session and creates a MediaAsset
   */
  async completeUpload(uploadId: UUID, payload: UploadComplete): Promise<MediaAsset> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 450));
      const mockAsset: MediaAsset = {
        id: uploadId || generateUUID(),
        status: 'READY',
        contentType: 'image/jpeg',
        sizeBytes: 150000,
        sha256: 'mock-sha256-hash',
        renditions: [
          {
            kind: 'ORIGINAL',
            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80',
            expiresAt: new Date(Date.now() + 86400 * 30 * 1000).toISOString(),
          },
        ],
        moderationStatus: 'APPROVED',
      };
      return mockAsset;
    }

    const response = await apiClient<ResourceResponse<MediaAsset>>(`/uploads/${uploadId}/complete`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.data;
  },

  /**
   * GET /api/v1/media/{mediaId}
   * Retrieves media asset metadata and renditions
   */
  async getMedia(mediaId: UUID): Promise<MediaAsset> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        id: mediaId,
        status: 'READY',
        contentType: 'image/jpeg',
        sizeBytes: 150000,
        sha256: 'mock-sha256-hash',
        renditions: [
          {
            kind: 'ORIGINAL',
            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80',
            expiresAt: new Date(Date.now() + 86400 * 30 * 1000).toISOString(),
          },
        ],
        moderationStatus: 'APPROVED',
      };
    }

    const response = await apiClient<ResourceResponse<MediaAsset>>(`/media/${mediaId}`, {
      method: 'GET',
    });

    return response.data;
  },
};
