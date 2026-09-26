import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { PlaceSummary } from '../types/api';
import { StatusBadge } from './StatusBadge';
import { MapPin } from 'lucide-react-native';

interface PlaceCardHorizontalProps {
  place: PlaceSummary;
  onPress: () => void;
  style?: ViewStyle;
}

export function PlaceCardHorizontal({ place, onPress, style }: PlaceCardHorizontalProps) {
  const [pressed, setPressed] = useState(false);

  const formatPrice = (min: number, max: number) => {
    const kMin = Math.round(min / 1000);
    const kMax = Math.round(max / 1000);
    return `${kMin}k - ${kMax}k/người`;
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return null;
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.card,
        pressed && styles.cardPressed,
        style,
      ]}
      accessibilityRole="button"
    >
      <Image
        source={{
          uri:
            place.heroImageUrl ||
            place.heroMedia?.renditions?.[0]?.url ||
            'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {place.name}
          </Text>
          <StatusBadge status={place.openState} />
        </View>

        <View style={styles.categoryRow}>
          <Text style={styles.category}>{place.category.label}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.price}>
            {formatPrice(place.priceRange.minAmount, place.priceRange.maxAmount)}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          {place.styles && place.styles.length > 0 ? (
            <View style={styles.styleChip}>
              <Text style={styles.styleChipText}>{place.styles[0].label}</Text>
            </View>
          ) : <View />}

          {place.distanceMeters ? (
            <View style={styles.distanceBadge}>
              <MapPin size={12} color={colors.textSecondary} style={{ marginRight: 2 }} />
              <Text style={styles.distanceText}>{formatDistance(place.distanceMeters)}</Text>
            </View>
          ) : null}
        </View>
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
    flexDirection: 'row',
    padding: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  cardPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    ...typography.cardTitle,
    fontSize: 15,
    marginRight: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    fontSize: 12,
  },
  dotSeparator: {
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  styleChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  styleChipText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
