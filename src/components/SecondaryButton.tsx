import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'outline' | 'ghost' | 'soft';
}

export function SecondaryButton({
  title,
  onPress,
  style,
  textStyle,
  icon,
  loading = false,
  disabled = false,
  variant = 'outline',
}: SecondaryButtonProps) {
  const [pressed, setPressed] = useState(false);

  const getBgColor = () => {
    if (disabled) return colors.surfaceMuted;
    if (variant === 'soft') {
      return pressed ? colors.borderLight : colors.surfaceMuted;
    }
    if (variant === 'ghost') {
      return pressed ? colors.borderLight : 'transparent';
    }
    return pressed ? colors.surfaceMuted : colors.surface;
  };

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.button,
        variant === 'outline' && styles.outline,
        { backgroundColor: getBgColor() },
        disabled && { opacity: 0.6 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} size="small" />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text
            style={[
              styles.text,
              { color: disabled ? colors.textMuted : colors.textPrimary },
              icon ? { marginLeft: 8 } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    minHeight: 44,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  text: {
    ...typography.bodyMedium,
    fontWeight: '600',
    fontSize: 14,
  },
});
