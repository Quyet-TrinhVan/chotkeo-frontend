import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../theme/tokens';
import { ChevronRight } from 'lucide-react-native';

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  badge?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function ActionCard({
  title,
  subtitle,
  icon,
  iconBgColor,
  badge,
  onPress,
  style,
}: ActionCardProps) {
  const [pressed, setPressed] = useState(false);

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
      accessibilityLabel={`${title}: ${subtitle}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.arrowContainer}>
        <ChevronRight size={20} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 74,
  },
  cardPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.99 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    ...typography.cardTitle,
    fontSize: 16,
    color: colors.textPrimary,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.accentLight,
  },
  badgeText: {
    ...typography.captionMedium,
    color: '#B45309',
    fontSize: 10,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    fontSize: 13,
  },
  arrowContainer: {
    marginLeft: spacing.xs,
  },
});
