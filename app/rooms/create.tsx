import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../src/theme/tokens';
import { AppHeader } from '../../src/components/AppHeader';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SecondaryButton } from '../../src/components/SecondaryButton';
import { roomApi } from '../../src/api/roomApi';
import { MOCK_PLACES } from '../../src/api/mockData';
import { useRouter } from '../../src/navigation/router';
import { Plus, Trash2, Check, Users, Sparkles, Clock } from 'lucide-react-native';

export default function CreateRoomScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([
    MOCK_PLACES[0].id,
    MOCK_PLACES[1].id,
  ]);
  const [allowChange, setAllowChange] = useState(true);
  const [closesInHours, setClosesInHours] = useState<number | null>(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPlacePicker, setShowPlacePicker] = useState(false);

  const selectedPlaces = selectedPlaceIds.map(
    (id) => MOCK_PLACES.find((p) => p.id === id) || MOCK_PLACES[0]
  );

  const handleTogglePlace = (id: string) => {
    if (selectedPlaceIds.includes(id)) {
      if (selectedPlaceIds.length <= 2) {
        return; // Minimum 2 options required
      }
      setSelectedPlaceIds((prev) => prev.filter((p) => p !== id));
    } else {
      if (selectedPlaceIds.length >= 10) return; // Max 10
      setSelectedPlaceIds((prev) => [...prev, id]);
    }
  };

  const handleCreateRoom = async () => {
    setIsSubmitting(true);
    try {
      const closesAt = closesInHours
        ? new Date(Date.now() + closesInHours * 3600 * 1000).toISOString()
        : null;

      const newRoom = await roomApi.createRoom({
        title: title.trim() || 'Kèo đi chơi nhóm',
        optionSource: {
          type: 'MANUAL',
          sourceId: null,
        },
        options: selectedPlaceIds.map((placeId) => ({
          placeId,
          note: null,
        })),
        votingRule: {
          type: 'ONE_CHOICE',
          maxSelections: 1,
          allowChange,
          allowVeto: false,
          tieBreakPolicy: 'FEWER_VETOES_THEN_RANDOM',
        },
        closesAt,
      });

      // Navigate to rooms list or detail
      router.replace('/(app)/(tabs)/rooms');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Tạo phòng kèo"
        subtitle="Bình chọn dân chủ cùng nhóm"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Tên phòng */}
        <View style={styles.section}>
          <Text style={styles.stepTitle}>Bước 1: Tên phòng kèo (tùy chọn)</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ví dụ: Tối nay quẩy ở đâu cả nhà? 🍕"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        {/* Step 2: Chọn phương án địa điểm (2-10 chỗ) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.stepTitle}>
              Bước 2: Danh sách phương án ({selectedPlaceIds.length}/10)
            </Text>
            <Pressable
              onPress={() => setShowPlacePicker((v) => !v)}
              style={styles.addOptionBtn}
            >
              <Plus size={14} color={colors.primary} />
              <Text style={styles.addOptionText}>Thêm quán</Text>
            </Pressable>
          </View>
          <Text style={styles.hintText}>Cần tối thiểu 2 phương án để mở bình chọn</Text>

          {/* Selected places cards */}
          {selectedPlaces.map((plc, idx) => (
            <View key={plc.id} style={styles.selectedPlaceRow}>
              <Text style={styles.placeIndexBadge}>{idx + 1}</Text>
              <Image
                source={{
                  uri:
                    plc.heroImageUrl ||
                    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=80',
                }}
                style={styles.placeThumb}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.placeName} numberOfLines={1}>
                  {plc.name}
                </Text>
                <Text style={styles.placeMeta}>
                  {plc.category.label} • {Math.round(plc.priceRange.minAmount / 1000)}k VND
                </Text>
              </View>

              {selectedPlaceIds.length > 2 ? (
                <Pressable
                  onPress={() => handleTogglePlace(plc.id)}
                  style={styles.removeBtn}
                  accessibilityLabel="Xóa phương án này"
                >
                  <Trash2 size={16} color={colors.danger} />
                </Pressable>
              ) : null}
            </View>
          ))}

          {/* Place picker quick selection */}
          {showPlacePicker ? (
            <View style={styles.pickerBox}>
              <Text style={styles.pickerTitle}>Chọn thêm từ địa điểm gần bạn:</Text>
              {MOCK_PLACES.filter((p) => !selectedPlaceIds.includes(p.id)).map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => handleTogglePlace(p.id)}
                  style={styles.pickerItem}
                >
                  <Text style={styles.pickerItemName}>{p.name}</Text>
                  <Plus size={16} color={colors.primary} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        {/* Step 3: Quy tắc bình chọn */}
        <View style={styles.section}>
          <Text style={styles.stepTitle}>Bước 3: Quy tắc bình chọn</Text>

          <View style={styles.ruleCard}>
            <View style={styles.ruleRow}>
              <View>
                <Text style={styles.ruleLabel}>Hình thức biểu quyết</Text>
                <Text style={styles.ruleDesc}>Mỗi người chọn đúng 1 phương án (MVP: ONE_CHOICE)</Text>
              </View>
              <View style={styles.ruleBadge}>
                <Text style={styles.ruleBadgeText}>1 phiếu</Text>
              </View>
            </View>

            <Pressable
              onPress={() => setAllowChange((v) => !v)}
              style={[styles.ruleRow, { borderBottomWidth: 0, marginTop: 10 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleLabel}>Cho phép đổi phiếu trước khi đóng</Text>
                <Text style={styles.ruleDesc}>Thành viên có thể cân nhắc và đổi lựa chọn</Text>
              </View>
              <View
                style={[
                  styles.toggleBox,
                  allowChange && styles.toggleBoxActive,
                ]}
              >
                {allowChange ? <Check size={14} color={colors.textInverse} /> : null}
              </View>
            </Pressable>
          </View>
        </View>

        {/* Step 4: Thời hạn đóng bình chọn */}
        <View style={styles.section}>
          <Text style={styles.stepTitle}>Bước 4: Thời gian đóng bình chọn</Text>
          <View style={styles.durationRow}>
            {[
              { val: 1, label: '1 giờ' },
              { val: 2, label: '2 giờ' },
              { val: 6, label: '6 giờ' },
              { val: null, label: 'Đóng thủ công' },
            ].map((d) => (
              <Pressable
                key={String(d.val)}
                onPress={() => setClosesInHours(d.val)}
                style={[
                  styles.durationBtn,
                  closesInHours === d.val && styles.durationBtnSelected,
                ]}
              >
                <Text
                  style={[
                    styles.durationBtnText,
                    closesInHours === d.val && styles.durationBtnTextSelected,
                  ]}
                >
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Primary CTA */}
      <View style={styles.stickyCTA}>
        <PrimaryButton
          title="Tạo phòng kèo"
          icon={<Users size={18} color={colors.textInverse} />}
          loading={isSubmitting}
          onPress={handleCreateRoom}
          style={styles.createCTA}
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
  section: {
    marginBottom: spacing.lg,
  },
  stepTitle: {
    ...typography.cardTitle,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hintText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    height: 48,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    ...typography.body,
    color: colors.textPrimary,
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  addOptionText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
  selectedPlaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  placeIndexBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 8,
  },
  placeThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  placeName: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  placeMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeBtn: {
    padding: 8,
  },
  pickerBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 6,
  },
  pickerTitle: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pickerItemName: {
    ...typography.body,
    fontSize: 14,
  },
  ruleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  ruleLabel: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  ruleDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ruleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  ruleBadgeText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  toggleBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBtnSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  durationBtnText: {
    ...typography.captionMedium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  durationBtnTextSelected: {
    color: colors.primary,
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
  createCTA: {
    height: 50,
  },
});
