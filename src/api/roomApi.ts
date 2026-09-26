/**
 * Room API Service
 * Section 3.6 & 4.3 of FE_API_INTEGRATION_GUIDE.md
 */

import { apiClient, generateIdempotencyKey, USE_MOCKS } from './client';
import {
  Room,
  RoomStatus,
  RoomCreate,
  RoomPatch,
  RoomOpen,
  RoomClose,
  RoomCancel,
  RoomExtension,
  RoomJoinCreate,
  RoomJoinResult,
  RoomOptionCreate,
  RoomOption,
  RoomShareLinkCreate,
  RoomShareLink,
  Ballot,
  Vote,
  VoteWrite,
  VoteSummary,
  RoomListItem,
  RoomResultData,
  RoomResultViewData,
  RoomParticipantListItem,
  ListResponse,
  ResourceResponse,
  UUID,
} from '../types/api';
import { MOCK_ROOMS, MOCK_PLACES } from './mockData';

export const roomApi = {
  /**
   * GET /api/v1/rooms
   */
  async getRooms(params: {
    status?: RoomStatus[];
    role?: 'OWNER' | 'MEMBER';
    pageToken?: string;
    pageSize?: number;
  } = {}): Promise<{ rooms: RoomListItem[]; hasNext: boolean; nextToken: string | null }> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 200));
      let filtered = [...MOCK_ROOMS];
      if (params.status && params.status.length > 0) {
        filtered = filtered.filter((r) => params.status?.includes(r.status));
      }
      return {
        rooms: filtered.map((r) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          closesAt: r.closesAt,
          roomVersion: r.roomVersion,
          votingRoundVersion: r.votingRoundVersion,
          options: r.options,
          optionCount: r.options.length,
          participantCount: r.participantCount || 4,
          role: 'OWNER',
          availableActions: r.availableActions,
        })),
        hasNext: false,
        nextToken: null,
      };
    }

    const response = await apiClient<ListResponse<RoomListItem>>('/rooms', {
      method: 'GET',
      params: {
        'status[]': params.status,
        role: params.role,
        pageToken: params.pageToken,
        pageSize: params.pageSize,
      },
    });

    return {
      rooms: response.data || [],
      hasNext: response.page?.hasNext ?? false,
      nextToken: response.page?.nextToken ?? null,
    };
  },

  /**
   * GET /api/v1/rooms/{roomId}
   */
  async getRoom(roomId: UUID): Promise<Room & { _etag?: string }> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 150));
      const found = MOCK_ROOMS.find((r) => r.id === roomId) || MOCK_ROOMS[0];
      return { ...found, _etag: `"room-${found.id}-v${found.roomVersion}"` };
    }

    const response = await apiClient<ResourceResponse<Room>>(`/rooms/${roomId}`, {
      method: 'GET',
    });
    return { ...response.data, _etag: (response as any)._etag };
  },

  /**
   * POST /api/v1/rooms
   */
  async createRoom(payload: RoomCreate): Promise<Room> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 400));
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        ownerActorId: '0199f2b8-4b1d-7a31-9c68-934e08e501ab',
        status: 'DRAFT',
        title: payload.title || 'Kèo đi chơi mới',
        options: payload.options.map((opt, index) => {
          const place = MOCK_PLACES.find((p) => p.id === opt.placeId) || MOCK_PLACES[0];
          return {
            id: `opt-${Date.now()}-${index}`,
            placeSnapshot: place,
            sourceType: payload.optionSource.type,
            addedBy: '0199f2b8-4b1d-7a31-9c68-934e08e501ab',
            position: index + 1,
          };
        }),
        votingRule: payload.votingRule,
        privacyMode: 'AGGREGATE',
        closesAt: payload.closesAt || null,
        votingRoundVersion: 1,
        roomVersion: 1,
        participantCount: 1,
        availableActions: ['OPEN', 'EDIT', 'ADD_OPTION', 'DELETE', 'SHARE'],
      };
      MOCK_ROOMS.unshift(newRoom);
      return newRoom;
    }

    const response = await apiClient<ResourceResponse<Room>>('/rooms', {
      method: 'POST',
      idempotencyKey: generateIdempotencyKey('room-create'),
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * PATCH /api/v1/rooms/{roomId}
   * Content-Type: application/merge-patch+json (Section 2.1 & 6.6)
   */
  async patchRoom(roomId: UUID, patch: RoomPatch, ifMatch: string): Promise<Room> {
    if (USE_MOCKS) {
      const room = await roomApi.getRoom(roomId);
      const updated: Room = {
        ...room,
        ...patch,
        privacyMode: 'AGGREGATE',
        votingRule: (patch.votingRule ?? room.votingRule) as any,
        roomVersion: room.roomVersion + 1,
      };
      return updated;
    }

    const response = await apiClient<ResourceResponse<Room>>(`/rooms/${roomId}`, {
      method: 'PATCH',
      isMergePatch: true,
      ifMatch,
      body: JSON.stringify(patch),
    });
    return response.data;
  },

  /**
   * DELETE /api/v1/rooms/{roomId}
   */
  async deleteRoom(roomId: UUID, ifMatch: string): Promise<void> {
    await apiClient<void>(`/rooms/${roomId}`, {
      method: 'DELETE',
      ifMatch,
    });
  },

  /**
   * POST /api/v1/room-joins
   */
  async joinRoom(payload: RoomJoinCreate): Promise<RoomJoinResult> {
    const response = await apiClient<ResourceResponse<RoomJoinResult>>('/room-joins', {
      method: 'POST',
      idempotencyKey: generateIdempotencyKey('room-join'),
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * POST /api/v1/rooms/{roomId}/open
   */
  async openRoom(roomId: UUID, payload: RoomOpen = {}): Promise<Room> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 250));
      const room = MOCK_ROOMS.find((r) => r.id === roomId);
      if (room) {
        room.status = 'OPEN';
        room.roomVersion += 1;
        room.availableActions = ['VOTE', 'SHARE', 'EXTEND', 'CLOSE', 'CANCEL'];
      }
      return room || MOCK_ROOMS[0];
    }

    const response = await apiClient<ResourceResponse<Room>>(`/rooms/${roomId}/open`, {
      method: 'POST',
      idempotencyKey: generateIdempotencyKey('room-open'),
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * POST /api/v1/rooms/{roomId}/close
   */
  async closeRoom(roomId: UUID, payload: RoomClose): Promise<RoomResultData> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 300));
      const room = await roomApi.getRoom(roomId);
      room.status = 'CLOSED';
      return {
        id: `res-${Date.now()}`,
        roomId,
        winnerOptionId: room.options[0]?.id || 'opt-1',
        ranking: room.options.map((opt, i) => ({
          optionId: opt.id,
          rank: i + 1,
          choiceCount: i === 0 ? 4 : 1,
          vetoCount: 0,
        })),
        tieBreakTrace: null,
        resultVersion: 1,
        closedAt: new Date().toISOString(),
        closedBy: 'OWNER',
      };
    }

    const response = await apiClient<ResourceResponse<RoomResultData>>(`/rooms/${roomId}/close`, {
      method: 'POST',
      idempotencyKey: generateIdempotencyKey('room-close'),
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * POST /api/v1/rooms/{roomId}/cancel
   */
  async cancelRoom(roomId: UUID, reasonCode = 'USER_CANCELLED'): Promise<Room> {
    const response = await apiClient<ResourceResponse<Room>>(`/rooms/${roomId}/cancel`, {
      method: 'POST',
      idempotencyKey: generateIdempotencyKey('room-cancel'),
      body: JSON.stringify({ reasonCode }),
    });
    return response.data;
  },

  /**
   * POST /api/v1/rooms/{roomId}/extensions
   */
  async extendRoom(roomId: UUID, payload: RoomExtension): Promise<Room> {
    const response = await apiClient<ResourceResponse<Room>>(`/rooms/${roomId}/extensions`, {
      method: 'POST',
      idempotencyKey: generateIdempotencyKey('room-extend'),
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * GET /api/v1/rooms/{roomId}/ballot
   */
  async getBallot(roomId: UUID): Promise<Ballot> {
    if (USE_MOCKS) {
      const room = await roomApi.getRoom(roomId);
      return {
        roomId,
        ballotVersion: room.votingRoundVersion,
        options: room.options,
        votingRule: room.votingRule,
        closesAt: room.closesAt,
        currentVote: null,
      };
    }

    const response = await apiClient<ResourceResponse<Ballot>>(`/rooms/${roomId}/ballot`, {
      method: 'GET',
    });
    return response.data;
  },

  /**
   * PUT /api/v1/rooms/{roomId}/votes/me
   * Note: optionIds MUST be RoomOption IDs (Section 3.6 & 6.5)
   */
  async submitVote(roomId: UUID, payload: VoteWrite): Promise<Vote> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 300));
      return {
        id: `vote-${Date.now()}`,
        roomId,
        participantId: '0199f2b8-4b1d-7a31-9c68-934e08e501ab',
        optionIds: payload.optionIds,
        vetoOptionIds: payload.vetoOptionIds || [],
        ballotVersion: payload.ballotVersion,
        submittedAt: new Date().toISOString(),
        version: 1,
      };
    }

    const response = await apiClient<ResourceResponse<Vote>>(`/rooms/${roomId}/votes/me`, {
      method: 'PUT',
      idempotencyKey: generateIdempotencyKey('room-vote'),
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * DELETE /api/v1/rooms/{roomId}/votes/me
   */
  async deleteVote(roomId: UUID, ballotVersion: number): Promise<void> {
    await apiClient<void>(`/rooms/${roomId}/votes/me`, {
      method: 'DELETE',
      params: { ballotVersion },
      idempotencyKey: generateIdempotencyKey('room-unvote'),
    });
  },

  /**
   * GET /api/v1/rooms/{roomId}/vote-summary
   */
  async getVoteSummary(roomId: UUID): Promise<VoteSummary> {
    if (USE_MOCKS) {
      const room = await roomApi.getRoom(roomId);
      return {
        roomId,
        ballotVersion: room.votingRoundVersion,
        eligibleCount: 5,
        submittedCount: 4,
        optionAggregates: room.options.map((opt, i) => ({
          optionId: opt.id,
          choiceCount: i === 0 ? 3 : 1,
          vetoCount: 0,
        })),
      };
    }

    const response = await apiClient<ResourceResponse<VoteSummary>>(`/rooms/${roomId}/vote-summary`, {
      method: 'GET',
    });
    return response.data;
  },

  /**
   * GET /api/v1/rooms/{roomId}/result (Section 5.5)
   */
  async getResult(roomId: UUID): Promise<RoomResultViewData> {
    if (USE_MOCKS) {
      const room = await roomApi.getRoom(roomId);
      return {
        id: `res-${Date.now()}`,
        roomId,
        winner: room.options[0],
        ranking: room.options.map((opt, i) => ({
          optionId: opt.id,
          rank: i + 1,
          choiceCount: i === 0 ? 4 : 1,
          vetoCount: 0,
        })),
        tieBreakTrace: null,
        resultVersion: 1,
        closedAt: new Date().toISOString(),
        closedBy: 'OWNER',
        availableActions: ['DIRECTIONS', 'SHARE'],
      };
    }

    const response = await apiClient<ResourceResponse<RoomResultViewData>>(`/rooms/${roomId}/result`, {
      method: 'GET',
    });
    return response.data;
  },

  /**
   * GET /api/v1/rooms/{roomId}/participants
   */
  async getParticipants(roomId: UUID, pageToken?: string): Promise<RoomParticipantListItem[]> {
    if (USE_MOCKS) {
      return [
        {
          id: 'part-1',
          displayName: 'Bạn (Trưởng phòng)',
          role: 'OWNER',
          status: 'ACTIVE',
          joinedAt: '2026-09-20T10:00:00Z',
          canRemove: false,
        },
        {
          id: 'part-2',
          displayName: 'Minh Anh',
          role: 'MEMBER',
          status: 'ACTIVE',
          joinedAt: '2026-09-20T10:15:00Z',
          canRemove: true,
        },
      ];
    }

    const response = await apiClient<ListResponse<RoomParticipantListItem>>(
      `/rooms/${roomId}/participants`,
      {
        method: 'GET',
        params: { pageToken },
      }
    );
    return response.data || [];
  },

  /**
   * POST /api/v1/rooms/{roomId}/options
   */
  async addOption(roomId: UUID, payload: RoomOptionCreate): Promise<RoomOption> {
    const response = await apiClient<ResourceResponse<RoomOption>>(`/rooms/${roomId}/options`, {
      method: 'POST',
      idempotencyKey: generateIdempotencyKey('room-opt'),
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * DELETE /api/v1/rooms/{roomId}/options/{optionId}
   */
  async deleteOption(roomId: UUID, optionId: UUID, ifMatch: string): Promise<void> {
    await apiClient<void>(`/rooms/${roomId}/options/${optionId}`, {
      method: 'DELETE',
      ifMatch,
    });
  },

  /**
   * POST /api/v1/rooms/{roomId}/share-links
   */
  async createShareLink(roomId: UUID, payload: RoomShareLinkCreate = {}): Promise<RoomShareLink> {
    if (USE_MOCKS) {
      return {
        linkId: `link-${Date.now()}`,
        inviteToken: 'chotkeo-invite-token-mock-12345678901234567890',
        expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
        maxUses: null,
      };
    }

    const response = await apiClient<ResourceResponse<RoomShareLink>>(
      `/rooms/${roomId}/share-links`,
      {
        method: 'POST',
        idempotencyKey: generateIdempotencyKey('room-link'),
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },
};
