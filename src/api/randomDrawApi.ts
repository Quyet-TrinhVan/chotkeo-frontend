/**
 * Random Draw API Service
 * Section 3.5 & 4.2 of FE_API_INTEGRATION_GUIDE.md
 */

import { apiClient, generateIdempotencyKey, USE_MOCKS } from './client';
import {
  RandomDrawCreate,
  RandomDraw,
  RandomDrawRerollRequest,
  RandomAcceptanceCreate,
  RandomAcceptance,
  ResourceResponse,
  UUID,
} from '../types/api';
import { MOCK_PLACES } from './mockData';

export const randomDrawApi = {
  /**
   * POST /api/v1/random-draws
   */
  async createDraw(payload: RandomDrawCreate = {
    source: { type: 'PLACE_QUERY', query: {} },
    constraints: {
      plannedAt: null,
      partySize: null,
      budgetPerPerson: null,
      styleIds: [],
      hardConstraints: [],
    },
    excludedPlaceIds: [],
  }): Promise<RandomDraw> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 450));
      const pool = MOCK_PLACES.filter((p) => !payload.excludedPlaceIds?.includes(p.id));
      const chosenIndex = Math.floor(Math.random() * pool.length);
      const winner = pool[chosenIndex] || MOCK_PLACES[0];

      // Prepare 20 items for reel, placing the winning item at index 15
      const reel = [];
      for (let i = 0; i < 20; i++) {
        if (i === 15) {
          reel.push(winner.id);
        } else {
          reel.push(pool[i % pool.length].id);
        }
      }

      return {
        id: `draw-${Date.now()}`,
        status: 'COMMITTED',
        result: winner,
        poolSize: pool.length,
        poolVersion: 'pool-hanoi-v1.2',
        ruleVersion: 'random-v1.3',
        animationSpec: {
          version: '1',
          durationMs: 4000,
          itemIds: reel,
          resultIndex: 15,
          easingPreset: 'CSGO_REEL',
        },
        reduceMotionFallback: {
          mode: 'SHORT_REVEAL',
          durationMs: 400,
        },
        replacedDrawId: null,
        createdAt: new Date().toISOString(),
      };
    }

    const response = await apiClient<ResourceResponse<RandomDraw>>('/random-draws', {
      method: 'POST',
      idempotencyKey: generateIdempotencyKey('draw-create'),
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * GET /api/v1/random-draws/{drawId}
   */
  async getDraw(drawId: UUID): Promise<RandomDraw> {
    const response = await apiClient<ResourceResponse<RandomDraw>>(`/random-draws/${drawId}`, {
      method: 'GET',
    });
    return response.data;
  },

  /**
   * POST /api/v1/random-draws/{drawId}/rerolls
   */
  async reroll(drawId: UUID, payload: RandomDrawRerollRequest = {}): Promise<RandomDraw> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 400));
      const winner = MOCK_PLACES[Math.floor(Math.random() * MOCK_PLACES.length)];
      const reel = Array.from({ length: 20 }, (_, i) =>
        i === 15 ? winner.id : MOCK_PLACES[i % MOCK_PLACES.length].id
      );

      return {
        id: `draw-${Date.now()}`,
        status: 'COMMITTED',
        result: winner,
        poolSize: MOCK_PLACES.length,
        poolVersion: 'pool-hanoi-v1.2',
        ruleVersion: 'random-v1.3',
        animationSpec: {
          version: '1',
          durationMs: 3800,
          itemIds: reel,
          resultIndex: 15,
          easingPreset: 'CSGO_REEL',
        },
        reduceMotionFallback: {
          mode: 'SHORT_REVEAL',
          durationMs: 400,
        },
        replacedDrawId: drawId,
        createdAt: new Date().toISOString(),
      };
    }

    const response = await apiClient<ResourceResponse<RandomDraw>>(
      `/random-draws/${drawId}/rerolls`,
      {
        method: 'POST',
        idempotencyKey: generateIdempotencyKey('draw-reroll'),
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  /**
   * POST /api/v1/random-draws/{drawId}/acceptances
   */
  async acceptDraw(drawId: UUID, payload: RandomAcceptanceCreate): Promise<RandomAcceptance> {
    const response = await apiClient<ResourceResponse<RandomAcceptance>>(
      `/random-draws/${drawId}/acceptances`,
      {
        method: 'POST',
        idempotencyKey: generateIdempotencyKey('draw-accept'),
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },
};
