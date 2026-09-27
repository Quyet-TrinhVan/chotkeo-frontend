import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, radius, spacing, typography } from '../../../src/theme/tokens';
import { PlaceCard } from '../../../src/components/PlaceCard';
import { useRouter } from '../../../src/navigation/router';
import { placeApi } from '../../../src/api/placeApi';
import { PlaceSummary } from '../../../src/types/api';
import { Sparkles, Dices, Users, Compass, ChevronRight, Flame, AlertCircle } from 'lucide-react-native';

interface HomeScreenProps {
  onSelectPlace?: (placeId: string) => void;
}

export default function HomeScreen({ onSelectPlace }: HomeScreenProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Collections query: GET /api/v1/collections
  const collectionsQuery = useQuery({
    queryKey: ['collections'],
    queryFn: () => placeApi.getCollections(),
  });

  // 2. Discovery Feed query: GET /api/v1/discovery/feed
  const discoveryFeedQuery = useQuery({
    queryKey: ['discoveryFeed'],
    queryFn: () => placeApi.getDiscoveryFeed(),
  });

  // 3. Fallback / direct Places query: GET /api/v1/places
  const placesQuery = useQuery({
    queryKey: ['places'],
    queryFn: () => placeApi.getPlaces({ pageSize: 50 }),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      collectionsQuery.refetch(),
      discoveryFeedQuery.refetch(),
      placesQuery.refetch(),
    ]);
    setIsRefreshing(false);
  };

  const collections = collectionsQuery.data ?? [];
  const discoverySections = (discoveryFeedQuery.data ?? []).filter(
    (s) => s.places && s.places.length > 0
  );
  const places = placesQuery.data?.places ?? [];

  const isLoading = (discoveryFeedQuery.isLoading || placesQuery.isLoading) && !isRefreshing;
  const isError =
    (discoveryFeedQuery.isError || placesQuery.isError) &&
    discoverySections.length === 0 &&
    places.length === 0;

  // Filter places for horizontal carousels when discoverySections is empty
  const nearbyPlaces = places.filter((p) => (p.distanceMeters || 0) < 1500);
  const openPlaces = places.filter((p) => p.openState === 'OPEN');
  const coffeePlaces = places.filter((p) => p.category?.code?.toLowerCase() === 'coffee');
  const budgetPlaces = places.filter((p) => (p.priceRange?.maxAmount || 0) <= 150000);

  const hasAnyFeedSections = discoverySections.length > 0;
  const hasAnyPlaces = hasAnyFeedSections || places.length > 0;

  const handlePlacePress = (id: string) => {
    if (onSelectPlace) {
      onSelectPlace(id);
    } else {
      router.push(`/places/${id}`);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Top Greeting Area */}
      <View style={styles.topGreeting}>
        <View style={styles.greetingHeader}>
          <View>
            <Text style={styles.greetingTitle}>Chốt mood - Chốt kèo</Text>
            <Text style={styles.greetingSubtitle}>
              Mood bạn chọn, kèo mình show.
            </Text>
          </View>
          <View style={styles.brandIconWrap}>
            <Flame size={24} color={colors.primary} />
          </View>
        </View>
      </View>

      {/* Action Section: "Kèo hôm nay, chốt cách nào?" */}
      <View style={styles.actionSection}>
        {/* 1. Header khu vực */}
        <View style={styles.actionHeader}>
          <Text style={styles.actionSectionTitle}>Kèo hôm nay, chốt cách nào?</Text>
          <Text style={styles.actionSectionSubtitle}>
            Theo mood, theo duyên hay theo hội?
          </Text>
        </View>

        {/* 2. Card chính: Chốt theo mood (CTA nổi bật nhất) */}
        <Pressable
          onPress={() => router.push('/recommendation/create')}
          style={({ pressed }) => [
            styles.heroCard,
            {
              transform: [{ scale: pressed ? 0.985 : 1 }],
              opacity: pressed ? 0.94 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Chốt theo mood. Nói mood hôm nay, mình tìm kèo hợp gu cho bạn. AI gợi ý."
        >
          {/* Subtle decorative ambient blob */}
          <View style={styles.heroBlob} pointerEvents="none" />

          <View style={styles.heroContentRow}>
            {/* Sparkle/AI icon ở góc trái */}
            <View style={styles.heroIconWrap}>
              <Sparkles size={24} color={colors.secondary} />
            </View>

            {/* Title, description, CTA pill */}
            <View style={styles.heroTextCol}>
              <View style={styles.heroTitleRow}>
                <Text style={styles.heroTitle}>Chốt theo mood</Text>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI gợi ý</Text>
                </View>
              </View>
              <Text style={styles.heroDesc}>
                Nói mood hôm nay, mình tìm kèo hợp gu cho bạn
              </Text>
            </View>

            {/* Chevron bên phải */}
            <View style={styles.heroChevronWrap}>
              <ChevronRight size={20} color={colors.textMuted} />
            </View>
          </View>
        </Pressable>

        {/* 3. Hai card phụ nằm cùng một hàng bên dưới */}
        <View style={styles.subCardsRow}>
          {/* Card trái: Chốt ngẫu hứng */}
          <Pressable
            onPress={() => router.push('/random-draw/create')}
            style={({ pressed }) => [
              styles.subCard,
              {
                transform: [{ scale: pressed ? 0.975 : 1 }],
                opacity: pressed ? 0.94 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Chốt ngẫu hứng. Để vận may chọn kèo."
          >
            <View style={[styles.subIconWrap, { backgroundColor: '#FFF0ED' }]}>
              <Dices size={24} color="#EA580C" />
            </View>
            <View style={styles.subTextWrap}>
              <Text style={styles.subCardTitle} numberOfLines={2}>
                Chốt ngẫu hứng
              </Text>
              <Text style={styles.subCardDesc} numberOfLines={2}>
                Để vận may chọn kèo
              </Text>
            </View>
          </Pressable>

          {/* Card phải: Chốt cùng hội */}
          <Pressable
            onPress={() => router.push('/rooms/create')}
            style={({ pressed }) => [
              styles.subCard,
              {
                transform: [{ scale: pressed ? 0.975 : 1 }],
                opacity: pressed ? 0.94 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Chốt cùng hội. Cả nhóm vote rồi cùng chốt."
          >
            <View style={[styles.subIconWrap, { backgroundColor: colors.primaryLight }]}>
              <Users size={24} color={colors.primary} />
            </View>
            <View style={styles.subTextWrap}>
              <Text style={styles.subCardTitle} numberOfLines={2}>
                Chốt cùng hội
              </Text>
              <Text style={styles.subCardDesc} numberOfLines={2}>
                Cả nhóm vote rồi cùng chốt
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Bộ sưu tập banner (chỉ hiển thị khi backend có collections) */}
      {collections.length > 0 && (
        <View style={styles.collectionBanner}>
          {collections[0].coverMedia?.renditions?.[0]?.url ? (
            <Image
              source={{ uri: collections[0].coverMedia.renditions[0].url }}
              style={styles.collectionImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.collectionImage, { backgroundColor: colors.primary }]} />
          )}
          <View style={styles.collectionOverlay}>
            {collections[0].theme ? (
              <View style={styles.collectionTag}>
                <Text style={styles.collectionTagText}>{collections[0].theme}</Text>
              </View>
            ) : null}
            <Text style={styles.collectionTitle}>{collections[0].title}</Text>
            {collections[0].description ? (
              <Text style={styles.collectionSub}>{collections[0].description}</Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Render Discovery Sections từ backend */}
      {hasAnyFeedSections ? (
        discoverySections.map((section) => (
          <View key={section.id} style={styles.carouselSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Pressable
                onPress={() => router.push('/search')}
                style={styles.seeAllBtn}
              >
                <Text style={styles.seeAllText}>Xem tất cả</Text>
                <ChevronRight size={14} color={colors.primary} />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {section.places.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onPress={() => handlePlacePress(place.id)}
                />
              ))}
            </ScrollView>
          </View>
        ))
      ) : hasAnyPlaces ? (
        <>
          {/* Carousel: Gần bạn (chỉ render nếu có data) */}
          {nearbyPlaces.length > 0 && (
            <View style={styles.carouselSection}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Gần bạn</Text>
                  <Text style={styles.sectionSub}>Bán kính dưới 1.5km tại trung tâm</Text>
                </View>
                <Pressable
                  onPress={() => router.push('/search')}
                  style={styles.seeAllBtn}
                >
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                  <ChevronRight size={14} color={colors.primary} />
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {nearbyPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onPress={() => handlePlacePress(place.id)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Carousel: Đang mở cửa (chỉ render nếu có data) */}
          {openPlaces.length > 0 && (
            <View style={styles.carouselSection}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Đang mở cửa ngay</Text>
                  <Text style={styles.sectionSub}>Sẵn sàng ghé ngay bây giờ</Text>
                </View>
                <Pressable
                  onPress={() => router.push('/search')}
                  style={styles.seeAllBtn}
                >
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                  <ChevronRight size={14} color={colors.primary} />
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {openPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onPress={() => handlePlacePress(place.id)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Carousel: Cafe góc quen (chỉ render nếu có data) */}
          {coffeePlaces.length > 0 && (
            <View style={styles.carouselSection}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Cafe góc quen</Text>
                  <Text style={styles.sectionSub}>Không gian trò chuyện, làm việc và sống ảo</Text>
                </View>
                <Pressable
                  onPress={() => router.push('/search')}
                  style={styles.seeAllBtn}
                >
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                  <ChevronRight size={14} color={colors.primary} />
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {coffeePlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onPress={() => handlePlacePress(place.id)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Carousel: Ăn ngon dưới 150K (chỉ render nếu có data) */}
          {budgetPlaces.length > 0 && (
            <View style={styles.carouselSection}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Ăn ngon dưới 150K</Text>
                  <Text style={styles.sectionSub}>No nê hợp túi tiền sinh viên & văn phòng</Text>
                </View>
                <Pressable
                  onPress={() => router.push('/search')}
                  style={styles.seeAllBtn}
                >
                  <Text style={styles.seeAllText}>Xem tất cả</Text>
                  <ChevronRight size={14} color={colors.primary} />
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {budgetPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onPress={() => handlePlacePress(place.id)}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </>
      ) : isLoading ? (
        <View style={styles.statusBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.statusLoadingText}>Đang tải địa điểm...</Text>
        </View>
      ) : isError ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconWrap, { backgroundColor: '#FEE2E2' }]}>
            <AlertCircle size={32} color={colors.danger} />
          </View>
          <Text style={styles.emptyTitle}>Không thể tải dữ liệu</Text>
          <Text style={styles.emptyDesc}>
            Không thể kết nối hoặc máy chủ đang bận. Vui lòng thử lại.
          </Text>
          <Pressable style={styles.retryBtn} onPress={handleRefresh}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        /* Empty state chuẩn khi toàn bộ backend chưa có địa điểm */
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Compass size={36} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có địa điểm</Text>
          <Text style={styles.emptyDesc}>
            Dữ liệu địa điểm đang được cập nhật. Hãy quay lại sau.
          </Text>
          <Pressable style={styles.retryBtn} onPress={handleRefresh}>
            <Text style={styles.retryBtnText}>Tải lại</Text>
          </Pressable>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  topGreeting: {
    paddingHorizontal: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingTitle: {
    ...typography.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  greetingSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: 4,
  },
  brandIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  actionHeader: {
    marginBottom: 16,
  },
  actionSectionTitle: {
    ...typography.sectionTitle,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionSectionSubtitle: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  heroBlob: {
    position: 'absolute',
    right: -25,
    top: -25,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.secondaryLight,
    opacity: 0.5,
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  heroTitle: {
    ...typography.cardTitle,
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  aiBadge: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
  },
  heroDesc: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  heroChevronWrap: {
    marginLeft: 6,
  },
  subCardsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 16,
  },
  subCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 136,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  subIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  subTextWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  subCardTitle: {
    ...typography.cardTitle,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
    lineHeight: 20,
  },
  subCardDesc: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  collectionBanner: {
    marginHorizontal: 20,
    height: 150,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(23, 23, 23, 0.45)',
    padding: spacing.md,
    justifyContent: 'flex-end',
  },
  collectionTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: 6,
  },
  collectionTagText: {
    ...typography.captionMedium,
    color: '#78350F',
    fontSize: 11,
    fontWeight: '700',
  },
  collectionTitle: {
    ...typography.cardTitle,
    fontSize: 18,
    color: colors.textInverse,
    fontWeight: '700',
  },
  collectionSub: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  carouselSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    fontSize: 19,
    color: colors.textPrimary,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  seeAllText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 2,
  },
  horizontalScroll: {
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  statusBox: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLoadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.sectionTitle,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryBtnText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '600',
  },
});
