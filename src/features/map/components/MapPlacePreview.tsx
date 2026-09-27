import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';
import { PlaceDetail, PlaceSummary } from '../../../types/api';
import { StatusBadge } from '../../../components/StatusBadge';
import { MapPin, X, ChevronRight } from 'lucide-react-native';

interface MapPlacePreviewProps {
  placeDetail: PlaceDetail | null;
  isLoading?: boolean;
  onPress: (placeId: string) => void;
  onClose: () => void;
}

export const MapPlacePreview = React.memo(function MapPlacePreview({
  placeDetail,
  isLoading = false,
  onPress,
  onClose,
}: MapPlacePreviewProps) {
  if (isLoading && !placeDetail) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin địa điểm...</Text>
        </View>
      </View>
    );
  }

  if (!placeDetail) return null;

  const place: PlaceSummary = placeDetail.summary;

  const formatPrice = (min?: number, max?: number) => {
    if (min === undefined && max === undefined) return null;
    const kMin = min !== undefined ? Math.round(min / 1000) : 0;
    const kMax = max !== undefined ? Math.round(max / 1000) : 0;
    if (kMin === 0 && kMax === 0) return 'Miễn phí';
    if (kMin === kMax) return `${kMin}k/người`;
    return `${kMin}k - ${kMax}k/người`;
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return null;
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const imageUrl = place.heroImageUrl || place.heroMedia?.renditions?.[0]?.url;
  const priceText = formatPrice(place.priceRange?.minAmount, place.priceRange?.maxAmount);
  const distanceText = formatDistance(place.distanceMeters ?? undefined);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onPress(place.id)}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Xem chi tiết địa điểm: ${place.name}`}
      >
        {/* Left Thumbnail */}
        <View style={styles.thumbWrap}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <MapPin size={22} color={colors.textMuted} />
            </View>
          )}

          {place.openState && place.openState !== 'UNKNOWN' ? (
            <View style={styles.statusWrap}>
              <StatusBadge status={place.openState} />
            </View>
          ) : null}
        </View>

        {/* Content Body */}
        <View style={styles.content}>
          <Text style={styles.placeName} numberOfLines={1}>
            {place.name}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.category} numberOfLines={1}>
              {place.category?.label || 'Địa điểm'}
            </Text>
            {priceText ? (
              <>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.price}>{priceText}</Text>
              </>
            ) : null}
          </View>

          {distanceText ? (
            <View style={styles.distanceRow}>
              <MapPin size={11} color={colors.textSecondary} style={{ marginRight: 3 }} />
              <Text style={styles.distanceText}>Cách bạn {distanceText}</Text>
            </View>
          ) : null}
        </View>

        {/* Right Arrow Action */}
        <View style={styles.actionCol}>
          <View style={styles.chevronWrap}>
            <ChevronRight size={18} color={colors.primary} />
          </View>
        </View>
      </Pressable>

      {/* Floating Close Button */}
      <Pressable
        onPress={onClose}
        style={styles.closeBtn}
        accessibilityRole="button"
        accessibilityLabel="Đóng xem trước địa điểm"
      >
        <X size={14} color="#6B7280" />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  cardPressed: {
    backgroundColor: '#FAFAFA',
    transform: [{ scale: 0.99 }],
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  thumbWrap: {
    width: 76,
    height: 76,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceMuted,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  statusWrap: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  placeName: {
    ...typography.cardTitle,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  category: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    fontSize: 12,
  },
  dot: {
    marginHorizontal: 5,
    color: colors.textMuted,
    fontSize: 10,
  },
  price: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  actionCol: {
    paddingRight: 6,
    paddingLeft: 4,
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: -8,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
});
