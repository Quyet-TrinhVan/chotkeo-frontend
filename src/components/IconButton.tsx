import React, { useState } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '../theme/tokens';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'surface' | 'ghost' | 'primary';
  accessibilityLabel: string;
}

export function IconButton({
  icon,
  onPress,
  style,
  variant = 'surface',
  accessibilityLabel,
}: IconButtonProps) {
  const [pressed, setPressed] = useState(false);

  const getBackgroundColor = () => {
    if (variant === 'ghost') return pressed ? colors.surfaceMuted : 'transparent';
    if (variant === 'primary') return pressed ? colors.primaryPressed : colors.primary;
    return pressed ? colors.surfaceMuted : colors.surface;
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.button,
        variant === 'surface' && styles.border,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
