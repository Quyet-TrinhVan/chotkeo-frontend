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
import { Rocket, Flame, Sparkles, MapPin, CheckCircle2 } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';
import { PlaceSummary } from '../../../types/api';
import { RandomAnimationProps } from '../types';

const CHECKPOINT_HEIGHT = 74;
const TOTAL_CHECKPOINTS = 16;
const WINNER_INDEX = 12;

export function RocketRandomAnimation({
  options,
  winner,
  draw,
  isRunning,
  reduceMotion = false,
  onComplete,
}: RandomAnimationProps) {
  // Animation values
  const trackY = useRef(new Animated.Value(0)).current;
  const rocketY = useRef(new Animated.Value(0)).current;
  const rocketScale = useRef(new Animated.Value(1)).current;
  const flameAnim = useRef(new Animated.Value(0)).current;
  const burstAnim = useRef(new Animated.Value(0)).current;
  const [landed, setLanded] = useState(false);

  // Prepare flight path checkpoints: sequence of candidate places ending at WINNER_INDEX
  const flightCheckpoints = useMemo<PlaceSummary[]>(() => {
    if (!winner) {
      if (options.length > 0) return options.slice(0, 5);
      return [];
    }

    const otherOptions = options.filter((o) => o.id !== winner.id);
    const items: PlaceSummary[] = [];

    for (let i = 0; i < TOTAL_CHECKPOINTS; i++) {
      if (i === WINNER_INDEX) {
        items.push(winner);
      } else {
        const item = otherOptions.length > 0
          ? otherOptions[i % otherOptions.length]
          : winner;
        items.push(item);
      }
    }
    return items;
  }, [options, winner]);

  // Target scroll distance to align winner with focal line
  // In our container, focal area is at y = 60px
  const targetOffset = WINNER_INDEX * CHECKPOINT_HEIGHT;
  const durationMs = draw?.animationSpec?.durationMs ?? 4200;

  useEffect(() => {
    if (isRunning && winner) {
      setLanded(false);
      trackY.setValue(0);
      rocketY.setValue(0);
      rocketScale.setValue(1);
      flameAnim.setValue(0);
      burstAnim.setValue(0);

      if (reduceMotion) {
        // Accessibility quick reveal (350ms)
        const fallbackMs = draw?.reduceMotionFallback?.durationMs ?? 350;
        Animated.parallel([
          Animated.timing(trackY, {
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
          setLanded(true);
          onComplete();
        });
        return;
      }

      // 1. Flame looping exhaust pulse during flight
      const flameLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim, {
            toValue: 0.4,
            duration: 120,
            useNativeDriver: true,
          }),
        ])
      );
      flameLoop.start();

      // 2. Rocket takeoff & cruising motion
      const rocketTakeoff = Animated.sequence([
        // Initial rumble & takeoff
        Animated.timing(rocketY, {
          toValue: -18,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Cruising slight float
        Animated.timing(rocketY, {
          toValue: -12,
          duration: durationMs - 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // Landing descent towards winner
        Animated.timing(rocketY, {
          toValue: -6,
          duration: 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      // 3. Track scroll passing options (slow -> fast -> decelerate to winner)
      const trackFlight = Animated.timing(trackY, {
        toValue: targetOffset,
        duration: durationMs,
        easing: Easing.bezier(0.12, 0.8, 0.22, 1),
        useNativeDriver: true,
      });

      // 4. Rocket scale dynamics during boost
      const rocketDynamics = Animated.sequence([
        Animated.timing(rocketScale, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(rocketScale, {
          toValue: 1.05,
          duration: durationMs - 1400,
          useNativeDriver: true,
        }),
        Animated.timing(rocketScale, {
          toValue: 1.0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]);

      // Run parallel flight
      Animated.parallel([rocketTakeoff, trackFlight, rocketDynamics]).start(({ finished }) => {
        flameLoop.stop();
        if (finished) {
          setLanded(true);
          // Celebration burst at touchdown
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
        flameLoop.stop();
        trackY.stopAnimation();
        rocketY.stopAnimation();
      };
    } else if (!isRunning) {
      trackY.setValue(0);
      rocketY.setValue(0);
      flameAnim.setValue(0);
      burstAnim.setValue(0);
      setLanded(false);
    }
  }, [
    isRunning,
    winner,
    targetOffset,
    durationMs,
    reduceMotion,
    draw,
    onComplete,
    trackY,
    rocketY,
    rocketScale,
    flameAnim,
    burstAnim,
  ]);

  return (
    <View style={styles.container}>
      {/* Flight Corridor Background with Sky/Star Elements */}
      <View style={styles.starsLayer}>
        <View style={[styles.starDot, { top: 20, left: '15%' }]} />
        <View style={[styles.starDot, { top: 45, right: '20%' }]} />
        <View style={[styles.starDot, { top: 110, left: '28%' }]} />
        <View style={[styles.starDot, { top: 160, right: '12%' }]} />
        <View style={[styles.starDot, { top: 220, left: '18%' }]} />
      </View>

      {/* Target Crosshair / Destination Gate Header */}
      <View style={styles.focalGate}>
        <View style={styles.focalLine} />
        <View style={styles.focalBadge}>
          <Sparkles size={12} color="#D97706" style={{ marginRight: 4 }} />
          <Text style={styles.focalText}>ĐIỂM HẠ CÁNH</Text>
        </View>
        <View style={styles.focalLine} />
      </View>

      {/* Vertical Options Track */}
      <View style={styles.flightTrackContainer}>
        {isRunning && flightCheckpoints.length === 0 ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.statusText}>Đang nạp tọa độ...</Text>
          </View>
        ) : flightCheckpoints.length > 0 ? (
          <Animated.View
            style={[
              styles.trackContent,
              {
                transform: [{ translateY: Animated.multiply(trackY, -1) }],
              },
            ]}
          >
            {flightCheckpoints.map((plc, idx) => {
              const isWinnerCheckpoint = idx === WINNER_INDEX;
              return (
                <View
                  key={`${plc.id}-${idx}`}
                  style={[
                    styles.checkpointCard,
                    isWinnerCheckpoint && landed && styles.checkpointCardWinner,
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        plc.heroImageUrl ||
                        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=80',
                    }}
                    style={styles.checkpointImage}
                  />
                  <View style={styles.checkpointInfo}>
                    <Text
                      style={[
                        styles.checkpointName,
                        isWinnerCheckpoint && landed && styles.checkpointNameWinner,
                      ]}
                      numberOfLines={1}
                    >
                      {plc.name}
                    </Text>
                    <View style={styles.checkpointMeta}>
                      <MapPin size={11} color={colors.textSecondary} style={{ marginRight: 3 }} />
                      <Text style={styles.checkpointCategory} numberOfLines={1}>
                        {plc.category?.label || 'Địa điểm'}
                      </Text>
                    </View>
                  </View>

                  {isWinnerCheckpoint && (
                    <View style={[styles.targetTag, landed && styles.targetTagActive]}>
                      {landed ? (
                        <CheckCircle2 size={13} color={colors.textInverse} style={{ marginRight: 3 }} />
                      ) : (
                        <Sparkles size={13} color="#D97706" style={{ marginRight: 3 }} />
                      )}
                      <Text style={[styles.targetTagText, landed && styles.targetTagTextActive]}>
                        {landed ? 'Chốt kèo!' : 'Mục tiêu'}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </Animated.View>
        ) : (
          <View style={styles.idlePlaceholder}>
            <Text style={styles.idlePrompt}>
              Nhấn “Mở kèo ngay” để phóng tên lửa!
            </Text>
          </View>
        )}
      </View>

      {/* Floating Rocket Launchpad & Vehicle (stationed at bottom) */}
      <View style={styles.launchpadContainer}>
        <Animated.View
          style={[
            styles.rocketAssembly,
            {
              transform: [
                { translateY: rocketY },
                { scale: rocketScale },
              ],
            },
          ]}
        >
          {/* Flame Tail Exhaust */}
          {isRunning && (
            <Animated.View
              style={[
                styles.flameTail,
                {
                  opacity: flameAnim,
                  transform: [
                    {
                      scaleY: flameAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1.3],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Flame size={24} color="#EA580C" />
            </Animated.View>
          )}

          {/* Rocket Ship Badge */}
          <View style={styles.rocketBadge}>
            <Rocket size={26} color={colors.textInverse} style={styles.rocketIcon} />
          </View>
        </Animated.View>

        {/* Celebratory Landing Sparkles Burst */}
        {landed && (
          <Animated.View
            style={[
              styles.celebrationBurst,
              {
                opacity: burstAnim,
                transform: [
                  {
                    scale: burstAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1.15],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.burstBadge}>
              <Sparkles size={16} color="#EA580C" style={{ marginRight: 5 }} />
              <Text style={styles.burstText}>Chốt kèo!</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    backgroundColor: '#FFF9F4',
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  starsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  starDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FDBA74',
    opacity: 0.6,
  },
  focalGate: {
    position: 'absolute',
    top: 66,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 15,
    paddingHorizontal: spacing.sm,
    pointerEvents: 'none',
  },
  focalLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#FDBA74',
    opacity: 0.7,
  },
  focalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginHorizontal: 6,
  },
  focalText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.6,
  },
  flightTrackContainer: {
    height: 160,
    overflow: 'hidden',
    marginTop: 18,
  },
  trackContent: {
    paddingHorizontal: spacing.md,
  },
  checkpointCard: {
    height: CHECKPOINT_HEIGHT - 8,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  checkpointCardWinner: {
    backgroundColor: '#FFF7ED',
    borderColor: colors.primary,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  checkpointImage: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  checkpointInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  checkpointName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  checkpointNameWinner: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  checkpointMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkpointCategory: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  targetTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  targetTagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  targetTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  targetTagTextActive: {
    color: colors.textInverse,
  },
  centerLoading: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    ...typography.captionMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  idlePlaceholder: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idlePrompt: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    fontSize: 13,
  },
  launchpadContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  rocketAssembly: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rocketBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  rocketIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  flameTail: {
    position: 'absolute',
    bottom: -18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  celebrationBurst: {
    position: 'absolute',
    top: -12,
    zIndex: 25,
  },
  burstBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  burstText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
});
