/**
 * ProfileAvatar Component
 *
 * Displays user avatar with:
 * - Direct rendition URL or optimistic local preview
 * - Interactive camera badge button to trigger avatar upload
 * - Loading overlay with progress indicator and friendly Vietnamese messages
 * - Disabled states during active upload to prevent double uploads
 */

import React from 'react';
import {
  View,
  Image,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Camera, User } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';

export interface ProfileAvatarProps {
  avatarUrl?: string | null;
  previewUri?: string | null;
  isUploading?: boolean;
  uploadMessage?: string;
  onPressCamera: () => void;
  size?: number;
}

export function ProfileAvatar({
  avatarUrl,
  previewUri,
  isUploading = false,
  uploadMessage = 'Đang tải...',
  onPressCamera,
  size = 96,
}: ProfileAvatarProps) {
  const displayUri = previewUri || avatarUrl;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Avatar Image or Neutral User Placeholder */}
      {displayUri ? (
        <Image
          source={{ uri: displayUri }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.image,
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <User size={Math.round(size * 0.45)} color={colors.textSecondary} />
        </View>
      )}

      {/* Uploading Overlay */}
      {isUploading && (
        <View
          style={[
            styles.loadingOverlay,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <ActivityIndicator size="small" color={colors.textInverse} />
          <Text style={styles.loadingText} numberOfLines={2}>
            {uploadMessage}
          </Text>
        </View>
      )}

      {/* Camera Action Button Badge */}
      <Pressable
        onPress={onPressCamera}
        disabled={isUploading}
        style={({ pressed }) => [
          styles.cameraButton,
          isUploading && styles.cameraButtonDisabled,
          pressed && !isUploading && styles.cameraButtonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Đổi ảnh đại diện"
        accessibilityState={{ disabled: isUploading }}
      >
        <Camera size={16} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  image: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  loadingText: {
    marginTop: spacing.xxs,
    fontSize: 10,
    fontWeight: '500',
    color: colors.textInverse,
    textAlign: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  cameraButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.6,
  },
  cameraButtonPressed: {
    backgroundColor: colors.primaryPressed,
    transform: [{ scale: 0.95 }],
  },
});
