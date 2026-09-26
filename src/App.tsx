/**
 * Chốt Kèo - Mobile Application Host
 * Runs React Native layout in Expo Web / Mobile container
 */

import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Text, Pressable, Platform } from 'react-native';
import RootLayout from '../app/_layout';
import { colors } from './theme/tokens';
import { Smartphone, Maximize2 } from 'lucide-react-native';

export default function App() {
  const { width: windowWidth } = useWindowDimensions();
  const [deviceFrameEnabled, setDeviceFrameEnabled] = useState(true);

  // On native iOS and Android, directly render the app layout
  if (Platform.OS !== 'web') {
    return <RootLayout />;
  }

  // If running on desktop web browser, enable optional phone frame emulator
  const isDesktopWeb = windowWidth > 520;

  return (
    <View style={styles.outerContainer}>
      {isDesktopWeb && (
        <View style={styles.topControlBar}>
          <View style={styles.brandTitleWrap}>
            <View style={styles.appDot} />
            <Text style={styles.appNameLabel}>Chốt Kèo • Mobile App (React Native + Expo)</Text>
          </View>
          <Pressable
            onPress={() => setDeviceFrameEnabled(!deviceFrameEnabled)}
            style={styles.toggleFrameBtn}
            accessibilityRole="button"
          >
            {deviceFrameEnabled ? (
              <>
                <Maximize2 size={14} color="#A1A1AA" style={{ marginRight: 6 }} />
                <Text style={styles.toggleFrameText}>Toàn màn hình</Text>
              </>
            ) : (
              <>
                <Smartphone size={14} color="#A1A1AA" style={{ marginRight: 6 }} />
                <Text style={styles.toggleFrameText}>Khung điện thoại</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      <View
        style={[
          styles.deviceWrapper,
          isDesktopWeb && deviceFrameEnabled ? styles.phoneFrame : styles.fullViewport,
        ]}
      >
        {/* Device Status Bar Mockup */}
        <View style={styles.deviceStatusBar}>
          <Text style={styles.statusTime}>20:06</Text>
          <View style={styles.dynamicIsland} />
          <View style={styles.statusIcons}>
            <Text style={styles.statusNetwork}>5G</Text>
            <View style={styles.batteryIcon}>
              <View style={styles.batteryFill} />
            </View>
          </View>
        </View>

        {/* The React Native App Layout */}
        <View style={styles.appContentContainer}>
          <RootLayout />
        </View>

        {/* Home Indicator */}
        <View style={styles.homeIndicatorBar}>
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#181615',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh' as any,
  },
  topControlBar: {
    position: 'absolute',
    top: 12,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  brandTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  appNameLabel: {
    color: '#E4E4E7',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'system-ui',
  },
  toggleFrameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleFrameText: {
    color: '#D4D4D8',
    fontSize: 12,
    fontWeight: '500',
  },
  deviceWrapper: {
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  phoneFrame: {
    width: 390,
    height: 820,
    maxHeight: '94vh' as any,
    borderRadius: 44,
    borderWidth: 10,
    borderColor: '#2D2A28',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  fullViewport: {
    width: '100%',
    height: '100%',
    maxWidth: 500,
  },
  deviceStatusBar: {
    height: 38,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 4,
    zIndex: 999,
  },
  statusTime: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dynamicIsland: {
    width: 88,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#181615',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusNetwork: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 6,
  },
  batteryIcon: {
    width: 20,
    height: 10,
    borderRadius: 2.5,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    padding: 1,
  },
  batteryFill: {
    width: '80%',
    height: '100%',
    backgroundColor: colors.textPrimary,
    borderRadius: 1,
  },
  appContentContainer: {
    flex: 1,
  },
  homeIndicatorBar: {
    height: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
});
