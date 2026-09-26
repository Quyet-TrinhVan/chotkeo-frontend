import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { colors, spacing, typography } from '../../../theme/tokens';
import { PasswordValidationResult } from '../utils/passwordPolicy';

interface PasswordRequirementsProps {
  validation: PasswordValidationResult;
  backendViolations?: string[];
  visible?: boolean;
}

interface RuleItemConfig {
  key: keyof Omit<PasswordValidationResult, 'isValid'>;
  label: string;
  backendReason: string;
}

const RULES: RuleItemConfig[] = [
  {
    key: 'minLength',
    label: 'Ít nhất 8 ký tự',
    backendReason: 'MIN_LENGTH',
  },
  {
    key: 'uppercase',
    label: 'Có ít nhất 1 chữ hoa',
    backendReason: 'UPPERCASE_REQUIRED',
  },
  {
    key: 'digit',
    label: 'Có ít nhất 1 chữ số',
    backendReason: 'DIGIT_REQUIRED',
  },
  {
    key: 'special',
    label: 'Có ít nhất 1 ký tự đặc biệt',
    backendReason: 'SPECIAL_CHARACTER_REQUIRED',
  },
];

export function PasswordRequirements({
  validation,
  backendViolations = [],
  visible = true,
}: PasswordRequirementsProps) {
  if (!visible) return null;

  return (
    <View style={styles.container} accessibilityRole="summary" accessibilityLabel="Yêu cầu mật khẩu">
      {RULES.map((rule) => {
        // If backend explicitly flagged this reason as violated, client must treat it as failed
        const backendFailed = backendViolations.includes(rule.backendReason);
        const isMet = validation[rule.key] && !backendFailed;

        return (
          <View key={rule.key} style={styles.ruleRow}>
            <View
              style={[
                styles.iconWrap,
                isMet ? styles.iconWrapSuccess : styles.iconWrapPending,
              ]}
            >
              {isMet ? (
                <Check size={11} color={colors.success} strokeWidth={2.6} />
              ) : (
                <X size={11} color={backendFailed ? colors.danger : colors.textMuted} strokeWidth={2.4} />
              )}
            </View>
            <Text
              style={[
                styles.ruleText,
                isMet
                  ? styles.ruleTextSuccess
                  : backendFailed
                  ? styles.ruleTextError
                  : styles.ruleTextPending,
              ]}
            >
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
    gap: 5,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconWrapSuccess: {
    backgroundColor: colors.openLight,
  },
  iconWrapPending: {
    backgroundColor: colors.surfaceMuted,
  },
  ruleText: {
    ...typography.caption,
    fontSize: 12,
    lineHeight: 16,
  },
  ruleTextSuccess: {
    color: colors.success,
    fontWeight: '500',
  },
  ruleTextPending: {
    color: colors.textSecondary,
  },
  ruleTextError: {
    color: colors.danger,
    fontWeight: '500',
  },
});
