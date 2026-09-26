import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../src/theme/tokens';
import { AppHeader } from '../../src/components/AppHeader';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SecondaryButton } from '../../src/components/SecondaryButton';
import { Chip } from '../../src/components/Chip';
import { StatusBadge } from '../../src/components/StatusBadge';
import { recommendationApi } from '../../src/api/recommendationApi';
import { RecommendationOption, RecommendationSession } from '../../src/types/api';
import { useRouter } from '../../src/navigation/router';
import {
  Utensils,
  Coffee,
  Beer,
  Gamepad2,
  Users,
  Lock,
  EyeOff,
  Navigation,
  RefreshCw,
  Sparkles,
  CheckCircle,
  SearchX,
  SlidersHorizontal,
} from 'lucide-react-native';

export default function RecommendationCreateScreen() {
  const router = useRouter();

  // Step state
  const [activity, setActivity] = useState<'EAT' | 'COFFEE' | 'DRINK' | 'PLAY'>('COFFEE');
  const [area, setArea] = useState('Hoàn Kiếm');
  const [partySize, setPartySize] = useState(2);
  const [budgetBand, setBudgetBand] = useState('50k - 100k');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Yên tĩnh']);

  // Result state
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<RecommendationSession | null>(null);
  const [lockedIds, setLockedIds] = useState<string[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  const activities = [
    { type: 'COFFEE' as const, label: 'Cafe', icon: Coffee },
    { type: 'EAT' as const, label: 'Ăn uống', icon: Utensils },
    { type: 'DRINK' as const, label: 'Quán nhậu & Bar', icon: Beer },
    { type: 'PLAY' as const, label: 'Đi chơi & Vui vẻ', icon: Gamepad2 },
  ];

  const areas = ['Hoàn Kiếm', 'Tây Hồ', 'Đống Đa', 'Ba Đình', 'Cầu Giấy'];
  const budgets = ['Dưới 50k', '50k - 100k', '100k - 200k', '200k+'];
  const availableStyles = ['Yên tĩnh', 'Hẹn hò', 'Sống ảo', 'Làm việc', 'Vỉa hè', 'Mở muộn'];

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    try {
      if (session) {
        try {
          const keepPlaceIds = (session.options || [])
            .filter((opt) => lockedIds.includes(opt.id))
            .map((opt) => opt.place.id);
          const excludedPlaceIds = (session.options || [])
            .filter((opt) => hiddenIds.includes(opt.id))
            .map((opt) => opt.place.id);
          const newSession = await recommendationApi.regenerate(session.id, {
            keepPlaceIds: keepPlaceIds.length > 0 ? keepPlaceIds : undefined,
            excludedPlaceIds: excludedPlaceIds.length > 0 ? excludedPlaceIds : undefined,
          });
          setSession(newSession);
          return;
        } catch (regenErr) {
          console.warn('[Recommendation] Regenerate failed, falling back to createSession:', regenErr);
        }
      }

      const newSession = await recommendationApi.createSession({
        areaId: '0199f2b8-4b1d-7a31-9c68-934e08e501ab',
        activityType: activity,
        partySize,
      });
      setSession(newSession);
    } catch (err) {
      console.warn('Failed to get recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLock = (optId: string) => {
    setLockedIds((prev) =>
      prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    );
  };

  const hideOption = (optId: string) => {
    setHiddenIds((prev) => [...prev, optId]);
  };

  const toggleStyle = (st: string) => {
    setSelectedStyles((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  // If a recommendation session has been generated
  if (session) {
    const options = session.options ?? [];
    const hasResults = options.length > 0;
    const visibleOptions = options.filter((opt) => !hiddenIds.includes(opt.id));
    const hints = session.relaxationHints ?? [];

    const handleBackToForm = () => {
      setSession(null);
      setLockedIds([]);
      setHiddenIds([]);
    };

    return (
      <View style={styles.container}>
        <AppHeader
          title="Gợi ý lên kèo"
          onBack={handleBackToForm}
          rightAction={
            <Pressable onPress={handleBackToForm} style={styles.changeFilterBtn} disabled={isLoading}>
              <Text style={styles.changeFilterText}>Đổi gu</Text>
            </Pressable>
          }
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {hasResults ? (
            /* State A: Có kết quả (options.length > 0) */
            <>
              <View style={styles.resultHeader}>
                <View style={styles.sparkleWrap}>
                  <Sparkles size={24} color={colors.secondary} />
                </View>
                <Text style={styles.resultTitle}>Có kèo rồi!</Text>
                <Text style={styles.resultSubtitle}>
                  Hệ thống đã chọn {options.length} phương án phù hợp nhất cho bạn
                </Text>
              </View>

              {isLoading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Đang tạo gợi ý mới...</Text>
                </View>
              )}

              {visibleOptions.map((opt) => {
                const isLocked = lockedIds.includes(opt.id);
                return (
                  <View key={opt.id} style={[styles.recCard, isLocked && styles.recCardLocked]}>
                    <Image
                      source={{
                        uri:
                          opt.place.heroImageUrl ||
                          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
                      }}
                      style={styles.recImage}
                      resizeMode="cover"
                    />

                    <View style={styles.recBody}>
                      <View style={styles.recTopRow}>
                        <Text style={styles.recPlaceName}>{opt.place.name}</Text>
                        <StatusBadge status={opt.place.openState} />
                      </View>

                      <Text style={styles.recCategory}>
                        {opt.place.category.label} • {Math.round(opt.place.priceRange.minAmount / 1000)}k - {Math.round(opt.place.priceRange.maxAmount / 1000)}k VND
                      </Text>

                      {/* Reasons / Explanation Chips */}
                      <View style={styles.reasonsRow}>
                        {opt.explanationCodes.map((reason, idx) => (
                          <View key={idx} style={styles.reasonChip}>
                            <CheckCircle size={12} color={colors.success} style={{ marginRight: 4 }} />
                            <Text style={styles.reasonText}>{reason}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Card actions: Giữ lại / Ẩn */}
                      <View style={styles.cardActionsRow}>
                        <Pressable
                          onPress={() => toggleLock(opt.id)}
                          style={[styles.miniActionBtn, isLocked && styles.miniActionBtnActive]}
                          disabled={isLoading}
                        >
                          <Lock size={14} color={isLocked ? colors.primary : colors.textSecondary} />
                          <Text style={[styles.miniActionText, isLocked && { color: colors.primary }]}>
                            {isLocked ? 'Đã giữ' : 'Giữ lại'}
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => hideOption(opt.id)}
                          style={styles.miniActionBtn}
                          disabled={isLoading}
                        >
                          <EyeOff size={14} color={colors.textSecondary} />
                          <Text style={styles.miniActionText}>Ẩn</Text>
                        </Pressable>
                      </View>

                      {/* Accept action for this place */}
                      <PrimaryButton
                        title="Chốt chỗ này"
                        onPress={() => router.push(`/places/${opt.place.id}`)}
                        disabled={isLoading}
                        style={{ height: 42, marginTop: spacing.sm }}
                      />
                    </View>
                  </View>
                );
              })}
            </>
          ) : (
            /* State B: Không có kết quả (options.length === 0) */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <SearchX size={32} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có kèo phù hợp</Text>
              <Text style={styles.emptyDesc}>
                Không tìm thấy địa điểm nào phù hợp với các điều kiện bạn đã chọn.
              </Text>

              {/* Gợi ý nới điều kiện nếu có relaxationHints từ backend */}
              {hints.length > 0 && (
                <View style={styles.hintsCard}>
                  <View style={styles.hintsHeaderRow}>
                    <SlidersHorizontal size={16} color={colors.primary} />
                    <Text style={styles.hintsTitle}>Gợi ý nới điều kiện</Text>
                  </View>
                  {hints.map((hint, idx) => (
                    <View key={idx} style={styles.hintItem}>
                      <View style={styles.hintDot} />
                      <Text style={styles.hintText}>{hint.message}</Text>
                    </View>
                  ))}
                </View>
              )}

              {isLoading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>Đang tìm kiếm lại...</Text>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom actions switch dynamically */}
        {hasResults ? (
          <View style={styles.bottomResultBar}>
            <SecondaryButton
              title="Gợi ý lại"
              icon={<RefreshCw size={16} color={colors.textPrimary} />}
              onPress={handleGetRecommendations}
              loading={isLoading}
              disabled={isLoading}
              style={{ flex: 1, marginRight: 8 }}
            />
            <PrimaryButton
              title="Tạo phòng ngay"
              onPress={() => router.push('/rooms/create')}
              disabled={isLoading}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        ) : (
          <View style={styles.bottomResultBar}>
            <SecondaryButton
              title="Đổi điều kiện"
              onPress={handleBackToForm}
              disabled={isLoading}
              style={{ flex: 1, marginRight: 8 }}
            />
            <PrimaryButton
              title="Gợi ý lại"
              icon={<RefreshCw size={16} color={colors.textInverse} />}
              onPress={handleGetRecommendations}
              loading={isLoading}
              disabled={isLoading}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        )}
      </View>
    );
  }

  // Lightweight Guided Form
  return (
    <View style={styles.container}>
      <AppHeader
        title="Lên kèo"
        subtitle="Để Chốt Kèo gợi ý nhanh"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Bạn muốn làm gì? */}
        <View style={styles.formSection}>
          <Text style={styles.questionTitle}>1. Bạn muốn làm gì?</Text>
          <View style={styles.activityGrid}>
            {activities.map((item) => {
              const IconComp = item.icon;
              const isSelected = activity === item.type;
              return (
                <Pressable
                  key={item.type}
                  onPress={() => setActivity(item.type)}
                  style={[
                    styles.activityCard,
                    isSelected && styles.activityCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.activityIconWrap,
                      isSelected && styles.activityIconWrapSelected,
                    ]}
                  >
                    <IconComp
                      size={22}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.activityLabel,
                      isSelected && styles.activityLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Section 2: Khu vực nào? */}
        <View style={styles.formSection}>
          <Text style={styles.questionTitle}>2. Khu vực nào?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {areas.map((ar) => (
              <Pressable
                key={ar}
                onPress={() => setArea(ar)}
                style={[
                  styles.pillOption,
                  area === ar && styles.pillOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.pillOptionText,
                    area === ar && styles.pillOptionTextSelected,
                  ]}
                >
                  {ar}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Section 3: Đi mấy người? */}
        <View style={styles.formSection}>
          <Text style={styles.questionTitle}>3. Đi mấy người?</Text>
          <View style={styles.partySizeRow}>
            {[1, 2, 4, 6, 8].map((num) => (
              <Pressable
                key={num}
                onPress={() => setPartySize(num)}
                style={[
                  styles.partyBtn,
                  partySize === num && styles.partyBtnSelected,
                ]}
              >
                <Text
                  style={[
                    styles.partyBtnText,
                    partySize === num && styles.partyBtnTextSelected,
                  ]}
                >
                  {num === 8 ? '8+' : num}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Section 4: Khoảng bao nhiêu / người? */}
        <View style={styles.formSection}>
          <Text style={styles.questionTitle}>4. Khoảng bao nhiêu / người?</Text>
          <View style={styles.budgetRow}>
            {budgets.map((bg) => (
              <Pressable
                key={bg}
                onPress={() => setBudgetBand(bg)}
                style={[
                  styles.budgetBtn,
                  budgetBand === bg && styles.budgetBtnSelected,
                ]}
              >
                <Text
                  style={[
                    styles.budgetBtnText,
                    budgetBand === bg && styles.budgetBtnTextSelected,
                  ]}
                >
                  {bg}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Section 5: Phong cách? */}
        <View style={styles.formSection}>
          <Text style={styles.questionTitle}>5. Phong cách mong muốn?</Text>
          <View style={styles.stylesWrap}>
            {availableStyles.map((st) => {
              const selected = selectedStyles.includes(st);
              return (
                <Pressable
                  key={st}
                  onPress={() => toggleStyle(st)}
                  style={[
                    styles.styleChipBtn,
                    selected && styles.styleChipBtnSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.styleChipBtnText,
                      selected && styles.styleChipBtnTextSelected,
                    ]}
                  >
                    {st}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={styles.stickyCTA}>
        <PrimaryButton
          title="Gợi ý cho tôi"
          icon={<Sparkles size={18} color={colors.textInverse} />}
          loading={isLoading}
          onPress={handleGetRecommendations}
          style={styles.submitCTA}
        />
      </View>
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
  formSection: {
    marginBottom: spacing.lg,
  },
  questionTitle: {
    ...typography.sectionTitle,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  activityGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  activityCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  activityCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  activityIconWrapSelected: {
    backgroundColor: '#FED7AA',
  },
  activityLabel: {
    ...typography.captionMedium,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  activityLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  pillOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
  },
  pillOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillOptionText: {
    ...typography.captionMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  pillOptionTextSelected: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  partySizeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  partyBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  partyBtnText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  partyBtnTextSelected: {
    color: colors.textInverse,
  },
  budgetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  budgetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  budgetBtnSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  budgetBtnText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontSize: 13,
  },
  budgetBtnTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  stylesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleChipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  styleChipBtnSelected: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },
  styleChipBtnText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  styleChipBtnTextSelected: {
    color: colors.secondary,
    fontWeight: '700',
  },
  stickyCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitCTA: {
    height: 50,
  },
  changeFilterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  changeFilterText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sparkleWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  resultTitle: {
    ...typography.pageTitle,
    fontSize: 24,
    color: colors.textPrimary,
  },
  resultSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  recCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  recCardLocked: {
    borderColor: colors.primary,
  },
  recImage: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surfaceMuted,
  },
  recBody: {
    padding: spacing.md,
  },
  recTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recPlaceName: {
    ...typography.cardTitle,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  recCategory: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  reasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.openLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  reasonText: {
    ...typography.captionMedium,
    color: colors.open,
    fontSize: 11,
    fontWeight: '600',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  miniActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
  },
  miniActionBtnActive: {
    backgroundColor: colors.primaryLight,
  },
  miniActionText: {
    ...typography.captionMedium,
    fontSize: 12,
    marginLeft: 4,
    color: colors.textSecondary,
  },
  bottomResultBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.container,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.cardTitle,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  hintsCard: {
    width: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(235, 94, 40, 0.2)',
  },
  hintsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  hintsTitle: {
    ...typography.captionMedium,
    fontWeight: '700',
    color: colors.primary,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: 8,
  },
  hintText: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  loadingText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
});
