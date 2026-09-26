/**
 * System, Bootstrap, Taxonomy & Policies API Service
 * Section 3.7 & 7.1 of FE_API_INTEGRATION_GUIDE.md
 */

import { Platform } from 'react-native';
import { apiClient } from './client';
import {
  BootstrapData,
  Taxonomy,
  ClientPolicy,
  ClientFeatureFlag,
  ResourceResponse,
} from '../types/api';

export const systemApi = {
  /**
   * GET /api/v1/bootstrap (Section 7.1 Startup step 1)
   */
  async getBootstrap(): Promise<BootstrapData> {
    const platform = Platform.select({
      ios: 'IOS',
      android: 'ANDROID',
      default: 'WEB',
    });

    const response = await apiClient<ResourceResponse<BootstrapData>>('/bootstrap', {
      method: 'GET',
      skipAuth: true,
      params: {
        platform,
        appVersion: '1.0.0',
        locale: 'vi-VN',
      },
    });

    return response.data;
  },

  /**
   * GET /api/v1/taxonomies
   */
  async getTaxonomies(keys?: string[]): Promise<Taxonomy[]> {
    const response = await apiClient<ResourceResponse<Taxonomy[]>>('/taxonomies', {
      method: 'GET',
      skipAuth: true,
      params: {
        'keys[]': keys,
        locale: 'vi-VN',
      },
    });

    return response.data || [];
  },

  /**
   * GET /api/v1/client-policies
   */
  async getClientPolicy(): Promise<ClientPolicy> {
    const platform = Platform.select({
      ios: 'IOS',
      android: 'ANDROID',
      default: 'WEB',
    });

    const response = await apiClient<ResourceResponse<ClientPolicy>>('/client-policies', {
      method: 'GET',
      skipAuth: true,
      params: {
        platform,
        appVersion: '1.0.0',
      },
    });

    return response.data;
  },

  /**
   * GET /api/v1/feature-flags
   */
  async getFeatureFlags(keys?: string[]): Promise<ClientFeatureFlag[]> {
    const response = await apiClient<ResourceResponse<ClientFeatureFlag[]>>('/feature-flags', {
      method: 'GET',
      params: {
        'keys[]': keys,
      },
    });

    return response.data || [];
  },
};
