/**
 * Recommendation API Service
 * Section 3.4 & 4.1 of FE_API_INTEGRATION_GUIDE.md
 */

import { apiClient, generateIdempotencyKey, USE_MOCKS } from './client';
import {
  RecommendationCreate,
  RecommendationSession,
  RecommendationRegenerationRequest,
  RecommendationAcceptanceCreate,
  RecommendationAcceptance,
  ResourceResponse,
  UUID,
} from '../types/api';
import { MOCK_PLACES } from './mockData';

export const recommendationApi = {
  /**
   * POST /api/v1/recommendation-sessions
   */
  async createSession(payload: RecommendationCreate): Promise<RecommendationSession> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 500));
      const candidates = [...MOCK_PLACES].slice(0, 3);
      const explanations = [
        ['Đúng ngân sách', 'Đang mở', 'Gần bạn'],
        ['Không gian yên tĩnh', 'Được đánh giá cao'],
        ['Hợp nhóm đông', 'Nhiều góc sống ảo'],
      ];

      return {
        id: `rec-${Date.now()}`,
        version: 1,
        status: 'ACTIVE',
        constraints: payload,
        options: candidates.map((place, index) => ({
          id: `opt-${place.id}`,
          place,
          scoreBand: 'HIGH',
          explanationCodes: explanations[index] || ['Đang mở'],
          constraintsSatisfied: ['BUDGET', 'PARTY_SIZE', 'ACTIVITY_TYPE'],
          rank: index + 1,
        })),
        relaxationHints: [],
        ruleVersion: 'rec-v1.4',
        candidateSetVersion: 'cand-2026-09-hanoi',
        expiresAt: new Date(Date.now() + 1800 * 1000).toISOString(),
      };
    }

    const response = await apiClient<ResourceResponse<RecommendationSession>>('/recommendation-sessions', {
      method: 'POST',
      idempotencyKey: generateIdempotencyKey('rec-create'),
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * GET /api/v1/recommendation-sessions/{sessionId}
   */
  async getSession(sessionId: UUID): Promise<RecommendationSession> {
    const response = await apiClient<ResourceResponse<RecommendationSession>>(
      `/recommendation-sessions/${sessionId}`,
      { method: 'GET' }
    );
    return response.data;
  },

  /**
   * POST /api/v1/recommendation-sessions/{sessionId}/regenerations
   */
  async regenerate(
    sessionId: UUID,
    payload: RecommendationRegenerationRequest
  ): Promise<RecommendationSession> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 450));
      // Re-shuffle or pick different candidates
      const candidates = [...MOCK_PLACES].reverse().slice(0, 3);
      return {
        id: sessionId,
        version: 2,
        status: 'ACTIVE',
        constraints: {
          areaId: '0199f2b8-4b1d-7a31-9c68-934e08e501ab',
          activityType: 'COFFEE',
          partySize: 2,
        },
        options: candidates.map((place, index) => ({
          id: `opt-${place.id}`,
          place,
          scoreBand: 'HIGH',
          explanationCodes: ['Gợi ý mới', 'Đang mở'],
          constraintsSatisfied: ['BUDGET', 'PARTY_SIZE'],
          rank: index + 1,
        })),
        relaxationHints: [],
        ruleVersion: 'rec-v1.4',
        candidateSetVersion: 'cand-2026-09-hanoi-v2',
        expiresAt: new Date(Date.now() + 1800 * 1000).toISOString(),
      };
    }

    const response = await apiClient<ResourceResponse<RecommendationSession>>(
      `/recommendation-sessions/${sessionId}/regenerations`,
      {
        method: 'POST',
        idempotencyKey: generateIdempotencyKey('rec-regen'),
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  /**
   * PUT /api/v1/recommendation-sessions/{sessionId}/locks/{placeId}
   */
  async lockPlace(sessionId: UUID, placeId: UUID): Promise<RecommendationSession> {
    const response = await apiClient<ResourceResponse<RecommendationSession>>(
      `/recommendation-sessions/${sessionId}/locks/${placeId}`,
      { method: 'PUT' }
    );
    return response.data;
  },

  /**
   * DELETE /api/v1/recommendation-sessions/{sessionId}/locks/{placeId}
   */
  async unlockPlace(sessionId: UUID, placeId: UUID): Promise<RecommendationSession> {
    const response = await apiClient<ResourceResponse<RecommendationSession>>(
      `/recommendation-sessions/${sessionId}/locks/${placeId}`,
      { method: 'DELETE' }
    );
    return response.data;
  },

  /**
   * PUT /api/v1/recommendation-sessions/{sessionId}/hidden/{placeId}
   */
  async hidePlace(sessionId: UUID, placeId: UUID): Promise<void> {
    await apiClient<void>(`/recommendation-sessions/${sessionId}/hidden/${placeId}`, {
      method: 'PUT',
    });
  },

  /**
   * POST /api/v1/recommendation-sessions/{sessionId}/acceptances
   */
  async acceptRecommendation(
    sessionId: UUID,
    payload: RecommendationAcceptanceCreate
  ): Promise<RecommendationAcceptance> {
    const response = await apiClient<ResourceResponse<RecommendationAcceptance>>(
      `/recommendation-sessions/${sessionId}/acceptances`,
      {
        method: 'POST',
        idempotencyKey: generateIdempotencyKey('rec-accept'),
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },
};
