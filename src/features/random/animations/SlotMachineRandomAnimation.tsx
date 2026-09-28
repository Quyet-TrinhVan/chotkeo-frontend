import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Sparkles, CheckCircle2, Flame } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';
import { PlaceSummary } from '../../../types/api';
import { RandomAnimationProps } from '../types';

const ITEM_HEIGHT = 100;
const REEL_LENGTH = 18;
const WINNER_INDEX = 14;

interface SingleReelProps {
  items: PlaceSummary[];
  translateY: Animated.Value;
  isWinnerRevealed: boolean;
}

function SlotReelColumn({ items, translateY, isWinnerRevealed }: SingleReelProps) {
  return (
    <View style={styles.reelColumn}>
      <Animated.View
        style={[
          styles.reelStrip,
          {
            transform: [{ translateY: Animated.multiply(translateY, -1) }],
          },
        ]}
      >
        {items.map((place, idx) => {
          const isTarget = idx === WINNER_INDEX && isWinnerRevealed;
          return (
            <View
              key={`${place.id}-${idx}`}
              style={[styles.slotCard, isTarget && styles.slotCardWinner]}
            >
              <Image
                source={{
                  uri:
                    place.heroImageUrl ||
                    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=80',
                }}
                style={styles.slotImage}
              />
              <Text
                style={[styles.slotName, isTarget && styles.slotNameWinner]}
                numberOfLines={1}
              >
                {place.name}
              </Text>
              <Text style={styles.slotCategory} numberOfLines={1}>
                {place.category?.label || 'Địa điểm'}
              </Text>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

export function SlotMachineRandomAnimation({
  options,
  winner,
  draw,
  isRunning,
  reduceMotion = false,
  onComplete,
}: RandomAnimationProps) {
  // 3 independent vertical scroll offsets for staggered stopping
  const reel1Y = useRef(new Animated.Value(0)).current;
  const reel2Y = useRef(new Animated.Value(0)).current;
  const reel3Y = useRef(new Animated.Value(0)).current;
  const burstAnim = useRef(new Animated.Value(0)).current;

  const [reel1Stopped, setReel1Stopped] = useState(false);
  const [reel2Stopped, setReel2Stopped] = useState(false);
  const [reel3Stopped, setReel3Stopped] = useState(false);
  const [isJackpot, setIsJackpot] = useState(false);

  // Generate 3 distinct sequences of places, all ending on WINNER at WINNER_INDEX
  const { reel1Items, reel2Items, reel3Items } = useMemo(() => {
    if (!winner) {
      const fallback = options.length > 0 ? options.slice(0, 3) : [];
      return { reel1Items: fallback, reel2Items: fallback, reel3Items: fallback };
    }

    const others = options.filter((o) => o.id !== winner.id);
    const buildList = (offsetShift: number) => {
      const list: PlaceSummary[] = [];
      for (let i = 0; i < REEL_LENGTH; i++) {
        if (i === WINNER_INDEX) {
          list.push(winner);
        } else {
          const item = others.length > 0
            ? others[(i + offsetShift) % others.length]
            : winner;
          list.push(item);
        }
      }
      return list;
    };

    return {
      reel1Items: buildList(0),
      reel2Items: buildList(1),
      reel3Items: buildList(2),
    };
  }, [options, winner]);

  const targetOffset = WINNER_INDEX * ITEM_HEIGHT;

  useEffect(() => {
    if (isRunning && winner) {
      setIsJackpot(false);
      setReel1Stopped(false);
      setReel2Stopped(false);
      setReel3Stopped(false);

      reel1Y.setValue(0);
      reel2Y.setValue(0);
      reel3Y.setValue(0);
      burstAnim.setValue(0);

      if (reduceMotion) {
        // Fast accessibility reveal (~400ms)
        const fallbackMs = draw?.reduceMotionFallback?.durationMs ?? 400;
        Animated.parallel([
          Animated.timing(reel1Y, {
            toValue: targetOffset,
            duration: fallbackMs,
            useNativeDriver: true,
          }),
          Animated.timing(reel2Y, {
            toValue: targetOffset,
            duration: fallbackMs,
            useNativeDriver: true,
          }),
          Animated.timing(reel3Y, {
            toValue: targetOffset,
            duration: fallbackMs,
            useNativeDriver: true,
          }),
          Animated.timing(burstAnim, {
            toValue: 1,
            duration: fallbackMs,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setReel1Stopped(true);
          setReel2Stopped(true);
          setReel3Stopped(true);
          setIsJackpot(true);
          onComplete();
        });
        return;
      }

      // Staggered decelerations: Reel 1 (2.4s) -> Reel 2 (3.1s) -> Reel 3 (3.8s)
      const anim1 = Animated.timing(reel1Y, {
        toValue: targetOffset,
        duration: 2400,
        easing: Easing.bezier(0.12, 0.8, 0.25, 1),
        useNativeDriver: true,
      });

      const anim2 = Animated.timing(reel2Y, {
        toValue: targetOffset,
        duration: 3100,
        easing: Easing.bezier(0.12, 0.8, 0.25, 1),
        useNativeDriver: true,
      });

      const anim3 = Animated.timing(reel3Y, {
        toValue: targetOffset,
        duration: 3800,
        easing: Easing.bezier(0.12, 0.8, 0.25, 1),
        useNativeDriver: true,
      });

      anim1.start(({ finished }) => {
        if (finished) setReel1Stopped(true);
      });

      anim2.start(({ finished }) => {
        if (finished) setReel2Stopped(true);
      });

      anim3.start(({ finished }) => {
        if (finished) {
          setReel3Stopped(true);
          setIsJackpot(true);

          // Winner celebratory pop
          Animated.timing(burstAnim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }).start(() => {
            onComplete();
          });
        }
      });

      return () => {
        reel1Y.stopAnimation();
        reel2Y.stopAnimation();
        reel3Y.stopAnimation();
      };
    } else if (!isRunning) {
      reel1Y.setValue(0);
      reel2Y.setValue(0);
      reel3Y.setValue(0);
      burstAnim.setValue(0);
      setReel1Stopped(false);
      setReel2Stopped(false);
      setReel3Stopped(false);
      setIsJackpot(false);
    }
  }, [
    isRunning,
    winner,
    targetOffset,
    reduceMotion,
    draw,
    onComplete,
    reel1Y,
    reel2Y,
    reel3Y,
    burstAnim,
  ]);

  return (
    <View style={styles.container}>
      {/* Slot Machine Machine Bezel Header */}
      <View style={styles.machineHeader}>
        <View style={styles.ledDotRow}>
          <View style={[styles.ledDot, isRunning && styles.ledActive]} />
          <View style={[styles.ledDot, isRunning && styles.ledActiveAlt]} />
          <View style={[styles.ledDot, isRunning && styles.ledActive]} />
        </View>

        <View style={styles.machineTitleBadge}>
          <Flame size={14} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.machineTitleText}>CHỐT KÈO LUCKY SLOTS</Text>
        </View>

        <View style={styles.ledDotRow}>
          <View style={[styles.ledDot, isRunning && styles.ledActive]} />
          <View style={[styles.ledDot, isRunning && styles.ledActiveAlt]} />
          <View style={[styles.ledDot, isRunning && styles.ledActive]} />
        </View>
      </View>

      {/* Main Viewport containing the 3 Reels */}
      <View style={styles.viewportContainer}>
        {/* Horizontal Win Line Indicator */}
        <View style={styles.winLine} />

        {isRunning && reel1Items.length === 0 ? (
          <View style={styles.placeholderWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.placeholderText}>Đang quay số...</Text>
          </View>
        ) : reel1Items.length > 0 ? (
          <View style={styles.reelsRow}>
            <SlotReelColumn
              items={reel1Items}
              translateY={reel1Y}
              isWinnerRevealed={isJackpot}
            />
            <SlotReelColumn
              items={reel2Items}
              translateY={reel2Y}
              isWinnerRevealed={isJackpot}
            />
            <SlotReelColumn
              items={reel3Items}
              translateY={reel3Y}
              isWinnerRevealed={isJackpot}
            />
          </View>
        ) : (
          <View style={styles.placeholderWrap}>
            <Text style={styles.placeholderText}>
              Nhấn “Mở kèo ngay” để gạt cần quay!
            </Text>
          </View>
        )}
      </View>

      {/* Status & Jackpot Celebration Banner */}
      <View style={styles.bottomBar}>
        {isJackpot ? (
          <Animated.View
            style={[
              styles.jackpotBanner,
              {
                opacity: burstAnim,
                transform: [
                  {
                    scale: burstAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <CheckCircle2 size={16} color={colors.textInverse} style={{ marginRight: 6 }} />
            <Text style={styles.jackpotText}>Chốt kèo! 3 hàng trùng khớp</Text>
            <Sparkles size={16} color="#FEF08A" style={{ marginLeft: 6 }} />
          </Animated.View>
        ) : isRunning ? (
          <View style={styles.spinningStatus}>
            <Text style={styles.spinningText}>
              {reel2Stopped
                ? 'Đang chốt ô cuối...'
                : reel1Stopped
                ? 'Đang so khớp...'
                : 'Đang quay slot...'}
            </Text>
          </View>
        ) : (
          <Text style={styles.idleStatusText}>3 ô cùng ra 1 quán = Chốt kèo!</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF9F4',
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#FED7AA',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  machineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FFEDD5',
    borderBottomWidth: 1.5,
    borderBottomColor: '#FDBA74',
  },
  ledDotRow: {
    flexDirection: 'row',
    gap: 4,
  },
  ledDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FDBA74',
  },
  ledActive: {
    backgroundColor: '#EA580C',
  },
  ledActiveAlt: {
    backgroundColor: '#EAB308',
  },
  machineTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  machineTitleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9A3412',
    letterSpacing: 0.8,
  },
  viewportContainer: {
    height: ITEM_HEIGHT,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    position: 'relative',
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  winLine: {
    position: 'absolute',
    top: ITEM_HEIGHT / 2 - 1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#EA580C',
    opacity: 0.35,
    zIndex: 10,
    pointerEvents: 'none',
  },
  reelsRow: {
    flexDirection: 'row',
    height: ITEM_HEIGHT,
    gap: 6,
    paddingHorizontal: 4,
  },
  reelColumn: {
    flex: 1,
    height: ITEM_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reelStrip: {
    width: '100%',
  },
  slotCard: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  slotCardWinner: {
    backgroundColor: '#FFF7ED',
  },
  slotImage: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#E5E7EB',
    marginBottom: 4,
  },
  slotName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    maxWidth: '100%',
  },
  slotNameWinner: {
    color: colors.primary,
    fontWeight: '800',
  },
  slotCategory: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 1,
  },
  placeholderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    fontSize: 12,
  },
  bottomBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFF9F4',
  },
  spinningStatus: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  spinningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  idleStatusText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  jackpotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: radius.pill,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  jackpotText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: 0.3,
  },
});
