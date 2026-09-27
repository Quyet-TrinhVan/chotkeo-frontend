import { Region } from 'react-native-maps';

/**
 * Calculates Mercator zoom level (0 - 22) from Region longitudeDelta.
 * At zoom 0, 360 degrees fits in one tile width.
 */
export function regionToZoom(region: Region, screenWidth = 375): number {
  const delta = region.longitudeDelta;
  if (!delta || delta <= 0 || isNaN(delta)) {
    return 14;
  }

  // Calculate zoom based on standard 360 degree span
  const zoom = Math.log2(360 / delta);

  // Clamp to backend schema bounds [0, 22]
  const clamped = Math.max(0, Math.min(22, Math.round(zoom)));
  return clamped;
}
