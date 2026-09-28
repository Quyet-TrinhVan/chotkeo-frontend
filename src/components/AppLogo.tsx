import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const APP_LOGO_SOURCE = require('../../assets/logo-app.png');

// Image native dimensions: 1323 x 1189 (width / height ≈ 1.1127)
const LOGO_ASPECT_RATIO = 1323 / 1189;

export type AppLogoVariant = 'login' | 'explore';

export interface AppLogoProps {
  size?: number;
  variant?: AppLogoVariant;
  style?: StyleProp<ImageStyle>;
}

export function AppLogo({ size, variant = 'login', style }: AppLogoProps) {
  const defaultSize = variant === 'explore' ? 36 : 128;
  const targetSize = size ?? defaultSize;

  // Preserve exact aspect ratio without cropping or stretching
  const width = targetSize;
  const height = Math.round(targetSize / LOGO_ASPECT_RATIO);

  return (
    <Image
      source={APP_LOGO_SOURCE}
      style={[
        {
          width,
          height,
        },
        style,
      ]}
      resizeMode="contain"
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel="Logo Chốt Kèo"
    />
  );
}

export default AppLogo;
