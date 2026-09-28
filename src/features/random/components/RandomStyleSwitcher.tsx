import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Dices, Rocket, Columns3, Gift } from 'lucide-react-native';
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollTrack}
      >
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
              size={15}
              color={selectedStyle === 'CSGO' ? colors.textInverse : colors.textSecondary}
              style={styles.icon}
            />
            <Text
              style={[
                styles.segmentText,
                selectedStyle === 'CSGO' && styles.segmentTextActive,
              ]}
              numberOfLines={1}
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
              size={15}
              color={selectedStyle === 'ROCKET' ? colors.textInverse : colors.textSecondary}
              style={styles.icon}
            />
            <Text
              style={[
                styles.segmentText,
                selectedStyle === 'ROCKET' && styles.segmentTextActive,
              ]}
              numberOfLines={1}
            >
              Rocket
            </Text>
          </Pressable>

          {/* Slot Machine Option */}
          <Pressable
            onPress={() => !disabled && onSelectStyle('SLOT_MACHINE')}
            disabled={disabled}
            style={({ pressed }) => [
              styles.segmentBtn,
              selectedStyle === 'SLOT_MACHINE' && styles.segmentBtnActive,
              pressed && !disabled && styles.segmentBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Chọn phong cách Slot Machine"
            accessibilityState={{ selected: selectedStyle === 'SLOT_MACHINE' }}
          >
            <Columns3
              size={15}
              color={selectedStyle === 'SLOT_MACHINE' ? colors.textInverse : colors.textSecondary}
              style={styles.icon}
            />
            <Text
              style={[
                styles.segmentText,
                selectedStyle === 'SLOT_MACHINE' && styles.segmentTextActive,
              ]}
              numberOfLines={1}
            >
              Slot Machine
            </Text>
          </Pressable>

          {/* Gacha Option */}
          <Pressable
            onPress={() => !disabled && onSelectStyle('GACHA_CAPSULE')}
            disabled={disabled}
            style={({ pressed }) => [
              styles.segmentBtn,
              selectedStyle === 'GACHA_CAPSULE' && styles.segmentBtnActive,
              pressed && !disabled && styles.segmentBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Chọn phong cách Gacha"
            accessibilityState={{ selected: selectedStyle === 'GACHA_CAPSULE' }}
          >
            <Gift
              size={15}
              color={selectedStyle === 'GACHA_CAPSULE' ? colors.textInverse : colors.textSecondary}
              style={styles.icon}
            />
            <Text
              style={[
                styles.segmentText,
                selectedStyle === 'GACHA_CAPSULE' && styles.segmentTextActive,
              ]}
              numberOfLines={1}
            >
              Gacha
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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
  scrollTrack: {
    flexGrow: 1,
  },
  switcherTrack: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '100%',
  },
  trackDisabled: {
    opacity: 0.55,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
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
    marginRight: 5,
  },
  segmentText: {
    ...typography.captionMedium,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
});
