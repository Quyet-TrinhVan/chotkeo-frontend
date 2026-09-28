import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Dices, Rocket } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';
import { RandomAnimationStyle } from '../types';

interface RandomStyleSwitcherProps {
  selectedStyle: RandomAnimationStyle;
  onSelectStyle: (style: RandomAnimationStyle) => void;
  disabled?: boolean;
}

export function RandomStyleSwitcher({
  selectedStyle,
  onSelectStyle,
  disabled = false,
}: RandomStyleSwitcherProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Phong cách quay</Text>
      <View style={[styles.switcherTrack, disabled && styles.trackDisabled]}>
        {/* CSGO Option */}
        <Pressable
          onPress={() => !disabled && onSelectStyle('CSGO')}
          disabled={disabled}
          style={({ pressed }) => [
            styles.segmentBtn,
            selectedStyle === 'CSGO' && styles.segmentBtnActive,
            pressed && !disabled && styles.segmentBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Chọn phong cách CSGO"
          accessibilityState={{ selected: selectedStyle === 'CSGO' }}
        >
          <Dices
            size={16}
            color={selectedStyle === 'CSGO' ? colors.textInverse : colors.textSecondary}
            style={styles.icon}
          />
          <Text
            style={[
              styles.segmentText,
              selectedStyle === 'CSGO' && styles.segmentTextActive,
            ]}
          >
            CSGO
          </Text>
        </Pressable>

        {/* Rocket Option */}
        <Pressable
          onPress={() => !disabled && onSelectStyle('ROCKET')}
          disabled={disabled}
          style={({ pressed }) => [
            styles.segmentBtn,
            selectedStyle === 'ROCKET' && styles.segmentBtnActive,
            pressed && !disabled && styles.segmentBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Chọn phong cách Rocket"
          accessibilityState={{ selected: selectedStyle === 'ROCKET' }}
        >
          <Rocket
            size={16}
            color={selectedStyle === 'ROCKET' ? colors.textInverse : colors.textSecondary}
            style={styles.icon}
          />
          <Text
            style={[
              styles.segmentText,
              selectedStyle === 'ROCKET' && styles.segmentTextActive,
            ]}
          >
            Rocket
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.captionMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  switcherTrack: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackDisabled: {
    opacity: 0.55,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentBtnPressed: {
    opacity: 0.8,
  },
  icon: {
    marginRight: 6,
  },
  segmentText: {
    ...typography.captionMedium,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
});
