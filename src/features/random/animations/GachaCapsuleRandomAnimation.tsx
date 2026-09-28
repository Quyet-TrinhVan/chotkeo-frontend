import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Sparkles, Gift, CheckCircle2, RotateCw } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';
import { PlaceSummary } from '../../../types/api';
import { RandomAnimationProps } from '../types';

// Palette of candy capsule colors for vibrant dome display
const CAPSULE_PALETTES = [
  { top: '#EA580C', bottom: '#FFFFFF' }, // Coral
  { top: '#F59E0B', bottom: '#FFFFFF' }, // Amber
  { top: '#8B5CF6', bottom: '#FFFFFF' }, // Violet
  { top: '#06B6D4', bottom: '#FFFFFF' }, // Cyan
  { top: '#EC4899', bottom: '#FFFFFF' }, // Pink
  { top: '#10B981', bottom: '#FFFFFF' }, // Emerald
  { top: '#F97316', bottom: '#FFFFFF' }, // Orange
  { top: '#6366F1', bottom: '#FFFFFF' }, // Indigo
];

interface CapsuleBallProps {
  color: { top: string; bottom: string };
  size?: number;
  style?: any;
}

function MiniCapsuleBall({ color, size = 32, style }: CapsuleBallProps) {
  const half = size / 2;
  return (
    <View style={[styles.miniCapsuleWrap, { width: size, height: size }, style]}>
      <View
        style={[
          styles.miniCapsuleTop,
          {
            backgroundColor: color.top,
            height: half,
            borderTopLeftRadius: half,
            borderTopRightRadius: half,
          },
        ]}
      >
        <View style={styles.glossHighlight} />
      </View>
      <View
        style={[
          styles.miniCapsuleBottom,
          {
            backgroundColor: color.bottom,
            height: half,
            borderBottomLeftRadius: half,
            borderBottomRightRadius: half,
          },
        ]}
      />
      <View style={styles.capsuleBand} />
    </View>
  );
}

