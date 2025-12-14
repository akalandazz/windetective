'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextType, AuthState, UserInfo, SignupRequest } from '@/lib/types';
import { apiClient } from '@/lib/api/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Store the refresh timeout ID
  const [refreshTimeoutId, setRefreshTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Refresh access token using httpOnly refresh token cookie
  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await apiClient.refreshToken();
      setState(prev => ({
        ...prev,
        accessToken: response.access_token,
        isAuthenticated: true,
      }));

      // Fetch user info
      const userInfo = await apiClient.getCurrentUser(response.access_token);
      setState(prev => ({
        ...prev,
        user: userInfo,
      }));

      // Schedule token refresh before expiration
      scheduleTokenRefresh(response.expires_in);
    } catch (error) {
      setState(prev => ({
        ...prev,
        user: null,
        accessToken: null,
        isAuthenticated: false,
      }));
      throw error;
    }
  }, []);

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback((expiresIn: number) => {
    // Clear any existing refresh timeout
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
    }

    // Refresh 1 minute before expiration (or half the expiration time, whichever is shorter)
    const refreshTime = Math.max((expiresIn - 60) * 1000, (expiresIn / 2) * 1000);

    const timeoutId = setTimeout(async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Auto refresh failed:', error);
        // Logout on refresh failure
        await logout();
      }
    }, refreshTime);

    setRefreshTimeoutId(timeoutId);
  }, [refreshTimeoutId]);

  // Initialize: try to refresh token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.log('No valid session found');
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeoutId) {
        clearTimeout(refreshTimeoutId);
      }
    };
  }, []); // Only run on mount

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.login({ email, password });

    setState(prev => ({
      ...prev,
      accessToken: response.access_token,
      isAuthenticated: true,
    }));

    // Fetch user info
    const userInfo = await apiClient.getCurrentUser(response.access_token);
    setState(prev => ({
      ...prev,
      user: userInfo,
    }));

    // Schedule token refresh
    scheduleTokenRefresh(response.expires_in);
  }, [scheduleTokenRefresh]);

  const signup = useCallback(async (data: SignupRequest) => {
    const response = await apiClient.signup(data);

    setState(prev => ({
      ...prev,
      accessToken: response.access_token,
      isAuthenticated: true,
    }));

    // Fetch user info
    const userInfo = await apiClient.getCurrentUser(response.access_token);
    setState(prev => ({
      ...prev,
      user: userInfo,
    }));

    // Schedule token refresh
    scheduleTokenRefresh(response.expires_in);
  }, [scheduleTokenRefresh]);

  const logout = useCallback(async () => {
    // Clear refresh timeout
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
      setRefreshTimeoutId(null);
    }

    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [refreshTimeoutId]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
