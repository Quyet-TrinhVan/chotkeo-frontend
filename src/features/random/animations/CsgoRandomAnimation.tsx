import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';
import { PlaceSummary } from '../../../types/api';
import { RandomAnimationProps } from '../types';

const ITEM_WIDTH = 130;
const REEL_ITEM_COUNT = 20;
const WINNER_INDEX = 15;

export function CsgoRandomAnimation({
  options,
  winner,
  draw,
  isRunning,
  reduceMotion = false,
  onComplete,
}: RandomAnimationProps) {
  const scrollX = useRef(new Animated.Value(0)).current;

  // Build reel items: put winner at WINNER_INDEX, fill other slots with options
  const reelItems = useMemo<PlaceSummary[]>(() => {
    if (!winner) {
      if (options.length > 0) return options.slice(0, 10);
      return [];
    }

    const otherOptions = options.filter((o) => o.id !== winner.id);
    const resultIndex = draw?.animationSpec?.resultIndex ?? WINNER_INDEX;
    const totalCount = Math.max(resultIndex + 5, REEL_ITEM_COUNT);

    const items: PlaceSummary[] = [];
    for (let i = 0; i < totalCount; i++) {
      if (i === resultIndex) {
        items.push(winner);
      } else {
        const item = otherOptions.length > 0
          ? otherOptions[i % otherOptions.length]
          : winner;
        items.push(item);
      }
    }
    return items;
  }, [options, winner, draw]);

  const targetIndex = draw?.animationSpec?.resultIndex ?? WINNER_INDEX;
  const durationMs = draw?.animationSpec?.durationMs ?? 4000;
  const targetOffset = targetIndex * ITEM_WIDTH - 100;

  useEffect(() => {
    if (isRunning && winner) {
      scrollX.setValue(0);

      if (reduceMotion) {
        const fallbackMs = draw?.reduceMotionFallback?.durationMs ?? 350;
        const timer = setTimeout(() => {
          onComplete();
        }, fallbackMs);
        return () => clearTimeout(timer);
      }

      const animation = Animated.timing(scrollX, {
        toValue: targetOffset,
        duration: durationMs,
        easing: Easing.bezier(0.12, 0.8, 0.25, 1),
        useNativeDriver: true,
      });

      animation.start(({ finished }) => {
        if (finished) {
          onComplete();
        }
      });

      return () => animation.stop();
    } else if (!isRunning) {
      scrollX.setValue(0);
    }
  }, [isRunning, winner, targetOffset, durationMs, reduceMotion, draw, onComplete, scrollX]);

  return (
    <View style={styles.container}>
      {/* Central Indicator Marker */}
      <View style={styles.indicator} />

      {isRunning && reelItems.length === 0 ? (
        <View style={styles.placeholder}>
          <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: spacing.xs }} />
          <Text style={styles.loadingText}>Đang quay số...</Text>
        </View>
      ) : reelItems.length > 0 ? (
        <Animated.View
          style={[
            styles.reelTrack,
            {
              transform: [{ translateX: Animated.multiply(scrollX, -1) }],
            },
          ]}
        >
          {reelItems.map((plc, idx) => (
            <View key={`${plc.id}-${idx}`} style={styles.reelItem}>
              <Image
                source={{
                  uri:
                    plc.heroImageUrl ||
                    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=80',
                }}
                style={styles.reelImage}
              />
              <Text style={styles.reelItemName} numberOfLines={1}>
                {plc.name}
              </Text>
            </View>
          ))}
        </Animated.View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Nhấn “Mở kèo ngay” để bắt đầu
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 124,
    backgroundColor: '#1E1B18',
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    marginLeft: -2,
    width: 4,
    backgroundColor: colors.primary,
    zIndex: 20,
    borderRadius: 2,
  },
  reelTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: '50%',
  },
  reelItem: {
    width: 120,
    marginRight: 10,
    alignItems: 'center',
  },
  reelImage: {
    width: 70,
    height: 70,
    borderRadius: radius.md,
    backgroundColor: '#333',
    marginBottom: 4,
  },
  reelItemName: {
    color: colors.textInverse,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.captionMedium,
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '600',
  },
  placeholderText: {
    ...typography.captionMedium,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
