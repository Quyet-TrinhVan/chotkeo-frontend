import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../theme/tokens';

interface ParticipantAvatarStackProps {
  count: number;
  avatars?: string[];
  maxVisible?: number;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
];

export function ParticipantAvatarStack({
  count,
  avatars = DEFAULT_AVATARS,
  maxVisible = 3,
}: ParticipantAvatarStackProps) {
  const visible = avatars.slice(0, maxVisible);
  const remaining = Math.max(0, count - maxVisible);

  return (
    <View style={styles.container}>
      {visible.map((url, idx) => (
        <View
          key={idx}
          style={[styles.avatarWrap, { marginLeft: idx === 0 ? 0 : -8, zIndex: 10 - idx }]}
        >
          <Image source={{ uri: url }} style={styles.avatar} />
        </View>
      ))}
      {remaining > 0 ? (
        <View style={[styles.avatarWrap, styles.moreWrap, { marginLeft: -8, zIndex: 0 }]}>
          <Text style={styles.moreText}>+{remaining}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.surface,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  moreWrap: {
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    ...typography.captionMedium,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
