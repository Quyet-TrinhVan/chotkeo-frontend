import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { RouterProvider, useRouter } from '../src/navigation/router';
import { TabsLayout, TabKey } from './(app)/(tabs)/_layout';
import HomeScreen from './(app)/(tabs)/index';
import SearchScreen from './(app)/(tabs)/search';
import RoomsScreen from './(app)/(tabs)/rooms/index';
import ProfileScreen from './(app)/(tabs)/profile';
import LoginScreen from './(auth)/login';
import RegisterScreen from './(auth)/register';
import PlaceDetailScreen from './places/[placeId]';
import RecommendationCreateScreen from './recommendation/create';
import RandomDrawScreen from './random-draw/create';
import CreateRoomScreen from './rooms/create';
import RoomDetailScreen from './rooms/[roomId]';
import { colors } from '../src/theme/tokens';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppNavigator() {
  const { pathname, params, push, replace, back } = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('index');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  useEffect(() => {
    if (pathname === '/search' || pathname === '/(app)/(tabs)/search') {
      setActiveTab('search');
    } else if (pathname === '/rooms' || pathname === '/(app)/(tabs)/rooms') {
      setActiveTab('rooms');
    } else if (pathname === '/profile' || pathname === '/(app)/(tabs)/profile') {
      setActiveTab('profile');
    } else if (pathname === '/' || pathname === '/index' || pathname === '/(app)/(tabs)/index') {
      setActiveTab('index');
    }
  }, [pathname]);

  // Auth routes (never unmounted during submit or loading)
  if (pathname === '/(auth)/login') {
    return <LoginScreen />;
  }
  if (pathname === '/(auth)/register') {
    return <RegisterScreen />;
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Route routing logic
  if (!isAuthenticated && !pathname.startsWith('/(auth)')) {
    return <LoginScreen />;
  }

  // Nested modal / detail routes
  if (pathname.startsWith('/places/')) {
    const id = pathname.replace('/places/', '') || selectedPlaceId;
    return <PlaceDetailScreen placeId={id} onBack={back} />;
  }

  if (pathname === '/recommendation/create') {
    return <RecommendationCreateScreen />;
  }

  if (pathname === '/random-draw/create') {
    return <RandomDrawScreen />;
  }

  if (pathname === '/rooms/create') {
    return <CreateRoomScreen />;
  }

  if (pathname.startsWith('/rooms/') && pathname !== '/(app)/(tabs)/rooms') {
    const id = pathname.replace('/rooms/', '') || selectedRoomId;
    return <RoomDetailScreen roomId={id} onBack={back} />;
  }

  // Main 4 Bottom Tabs
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  return (
    <TabsLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === 'index' && (
        <HomeScreen
          onSelectPlace={(id) => {
            setSelectedPlaceId(id);
            push(`/places/${id}`);
          }}
        />
      )}
      {activeTab === 'search' && (
        <SearchScreen
          onSelectPlace={(id) => {
            setSelectedPlaceId(id);
            push(`/places/${id}`);
          }}
        />
      )}
      {activeTab === 'rooms' && (
        <RoomsScreen
          onSelectRoom={(id) => {
            setSelectedRoomId(id);
            push(`/rooms/${id}`);
          }}
          onCreateRoom={() => push('/rooms/create')}
        />
      )}
      {activeTab === 'profile' && <ProfileScreen />}
    </TabsLayout>
  );
}

function NavigationWrapper() {
  const { pathname } = useRouter();
  const isAuth = pathname.startsWith('/(auth)');
  return (
    <View style={[styles.rootContainer, isAuth && { backgroundColor: '#FFFFFF' }]}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={[styles.safeArea, isAuth && { backgroundColor: '#FFFFFF' }]}>
        <AppNavigator />
      </SafeAreaView>
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider>
        <AuthProvider>
          <NavigationWrapper />
        </AuthProvider>
      </RouterProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
