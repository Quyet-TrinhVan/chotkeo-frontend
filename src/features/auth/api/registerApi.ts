/**
 * Register API Service
 * Handles POST /api/v1/auth/register
 */

import { authApi } from '../../../api/authApi';
import { RegisterRequest } from '../../../types/api';

export async function registerApi(payload: RegisterRequest): Promise<void> {
  return authApi.register(payload);
}
