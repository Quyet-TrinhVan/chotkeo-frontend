import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { Room, RoomStatus } from '../types/api';
import { ParticipantAvatarStack } from './ParticipantAvatarStack';
import { Clock, Users, CheckCircle2 } from 'lucide-react-native';

interface RoomCardProps {
  room: Room;
  onPress: () => void;
  style?: ViewStyle;
}

export function RoomCard({ room, onPress, style }: RoomCardProps) {
  const [pressed, setPressed] = useState(false);

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'OPEN':
        return {
          label: 'Đang mở',
          bg: colors.openLight,
          textColor: colors.open,
        };
      case 'DRAFT':
        return {
          label: 'Bản nháp',
          bg: colors.accentLight,
          textColor: '#B45309',
        };
      case 'CLOSED':
        return {
          label: 'Đã chốt',
          bg: colors.secondaryLight,
          textColor: colors.secondary,
        };
      default:
        return {
          label: status,
          bg: colors.surfaceMuted,
          textColor: colors.textSecondary,
        };
    }
  };

  const badgeConfig = getStatusBadge(room.status);

  // Time remaining format
  const getRemainingTime = (closesAt?: string | null) => {
    if (!closesAt) return null;
    const diffMs = new Date(closesAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Đã hết hạn';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `Còn ${hours}h ${mins}m`;
    return `Còn ${mins} phút`;
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.card,
        pressed && styles.cardPressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Phòng: ${room.title || 'Phòng kèo'}`}
    >
      <View style={styles.headerRow}>
        <View style={[styles.statusBadge, { backgroundColor: badgeConfig.bg }]}>
          <Text style={[styles.statusText, { color: badgeConfig.textColor }]}>
            {badgeConfig.label}
          </Text>
        </View>

        {room.closesAt && room.status === 'OPEN' ? (
          <View style={styles.countdownRow}>
            <Clock size={12} color={colors.warning} style={{ marginRight: 4 }} />
            <Text style={styles.countdownText}>{getRemainingTime(room.closesAt)}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {room.title || 'Phòng kèo nhóm'}
      </Text>

      {/* Place Thumbnails Preview */}
      <View style={styles.placesPreviewRow}>
        {room.options.slice(0, 3).map((opt, idx) => (
          <View key={opt.id} style={styles.thumbWrap}>
            <Image
              source={{
                uri:
                  opt.placeSnapshot.heroImageUrl ||
                  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=80',
              }}
              style={styles.thumbImage}
            />
            <Text style={styles.thumbName} numberOfLines={1}>
              {opt.placeSnapshot.name}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.statsCol}>
          <Text style={styles.optionsCountText}>
            {room.options.length} phương án bình chọn
          </Text>
        </View>

        {room.participantCount ? (
          <View style={styles.participantsContainer}>
            <ParticipantAvatarStack count={room.participantCount} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  statusText: {
    ...typography.captionMedium,
    fontSize: 11,
    fontWeight: '700',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownText: {
    ...typography.captionMedium,
    color: colors.warning,
    fontSize: 11,
  },
  title: {
    ...typography.cardTitle,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  placesPreviewRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  thumbWrap: {
    flex: 1,
    height: 70,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbName: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.xs,
  },
  statsCol: {
    flex: 1,
  },
  optionsCountText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
