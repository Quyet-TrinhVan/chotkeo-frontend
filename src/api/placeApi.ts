/**
 * Places, Discovery & Collections API Service
 * Section 3.3 of FE_API_INTEGRATION_GUIDE.md
 */

import { apiClient, generateIdempotencyKey, USE_MOCKS } from './client';
import {
  ListResponse,
  ResourceResponse,
  PlaceDetail,
  PlaceQuery,
  PlaceSummary,
  PlaceAvailability,
  DirectionOptions,
  SearchSuggestion,
  MapCluster,
  CollectionSummary,
  CollectionDetail,
  DiscoverySection,
  PlaceReportCreate,
  PlaceReport,
  UUID,
  DateTime,
} from '../types/api';
import { MOCK_PLACES, MOCK_PLACE_DETAILS, MOCK_SEARCH_SUGGESTIONS } from './mockData';

export const placeApi = {
  /**
   * GET /api/v1/places
   * Supports array query params with [] notation (categoryIds[], styleIds[])
   */
  async getPlaces(query: PlaceQuery = {}): Promise<{ places: PlaceSummary[]; hasNext: boolean; nextToken: string | null }> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 250));
      let filtered = [...MOCK_PLACES];

      if (query.q) {
        const qLower = query.q.toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(qLower) ||
            p.category.label.toLowerCase().includes(qLower) ||
            p.styles?.some((s) => s.label.toLowerCase().includes(qLower))
        );
      }

      if (query.categoryIds && query.categoryIds.length > 0 && !query.categoryIds.includes('cat-all')) {
        filtered = filtered.filter((p) => query.categoryIds?.includes(p.category.id));
      }

      if (query.styleIds && query.styleIds.length > 0) {
        filtered = filtered.filter((p) =>
          p.styles?.some((s) => query.styleIds?.includes(s.id))
        );
      }

      if (query.priceMax) {
        filtered = filtered.filter((p) => p.priceRange.maxAmount <= (query.priceMax || 999999999));
      }

      return {
        places: filtered,
        hasNext: false,
        nextToken: null,
      };
    }

    const response = await apiClient<ListResponse<PlaceSummary>>('/places', {
      method: 'GET',
      params: {
        q: query.q,
        'categoryIds[]': query.categoryIds,
        'styleIds[]': query.styleIds,
        priceMin: query.priceMin,
        priceMax: query.priceMax,
        openAt: query.openAt,
        lat: query.lat,
        lng: query.lng,
        radiusMeters: query.radiusMeters,
        sort: query.sort,
        pageSize: query.pageSize || 20,
        pageToken: query.pageToken,
      },
    });

    return {
      places: response.data || [],
      hasNext: response.page?.hasNext ?? false,
      nextToken: response.page?.nextToken ?? null,
    };
  },

  /**
   * GET /api/v1/places/{placeId}
   */
  async getPlaceDetail(placeId: UUID, ifNoneMatch?: string): Promise<PlaceDetail> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 200));
      const detail = MOCK_PLACE_DETAILS[placeId];
      if (detail) return detail;

      const summary = MOCK_PLACES.find((p) => p.id === placeId) || MOCK_PLACES[0];
      return {
        summary,
        address: {
          displayAddress: `${summary.name}, Hà Nội`,
          normalizedAddress: `${summary.name}, Ha Noi`,
        },
        openingHours: {
          timeZone: 'Asia/Ho_Chi_Minh',
          weeklyPeriods: [
            { dayOfWeek: 1, opensAt: '07:00', closesAt: '22:30' },
            { dayOfWeek: 2, opensAt: '07:00', closesAt: '22:30' },
            { dayOfWeek: 3, opensAt: '07:00', closesAt: '22:30' },
            { dayOfWeek: 4, opensAt: '07:00', closesAt: '22:30' },
            { dayOfWeek: 5, opensAt: '07:00', closesAt: '23:00' },
            { dayOfWeek: 6, opensAt: '07:00', closesAt: '23:00' },
            { dayOfWeek: 7, opensAt: '07:00', closesAt: '23:00' },
          ],
          verifiedAt: '2026-09-20T08:00:00Z',
        },
        contact: {
          phone: '0912 345 678',
          website: 'https://chotkeo.vn',
        },
        amenities: [
          { id: 'amen-1', code: 'wifi', label: 'Wifi miễn phí' },
          { id: 'amen-2', code: 'ac', label: 'Điều hòa mát mẻ' },
          { id: 'amen-3', code: 'parking', label: 'Chỗ gửi xe' },
        ],
        dietaryOptions: [],
        media: [],
        sources: [{ source: 'CHOT_KEO', attribution: null, license: null }],
        bookingOptions: [],
        availableActions: ['DIRECTIONS', 'ADD_TO_ROOM', 'RANDOM_DRAW', 'SHARE'],
      };
    }

    const response = await apiClient<ResourceResponse<PlaceDetail>>(`/places/${placeId}`, {
      method: 'GET',
      ifNoneMatch,
    });

    return response.data;
  },

  /**
   * GET /api/v1/places/{placeId}/availability
   */
  async getAvailability(placeId: UUID, at: DateTime, partySize?: number): Promise<PlaceAvailability> {
    if (USE_MOCKS) {
      return {
        placeId,
        at,
        timeZone: 'Asia/Ho_Chi_Minh',
        openState: 'OPEN',
        nextTransitionAt: new Date(Date.now() + 3600 * 1000 * 4).toISOString(),
      };
    }

    const response = await apiClient<ResourceResponse<PlaceAvailability>>(`/places/${placeId}/availability`, {
      method: 'GET',
      params: { at, partySize },
    });
    return response.data;
  },

  /**
   * GET /api/v1/places/{placeId}/directions
   */
  async getDirections(
    placeId: UUID,
    mode: 'DRIVING' | 'WALKING' = 'DRIVING',
    fromLat?: number,
    fromLng?: number
  ): Promise<DirectionOptions> {
    if (USE_MOCKS) {
      return {
        placeId,
        mode,
        destination: { type: 'Point', coordinates: [105.85, 21.03] },
        deepLink: `https://maps.google.com/?q=${placeId}`,
        estimate: { distanceMeters: 1200, durationSeconds: 480 },
      };
    }

    const response = await apiClient<ResourceResponse<DirectionOptions>>(`/places/${placeId}/directions`, {
      method: 'GET',
      params: { mode, fromLat, fromLng },
    });
    return response.data;
  },

  /**
   * GET /api/v1/place-search/suggestions
   */
  async getSearchSuggestions(q: string, lat?: number, lng?: number, limit = 10): Promise<SearchSuggestion[]> {
    if (!q || q.trim().length === 0) return [];

    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 120));
      const qLower = q.toLowerCase();
      return MOCK_SEARCH_SUGGESTIONS.filter((s) =>
        s.text.toLowerCase().includes(qLower) || s.normalizedText.includes(qLower)
      );
    }

    const response = await apiClient<ResourceResponse<SearchSuggestion[]>>('/place-search/suggestions', {
      method: 'GET',
      params: { q, lat, lng, limit },
    });
    return response.data || [];
  },

  /**
   * GET /api/v1/place-map/clusters
   */
  async getMapClusters(bbox: string, zoom: number, filters?: Record<string, any>): Promise<MapCluster[]> {
    if (USE_MOCKS) {
      return MOCK_PLACES.map((p) => ({
        type: 'PLACE',
        geometry: p.location,
        pointCount: 1,
        representativePlaceIds: [p.id],
      }));
    }

    const response = await apiClient<ResourceResponse<MapCluster[]>>('/place-map/clusters', {
      method: 'GET',
      params: { bbox, zoom, ...filters },
    });
    return response.data || [];
  },

  /**
   * GET /api/v1/discovery/feed
   */
  async getDiscoveryFeed(context?: string, pageSize = 20, pageToken?: string): Promise<DiscoverySection[]> {
    if (USE_MOCKS) {
      return [
        {
          id: 'nearby',
          type: 'PLACE_LIST',
          title: 'Gần bạn',
          places: MOCK_PLACES.filter((p) => (p.distanceMeters || 0) < 1500),
        },
        {
          id: 'open',
          type: 'PLACE_LIST',
          title: 'Đang mở cửa ngay',
          places: MOCK_PLACES.filter((p) => p.openState === 'OPEN'),
        },
        {
          id: 'coffee',
          type: 'PLACE_LIST',
          title: 'Cafe góc quen',
          places: MOCK_PLACES.filter((p) => p.category.code === 'coffee'),
        },
        {
          id: 'budget',
          type: 'PLACE_LIST',
          title: 'Ăn ngon dưới 150K',
          places: MOCK_PLACES.filter((p) => p.priceRange.maxAmount <= 150000),
        },
      ];
    }

    const response = await apiClient<ListResponse<DiscoverySection>>('/discovery/feed', {
      method: 'GET',
      params: { context, pageSize, pageToken },
    });
    return response.data || [];
  },

  /**
   * GET /api/v1/collections
   */
  async getCollections(theme?: string, context?: string): Promise<CollectionSummary[]> {
    if (USE_MOCKS) {
      return [
        {
          id: 'col-weekend-hanoi',
          title: 'Chill cuối tuần Hồ Tây & Phố Cổ',
          description: '12 địa điểm cafe & quán ăn gió lộng lý tưởng để hẹn hò',
          theme: 'WEEKEND',
          coverMedia: null,
          effectiveAt: '2026-09-20T00:00:00Z',
          expiresAt: null,
        },
      ];
    }

    const response = await apiClient<ListResponse<CollectionSummary>>('/collections', {
      method: 'GET',
      params: { theme, context },
    });
    return response.data || [];
  },

  /**
   * GET /api/v1/collections/{collectionId}
   */
  async getCollectionDetail(collectionId: UUID): Promise<CollectionDetail> {
    const response = await apiClient<ResourceResponse<CollectionDetail>>(`/collections/${collectionId}`, {
      method: 'GET',
    });
    return response.data;
  },

  /**
   * POST /api/v1/place-reports
   */
  async reportPlace(payload: PlaceReportCreate): Promise<PlaceReport> {
    const response = await apiClient<ResourceResponse<PlaceReport>>('/place-reports', {
      method: 'POST',
      idempotencyKey: generateIdempotencyKey('report'),
      body: JSON.stringify(payload),
    });
    return response.data;
  },
};
