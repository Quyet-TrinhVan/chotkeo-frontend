import React from 'react';
import { View, TextInput, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';
import { Search, X } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Tìm quán ăn, cafe, địa điểm...',
  onClear,
  onFocus,
  onBlur,
  style,
  autoFocus = false,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Search size={18} color={colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        returnKeyType="search"
        accessibilityRole="search"
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          style={styles.clearButton}
          accessibilityLabel="Xóa tìm kiếm"
          accessibilityRole="button"
        >
          <X size={16} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
    outlineStyle: 'none' as any,
  },
  clearButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    marginLeft: 6,
  },
});
