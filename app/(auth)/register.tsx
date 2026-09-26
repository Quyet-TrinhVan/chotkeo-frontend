import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography } from '../../src/theme/tokens';
import { useRouter } from '../../src/navigation/router';
import { ArrowLeft } from 'lucide-react-native';
import { RegisterForm } from '../../src/features/auth';

export default function RegisterScreen() {
  const router = useRouter();

  const handleSuccess = () => {
    router.replace('/(app)/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Quay lại đăng nhập"
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
          <Text style={styles.backText}>Đăng nhập</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>
            Bắt đầu khám phá và chốt kèo cùng bạn bè ngay hôm nay
          </Text>
        </View>

        <RegisterForm
          onSuccess={handleSuccess}
          onNavigateLogin={() => router.push('/(auth)/login')}
        />

        <View style={styles.loginLinkRow}>
          <Text style={styles.loginLinkText}>Đã có tài khoản? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLinkHighlight}>Đăng nhập ngay</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  backText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginLeft: 6,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.display,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loginLinkHighlight: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
