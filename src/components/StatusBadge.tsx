import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';
import { OpenState } from '../types/api';

interface StatusBadgeProps {
  status: OpenState;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'OPEN':
        return {
          label: 'Đang mở',
          bg: colors.openLight,
          textColor: colors.open,
          dotColor: colors.open,
        };
      case 'CLOSING_SOON':
        return {
          label: 'Sắp đóng',
          bg: colors.closingSoonLight,
          textColor: colors.closingSoon,
          dotColor: colors.closingSoon,
        };
      case 'CLOSED':
        return {
          label: 'Đã đóng',
          bg: colors.closedLight,
          textColor: colors.closed,
          dotColor: colors.closed,
        };
      default:
        return {
          label: 'Chưa rõ',
          bg: colors.unknownLight,
          textColor: colors.unknown,
          dotColor: colors.unknown,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dotColor }]} />
      <Text style={[styles.text, { color: config.textColor }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  text: {
    ...typography.captionMedium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
});
