/**
 * Authentication State Management
 * Follows Section 3.1 & 7.1 of FE_API_INTEGRATION_GUIDE.md
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, RegisterRequest } from '../types/api';
import { authApi } from '../api/authApi';
import { secureStorage } from '../utils/storage';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authStatus: AuthStatus;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const authStatus: AuthStatus = isLoading
    ? 'loading'
    : isAuthenticated
    ? 'authenticated'
    : 'unauthenticated';

  const refreshProfile = async () => {
    try {
      const me = await authApi.getMe();
      if (me) {
        setUser(me);
        setIsAuthenticated(true);
      }
    } catch {
      // Keep current state on network failure
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        // Purge any legacy mock user data or mock tokens from local storage
        const cachedUser = await secureStorage.getItemAsync('currentUser');
        if (cachedUser && (cachedUser.includes('Minh Hoàng') || cachedUser.includes('mock-'))) {
          await secureStorage.deleteItemAsync('currentUser');
          await secureStorage.deleteItemAsync('accessToken');
          await secureStorage.deleteItemAsync('refreshToken');
        }

        const loggedOut = await secureStorage.getItemAsync('userLoggedOut');
        const token = await secureStorage.getItemAsync('accessToken');

        // If explicitly logged out or no token, or invalid mock token -> unauthenticated
        if (loggedOut === 'true' || !token || token.startsWith('mock-')) {
          await secureStorage.deleteItemAsync('accessToken');
          await secureStorage.deleteItemAsync('refreshToken');
          await secureStorage.deleteItemAsync('currentUser');
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
          return;
        }

        // Validate session with backend
        try {
          const me = await authApi.getMe();
          if (isMounted && me) {
            setUser(me);
            setIsAuthenticated(true);
            return;
          }
        } catch {
          // Token invalid or expired
          await secureStorage.deleteItemAsync('accessToken');
          await secureStorage.deleteItemAsync('refreshToken');
          await secureStorage.deleteItemAsync('currentUser');
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await secureStorage.deleteItemAsync('userLoggedOut');
      await authApi.login({ username, password });
      const profile = await authApi.getMe();
      setUser(profile);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterRequest) => {
    // Only call API; do not touch auth state or trigger screen remounting
    await authApi.register(payload);
    // Success: clear logged-out flag and auto login
    await secureStorage.deleteItemAsync('userLoggedOut');
    await login(payload.username, payload.password);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('[AuthContext] Logout API error:', err);
    } finally {
      await secureStorage.setItemAsync('userLoggedOut', 'true');
      await secureStorage.deleteItemAsync('accessToken');
      await secureStorage.deleteItemAsync('refreshToken');
      await secureStorage.deleteItemAsync('currentUser');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const updateDisplayName = async (name: string) => {
    if (!user) return;
    try {
      const etag = `"user-profile-${user.version}"`;
      const updated = await authApi.updateMe({ displayName: name }, etag);
      setUser(updated);
    } catch (err) {
      console.warn('[AuthContext] updateMe error, updating local state:', err);
      const updated: UserProfile = {
        ...user,
        displayName: name,
        version: (user.version || 0) + 1,
        updatedAt: new Date().toISOString(),
      };
      setUser(updated);
      await secureStorage.setItemAsync('currentUser', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authStatus,
        login,
        register,
        logout,
        updateDisplayName,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
