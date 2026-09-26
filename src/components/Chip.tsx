import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';

interface ChipProps {
  label: string;
  style?: ViewStyle;
  variant?: 'neutral' | 'brand' | 'subtle';
  icon?: React.ReactNode;
}

export function Chip({ label, style, variant = 'neutral', icon }: ChipProps) {
  const getColors = () => {
    switch (variant) {
      case 'brand':
        return {
          bg: colors.primaryLight,
          border: colors.primaryLight,
          text: colors.primary,
        };
      case 'subtle':
        return {
          bg: colors.surfaceMuted,
          border: 'transparent',
          text: colors.textSecondary,
        };
      default:
        return {
          bg: colors.surface,
          border: colors.border,
          text: colors.textPrimary,
        };
    }
  };

  const scheme = getColors();

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: scheme.bg, borderColor: scheme.border },
        style,
      ]}
    >
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text style={[styles.text, { color: scheme.text }]}>{label}</Text>
    </View>
  );
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  badge?: number | string;
  style?: ViewStyle;
}

export function FilterChip({
  label,
  selected,
  onPress,
  icon,
  badge,
  style,
}: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        selected ? styles.filterChipSelected : styles.filterChipUnselected,
        style,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text
        style={[
          styles.filterChipText,
          selected ? styles.filterChipTextSelected : styles.filterChipTextUnselected,
        ]}
      >
        {label}
      </Text>
      {badge !== undefined ? (
        <View
          style={[
            styles.badge,
            selected ? styles.badgeSelected : styles.badgeUnselected,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              selected ? styles.badgeTextSelected : styles.badgeTextUnselected,
            ]}
          >
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    ...typography.captionMedium,
    fontSize: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radius.pill,
    marginRight: 8,
    borderWidth: 1.5,
  },
  filterChipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.captionMedium,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextUnselected: {
    color: colors.textPrimary,
  },
  filterChipTextSelected: {
    color: colors.textInverse,
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeUnselected: {
    backgroundColor: colors.surfaceMuted,
  },
  badgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextUnselected: {
    color: colors.textSecondary,
  },
  badgeTextSelected: {
    color: colors.textInverse,
  },
});
