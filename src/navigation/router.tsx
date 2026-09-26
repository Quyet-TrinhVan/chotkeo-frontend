/**
 * Expo Router Navigation Abstraction
 * Provides useRouter, usePathname, useLocalSearchParams, Link, and Layout Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RouterContextType {
  pathname: string;
  params: Record<string, string>;
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  navigate: (href: string) => void;
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState<string>('/(app)/(tabs)');
  const [params, setParams] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>(['/(app)/(tabs)']);
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  const navigateTo = (href: string, replaceMode = false) => {
    // Parse query params if any
    const [pathPart, queryPart] = href.split('?');
    const newParams: Record<string, string> = {};
    if (queryPart) {
      const search = new URLSearchParams(queryPart);
      search.forEach((val, key) => {
        newParams[key] = val;
      });
    }

    setParams(newParams);
    setPathname(pathPart);

    if (replaceMode) {
      setHistory((prev) => [...prev.slice(0, -1), pathPart]);
    } else {
      setHistory((prev) => [...prev, pathPart]);
    }
  };

  const back = () => {
    if (history.length > 1) {
      const nextHistory = [...history];
      nextHistory.pop();
      const prevPath = nextHistory[nextHistory.length - 1];
      setHistory(nextHistory);
      setPathname(prevPath);
    } else {
      setPathname('/(app)/(tabs)');
    }
  };

  const toggleReduceMotion = () => {
    setReduceMotion((v) => !v);
  };

  return (
    <RouterContext.Provider
      value={{
        pathname,
        params,
        push: (href: string) => navigateTo(href, false),
        replace: (href: string) => navigateTo(href, true),
        navigate: (href: string) => navigateTo(href, false),
        back,
        reduceMotion,
        toggleReduceMotion,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export function usePathname() {
  const context = useContext(RouterContext);
  return context?.pathname || '/';
}

export function useLocalSearchParams<T extends Record<string, string>>(): T {
  const context = useContext(RouterContext);
  return (context?.params || {}) as T;
}
