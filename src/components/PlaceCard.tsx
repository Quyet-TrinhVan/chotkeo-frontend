import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../theme/tokens';
import { PlaceSummary } from '../types/api';
import { StatusBadge } from './StatusBadge';
import { MapPin } from 'lucide-react-native';

interface PlaceCardProps {
  place: PlaceSummary;
  onPress: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export function PlaceCard({ place, onPress, style, compact = false }: PlaceCardProps) {
  const [pressed, setPressed] = useState(false);

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

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.card,
        compact ? styles.cardCompact : styles.cardStandard,
        pressed && styles.cardPressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Địa điểm: ${place.name}`}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImageContainer}>
            <MapPin size={28} color={colors.textMuted} />
          </View>
        )}
        {place.openState && place.openState !== 'UNKNOWN' ? (
          <View style={styles.statusOverlay}>
            <StatusBadge status={place.openState} />
          </View>
        ) : null}
        {place.distanceMeters ? (
          <View style={styles.distanceBadge}>
            <MapPin size={11} color={colors.textInverse} style={{ marginRight: 2 }} />
            <Text style={styles.distanceText}>{formatDistance(place.distanceMeters)}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>

        <View style={styles.categoryRow}>
          <Text style={styles.category}>{place.category?.label || 'Địa điểm'}</Text>
          {priceText ? (
            <>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.price}>{priceText}</Text>
            </>
          ) : null}
        </View>

        {place.styles && place.styles.length > 0 ? (
          <View style={styles.styleChipsRow}>
            {place.styles.slice(0, 2).map((s) => (
              <View key={s.id} style={styles.styleChip}>
                <Text style={styles.styleChipText}>{s.label}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardStandard: {
    width: 250,
    marginRight: spacing.md,
  },
  cardCompact: {
    width: '100%',
    marginBottom: spacing.md,
  },
  cardPressed: {
    borderColor: colors.primary,
    transform: [{ scale: 0.985 }],
  },
  imageContainer: {
    width: '100%',
    height: 145,
    backgroundColor: colors.surfaceMuted,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  distanceText: {
    ...typography.captionMedium,
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
  },
  name: {
    ...typography.cardTitle,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: colors.textMuted,
    fontSize: 10,
  },
  price: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  styleChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  styleChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  styleChipText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
});
