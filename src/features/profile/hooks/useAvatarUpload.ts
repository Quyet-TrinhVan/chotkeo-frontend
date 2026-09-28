/**
 * Custom Hook: useAvatarUpload
 *
 * Coordinates:
 * - Expo ImagePicker (Gallery & Camera)
 * - Permissions handling with friendly Vietnamese alerts
 * - Pre-upload validation
 * - Upload session + Presigned PUT + Complete + PATCH /me
 * - Single-flight concurrency guard
 * - Optimistic preview & safe rollback on failure
 */

import { useState, useRef, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';
import { useAuth } from '../../../context/AuthContext';
import {
  avatarUploadService,
  UploadStepStatus,
} from '../services/avatarUploadService';
import { validateAvatarFile } from '../utils/fileValidation';

export interface UseAvatarUploadReturn {
  isUploading: boolean;
  uploadStep: UploadStepStatus;
  uploadMessage: string;
  previewUri: string | null;
  error: string | null;
  toastMessage: string | null;
  clearError: () => void;
  clearToast: () => void;
  pickImageFromLibrary: () => Promise<boolean>;
  takePhotoWithCamera: () => Promise<boolean>;
}

export function useAvatarUpload(): UseAvatarUploadReturn {
  const { user, refreshProfile } = useAuth();

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStep, setUploadStep] = useState<UploadStepStatus>('IDLE');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Concurrency guard ref to prevent multiple simultaneous upload flows
  const isRunningRef = useRef<boolean>(false);

  const clearError = useCallback(() => setError(null), []);
  const clearToast = useCallback(() => setToastMessage(null), []);

  /**
   * Internal pipeline executor for picked/captured image asset
   */
  const processAssetUpload = useCallback(
    async (asset: ImagePickerAsset): Promise<boolean> => {
      if (isRunningRef.current) {
        return false;
      }

      if (!user) {
        setError('Không tìm thấy thông tin tài khoản.');
        return false;
      }

      // Pre-validate before even setting loading state
      const validation = validateAvatarFile(asset.fileName, asset.mimeType, asset.fileSize);
      if (!validation.valid) {
        setError(validation.error || 'Định dạng ảnh chưa được hỗ trợ.');
        return false;
      }

      isRunningRef.current = true;
      setIsUploading(true);
      setError(null);
      setPreviewUri(asset.uri); // Optimistic preview
      setUploadStep('PREPARING');
      setUploadMessage('Đang chuẩn bị ảnh...');

      try {
        await avatarUploadService.uploadAvatar({
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: validation.normalizedMimeType || asset.mimeType,
          fileSize: asset.fileSize,
          currentUser: user,
          onProgress: (status, message) => {
            setUploadStep(status);
            setUploadMessage(message);
          },
        });

        // Pipeline succeeded: refresh profile and show toast
        await refreshProfile();
        setToastMessage('Đã cập nhật ảnh đại diện');
        setPreviewUri(null); // Backend rendition will take over
        return true;
      } catch (err: any) {
        // Rollback preview, show friendly error without resetting screen
        setPreviewUri(null);
        setError(err?.message || 'Tải ảnh thất bại. Vui lòng thử lại.');
        return false;
      } finally {
        setIsUploading(false);
        setUploadStep('IDLE');
        setUploadMessage('');
        isRunningRef.current = false;
      }
    },
    [user, refreshProfile]
  );

  /**
   * Pick image from media library
   */
  const pickImageFromLibrary = useCallback(async (): Promise<boolean> => {
    if (isRunningRef.current) return false;

    clearError();
    clearToast();

    try {
      if (!ImagePicker?.requestMediaLibraryPermissionsAsync) {
        setError('Không thể mở thư viện ảnh. Vui lòng thử lại.');
        return false;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        if (!permission.canAskAgain) {
          Alert.alert(
            'Quyền truy cập thư viện ảnh',
            'Chốt Kèo cần quyền truy cập thư viện ảnh để bạn chọn ảnh đại diện. Vui lòng cấp quyền trong Cài đặt thiết bị.',
            [
              { text: 'Hủy', style: 'cancel' },
              {
                text: 'Mở Cài đặt',
                onPress: () => {
                  Linking.openSettings().catch((err) => {
                    console.warn('[useAvatarUpload] Failed to open settings:', err);
                  });
                },
              },
            ]
          );
        }
        setError('Chốt Kèo cần quyền truy cập thư viện ảnh để bạn chọn ảnh đại diện.');
        return false;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return false;
      }

      const selectedAsset = result.assets[0];
      if (!selectedAsset?.uri) {
        return false;
      }

      return await processAssetUpload(selectedAsset);
    } catch (err: unknown) {
      console.warn('[useAvatarUpload] pickImageFromLibrary failed:', err);
      setError('Không thể mở thư viện ảnh. Vui lòng thử lại.');
      return false;
    }
  }, [processAssetUpload, clearError, clearToast]);

  /**
   * Take new photo with device camera
   */
  const takePhotoWithCamera = useCallback(async (): Promise<boolean> => {
    if (isRunningRef.current) return false;

    clearError();
    clearToast();

    try {
      if (!ImagePicker?.requestCameraPermissionsAsync) {
        setError('Không thể mở camera. Vui lòng thử lại.');
        return false;
      }

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        if (!permission.canAskAgain) {
          Alert.alert(
            'Quyền sử dụng máy ảnh',
            'Chốt Kèo cần quyền sử dụng camera để bạn chụp ảnh đại diện. Vui lòng cấp quyền trong Cài đặt thiết bị.',
            [
              { text: 'Hủy', style: 'cancel' },
              {
                text: 'Mở Cài đặt',
                onPress: () => {
                  Linking.openSettings().catch((err) => {
                    console.warn('[useAvatarUpload] Failed to open settings:', err);
                  });
                },
              },
            ]
          );
        }
        setError('Chốt Kèo cần quyền sử dụng camera để bạn chụp ảnh đại diện.');
        return false;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return false;
      }

      const capturedAsset = result.assets[0];
      if (!capturedAsset?.uri) {
        return false;
      }

      return await processAssetUpload(capturedAsset);
    } catch (err: unknown) {
      console.warn('[useAvatarUpload] takePhotoWithCamera failed:', err);
      setError('Không thể mở camera. Vui lòng thử lại.');
      return false;
    }
  }, [processAssetUpload, clearError, clearToast]);

  return {
    isUploading,
    uploadStep,
    uploadMessage,
    previewUri,
    error,
    toastMessage,
    clearError,
    clearToast,
    pickImageFromLibrary,
    takePhotoWithCamera,
  };
}