export function GachaCapsuleRandomAnimation({
  options,
  winner,
  draw,
  isRunning,
  reduceMotion = false,
  onComplete,
}: RandomAnimationProps) {
  // Animation controller values
  const machineShake = useRef(new Animated.Value(0)).current;
  const capsuleJiggle = useRef(new Animated.Value(0)).current;
  const knobRotation = useRef(new Animated.Value(0)).current;
  const capsuleDropY = useRef(new Animated.Value(-60)).current;
  const capsuleDropOpacity = useRef(new Animated.Value(0)).current;
  const capsuleScale = useRef(new Animated.Value(1)).current;
  const capsuleSplitTop = useRef(new Animated.Value(0)).current;
  const capsuleSplitBottom = useRef(new Animated.Value(0)).current;
  const prizeRevealOpacity = useRef(new Animated.Value(0)).current;
  const prizeRevealScale = useRef(new Animated.Value(0.7)).current;
  const burstAnim = useRef(new Animated.Value(0)).current;

  // Local state phases
  const [phase, setPhase] = useState<'IDLE' | 'SHAKING' | 'TURNING' | 'DROPPING' | 'OPENING' | 'REVEALED'>('IDLE');

  useEffect(() => {
    if (isRunning && winner) {
      setPhase('SHAKING');

      // Reset values
      machineShake.setValue(0);
      capsuleJiggle.setValue(0);
      knobRotation.setValue(0);
      capsuleDropY.setValue(-60);
      capsuleDropOpacity.setValue(0);
      capsuleScale.setValue(1);
      capsuleSplitTop.setValue(0);
      capsuleSplitBottom.setValue(0);
      prizeRevealOpacity.setValue(0);
      prizeRevealScale.setValue(0.7);
      burstAnim.setValue(0);

      if (reduceMotion) {
        // Fast accessibility reveal (~400ms)
        const fallbackMs = draw?.reduceMotionFallback?.durationMs ?? 400;
        capsuleDropOpacity.setValue(1);
        Animated.parallel([
          Animated.timing(capsuleDropY, {
            toValue: 20,
            duration: fallbackMs * 0.5,
            useNativeDriver: true,
          }),
          Animated.timing(prizeRevealOpacity, {
            toValue: 1,
            duration: fallbackMs,
            useNativeDriver: true,
          }),
          Animated.timing(prizeRevealScale, {
            toValue: 1,
            duration: fallbackMs,
            useNativeDriver: true,
          }),
          Animated.timing(burstAnim, {
            toValue: 1,
            duration: fallbackMs,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setPhase('REVEALED');
          onComplete();
        });
        return;
      }

      // 1. Machine Shake Sequence (0 - 800ms)
      const shakeSequence = Animated.sequence([
        Animated.timing(machineShake, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(machineShake, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(machineShake, { toValue: -5, duration: 70, useNativeDriver: true }),
        Animated.timing(machineShake, { toValue: 5, duration: 70, useNativeDriver: true }),
        Animated.timing(machineShake, { toValue: -4, duration: 80, useNativeDriver: true }),
        Animated.timing(machineShake, { toValue: 4, duration: 80, useNativeDriver: true }),
        Animated.timing(machineShake, { toValue: -2, duration: 90, useNativeDriver: true }),
        Animated.timing(machineShake, { toValue: 0, duration: 90, useNativeDriver: true }),
      ]);

      const jiggleSequence = Animated.sequence([
        Animated.timing(capsuleJiggle, { toValue: -8, duration: 100, useNativeDriver: true }),
        Animated.timing(capsuleJiggle, { toValue: 8, duration: 100, useNativeDriver: true }),
        Animated.timing(capsuleJiggle, { toValue: -6, duration: 100, useNativeDriver: true }),
        Animated.timing(capsuleJiggle, { toValue: 6, duration: 100, useNativeDriver: true }),
        Animated.timing(capsuleJiggle, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]);

      // 2. Knob Rotation (800ms - 1500ms)
      const knobSpin = Animated.timing(knobRotation, {
        toValue: 1,
        duration: 700,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true,
      });

      // 3. Capsule Drop & Bounce (1500ms - 2700ms)
      const dropAndBounce = Animated.parallel([
        Animated.timing(capsuleDropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.sequence([
          // Drop from chute to tray
          Animated.timing(capsuleDropY, {
            toValue: 15,
            duration: 500,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          // Bounce up
          Animated.timing(capsuleDropY, {
            toValue: -4,
            duration: 220,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          // Settle down
          Animated.timing(capsuleDropY, {
            toValue: 15,
            duration: 180,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]);

      // 4. Capsule Pop Open & Winner Card Emerges (2700ms - 3900ms)
      const capsuleOpenAndReveal = Animated.parallel([
        // Capsule scales up slightly
        Animated.timing(capsuleScale, {
          toValue: 1.15,
          duration: 350,
          useNativeDriver: true,
        }),
        // Top half splits upwards
        Animated.timing(capsuleSplitTop, {
          toValue: -28,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        // Bottom half splits downwards
        Animated.timing(capsuleSplitBottom, {
          toValue: 20,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Prize card zooms out from inside capsule
        Animated.timing(prizeRevealOpacity, {
          toValue: 1,
          duration: 450,
          delay: 150,
          useNativeDriver: true,
        }),
        Animated.timing(prizeRevealScale, {
          toValue: 1,
          duration: 500,
          delay: 150,
          easing: Easing.out(Easing.back(1.3)),
          useNativeDriver: true,
        }),
        // Celebration burst
        Animated.timing(burstAnim, {
          toValue: 1,
          duration: 450,
          delay: 250,
          useNativeDriver: true,
        }),
      ]);

      // Master Pipeline
      Animated.parallel([shakeSequence, jiggleSequence]).start(({ finished }) => {
        if (!finished) return;
        setPhase('TURNING');
        knobSpin.start(({ finished: knobDone }) => {
          if (!knobDone) return;
          setPhase('DROPPING');
          dropAndBounce.start(({ finished: dropDone }) => {
            if (!dropDone) return;
            setPhase('OPENING');
            capsuleOpenAndReveal.start(({ finished: openDone }) => {
              if (!openDone) return;
              setPhase('REVEALED');
              onComplete();
            });
          });
        });
      });

      return () => {
        machineShake.stopAnimation();
        capsuleJiggle.stopAnimation();
        knobRotation.stopAnimation();
        capsuleDropY.stopAnimation();
        capsuleScale.stopAnimation();
      };
    } else if (!isRunning) {
      setPhase('IDLE');
      machineShake.setValue(0);
      capsuleJiggle.setValue(0);
      knobRotation.setValue(0);
      capsuleDropY.setValue(-60);
      capsuleDropOpacity.setValue(0);
      capsuleScale.setValue(1);
      capsuleSplitTop.setValue(0);
      capsuleSplitBottom.setValue(0);
      prizeRevealOpacity.setValue(0);
      prizeRevealScale.setValue(0.7);
      burstAnim.setValue(0);
    }
  }, [
    isRunning,
    winner,
    reduceMotion,
    draw,
    onComplete,
    machineShake,
    capsuleJiggle,
    knobRotation,
    capsuleDropY,
    capsuleDropOpacity,
    capsuleScale,
    capsuleSplitTop,
    capsuleSplitBottom,
    prizeRevealOpacity,
    prizeRevealScale,
    burstAnim,
  ]);

  const knobRotationInterpolate = knobRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Decorative Header Bar */}
      <View style={styles.machineTopHeader}>
        <View style={styles.badgeLabel}>
          <Gift size={13} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.badgeText}>CHỐT KÈO GACHAPON</Text>
        </View>
        <Sparkles size={14} color="#F59E0B" />
      </View>

      {/* Main Machine Container with Shake Physics */}
      <Animated.View
        style={[
          styles.machineBody,
          {
            transform: [{ translateX: machineShake }],
          },
        ]}
      >
        {/* Glass Dome containing colorful capsule balls */}
        <View style={styles.glassDome}>
          <View style={styles.glassReflectionOverlay} />

          {/* Capsule balls bouncing inside dome */}
          <Animated.View
            style={[
              styles.capsulesCluster,
              {
                transform: [
                  { translateY: capsuleJiggle },
                  {
                    rotate: capsuleJiggle.interpolate({
                      inputRange: [-10, 10],
                      outputRange: ['-4deg', '4deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <MiniCapsuleBall color={CAPSULE_PALETTES[0]} size={34} style={{ position: 'absolute', top: 12, left: 16 }} />
            <MiniCapsuleBall color={CAPSULE_PALETTES[1]} size={32} style={{ position: 'absolute', top: 16, right: 20 }} />
            <MiniCapsuleBall color={CAPSULE_PALETTES[2]} size={36} style={{ position: 'absolute', top: 22, left: '38%' }} />
            <MiniCapsuleBall color={CAPSULE_PALETTES[3]} size={30} style={{ position: 'absolute', bottom: 12, left: 24 }} />
            <MiniCapsuleBall color={CAPSULE_PALETTES[4]} size={34} style={{ position: 'absolute', bottom: 10, right: 28 }} />
            <MiniCapsuleBall color={CAPSULE_PALETTES[5]} size={32} style={{ position: 'absolute', bottom: 14, left: '44%' }} />
            <MiniCapsuleBall color={CAPSULE_PALETTES[6]} size={28} style={{ position: 'absolute', top: 38, left: 10 }} />
            <MiniCapsuleBall color={CAPSULE_PALETTES[7]} size={28} style={{ position: 'absolute', top: 36, right: 12 }} />
          </Animated.View>
        </View>

        {/* Machine Base with Turn Knob and Chute Slot */}
        <View style={styles.pedestalBase}>
          <View style={styles.knobZone}>
            <Text style={styles.knobPrompt}>VẶN NÚM</Text>
            <Animated.View
              style={[
                styles.rotaryDial,
                {
                  transform: [{ rotate: knobRotationInterpolate }],
                },
              ]}
            >
              <View style={styles.knobWingLeft} />
              <View style={styles.knobCenterHub}>
                <RotateCw size={14} color="#FFF" />
              </View>
              <View style={styles.knobWingRight} />
            </Animated.View>
          </View>

          {/* Chute Opening & Dropped Winner Capsule */}
          <View style={styles.outputTray}>
            <View style={styles.trayBezel} />

            {/* Dropping and opening winner capsule */}
            {isRunning && winner ? (
              <Animated.View
                style={[
                  styles.droppedCapsuleAssembly,
                  {
                    opacity: capsuleDropOpacity,
                    transform: [
                      { translateY: capsuleDropY },
                      { scale: capsuleScale },
                    ],
                  },
                ]}
              >
                {/* Top Half of Capsule */}
                <Animated.View
                  style={[
                    styles.splitCapsuleTop,
                    {
                      transform: [
                        { translateY: capsuleSplitTop },
                        {
                          rotate: capsuleSplitTop.interpolate({
                            inputRange: [-30, 0],
                            outputRange: ['-16deg', '0deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.glossHighlightBig} />
                </Animated.View>

                {/* Bottom Half of Capsule */}
                <Animated.View
                  style={[
                    styles.splitCapsuleBottom,
                    {
                      transform: [{ translateY: capsuleSplitBottom }],
                    },
                  ]}
                />
              </Animated.View>
            ) : null}
          </View>
        </View>
      </Animated.View>

      {/* Floating Winner Card Reveal when Capsule Pops Open */}
      {winner && (phase === 'OPENING' || phase === 'REVEALED') ? (
        <Animated.View
          style={[
            styles.revealedPrizeCard,
            {
              opacity: prizeRevealOpacity,
              transform: [{ scale: prizeRevealScale }],
            },
          ]}
        >
          <View style={styles.prizeBadgeTag}>
            <CheckCircle2 size={13} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.prizeBadgeText}>Chốt kèo!</Text>
            <Sparkles size={13} color="#FEF08A" style={{ marginLeft: 4 }} />
          </View>

          <View style={styles.prizeInnerRow}>
            <Image
              source={{
                uri:
                  winner.heroImageUrl ||
                  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=80',
              }}
              style={styles.prizeThumb}
            />
            <View style={styles.prizeDetails}>
              <Text style={styles.prizeTitle} numberOfLines={1}>
                {winner.name}
              </Text>
              <Text style={styles.prizeSub} numberOfLines={1}>
                {winner.category?.label || 'Địa điểm'}
              </Text>
            </View>
          </View>
        </Animated.View>
      ) : null}

      {/* Status Footer Message */}
      <View style={styles.footerBar}>
        {phase === 'SHAKING' ? (
          <View style={styles.statusBubble}>
            <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.statusText}>Đang xáo trứng Gacha...</Text>
          </View>
        ) : phase === 'TURNING' ? (
          <View style={styles.statusBubble}>
            <Text style={styles.statusText}>Đang vặn chốt thưởng...</Text>
          </View>
        ) : phase === 'DROPPING' ? (
          <View style={styles.statusBubble}>
            <Text style={styles.statusText}>Trứng vàng đang rơi!</Text>
          </View>
        ) : phase === 'OPENING' || phase === 'REVEALED' ? (
          <View style={styles.statusBubbleSuccess}>
            <Sparkles size={14} color="#EA580C" style={{ marginRight: 4 }} />
            <Text style={styles.statusTextSuccess}>Trúng địa điểm vàng!</Text>
          </View>
        ) : (
          <Text style={styles.idleHintText}>Mỗi quả trứng giấu một điểm hẹn bất ngờ!</Text>
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
    paddingTop: 8,
    alignItems: 'center',
    position: 'relative',
  },
  machineTopHeader: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: 6,
  },
  badgeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9A3412',
    letterSpacing: 0.6,
  },
  machineBody: {
    width: '90%',
    alignItems: 'center',
  },
  glassDome: {
    width: 200,
    height: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderWidth: 2.5,
    borderColor: '#FDBA74',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  glassReflectionOverlay: {
    position: 'absolute',
    top: 6,
    left: 20,
    width: 28,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    transform: [{ rotate: '-25deg' }],
  },
  capsulesCluster: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  miniCapsuleWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  miniCapsuleTop: {
    width: '100%',
    position: 'relative',
  },
  glossHighlight: {
    position: 'absolute',
    top: 2,
    left: 4,
    width: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  miniCapsuleBottom: {
    width: '100%',
  },
  capsuleBand: {
    position: 'absolute',
    top: '48%',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  pedestalBase: {
    width: 220,
    backgroundColor: '#FFEDD5',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    borderWidth: 2,
    borderColor: '#FDBA74',
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  knobZone: {
    alignItems: 'center',
    width: 80,
  },
  knobPrompt: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 4,
  },
  rotaryDial: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#F97316',
  },
  knobCenterHub: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  knobWingLeft: {
    position: 'absolute',
    left: 4,
    width: 8,
    height: 12,
    backgroundColor: '#C2410C',
    borderRadius: 2,
  },
  knobWingRight: {
    position: 'absolute',
    right: 4,
    width: 8,
    height: 12,
    backgroundColor: '#C2410C',
    borderRadius: 2,
  },
  outputTray: {
    width: 90,
    height: 56,
    backgroundColor: '#E5E7EB',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trayBezel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#9CA3AF',
  },
  droppedCapsuleAssembly: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  splitCapsuleTop: {
    width: 46,
    height: 23,
    backgroundColor: '#EA580C',
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    borderWidth: 1.5,
    borderColor: '#C2410C',
    position: 'relative',
  },
  glossHighlightBig: {
    position: 'absolute',
    top: 4,
    left: 8,
    width: 10,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  splitCapsuleBottom: {
    width: 46,
    height: 23,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 23,
    borderBottomRightRadius: 23,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  revealedPrizeCard: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    width: 230,
    zIndex: 50,
  },
  prizeBadgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: 6,
  },
  prizeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  prizeInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prizeThumb: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  prizeDetails: {
    flex: 1,
  },
  prizeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  prizeSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  footerBar: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
  },
  statusBubbleSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  statusTextSuccess: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  idleHintText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
});
