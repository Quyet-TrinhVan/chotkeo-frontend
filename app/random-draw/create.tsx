import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../src/theme/tokens';
import { AppHeader } from '../../src/components/AppHeader';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SecondaryButton } from '../../src/components/SecondaryButton';
import { StatusBadge } from '../../src/components/StatusBadge';
import { randomDrawApi } from '../../src/api/randomDrawApi';
import { RandomDraw, PlaceSummary } from '../../src/types/api';
import { MOCK_PLACES } from '../../src/api/mockData';
import { useRouter } from '../../src/navigation/router';
import {
  Dices,
  RefreshCw,
  Navigation,
  Users,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react-native';

export default function RandomDrawScreen() {
  const router = useRouter();
  const { reduceMotion } = router;

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDraw, setCurrentDraw] = useState<RandomDraw | null>(null);
  const [showResultCard, setShowResultCard] = useState(false);
  const [reelPlaces, setReelPlaces] = useState<PlaceSummary[]>([]);

  // Animation values for horizontal CSGO reel
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleStartDraw = async () => {
    setIsDrawing(true);
    setShowResultCard(false);
    scrollX.setValue(0);
    fadeAnim.setValue(0);

    // Call server endpoint. Server commits winner BEFORE animation!
    const draw = await randomDrawApi.createDraw();
    setCurrentDraw(draw);

    // Prepare reel candidate items
    const places = draw.animationSpec.itemIds.map((id) => {
      return MOCK_PLACES.find((p) => p.id === id) || draw.result;
    });
    setReelPlaces(places);

    const ITEM_WIDTH = 130;
    const targetOffset = draw.animationSpec.resultIndex * ITEM_WIDTH - 100;

    if (reduceMotion) {
      // Short reveal mode for accessibility
      setTimeout(() => {
        setIsDrawing(false);
        setShowResultCard(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }, draw.reduceMotionFallback.durationMs);
    } else {
      // Reel spring deceleration animation
      Animated.timing(scrollX, {
        toValue: targetOffset,
        duration: draw.animationSpec.durationMs,
        easing: Easing.bezier(0.12, 0.8, 0.25, 1),
        useNativeDriver: true,
      }).start(() => {
        setIsDrawing(false);
        setShowResultCard(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleReroll = () => {
    handleStartDraw();
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Mở kèo ngẫu nhiên"
        subtitle="Vòng quay số phận"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Banner */}
        <View style={styles.introCard}>
          <View style={styles.diceIconWrap}>
            <Dices size={36} color="#EA580C" />
          </View>
          <Text style={styles.introTitle}>Để số phận chọn?</Text>
          <Text style={styles.introSubtitle}>
            Không cần suy nghĩ đau đầu. Máy chủ sẽ chốt một địa điểm xuất sắc từ tập ứng viên đang mở cửa gần bạn.
          </Text>
        </View>

        {/* Animated Reel Canvas */}
        <View style={styles.reelContainer}>
          <View style={styles.reelIndicator} />

          {reelPlaces.length > 0 ? (
            <Animated.View
              style={[
                styles.reelTrack,
                {
                  transform: [{ translateX: Animated.multiply(scrollX, -1) }],
                },
              ]}
            >
              {reelPlaces.map((plc, idx) => (
                <View key={idx} style={styles.reelItem}>
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
            <View style={styles.reelPlaceholder}>
              <Text style={styles.reelPlaceholderText}>
                Nhấn “Mở kèo ngay” để quay số
              </Text>
            </View>
          )}
        </View>

        {/* Big CTA when not drawn yet or drawing */}
        {!showResultCard ? (
          <PrimaryButton
            title={isDrawing ? 'Đang quay số phận...' : 'Mở kèo ngay'}
            icon={<Dices size={20} color={colors.textInverse} />}
            loading={isDrawing}
            onPress={handleStartDraw}
            style={styles.drawCTA}
          />
        ) : null}

        {/* Celebratory Result Card Reveal */}
        {showResultCard && currentDraw ? (
          <Animated.View style={[styles.resultRevealCard, { opacity: fadeAnim }]}>
            <View style={styles.revealHeader}>
              <View style={styles.tagChot}>
                <Flame size={16} color={colors.textInverse} style={{ marginRight: 4 }} />
                <Text style={styles.tagChotText}>Chốt chỗ này!</Text>
              </View>
              <Text style={styles.poolInfo}>
                Được chọn ngẫu nhiên từ {currentDraw.poolSize} địa điểm
              </Text>
            </View>

            <Image
              source={{
                uri:
                  currentDraw.result.heroImageUrl ||
                  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
              }}
              style={styles.resultImage}
              resizeMode="cover"
            />

            <View style={styles.resultDetails}>
              <View style={styles.resultTopRow}>
                <Text style={styles.resultPlaceName}>{currentDraw.result.name}</Text>
                <StatusBadge status={currentDraw.result.openState} />
              </View>

              <Text style={styles.resultCategory}>
                {currentDraw.result.category.label} • {Math.round(currentDraw.result.priceRange.minAmount / 1000)}k - {Math.round(currentDraw.result.priceRange.maxAmount / 1000)}k VND
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionButtonsCol}>
                <PrimaryButton
                  title="Chỉ đường tới quán"
                  icon={<Navigation size={18} color={colors.textInverse} />}
                  onPress={() => router.push(`/places/${currentDraw.result.id}`)}
                  style={{ marginBottom: spacing.xs }}
                />

                <SecondaryButton
                  title="Tạo phòng bình chọn với chỗ này"
                  icon={<Users size={18} color={colors.textPrimary} />}
                  onPress={() => router.push('/rooms/create')}
                  style={{ marginBottom: spacing.xs }}
                />

                <SecondaryButton
                  title="Quay lại lần nữa"
                  icon={<RefreshCw size={16} color={colors.textPrimary} />}
                  onPress={handleReroll}
                  variant="soft"
                />
              </View>
            </View>
          </Animated.View>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  introCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  diceIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  introTitle: {
    ...typography.pageTitle,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  introSubtitle: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  reelContainer: {
    height: 120,
    backgroundColor: '#1E1B18',
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  reelIndicator: {
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
  reelPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelPlaceholderText: {
    ...typography.captionMedium,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  drawCTA: {
    height: 52,
    marginBottom: spacing.lg,
  },
  resultRevealCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.container,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  revealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
  },
  tagChot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  tagChotText: {
    ...typography.captionMedium,
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  poolInfo: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  resultImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surfaceMuted,
  },
  resultDetails: {
    padding: spacing.lg,
  },
  resultTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultPlaceName: {
    ...typography.pageTitle,
    fontSize: 20,
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  resultCategory: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actionButtonsCol: {
    gap: 6,
  },
});
