import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { PrimaryButton } from './PrimaryButton';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({
  title,
  description,
  actionTitle,
  onAction,
  icon,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        {icon || <Sparkles size={32} color={colors.primary} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionTitle && onAction ? (
        <PrimaryButton
          title={actionTitle}
          onPress={onAction}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorState({
  title = 'Đã có lỗi xảy ra',
  message = 'Không tải được dữ liệu. Vui lòng kiểm tra kết nối mạng và thử lại.',
  onRetry,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconCircle, styles.errorCircle]}>
        <AlertCircle size={32} color={colors.danger} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{message}</Text>
      {onRetry ? (
        <PrimaryButton
          title="Thử lại"
          onPress={onRetry}
          icon={<RefreshCw size={16} color={colors.textInverse} />}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  errorCircle: {
    backgroundColor: colors.closedLight,
  },
  title: {
    ...typography.sectionTitle,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  button: {
    minWidth: 140,
  },
});
