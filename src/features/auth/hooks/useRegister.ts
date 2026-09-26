import { useState, useMemo, useCallback } from 'react';
import { validatePassword, PasswordValidationResult } from '../utils/passwordPolicy';
import { mapProblemDetailToFormErrors, FormErrors } from '../utils/problemDetailMapper';
import { useAuth } from '../../../context/AuthContext';

export interface RegisterFormData {
  lastName: string;
  firstName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type RegisterFieldKey = keyof RegisterFormData;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useRegister() {
  const { register: authRegister } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    lastName: '',
    firstName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Realtime password evaluation
  const passwordValidation: PasswordValidationResult = useMemo(
    () => validatePassword(formData.password),
    [formData.password]
  );

  // Clear specific field error when user starts typing in that field
  const setFieldValue = useCallback((field: RegisterFieldKey, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    setErrors((prev) => {
      // Only clear if this specific field has an error (or password policy reasons)
      if (!prev[field] && !(field === 'password' && prev.passwordViolationReasons)) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];

      if (field === 'password') {
        delete next.passwordViolationReasons;
      }

      return next;
    });
  }, []);

  const validateLocal = useCallback((): boolean => {
    const localErrors: FormErrors = {};

    if (!formData.lastName.trim()) {
      localErrors.lastName = 'Vui lòng nhập họ.';
    }

    if (!formData.firstName.trim()) {
      localErrors.firstName = 'Vui lòng nhập tên.';
    }

    const trimmedUsername = formData.username.trim();
    if (!trimmedUsername) {
      localErrors.username = 'Vui lòng nhập tên đăng nhập.';
    } else if (trimmedUsername.length < 3) {
      localErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự.';
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      localErrors.email = 'Vui lòng nhập email.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      localErrors.email = 'Địa chỉ email không đúng định dạng.';
    }

    if (!formData.password) {
      localErrors.password = ['Vui lòng nhập mật khẩu.'];
    } else {
      const pwdVal = validatePassword(formData.password);
      if (!pwdVal.isValid) {
        localErrors.password = ['Mật khẩu chưa đáp ứng đầy đủ các yêu cầu bảo mật.'];
      }
    }

    if (formData.confirmPassword !== formData.password) {
      localErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    const hasError = Object.keys(localErrors).length > 0;
    if (hasError) {
      setErrors(localErrors);
      return false;
    }

    return true;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      lastName: '',
      firstName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setErrors({});
  }, []);

  const submit = useCallback(
    async (onSuccess?: () => void): Promise<boolean> => {
      // Guard against duplicate submissions while loading
      if (loading) return false;

      // Clear previous server errors
      setErrors({});

      // Validate locally first
      const isLocalValid = validateLocal();
      if (!isLocalValid) {
        return false;
      }

      setLoading(true);

      try {
        // Send strictly the RegisterRequest (no confirmPassword)
        await authRegister({
          username: formData.username.trim(),
          password: formData.password,
          email: formData.email.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
        });

        // Chỉ khi backend trả success mới reset form và trigger navigation callback
        resetForm();
        onSuccess?.();
        return true;
      } catch (err: any) {
        // Log sanitized message without sensitive credentials/passwords
        console.warn('[useRegister] Registration failed with status/code:', err?.status || err?.code || 'unknown');

        const mappedErrors = mapProblemDetailToFormErrors(err.problem || err);
        setErrors(mappedErrors);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loading, validateLocal, authRegister, formData, resetForm]
  );

  return {
    formData,
    setFieldValue,
    errors,
    loading,
    passwordValidation,
    resetForm,
    submit,
  };
}
