/**
 * Authentication State Management
 * Follows Section 3.1 & 7.1 of FE_API_INTEGRATION_GUIDE.md
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, RegisterRequest } from '../types/api';
import { authApi } from '../api/authApi';
import { secureStorage } from '../utils/storage';
import { MOCK_USER } from '../api/mockData';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(MOCK_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
        const hasLoggedOut = await secureStorage.getItemAsync('userLoggedOut');
        if (hasLoggedOut === 'true') {
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
          return;
        }

        const token = await secureStorage.getItemAsync('accessToken');
        if (token && !token.startsWith('mock-')) {
          try {
            const me = await authApi.getMe();
            if (isMounted) {
              setUser(me);
              setIsAuthenticated(true);
            }
            return;
          } catch {
            // Token expired or invalid, clear invalid credentials
            await secureStorage.deleteItemAsync('accessToken');
            await secureStorage.deleteItemAsync('refreshToken');
            await secureStorage.deleteItemAsync('currentUser');
          }
        }

        // Auto login demo account so backend queries work seamlessly
        try {
          await authApi.login({ username: 'chotkeo_demo', password: 'Password123!' });
          const me = await authApi.getMe();
          if (isMounted) {
            setUser(me);
            setIsAuthenticated(true);
          }
        } catch (loginErr) {
          console.warn('[AuthContext] Demo auto-login failed, falling back to mock:', loginErr);
          if (isMounted) {
            setUser(MOCK_USER);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.warn('[AuthContext] initAuth error:', err);
        if (isMounted) {
          setUser(MOCK_USER);
          setIsAuthenticated(true);
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
      const session = await authApi.login({ username, password });
      try {
        const profile = await authApi.getMe();
        setUser(profile);
      } catch {
        setUser({
          ...MOCK_USER,
          id: session?.actor?.id || MOCK_USER.id,
          displayName: username || MOCK_USER.displayName,
        });
      }
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
