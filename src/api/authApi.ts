/**
 * Auth & User Profile API Service
 * Section 3.1 & 4 of FE_API_INTEGRATION_GUIDE.md
 */

import { apiClient, generateIdempotencyKey, USE_MOCKS } from './client';
import {
  RegisterRequest,
  LoginRequest,
  SessionTokenPair,
  UserProfile,
  UserProfilePatch,
  ResourceResponse,
} from '../types/api';
import { secureStorage } from '../utils/storage';
import { MOCK_USER } from './mockData';

export const authApi = {
  /**
   * POST /api/v1/auth/login
   */
  async login(credentials: LoginRequest): Promise<SessionTokenPair> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 450));
      if (!credentials.username || !credentials.password) {
        throw new Error('Vui lòng nhập tài khoản và mật khẩu');
      }
      const mockSession: SessionTokenPair = {
        accessToken: `mock-jwt-token-${Date.now()}`,
        expiresIn: 3600,
        refreshToken: `mock-refresh-token-${Date.now()}`,
        refreshExpiresIn: 86400 * 30,
        tokenType: 'Bearer',
        actor: {
          id: MOCK_USER.id,
          type: 'USER',
          permissions: ['ROOM_CREATE', 'VOTE', 'RECOMMENDATION', 'RANDOM_DRAW'],
        },
      };
      await secureStorage.setItemAsync('accessToken', mockSession.accessToken);
      await secureStorage.setItemAsync('refreshToken', mockSession.refreshToken);
      await secureStorage.setItemAsync('currentUser', JSON.stringify(MOCK_USER));
      return mockSession;
    }

    const response = await apiClient<ResourceResponse<SessionTokenPair>>('/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify(credentials),
    });

    const session = response.data;
    await secureStorage.setItemAsync('accessToken', session.accessToken);
    await secureStorage.setItemAsync('refreshToken', session.refreshToken);
    return session;
  },

  /**
   * POST /api/v1/auth/register
   */
  async register(payload: RegisterRequest): Promise<void> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 500));
      if (payload.username === 'chotkeo_demo' || payload.username.toLowerCase().includes('duplicate_user')) {
        const { ApiError } = await import('./client');
        throw new ApiError({
          type: 'https://docs.chotkeo.vn/problems/duplicate-username',
          title: 'Tên đăng nhập đã tồn tại',
          status: 409,
          detail: 'Tên đăng nhập đã được sử dụng.',
          instance: '/api/v1/auth/register',
          code: 'USERNAME_ALREADY_EXISTS',
          requestId: 'mock-req-dup-user',
          retryable: false,
          errors: [
            {
              field: 'username',
              reason: 'DUPLICATE',
              message: 'Tên đăng nhập đã được sử dụng.',
            },
          ],
        });
      }
      if (payload.email.toLowerCase().includes('duplicate') || payload.email === 'demo@chotkeo.vn') {
        const { ApiError } = await import('./client');
        throw new ApiError({
          type: 'https://docs.chotkeo.vn/problems/duplicate-email',
          title: 'Email đã tồn tại',
          status: 409,
          detail: 'Email đã được sử dụng.',
          instance: '/api/v1/auth/register',
          code: 'EMAIL_ALREADY_EXISTS',
          requestId: 'mock-req-dup-email',
          retryable: false,
          errors: [
            {
              field: 'email',
              reason: 'DUPLICATE',
              message: 'Email đã được sử dụng.',
            },
          ],
        });
      }
      return;
    }

    await apiClient<ResourceResponse<Record<string, never>>>('/auth/register', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify(payload),
    });
  },

  /**
   * POST /api/v1/auth/tokens/refresh
   */
  async refreshToken(refreshToken: string): Promise<SessionTokenPair> {
    const response = await apiClient<ResourceResponse<SessionTokenPair>>('/auth/tokens/refresh', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ refreshToken }),
    });

    const session = response.data;
    await secureStorage.setItemAsync('accessToken', session.accessToken);
    if (session.refreshToken) {
      await secureStorage.setItemAsync('refreshToken', session.refreshToken);
    }
    return session;
  },

  /**
   * POST /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    const refreshToken = await secureStorage.getItemAsync('refreshToken');
    if (!USE_MOCKS && refreshToken) {
      try {
        await apiClient<void>('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // Idempotent logout
      }
    }
    await secureStorage.deleteItemAsync('accessToken');
    await secureStorage.deleteItemAsync('refreshToken');
    await secureStorage.deleteItemAsync('currentUser');
  },

  /**
   * GET /api/v1/me
   */
  async getMe(ifNoneMatch?: string): Promise<UserProfile> {
    if (USE_MOCKS) {
      const userJson = await secureStorage.getItemAsync('currentUser');
      if (userJson) {
        try {
          return JSON.parse(userJson);
        } catch {
          return MOCK_USER;
        }
      }
      return MOCK_USER;
    }

    const response = await apiClient<ResourceResponse<UserProfile>>('/me', {
      method: 'GET',
      ifNoneMatch,
    });

    if (response?.data) {
      await secureStorage.setItemAsync('currentUser', JSON.stringify(response.data));
      return response.data;
    }

    return MOCK_USER;
  },

  /**
   * PATCH /api/v1/me
   */
  async updateMe(patch: UserProfilePatch, ifMatch: string): Promise<UserProfile> {
    if (USE_MOCKS) {
      await new Promise((r) => setTimeout(r, 300));
      const current = await authApi.getMe();
      let newAvatar = current.avatar;
      if (patch.avatar !== undefined) {
        if (patch.avatar === null) {
          newAvatar = null;
        } else {
          newAvatar = {
            id: patch.avatar,
            status: 'READY',
            contentType: 'image/jpeg',
            sizeBytes: 150000,
            sha256: 'mock-sha256',
            renditions: [
              {
                kind: 'ORIGINAL',
                url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80&v=${Date.now()}`,
                expiresAt: new Date(Date.now() + 86400 * 30 * 1000).toISOString(),
              },
            ],
            moderationStatus: 'APPROVED',
          };
        }
      }
      const updated: UserProfile = {
        ...current,
        displayName: patch.displayName ?? current.displayName,
        avatar: newAvatar,
        version: (current.version || 1) + 1,
        updatedAt: new Date().toISOString(),
      };
      await secureStorage.setItemAsync('currentUser', JSON.stringify(updated));
      return updated;
    }

    const response = await apiClient<ResourceResponse<UserProfile>>('/me', {
      method: 'PATCH',
      ifMatch,
      body: JSON.stringify(patch),
    });

    await secureStorage.setItemAsync('currentUser', JSON.stringify(response.data));
    return response.data;
  },

  async getCurrentUser(): Promise<UserProfile> {
    const userJson = await secureStorage.getItemAsync('currentUser');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return MOCK_USER;
      }
    }
    return MOCK_USER;
  },
};
