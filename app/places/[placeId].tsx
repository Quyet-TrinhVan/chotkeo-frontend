import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../src/theme/tokens';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SecondaryButton } from '../../src/components/SecondaryButton';
import { StatusBadge } from '../../src/components/StatusBadge';
import { Chip } from '../../src/components/Chip';
import { placeApi } from '../../src/api/placeApi';
import { PlaceDetail } from '../../src/types/api';
import { useRouter } from '../../src/navigation/router';
import { ActivityIndicator } from 'react-native';
import {
  ArrowLeft,
  Share2,
  Navigation,
  PlusCircle,
  Clock,
  Phone,
  Globe,
  MapPin,
  Check,
  Dices,
  Users,
  Sparkles,
  AlertTriangle,
} from 'lucide-react-native';

interface PlaceDetailScreenProps {
  placeId?: string;
  onBack?: () => void;
}

export default function PlaceDetailScreen({ placeId, onBack }: PlaceDetailScreenProps) {
  const router = useRouter();
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [placeDetail, setPlaceDetail] = useState<PlaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetail() {
      if (!placeId) {
        setIsLoading(false);
        setError('Không tìm thấy thông tin địa điểm.');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await placeApi.getPlaceDetail(placeId);
        if (data) {
          setPlaceDetail(data);
        } else {
          setError('Không tìm thấy thông tin địa điểm.');
        }
      } catch (err) {
        console.warn('getPlaceDetail failed:', err);
        setError('Không tìm thấy thông tin địa điểm hoặc đã bị gỡ bỏ.');
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [placeId]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const formatPrice = (min?: number, max?: number) => {
    if (min === undefined && max === undefined) return 'Đang cập nhật';
    return `${Math.round((min || 0) / 1000)}k - ${Math.round((max || 0) / 1000)}k VND / người`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Đang tải thông tin địa điểm...</Text>
      </View>
    );
  }

  if (error || !placeDetail) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: spacing.xl }]}>
        <AlertTriangle size={48} color={colors.warning} />
        <Text style={[styles.placeName, { marginTop: spacing.md, textAlign: 'center' }]}>
          {error || 'Không tìm thấy địa điểm'}
        </Text>
        <PrimaryButton title="Quay lại" onPress={handleBack} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  const place = placeDetail.summary;
  const detail = placeDetail;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Hero Image at Top */}
        <View style={styles.heroContainer}>
          {place.heroImageUrl || place.heroMedia?.renditions?.[0]?.url ? (
            <Image
              source={{
                uri: place.heroImageUrl || place.heroMedia?.renditions?.[0]?.url,
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }]}>
              <MapPin size={48} color={colors.textMuted} />
            </View>
          )}

          {/* Top Overlays */}
          <View style={styles.navOverlay}>
            <Pressable
              onPress={handleBack}
              style={styles.iconCircleBtn}
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
            >
              <ArrowLeft size={20} color={colors.textPrimary} />
            </Pressable>

            <Pressable
              onPress={() => showToast('Đã sao chép link chia sẻ!')}
              style={styles.iconCircleBtn}
              accessibilityRole="button"
              accessibilityLabel="Chia sẻ"
            >
              <Share2 size={18} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Status Row */}
          <View style={styles.statusRow}>
            <StatusBadge status={place.openState} />
            <Text style={styles.categoryBadge}>{place.category.label}</Text>
            {place.distanceMeters ? (
              <Text style={styles.distanceBadgeText}>
                Cách bạn {(place.distanceMeters / 1000).toFixed(1)}km
              </Text>
            ) : null}
          </View>

          {/* Place Name */}
          <Text style={styles.placeName}>{place.name}</Text>

          {/* Price Range */}
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>
              {formatPrice(place.priceRange.minAmount, place.priceRange.maxAmount)}
            </Text>
            <Text style={styles.priceConfidence}>
              (Độ chính xác: {place.priceRange.confidence === 'HIGH' ? 'Cao' : 'Ước tính'})
            </Text>
          </View>

          {/* Style Chips */}
          {place.styles && place.styles.length > 0 ? (
            <View style={styles.stylesList}>
              {place.styles.map((s) => (
                <Chip key={s.id} label={s.label} variant="brand" style={{ marginRight: 6 }} />
              ))}
            </View>
          ) : null}

          {/* Freshness / Stale Warning if any */}
          {place.freshness.status === 'STALE' || place.freshness.status === 'DUE' ? (
            <View style={styles.freshnessWarning}>
              <AlertTriangle size={16} color={colors.warning} style={{ marginRight: 8 }} />
              <Text style={styles.warningText}>
                Thông tin giờ mở cửa có thể đã thay đổi gần đây.
              </Text>
            </View>
          ) : null}

          {/* Address Section */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MapPin size={18} color={colors.primary} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Địa chỉ</Text>
                <Text style={styles.infoValue}>{detail.address.displayAddress}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Clock size={18} color={colors.secondary} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Giờ mở cửa hôm nay</Text>
                <Text style={styles.infoValue}>
                  07:00 - 22:30 (Mở cửa tất cả các ngày trong tuần)
                </Text>
              </View>
            </View>

            {detail.contact?.phone ? (
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Phone size={18} color={colors.open} style={styles.infoIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Điện thoại liên hệ</Text>
                  <Text style={styles.infoValue}>{detail.contact.phone}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Amenities */}
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>Tiện ích nổi bật</Text>
            <View style={styles.amenitiesGrid}>
              {detail.amenities?.map((am) => (
                <View key={am.id} style={styles.amenityItem}>
                  <Check size={14} color={colors.success} style={{ marginRight: 6 }} />
                  <Text style={styles.amenityText}>{am.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={styles.bottomBar}>
        <SecondaryButton
          title="Chỉ đường"
          icon={<Navigation size={18} color={colors.textPrimary} />}
          onPress={() => showToast('Đang mở ứng dụng bản đồ...')}
          style={{ flex: 1, marginRight: 8 }}
        />
        <PrimaryButton
          title="Thêm vào kèo"
          icon={<PlusCircle size={18} color={colors.textInverse} />}
          onPress={() => setActionSheetVisible(true)}
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>

      {/* Action Sheet Modal: "Thêm vào kèo" */}
      <Modal visible={actionSheetVisible} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setActionSheetVisible(false)}
          />
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Thêm “{place.name}” vào kèo nào?</Text>

            <Pressable
              onPress={() => {
                setActionSheetVisible(false);
                router.push('/rooms/create');
              }}
              style={styles.sheetOption}
            >
              <View style={[styles.sheetOptionIcon, { backgroundColor: colors.primaryLight }]}>
                <Users size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetOptionTitle}>Thêm vào phòng bình chọn</Text>
                <Text style={styles.sheetOptionSub}>Tạo phòng hoặc thêm vào danh sách phương án</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                setActionSheetVisible(false);
                router.push('/random-draw/create');
              }}
              style={styles.sheetOption}
            >
              <View style={[styles.sheetOptionIcon, { backgroundColor: colors.accentLight }]}>
                <Dices size={20} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetOptionTitle}>Mở kèo ngẫu nhiên</Text>
                <Text style={styles.sheetOptionSub}>Cho quán vào tập ứng viên vòng quay</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                setActionSheetVisible(false);
                router.push('/recommendation/create');
              }}
              style={styles.sheetOption}
            >
              <View style={[styles.sheetOptionIcon, { backgroundColor: colors.secondaryLight }]}>
                <Sparkles size={20} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetOptionTitle}>Dùng làm lựa chọn cho Lên kèo</Text>
                <Text style={styles.sheetOptionSub}>Lấy gợi ý các địa điểm có cùng phong cách</Text>
              </View>
            </Pressable>

            <SecondaryButton
              title="Đóng"
              onPress={() => setActionSheetVisible(false)}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      </Modal>

      {/* Toast feedback */}
      {successToast ? (
        <View style={styles.toastWrap}>
          <Text style={styles.toastText}>{successToast}</Text>
        </View>
      ) : null}
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
    paddingBottom: spacing.xl,
  },
  heroContainer: {
    width: '100%',
    height: 280,
    backgroundColor: colors.surfaceMuted,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  navOverlay: {
    position: 'absolute',
    top: 20,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  body: {
    padding: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  distanceBadgeText: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 8,
  },
  placeName: {
    ...typography.pageTitle,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  priceValue: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 16,
  },
  priceConfidence: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 6,
  },
  stylesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  freshnessWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.closingSoonLight,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  warningText: {
    ...typography.captionMedium,
    color: '#B45309',
    flex: 1,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  infoLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  amenitiesSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amenityText: {
    ...typography.body,
    fontSize: 13,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    flex: 1,
  },
  sheetContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.sectionTitle,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sheetOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sheetOptionTitle: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sheetOptionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toastWrap: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: '#1E1B18',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  toastText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
    fontSize: 13,
  },
});
