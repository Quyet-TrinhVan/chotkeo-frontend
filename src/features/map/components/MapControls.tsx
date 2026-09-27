import React from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, shadows } from '../../../theme/tokens';
import { Locate, Plus, Minus } from 'lucide-react-native';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocateMe: () => void;
  isLocating?: boolean;
}

export const MapControls = React.memo(function MapControls({
  onZoomIn,
  onZoomOut,
  onLocateMe,
  isLocating = false,
}: MapControlsProps) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Current location button */}
      <Pressable
        onPress={onLocateMe}
        disabled={isLocating}
        style={({ pressed }) => [
          styles.btn,
          styles.btnLocation,
          pressed && styles.btnPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Vị trí của tôi"
      >
        {isLocating ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Locate size={20} color={colors.primary} />
        )}
      </Pressable>

      {/* Zoom In/Out Button Group */}
      <View style={styles.zoomGroup}>
        <Pressable
          onPress={onZoomIn}
          style={({ pressed }) => [
            styles.btn,
            styles.btnZoomTop,
            pressed && styles.btnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Phóng to bản đồ"
        >
          <Plus size={20} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          onPress={onZoomOut}
          style={({ pressed }) => [
            styles.btn,
            styles.btnZoomBottom,
            pressed && styles.btnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Thu nhỏ bản đồ"
        >
          <Minus size={20} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: 70,
    zIndex: 20,
    gap: 12,
  },
  btn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    backgroundColor: '#F3F4F6',
    transform: [{ scale: 0.96 }],
  },
  btnLocation: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  zoomGroup: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  btnZoomTop: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  btnZoomBottom: {
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
  },
});
