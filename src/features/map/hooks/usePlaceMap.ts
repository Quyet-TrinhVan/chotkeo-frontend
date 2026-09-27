import { useState, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { placeApi } from '../../../api/placeApi';
import { MapCluster, PlaceDetail } from '../../../types/api';
import { useMapViewport } from './useMapViewport';
import { MapArea, STANDARD_HANOI_AREAS, HANOI_DEFAULT_REGION } from '../types';

export interface MapFilters {
  categoryIds?: string[];
  styleIds?: string[];
  priceMin?: number;
  priceMax?: number;
  onlyOpen?: boolean;
  q?: string;
}

export interface UsePlaceMapOptions {
  filters?: MapFilters;
  onSelectPlace?: (placeId: string) => void;
}

export function usePlaceMap({ filters, onSelectPlace }: UsePlaceMapOptions = {}) {
  const mapRef = useRef<MapView | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('area-all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    region,
    debouncedRegion,
    bbox,
    zoom,
    isMoving,
    onRegionChange,
    onRegionChangeComplete,
    setViewport,
  } = useMapViewport({ initialRegion: HANOI_DEFAULT_REGION });

  // Query clusters from backend
  const clustersQuery = useQuery<MapCluster[]>({
    queryKey: ['place-map-clusters', bbox, zoom, filters],
    queryFn: async () => {
      const apiFilters: Record<string, any> = {};
      if (filters?.categoryIds && filters.categoryIds.length > 0 && !filters.categoryIds.includes('cat-all')) {
        apiFilters['categoryIds[]'] = filters.categoryIds;
      }
      if (filters?.styleIds && filters.styleIds.length > 0) {
        apiFilters['styleIds[]'] = filters.styleIds;
      }
      if (filters?.priceMin !== undefined) {
        apiFilters.priceMin = filters.priceMin;
      }
      if (filters?.priceMax !== undefined) {
        apiFilters.priceMax = filters.priceMax;
      }
      if (filters?.q) {
        apiFilters.q = filters.q;
      }
      return placeApi.getMapClusters(bbox, zoom, apiFilters);
    },
    staleTime: 1000 * 30, // 30s cache
  });

  // Query selected place detail for bottom preview card
  const placeDetailQuery = useQuery<PlaceDetail | null>({
    queryKey: ['map-place-detail', selectedPlaceId],
    queryFn: async () => {
      if (!selectedPlaceId) return null;
      try {
        return await placeApi.getPlaceDetail(selectedPlaceId);
      } catch (err) {
        console.warn('Failed to load place detail on map:', err);
        return null;
      }
    },
    enabled: !!selectedPlaceId,
  });

  // Tap on a cluster -> zoom in to its coordinates
  const handleClusterPress = useCallback(
    (cluster: MapCluster) => {
      const [lng, lat] = cluster.geometry.coordinates;
      const nextZoom = Math.min(zoom + 2, 20);
      const nextLngDelta = 360 / Math.pow(2, nextZoom);
      const nextLatDelta = nextLngDelta * 0.8;

      const targetRegion: Region = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: nextLatDelta,
        longitudeDelta: nextLngDelta,
      };

      mapRef.current?.animateToRegion(targetRegion, 350);
      setViewport(targetRegion);
    },
    [zoom, setViewport]
  );

  // Tap on an individual place marker
  const handleMarkerPress = useCallback(
    (placeId: string) => {
      setSelectedPlaceId(placeId);
      if (onSelectPlace) {
        onSelectPlace(placeId);
      }
    },
    [onSelectPlace]
  );

  const handleClosePreview = useCallback(() => {
    setSelectedPlaceId(null);
  }, []);

  // Area selection
  const handleSelectArea = useCallback(
    (area: MapArea) => {
      setSelectedAreaId(area.id);
      setSelectedPlaceId(null);
      mapRef.current?.animateToRegion(area.region, 500);
      setViewport(area.region);
    },
    [setViewport]
  );

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const nextLatDelta = Math.max(region.latitudeDelta / 2, 0.002);
    const nextLngDelta = Math.max(region.longitudeDelta / 2, 0.002);
    const targetRegion: Region = {
      ...region,
      latitudeDelta: nextLatDelta,
      longitudeDelta: nextLngDelta,
    };
    mapRef.current?.animateToRegion(targetRegion, 250);
    setViewport(targetRegion);
  }, [region, setViewport]);

  const handleZoomOut = useCallback(() => {
    const nextLatDelta = Math.min(region.latitudeDelta * 2, 1.0);
    const nextLngDelta = Math.min(region.longitudeDelta * 2, 1.0);
    const targetRegion: Region = {
      ...region,
      latitudeDelta: nextLatDelta,
      longitudeDelta: nextLngDelta,
    };
    mapRef.current?.animateToRegion(targetRegion, 250);
    setViewport(targetRegion);
  }, [region, setViewport]);

  // Current user location
  const handleLocateMe = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Không được cấp quyền vị trí.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userRegion: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      mapRef.current?.animateToRegion(userRegion, 500);
      setViewport(userRegion);
    } catch (err) {
      console.warn('Location lookup failed:', err);
      setLocationError('Không xác định được vị trí.');
    } finally {
      setIsLocating(false);
    }
  }, [setViewport]);

  return {
    mapRef,
    region,
    debouncedRegion,
    bbox,
    zoom,
    isMoving,
    clusters: clustersQuery.data ?? [],
    isLoadingClusters: clustersQuery.isLoading || clustersQuery.isFetching,
    isErrorClusters: clustersQuery.isError,
    refetchClusters: clustersQuery.refetch,
    selectedAreaId,
    selectedPlaceId,
    selectedPlaceDetail: placeDetailQuery.data,
    isLoadingPlaceDetail: placeDetailQuery.isLoading,
    isLocating,
    locationError,
    onRegionChange,
    onRegionChangeComplete,
    handleClusterPress,
    handleMarkerPress,
    handleClosePreview,
    handleSelectArea,
    handleZoomIn,
    handleZoomOut,
    handleLocateMe,
  };
}
