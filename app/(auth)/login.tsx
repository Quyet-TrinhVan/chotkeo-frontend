import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../src/theme/tokens';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SecondaryButton } from '../../src/components/SecondaryButton';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from '../../src/navigation/router';
import { Flame, Lock, User, AlertCircle } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setErrorMessage('Vui lòng điền tên đăng nhập và mật khẩu.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      await login(username.trim(), password);
      router.replace('/(app)/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand & Logo */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Flame size={38} color={colors.textInverse} />
          </View>
          <Text style={styles.appName}>Chốt Kèo</Text>
          <Text style={styles.tagline}>Hôm nay đi đâu? Để Chốt Kèo lo!</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>Đăng nhập</Text>
          <Text style={styles.formSubtitle}>
            Đăng nhập để tạo phòng bình chọn và lưu kèo cùng hội bạn
          </Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color={colors.danger} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Username Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tên đăng nhập</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={username}
                onChangeText={(txt) => {
                  setUsername(txt);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Nhập tên tài khoản"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={(txt) => {
                  setPassword(txt);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                style={styles.input}
              />
            </View>
          </View>

          {/* Primary CTA: Đăng nhập */}
          <PrimaryButton
            title="Đăng nhập"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Secondary CTA: Tạo tài khoản */}
          <SecondaryButton
            title="Tạo tài khoản mới"
            onPress={() => router.push('/(auth)/register')}
            style={styles.registerBtn}
          />
        </View>

        <Text style={styles.footerNote}>
          Phiên bản 1.0.0 • Nền tảng Chốt Kèo Hà Nội
        </Text>
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
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: radius.container,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  appName: {
    ...typography.display,
    fontSize: 32,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.container,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    ...typography.pageTitle,
    fontSize: 22,
    marginBottom: 4,
  },
  formSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.closedLight,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.captionMedium,
    color: colors.danger,
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.captionMedium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
    outlineStyle: 'none' as any,
  },
  submitBtn: {
    marginTop: spacing.sm,
    height: 50,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
    marginHorizontal: spacing.sm,
  },
  registerBtn: {
    height: 50,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
