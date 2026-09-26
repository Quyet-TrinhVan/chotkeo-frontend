/**
 * Chốt Kèo API Client Abstraction
 * Implements Section 2, 7 & 8 of FE_API_INTEGRATION_GUIDE.md
 */

import { Platform } from 'react-native';
import { ProblemDetail } from '../types/api';
import { secureStorage } from '../utils/storage';

export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:8000/api/v1';

export const USE_MOCKS =
  typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_USE_MOCKS === 'true';

export class ApiError extends Error {
  public problem: ProblemDetail;
  public status: number;
  public code: string;

  constructor(problem: ProblemDetail) {
    super(problem.detail || problem.title || 'Lỗi hệ thống');
    this.name = 'ApiError';
    this.problem = problem;
    this.status = problem.status;
    this.code = problem.code;
  }
}

export function generateUUID(): string {
  // Generate RFC4122 v4 UUID lowercase
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateIdempotencyKey(prefix = 'cmd'): string {
  return `${prefix}-${generateUUID()}`;
}

export interface RequestOptions extends RequestInit {
  idempotencyKey?: string;
  ifMatch?: string;
  ifNoneMatch?: string;
  isMergePatch?: boolean;
  params?: Record<string, string | number | boolean | Array<string | number> | undefined | null>;
  skipAuth?: boolean;
}

export interface ApiResponseWithMeta<T> {
  data: T;
  etag?: string | null;
  status: number;
}

// Mutex for token refresh serialization (Section 7.2)
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await secureStorage.getItemAsync('refreshToken');
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/tokens/refresh`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Request-Id': generateUUID(),
          'X-App-Version': '1.0.0',
          'X-Client-Platform': Platform.select({ ios: 'IOS', android: 'ANDROID', default: 'WEB' }),
          'X-Time-Zone': 'Asia/Ho_Chi_Minh',
          'Accept-Language': 'vi-VN',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await secureStorage.deleteItemAsync('accessToken');
        await secureStorage.deleteItemAsync('refreshToken');
        await secureStorage.deleteItemAsync('currentUser');
        return null;
      }

      const json = await response.json();
      const tokenPair = json.data;
      if (tokenPair?.accessToken) {
        await secureStorage.setItemAsync('accessToken', tokenPair.accessToken);
        if (tokenPair.refreshToken) {
          await secureStorage.setItemAsync('refreshToken', tokenPair.refreshToken);
        }
        return tokenPair.accessToken as string;
      }
      return null;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const token = await secureStorage.getItemAsync('accessToken');

  const clientPlatform = Platform.select({
    ios: 'IOS',
    android: 'ANDROID',
    default: 'WEB',
  });

  const contentType = options.isMergePatch
    ? 'application/merge-patch+json'
    : 'application/json';

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': contentType,
    'X-Request-Id': generateUUID(),
    'X-App-Version': '1.0.0',
    'X-Client-Platform': clientPlatform,
    'X-Time-Zone': 'Asia/Ho_Chi_Minh',
    'Accept-Language': 'vi-VN',
    ...(options.headers as Record<string, string>),
  };

  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  if (options.ifMatch) {
    headers['If-Match'] = options.ifMatch;
  }

  if (options.ifNoneMatch) {
    headers['If-None-Match'] = options.ifNoneMatch;
  }

  // Construct URL & query params with correct array [] formatting (Section 2.4)
  let url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        // Encode array keys with []
        const arrayKey = key.endsWith('[]') ? key : `${key}[]`;
        value.forEach((item) => {
          if (item !== undefined && item !== null) {
            searchParams.append(arrayKey, String(item));
          }
        });
      } else {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized with token refresh (Section 7.2)
  if (response.status === 401 && !isRetry && !options.skipAuth) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      return apiClient<T>(endpoint, options, true);
    }
  }

  // Section 2.2: 204 No Content & 304 Not Modified do NOT have a body. Never call response.json().
  if (response.status === 204 || response.status === 304) {
    return {} as T;
  }

  const etag = response.headers.get('ETag');
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const problem: ProblemDetail = json || {
      type: 'https://docs.chotkeo.vn/problems/unknown',
      title: 'Lỗi không xác định',
      status: response.status,
      detail: `Máy chủ phản hồi mã lỗi ${response.status}`,
      instance: endpoint,
      code: response.status === 404 ? 'RESOURCE_NOT_FOUND' : 'INTERNAL_ERROR',
      requestId: headers['X-Request-Id'] || generateUUID(),
      retryable: response.status >= 500,
    };
    throw new ApiError(problem);
  }

  // If caller requested raw envelope or data, return json
  if (etag && json && typeof json === 'object') {
    (json as any)._etag = etag;
  }

  return json as T;
}
