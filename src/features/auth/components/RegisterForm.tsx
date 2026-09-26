import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  Lock,
  User,
  AlertCircle,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { PasswordRequirements } from './PasswordRequirements';
import { useRegister } from '../hooks/useRegister';

interface RegisterFormProps {
  onSuccess: () => void;
  onNavigateLogin?: () => void;
}

export function RegisterForm({ onSuccess, onNavigateLogin }: RegisterFormProps) {
  const {
    formData,
    setFieldValue,
    errors,
    loading,
    passwordValidation,
    submit,
  } = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const usernameInputRef = useRef<TextInput>(null);

  // Focus username input if backend returns duplicate username error
  useEffect(() => {
    if (errors.username) {
      usernameInputRef.current?.focus();
    }
  }, [errors.username]);

  const handleSubmit = async () => {
    await submit(onSuccess);
  };

  const isFormComplete =
    Boolean(formData.lastName.trim()) &&
    Boolean(formData.firstName.trim()) &&
    Boolean(formData.username.trim()) &&
    Boolean(formData.email.trim()) &&
    Boolean(formData.password) &&
    passwordValidation.isValid &&
    formData.confirmPassword === formData.password;

  return (
    <View style={styles.card}>
      {/* Row: Last name (Họ) & First name (Tên) */}
      <View style={styles.nameRow}>
        {/* Họ */}
        <View style={[styles.inputGroup, styles.flexHalf, { marginRight: spacing.sm }]}>
          <Text style={styles.inputLabel}>Họ</Text>
          <View
            style={[
              styles.inputWrapper,
              focusedField === 'lastName' && styles.inputWrapperFocused,
              Boolean(errors.lastName) && styles.inputWrapperError,
            ]}
          >
            <TextInput
              value={formData.lastName}
              onChangeText={(txt) => setFieldValue('lastName', txt)}
              onFocus={() => setFocusedField('lastName')}
              onBlur={() => setFocusedField(null)}
              placeholder="Nguyễn"
              placeholderTextColor={colors.textMuted}
              editable={!loading}
              style={styles.input}
              accessibilityLabel="Họ"
            />
          </View>
          {errors.lastName ? (
            <Text style={styles.fieldErrorText}>{errors.lastName}</Text>
          ) : null}
        </View>

        {/* Tên */}
        <View style={[styles.inputGroup, styles.flexHalf]}>
          <Text style={styles.inputLabel}>Tên</Text>
          <View
            style={[
              styles.inputWrapper,
              focusedField === 'firstName' && styles.inputWrapperFocused,
              Boolean(errors.firstName) && styles.inputWrapperError,
            ]}
          >
            <TextInput
              value={formData.firstName}
              onChangeText={(txt) => setFieldValue('firstName', txt)}
              onFocus={() => setFocusedField('firstName')}
              onBlur={() => setFocusedField(null)}
              placeholder="Văn A"
              placeholderTextColor={colors.textMuted}
              editable={!loading}
              style={styles.input}
              accessibilityLabel="Tên"
            />
          </View>
          {errors.firstName ? (
            <Text style={styles.fieldErrorText}>{errors.firstName}</Text>
          ) : null}
        </View>
      </View>

      {/* Username */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Tên đăng nhập</Text>
        <View
          style={[
            styles.inputWrapper,
            focusedField === 'username' && styles.inputWrapperFocused,
            Boolean(errors.username) && styles.inputWrapperError,
          ]}
        >
          <User
            size={18}
            color={errors.username ? colors.danger : colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            ref={usernameInputRef}
            value={formData.username}
            onChangeText={(txt) => setFieldValue('username', txt)}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
            placeholder="Tên tài khoản (ít nhất 3 ký tự)"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            style={styles.input}
            accessibilityLabel="Tên đăng nhập"
          />
        </View>
        {errors.username ? (
          <Text style={styles.fieldErrorText}>{errors.username}</Text>
        ) : null}
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <View
          style={[
            styles.inputWrapper,
            focusedField === 'email' && styles.inputWrapperFocused,
            Boolean(errors.email) && styles.inputWrapperError,
          ]}
        >
          <Mail
            size={18}
            color={errors.email ? colors.danger : colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            value={formData.email}
            onChangeText={(txt) => setFieldValue('email', txt)}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder="email@vidu.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            style={styles.input}
            accessibilityLabel="Địa chỉ email"
          />
        </View>
        {errors.email ? (
          <Text style={styles.fieldErrorText}>{errors.email}</Text>
        ) : null}
      </View>

      {/* Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Mật khẩu</Text>
        <View
          style={[
            styles.inputWrapper,
            focusedField === 'password' && styles.inputWrapperFocused,
            Boolean(errors.password && errors.password.length > 0) && styles.inputWrapperError,
          ]}
        >
          <Lock
            size={18}
            color={
              errors.password && errors.password.length > 0
                ? colors.danger
                : colors.textSecondary
            }
            style={styles.inputIcon}
          />
          <TextInput
            value={formData.password}
            onChangeText={(txt) => setFieldValue('password', txt)}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            placeholder="Nhập mật khẩu an toàn"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            style={styles.input}
            accessibilityLabel="Mật khẩu"
          />
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={10}
            style={styles.eyeBtn}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? (
              <EyeOff size={18} color={colors.textSecondary} />
            ) : (
              <Eye size={18} color={colors.textSecondary} />
            )}
          </Pressable>
        </View>

        {/* Realtime password requirements checklist */}
        <PasswordRequirements
          validation={passwordValidation}
          backendViolations={errors.passwordViolationReasons}
          visible={true}
        />

        {errors.password && errors.password.length > 0 ? (
          <View style={styles.fieldErrorList}>
            {errors.password.map((msg, idx) => (
              <Text key={idx} style={styles.fieldErrorText}>
                {msg}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      {/* Confirm Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
        <View
          style={[
            styles.inputWrapper,
            focusedField === 'confirmPassword' && styles.inputWrapperFocused,
            Boolean(errors.confirmPassword) && styles.inputWrapperError,
          ]}
        >
          <Lock
            size={18}
            color={errors.confirmPassword ? colors.danger : colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            value={formData.confirmPassword}
            onChangeText={(txt) => setFieldValue('confirmPassword', txt)}
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => setFocusedField(null)}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            style={styles.input}
            accessibilityLabel="Xác nhận mật khẩu"
          />
          <Pressable
            onPress={() => setShowConfirmPassword((prev) => !prev)}
            hitSlop={10}
            style={styles.eyeBtn}
            accessibilityRole="button"
            accessibilityLabel={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showConfirmPassword ? (
              <EyeOff size={18} color={colors.textSecondary} />
            ) : (
              <Eye size={18} color={colors.textSecondary} />
            )}
          </Pressable>
        </View>
        {errors.confirmPassword ? (
          <Text style={styles.fieldErrorText}>{errors.confirmPassword}</Text>
        ) : null}
      </View>

      {/* Form-level error (hiển thị phía trên nút Đăng ký khi lỗi không map được vào field) */}
      {errors.form ? (
        <View style={styles.formErrorBox} accessibilityRole="alert">
          <AlertCircle size={18} color={colors.danger} style={styles.formErrorIcon} />
          <Text style={styles.formErrorText}>{errors.form}</Text>
        </View>
      ) : null}

      {/* Submit Button */}
      <PrimaryButton
        title="Đăng ký"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading || !passwordValidation.isValid}
        style={styles.submitBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.container,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  formErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.closedLight,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  formErrorIcon: {
    marginRight: 8,
  },
  formErrorText: {
    ...typography.captionMedium,
    color: colors.danger,
    flex: 1,
    lineHeight: 18,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flexHalf: {
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
  inputWrapperFocused: {
    borderColor: colors.borderFocus,
  },
  inputWrapperError: {
    borderColor: colors.danger,
    backgroundColor: '#FFFBFB',
  },
  inputIcon: {
    marginRight: 8,
  },
  eyeBtn: {
    padding: 6,
    marginLeft: 4,
  },
  input: {
    flex: 1,
    height: '100%',
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
    outlineStyle: 'none' as any,
  },
  fieldErrorText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    paddingHorizontal: 2,
    lineHeight: 16,
  },
  fieldErrorList: {
    marginTop: 2,
    gap: 2,
  },
  submitBtn: {
    marginTop: spacing.md,
    height: 50,
  },
});
