import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export type LocationServiceResult =
  | { success: true; coords: LocationCoordinates }
  | {
      success: false;
      reason: 'DENIED' | 'BLOCKED' | 'ERROR';
      message: string;
      canOpenSettings: boolean;
    };

/**
 * Opens native app settings if permission is blocked or user wants to configure
 */
export async function openAppSettings(): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  } catch (err) {
    console.warn('Failed to open app settings:', err);
  }
}

/**
 * Requests the user's current foreground location safely without throwing uncaught errors.
 *
 * Steps:
 * 1. Checks current foreground permissions
 * 2. If not granted and can ask again, requests permission
 * 3. If denied or blocked, returns friendly Vietnamese message
 * 4. If granted, retrieves current coordinates with balanced accuracy
 */
export async function requestCurrentLocation(): Promise<LocationServiceResult> {
  try {
    // 1. Check existing permission status
    let permission = await Location.getForegroundPermissionsAsync();

    // 2. Request if undetermined or can ask again
    if (permission.status !== 'granted') {
      if (permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }
    }

    // 3. Handle non-granted status
    if (permission.status !== 'granted') {
      const isBlocked = !permission.canAskAgain;
      if (isBlocked) {
        return {
          success: false,
          reason: 'BLOCKED',
          message: 'Quyền vị trí đang bị tắt. Bạn có thể bật lại trong Cài đặt.',
          canOpenSettings: true,
        };
      }

      return {
        success: false,
        reason: 'DENIED',
        message: 'Bạn chưa cấp quyền vị trí. Hãy chọn khu vực thủ công hoặc bật quyền trong Cài đặt.',
        canOpenSettings: true,
      };
    }

    // 4. Granted: retrieve position
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      success: true,
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  } catch (error) {
    console.warn('requestCurrentLocation error:', error);
    return {
      success: false,
      reason: 'ERROR',
      message: 'Không thể lấy vị trí hiện tại. Vui lòng thử lại.',
      canOpenSettings: false,
    };
  }
}
