import { useState, useCallback, useRef, useEffect } from 'react';
import { Region } from 'react-native-maps';
import { regionToBBox } from '../utils/regionToBBox';
import { regionToZoom } from '../utils/regionToZoom';
import { HANOI_DEFAULT_REGION } from '../types';

export interface UseMapViewportOptions {
  initialRegion?: Region;
  debounceMs?: number;
}

export function useMapViewport({
  initialRegion = HANOI_DEFAULT_REGION,
  debounceMs = 300,
}: UseMapViewportOptions = {}) {
  const [region, setRegion] = useState<Region>(initialRegion);
  const [debouncedRegion, setDebouncedRegion] = useState<Region>(initialRegion);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bbox = regionToBBox(debouncedRegion);
  const zoom = regionToZoom(debouncedRegion);

  const onRegionChange = useCallback(() => {
    if (!isMoving) {
      setIsMoving(true);
    }
  }, [isMoving]);

  const onRegionChangeComplete = useCallback(
    (newRegion: Region) => {
      setRegion(newRegion);
      setIsMoving(false);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setDebouncedRegion(newRegion);
      }, debounceMs);
    },
    [debounceMs]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const setViewport = useCallback((newRegion: Region) => {
    setRegion(newRegion);
    setDebouncedRegion(newRegion);
    setIsMoving(false);
  }, []);

  return {
    region,
    debouncedRegion,
    bbox,
    zoom,
    isMoving,
    onRegionChange,
    onRegionChangeComplete,
    setViewport,
  };
}
