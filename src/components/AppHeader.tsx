import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../theme/tokens';
import { IconButton } from './IconButton';
import { ArrowLeft } from 'lucide-react-native';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  style,
}: AppHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContainer}>
        {onBack ? (
          <IconButton
            icon={<ArrowLeft size={22} color={colors.textPrimary} />}
            onPress={onBack}
            variant="ghost"
            accessibilityLabel="Quay lại"
            style={styles.backButton}
          />
        ) : null}
        <View style={styles.titleContainer}>
          {title ? (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightAction ? <View style={styles.rightContainer}>{rightAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
    marginLeft: -8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.cardTitle,
    fontSize: 18,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
