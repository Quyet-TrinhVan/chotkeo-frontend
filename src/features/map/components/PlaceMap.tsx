import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import { colors, radius, spacing, typography } from '../../../theme/tokens';
import { usePlaceMap, MapFilters } from '../hooks/usePlaceMap';
import { MapClusterMarker } from './MapClusterMarker';
import { PlaceMapMarker } from './PlaceMapMarker';
import { MapControls } from './MapControls';
import { AreaSelector } from './AreaSelector';
import { MapPlacePreview } from './MapPlacePreview';
import { AlertCircle, RefreshCw } from 'lucide-react-native';

interface PlaceMapProps {
  filters?: MapFilters;
  onSelectPlace?: (placeId: string) => void;
  style?: any;
}

export function PlaceMap({ filters, onSelectPlace, style }: PlaceMapProps) {
  const {
    mapRef,
    region,
    clusters,
    isLoadingClusters,
    isErrorClusters,
    refetchClusters,
    selectedAreaId,
    selectedPlaceId,
    selectedPlaceDetail,
    isLoadingPlaceDetail,
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
  } = usePlaceMap({ filters, onSelectPlace });

  return (
    <View style={[styles.container, style]}>
      {/* Native Interactive Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        onRegionChange={onRegionChange}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        rotateEnabled
        pitchEnabled={false}
        scrollEnabled
        zoomEnabled
        minZoomLevel={5}
        maxZoomLevel={20}
      >
        {/* Render Clusters & Place Markers from real backend data */}
        {clusters.map((item, index) => {
          const isCluster = item.type === 'CLUSTER' || item.pointCount > 1;
          const [lng, lat] = item.geometry.coordinates;
          const key = `map-item-${item.type}-${lat}-${lng}-${index}`;

          if (isCluster) {
            return (
              <MapClusterMarker
                key={key}
                cluster={item}
                onPress={handleClusterPress}
              />
            );
          }

          const placeId = item.representativePlaceIds?.[0] || '';
          const isSelected = selectedPlaceId === placeId;

          return (
            <PlaceMapMarker
              key={key}
              cluster={item}
              isSelected={isSelected}
              onPress={handleMarkerPress}
            />
          );
        })}
      </MapView>

      {/* Top Floating Bar: Area Selector */}
      <View style={styles.topBar} pointerEvents="box-none">
        <AreaSelector
          selectedAreaId={selectedAreaId}
          onSelectArea={handleSelectArea}
        />
      </View>

      {/* Map Controls on the right side */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
      />

      {/* Subtle Floating Loading Indicator */}
      {isLoadingClusters ? (
        <View style={styles.loadingPill} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingPillText}>Đang cập nhật...</Text>
        </View>
      ) : null}

      {/* Location Error Notice */}
      {locationError ? (
        <View style={styles.noticePill} pointerEvents="none">
          <Text style={styles.noticeText}>{locationError}</Text>
        </View>
      ) : null}

      {/* Empty State Banner (when viewport returns 0 clusters and not loading) */}
      {!isLoadingClusters && !isErrorClusters && clusters.length === 0 ? (
        <View style={styles.emptyPill} pointerEvents="none">
          <Text style={styles.emptyPillText}>
            Không có địa điểm trong khu vực này. Thử di chuyển hoặc đổi bộ lọc.
          </Text>
        </View>
      ) : null}

      {/* Error Banner with Retry */}
      {isErrorClusters ? (
        <View style={styles.errorPill}>
          <AlertCircle size={15} color={colors.danger} style={{ marginRight: 6 }} />
          <Text style={styles.errorPillText}>Không tải được địa điểm.</Text>
          <Pressable
            onPress={() => refetchClusters()}
            style={styles.retryBtn}
            accessibilityRole="button"
            accessibilityLabel="Thử lại"
          >
            <RefreshCw size={13} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Bottom Place Preview Card */}
      {selectedPlaceId ? (
        <MapPlacePreview
          placeDetail={selectedPlaceDetail ?? null}
          isLoading={isLoadingPlaceDetail}
          onPress={(id) => {
            if (onSelectPlace) {
              onSelectPlace(id);
            }
          }}
          onClose={handleClosePreview}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  topBar: {
    position: 'absolute',
    top: 14,
    left: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingPill: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
    zIndex: 15,
  },
  loadingPillText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  noticePill: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    backgroundColor: 'rgba(23, 23, 23, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    zIndex: 15,
  },
  noticeText: {
    ...typography.caption,
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptyPill: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(23, 23, 23, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    zIndex: 15,
    maxWidth: '85%',
  },
  emptyPillText: {
    ...typography.caption,
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  errorPill: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
    zIndex: 15,
  },
  errorPillText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
  },
  retryBtnText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 11,
  },
});
