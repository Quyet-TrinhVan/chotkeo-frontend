/**
 * AvatarPickerSheet Component
 *
 * Bottom sheet modal for choosing avatar source:
 * - Chọn ảnh từ thư viện
 * - Chụp ảnh
 * - Hủy
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';

export interface AvatarPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectLibrary: () => void;
  onSelectCamera: () => void;
  disabled?: boolean;
}

export function AvatarPickerSheet({
  visible,
  onClose,
  onSelectLibrary,
  onSelectCamera,
  disabled = false,
}: AvatarPickerSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose} disabled={disabled}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Top Handle Indicator */}
              <View style={styles.handleBar} />

              {/* Title & Close Header */}
              <View style={styles.headerRow}>
                <Text style={styles.title}>Đổi ảnh đại diện</Text>
                <Pressable
                  onPress={onClose}
                  disabled={disabled}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.buttonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Đóng"
                >
                  <X size={20} color={colors.textSecondary} />
                </Pressable>
              </View>

              {/* Action Buttons */}
              <View style={styles.optionsList}>
                <Pressable
                  onPress={() => {
                    onClose();
                    onSelectLibrary();
                  }}
                  disabled={disabled}
                  style={({ pressed }) => [
                    styles.optionItem,
                    pressed && styles.optionItemPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Chọn ảnh từ thư viện"
                >
                  <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                    <ImageIcon size={20} color={colors.primary} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionLabel}>Chọn ảnh từ thư viện</Text>
                    <Text style={styles.optionHint}>JPEG, PNG, WebP (Tối đa 100MB)</Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => {
                    onClose();
                    onSelectCamera();
                  }}
                  disabled={disabled}
                  style={({ pressed }) => [
                    styles.optionItem,
                    pressed && styles.optionItemPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Chụp ảnh mới"
                >
                  <View style={[styles.iconCircle, { backgroundColor: colors.secondaryLight }]}>
                    <Camera size={20} color={colors.secondary} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionLabel}>Chụp ảnh</Text>
                    <Text style={styles.optionHint}>Chụp ảnh selfie hoặc ảnh mới</Text>
                  </View>
                </Pressable>
              </View>

              {/* Cancel Button */}
              <Pressable
                onPress={onClose}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Hủy"
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl + 12 : spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: radius.pill,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  optionsList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  optionItemPressed: {
    backgroundColor: colors.borderLight,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  optionHint: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  cancelButton: {
    marginTop: spacing.xs,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
