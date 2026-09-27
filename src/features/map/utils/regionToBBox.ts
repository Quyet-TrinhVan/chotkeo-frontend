import { Region } from 'react-native-maps';

export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

/**
 * Converts a react-native-maps Region to a WGS84 Bounding Box (west,south,east,north).
 * Formatted as expected by GET /api/v1/place-map/clusters.
 */
export function regionToBBox(region: Region): string {
  const halfLatDelta = (region.latitudeDelta || 0.05) / 2;
  const halfLngDelta = (region.longitudeDelta || 0.05) / 2;

  const north = Number((region.latitude + halfLatDelta).toFixed(5));
  const south = Number((region.latitude - halfLatDelta).toFixed(5));
  const east = Number((region.longitude + halfLngDelta).toFixed(5));
  const west = Number((region.longitude - halfLngDelta).toFixed(5));

  // Format: west,south,east,north
  return `${west},${south},${east},${north}`;
}

export function regionToBBoxObject(region: Region): BoundingBox {
  const halfLatDelta = (region.latitudeDelta || 0.05) / 2;
  const halfLngDelta = (region.longitudeDelta || 0.05) / 2;

  return {
    north: Number((region.latitude + halfLatDelta).toFixed(5)),
    south: Number((region.latitude - halfLatDelta).toFixed(5)),
    east: Number((region.longitude + halfLngDelta).toFixed(5)),
    west: Number((region.longitude - halfLngDelta).toFixed(5)),
  };
}
