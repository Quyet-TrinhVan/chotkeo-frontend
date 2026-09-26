import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../src/theme/tokens';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { SecondaryButton } from '../../../src/components/SecondaryButton';
import { useAuth } from '../../../src/context/AuthContext';
import { useRouter } from '../../../src/navigation/router';
import {
  Camera,
  Edit2,
  Globe,
  Sliders,
  LogOut,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react-native';
import {
  ProfileAvatar,
  AvatarPickerSheet,
  useAvatarUpload,
} from '../../../src/features/profile';

export default function ProfileScreen() {
  const { user, logout, updateDisplayName } = useAuth();
  const router = useRouter();
  const { reduceMotion, toggleReduceMotion } = router;

  const [editNameModal, setEditNameModal] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [pickerSheetVisible, setPickerSheetVisible] = useState(false);

  const {
    isUploading,
    uploadMessage,
    previewUri,
    error: avatarError,
    toastMessage: avatarToast,
    clearError: clearAvatarError,
    clearToast: clearAvatarToast,
    pickImageFromLibrary,
    takePhotoWithCamera,
  } = useAvatarUpload();

  useEffect(() => {
    if (avatarToast) {
      const timer = setTimeout(() => {
        clearAvatarToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [avatarToast, clearAvatarToast]);

  useEffect(() => {
    if (avatarError) {
      const timer = setTimeout(() => {
        clearAvatarError();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [avatarError, clearAvatarError]);

  const handleSaveName = async () => {
    if (newName.trim()) {
      await updateDisplayName(newName.trim());
      setEditNameModal(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const avatarUrl =
    user?.avatar?.renditions?.[0]?.url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <ProfileAvatar
            avatarUrl={user?.avatar?.renditions?.[0]?.url}
            previewUri={previewUri}
            isUploading={isUploading}
            uploadMessage={uploadMessage}
            onPressCamera={() => setPickerSheetVisible(true)}
            size={90}
          />
        </View>

        <Text style={styles.displayName}>{user?.displayName || 'Người dùng Chốt Kèo'}</Text>
        <Text style={styles.localeInfo}>Múi giờ: {user?.timeZone || 'Asia/Ho_Chi_Minh'} (vi-VN)</Text>

        <View style={styles.stateBadge}>
          <ShieldCheck size={14} color={colors.success} style={{ marginRight: 4 }} />
          <Text style={styles.stateBadgeText}>Tài khoản đã xác thực</Text>
        </View>

        {/* Inline Avatar Error Banner */}
        {avatarError && (
          <View style={styles.errorBanner}>
            <AlertCircle size={15} color={colors.danger} style={{ marginRight: 6 }} />
            <Text style={styles.errorBannerText}>{avatarError}</Text>
            <Pressable onPress={clearAvatarError} hitSlop={8} style={{ marginLeft: 6 }}>
              <X size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}

        {/* Profile Action Buttons */}
        <View style={styles.profileActionsRow}>
          <SecondaryButton
            title="Đổi tên hiển thị"
            icon={<Edit2 size={15} color={colors.textPrimary} />}
            onPress={() => {
              setNewName(user?.displayName || '');
              setEditNameModal(true);
            }}
            style={styles.actionBtnHalf}
          />
          <SecondaryButton
            title="Đổi ảnh đại diện"
            icon={<Camera size={15} color={colors.textPrimary} />}
            onPress={() => setPickerSheetVisible(true)}
            disabled={isUploading}
            style={styles.actionBtnHalf}
          />
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Cài đặt hệ thống</Text>

        <View style={styles.settingsGroup}>
          {/* Language Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Globe size={18} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Ngôn ngữ</Text>
                <Text style={styles.settingSubtitle}>Tiếng Việt (mặc định)</Text>
              </View>
            </View>
            <Text style={styles.settingValue}>vi-VN</Text>
          </View>

          {/* Reduce Motion Accessibility Setting */}
          <Pressable
            onPress={toggleReduceMotion}
            style={styles.settingItem}
            accessibilityRole="switch"
            accessibilityState={{ checked: reduceMotion }}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIconWrap}>
                <Sliders size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Giảm chuyển động (Reduce Motion)</Text>
                <Text style={styles.settingSubtitle}>
                  {reduceMotion ? 'Đang bật hiệu ứng rút gọn' : 'Đang bật chuyển động mượt mà'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                reduceMotion && styles.toggleSwitchActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  reduceMotion && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Logout Action */}
      <View style={styles.logoutSection}>
        <SecondaryButton
          title="Đăng xuất"
          icon={<LogOut size={16} color={colors.danger} />}
          onPress={handleLogout}
          textStyle={{ color: colors.danger }}
          style={styles.logoutBtn}
        />
      </View>

      {/* Edit Name Modal */}
      <Modal visible={editNameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi tên hiển thị</Text>
              <Pressable
                onPress={() => setEditNameModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={styles.modalDesc}>
              Tên hiển thị sẽ xuất hiện khi bạn tham gia bình chọn hoặc tạo phòng kèo.
            </Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Nhập tên mới (1-80 ký tự)"
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
              autoFocus
            />

            <View style={styles.modalActions}>
              <SecondaryButton
                title="Hủy"
                onPress={() => setEditNameModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <PrimaryButton
                title="Lưu thay đổi"
                onPress={handleSaveName}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Avatar Picker Bottom Sheet */}
      <AvatarPickerSheet
        visible={pickerSheetVisible}
        onClose={() => setPickerSheetVisible(false)}
        onSelectLibrary={pickImageFromLibrary}
        onSelectCamera={takePhotoWithCamera}
        disabled={isUploading}
      />

      {/* Success Toast */}
      {avatarToast && (
        <View style={styles.toastWrap}>
          <CheckCircle2 size={16} color={colors.success} style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>{avatarToast}</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.md,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  avatarWrap: {
    marginBottom: spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.closedLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: spacing.md,
    width: '100%',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: colors.danger,
  },
  toastWrap: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: '#1E1B18',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 9999,
  },
  toastText: {
    ...typography.captionMedium,
    color: colors.textInverse,
    fontSize: 13,
  },
  displayName: {
    ...typography.pageTitle,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  localeInfo: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.openLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  stateBadgeText: {
    ...typography.captionMedium,
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  profileActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionBtnHalf: {
    flex: 1,
    height: 42,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.sectionTitle,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    paddingHorizontal: 4,
  },
  settingsGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  settingTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingValue: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  toggleSwitch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  toggleThumbActive: {
    transform: [{ translateX: 18 }],
  },
  logoutSection: {
    marginTop: spacing.md,
  },
  logoutBtn: {
    borderColor: '#FECACA',
    backgroundColor: colors.closedLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  modalTitle: {
    ...typography.sectionTitle,
    fontSize: 18,
    color: colors.textPrimary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  modalInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
  },
});
