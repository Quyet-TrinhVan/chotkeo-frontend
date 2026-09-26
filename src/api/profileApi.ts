/**
 * User Profile API Service
 * Wraps and standardizes user profile queries and mutations
 */

import { authApi } from './authApi';
import { UserProfile, UserProfilePatch } from '../types/api';

export const profileApi = {
  /**
   * GET /api/v1/me
   */
  async getProfile(ifNoneMatch?: string): Promise<UserProfile> {
    return authApi.getMe(ifNoneMatch);
  },

  /**
   * PATCH /api/v1/me
   */
  async updateProfile(patch: UserProfilePatch, ifMatch: string): Promise<UserProfile> {
    return authApi.updateMe(patch, ifMatch);
  },
};
