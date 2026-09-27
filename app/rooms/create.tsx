import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../src/theme/tokens';
import { AppHeader } from '../../src/components/AppHeader';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SecondaryButton } from '../../src/components/SecondaryButton';
import { roomApi } from '../../src/api/roomApi';
import { placeApi } from '../../src/api/placeApi';
import { PlaceSummary } from '../../src/types/api';
import { useRouter } from '../../src/navigation/router';
import { Plus, Trash2, Check, Users, Sparkles, Clock, X, Minus } from 'lucide-react-native';

type CloseMode = 'PRESET' | 'CUSTOM' | 'MANUAL';

const QUICK_PRESETS = [
  { label: '30 phút', h: 0, m: 30 },
  { label: '1 giờ', h: 1, m: 0 },
  { label: '1 giờ 30 phút', h: 1, m: 30 },
  { label: '3 giờ', h: 3, m: 0 },
  { label: '4 giờ', h: 4, m: 0 },
  { label: '12 giờ', h: 12, m: 0 },
  { label: '24 giờ (1 ngày)', h: 24, m: 0 },
];

export default function CreateRoomScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [availablePlaces, setAvailablePlaces] = useState<PlaceSummary[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [allowChange, setAllowChange] = useState(true);

  // Close duration state
  const [closeMode, setCloseMode] = useState<CloseMode>('PRESET');
  const [presetHours, setPresetHours] = useState<number>(2); // Default 2 hours
  const [customHours, setCustomHours] = useState<number>(3);
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [hasSelectedCustom, setHasSelectedCustom] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Modal temporary values
  const [tempHours, setTempHours] = useState<number>(3);
  const [tempMinutes, setTempMinutes] = useState<number>(30);
  const [customError, setCustomError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPlacePicker, setShowPlacePicker] = useState(false);

  useEffect(() => {
    async function loadPlaces() {
      try {
        const res = await placeApi.getPlaces({ pageSize: 50 });
        if (res.places) {
          setAvailablePlaces(res.places);
          if (res.places.length >= 2) {
            setSelectedPlaceIds([res.places[0].id, res.places[1].id]);
          } else if (res.places.length === 1) {
            setSelectedPlaceIds([res.places[0].id]);
          }
        }
      } catch (err) {
        console.warn('loadPlaces failed in create room:', err);
      }
    }
    loadPlaces();
  }, []);

  const selectedPlaces = availablePlaces.filter((p) => selectedPlaceIds.includes(p.id));

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

  const handleOpenCustomModal = () => {
    setTempHours(customHours);
    setTempMinutes(customMinutes);
    setCustomError(null);
    setShowCustomModal(true);
  };

  const handleConfirmCustom = () => {
    const totalMinutes = tempHours * 60 + tempMinutes;
    if (totalMinutes <= 0 || tempHours < 0 || tempMinutes < 0 || tempHours > 168 || tempMinutes >= 60) {
      setCustomError('Vui lòng chọn thời gian hợp lệ.');
      return;
    }

    setCustomHours(tempHours);
    setCustomMinutes(tempMinutes);
    setHasSelectedCustom(true);
    setCloseMode('CUSTOM');
    setShowCustomModal(false);
    setCustomError(null);
  };

  const handleCancelCustom = () => {
    setShowCustomModal(false);
    setCustomError(null);
    if (!hasSelectedCustom && closeMode === 'CUSTOM') {
      setCloseMode('PRESET');
    }
  };

  const getCustomSubtitle = () => {
    if (!hasSelectedCustom) return null;
    const parts: string[] = [];
    if (customHours > 0) parts.push(`${customHours} giờ`);
    if (customMinutes > 0) parts.push(`${customMinutes} phút`);
    return parts.join(' ');
  };

  const handleCreateRoom = async () => {
    setIsSubmitting(true);
    try {
      let closesAt: string | null = null;
      if (closeMode === 'PRESET') {
        closesAt = new Date(Date.now() + presetHours * 3600 * 1000).toISOString();
      } else if (closeMode === 'CUSTOM') {
        const totalMinutes = customHours * 60 + customMinutes;
        closesAt = new Date(Date.now() + totalMinutes * 60 * 1000).toISOString();
      } else {
        // MANUAL: "Cho đến khi tôi đóng"
        closesAt = null;
      }

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
              {availablePlaces.filter((p) => !selectedPlaceIds.includes(p.id)).map((p) => (
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
                <Text style={styles.ruleDesc}>Mỗi người chọn 1 phương án</Text>
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

        {/* Step 4: Thời gian đóng bình chọn */}
        <View style={styles.section}>
          <Text style={styles.stepTitle}>Bước 4: Thời gian đóng bình chọn</Text>
          
          {/* Row 1: Presets 1 giờ, 2 giờ, 6 giờ */}
          <View style={styles.durationGridRow}>
            {[1, 2, 6].map((h) => {
              const isSelected = closeMode === 'PRESET' && presetHours === h;
              return (
                <Pressable
                  key={h}
                  onPress={() => {
                    setCloseMode('PRESET');
                    setPresetHours(h);
                  }}
                  style={[
                    styles.durationBtn,
                    isSelected && styles.durationBtnSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${h} giờ`}
                >
                  <Text
                    style={[
                      styles.durationBtnText,
                      isSelected && styles.durationBtnTextSelected,
                    ]}
                  >
                    {h} giờ
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Row 2: Tự chọn & Cho đến khi tôi đóng */}
          <View style={[styles.durationGridRow, { marginTop: 12 }]}>
            {/* Tự chọn */}
            <Pressable
              onPress={handleOpenCustomModal}
              style={[
                styles.durationBtn,
                closeMode === 'CUSTOM' && styles.durationBtnSelected,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Tự chọn thời gian"
            >
              <Text
                style={[
                  styles.durationBtnText,
                  closeMode === 'CUSTOM' && styles.durationBtnTextSelected,
                ]}
              >
                Tự chọn
              </Text>
              {hasSelectedCustom ? (
                <Text
                  style={[
                    styles.durationSubText,
                    closeMode === 'CUSTOM' && styles.durationSubTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {getCustomSubtitle()}
                </Text>
              ) : null}
            </Pressable>

            {/* Cho đến khi tôi đóng */}
            <Pressable
              onPress={() => setCloseMode('MANUAL')}
              style={[
                styles.durationBtn,
                closeMode === 'MANUAL' && styles.durationBtnSelected,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cho đến khi tôi đóng"
            >
              <Text
                style={[
                  styles.durationBtnText,
                  styles.durationBtnManualText,
                  closeMode === 'MANUAL' && styles.durationBtnTextSelected,
                ]}
                numberOfLines={2}
              >
                Cho đến khi{'\n'}tôi đóng
              </Text>
            </Pressable>
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

      {/* Modal / BottomSheet: Chọn thời gian đóng */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelCustom}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={styles.modalBackdrop} onPress={handleCancelCustom} />
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHandleBar} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Chọn thời gian đóng</Text>
                <Text style={styles.modalSubtitle}>
                  Bình chọn sẽ tự động kết thúc sau khoảng thời gian này
                </Text>
              </View>
              <Pressable
                onPress={handleCancelCustom}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Đóng"
              >
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Steppers: Giờ & Phút */}
            <View style={styles.timeInputsRow}>
              {/* Giờ */}
              <View style={styles.timeInputCol}>
                <Text style={styles.timeInputLabel}>Số giờ</Text>
                <View style={styles.stepperContainer}>
                  <Pressable
                    onPress={() => {
                      setTempHours((h) => Math.max(0, h - 1));
                      setCustomError(null);
                    }}
                    style={styles.stepperBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Giảm 1 giờ"
                  >
                    <Minus size={18} color={colors.textPrimary} />
                  </Pressable>
                  <TextInput
                    value={String(tempHours)}
                    onChangeText={(text) => {
                      const val = parseInt(text.replace(/[^0-9]/g, ''), 10);
                      setTempHours(isNaN(val) ? 0 : Math.min(val, 168));
                      setCustomError(null);
                    }}
                    keyboardType="number-pad"
                    style={styles.stepperInput}
                    maxLength={3}
                  />
                  <Pressable
                    onPress={() => {
                      setTempHours((h) => Math.min(168, h + 1));
                      setCustomError(null);
                    }}
                    style={styles.stepperBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Tăng 1 giờ"
                  >
                    <Plus size={18} color={colors.textPrimary} />
                  </Pressable>
                </View>
              </View>

              {/* Phút */}
              <View style={styles.timeInputCol}>
                <Text style={styles.timeInputLabel}>Số phút</Text>
                <View style={styles.stepperContainer}>
                  <Pressable
                    onPress={() => {
                      setTempMinutes((m) => Math.max(0, m - 5));
                      setCustomError(null);
                    }}
                    style={styles.stepperBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Giảm 5 phút"
                  >
                    <Minus size={18} color={colors.textPrimary} />
                  </Pressable>
                  <TextInput
                    value={String(tempMinutes)}
                    onChangeText={(text) => {
                      const val = parseInt(text.replace(/[^0-9]/g, ''), 10);
                      setTempMinutes(isNaN(val) ? 0 : Math.min(val, 59));
                      setCustomError(null);
                    }}
                    keyboardType="number-pad"
                    style={styles.stepperInput}
                    maxLength={2}
                  />
                  <Pressable
                    onPress={() => {
                      setTempMinutes((m) => Math.min(59, m + 5));
                      setCustomError(null);
                    }}
                    style={styles.stepperBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Tăng 5 phút"
                  >
                    <Plus size={18} color={colors.textPrimary} />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Quick Presets */}
            <Text style={styles.quickPresetTitle}>Gợi ý thời gian:</Text>
            <View style={styles.quickPresetChipsWrap}>
              {QUICK_PRESETS.map((p) => {
                const isSelected = tempHours === p.h && tempMinutes === p.m;
                return (
                  <Pressable
                    key={p.label}
                    onPress={() => {
                      setTempHours(p.h);
                      setTempMinutes(p.m);
                      setCustomError(null);
                    }}
                    style={[
                      styles.quickPresetChip,
                      isSelected && styles.quickPresetChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.quickPresetChipText,
                        isSelected && styles.quickPresetChipTextSelected,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Summary preview */}
            <View style={styles.summaryBox}>
              <Clock size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.summaryText}>
                {tempHours === 0 && tempMinutes === 0
                  ? 'Chưa chọn thời gian'
                  : `Đóng sau: ${tempHours > 0 ? `${tempHours} giờ ` : ''}${tempMinutes > 0 ? `${tempMinutes} phút` : ''}`}
              </Text>
            </View>

            {/* Error Message */}
            {customError ? (
              <View style={styles.customErrorBox}>
                <Text style={styles.customErrorText}>{customError}</Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.modalActionsRow}>
              <SecondaryButton
                title="Hủy"
                onPress={handleCancelCustom}
                style={{ flex: 1, marginRight: 8 }}
              />
              <PrimaryButton
                title="Xác nhận"
                onPress={handleConfirmCustom}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  durationGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationBtn: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: 8,
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
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  durationBtnTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  durationSubText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  durationSubTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  durationBtnManualText: {
    lineHeight: 18,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 36 : spacing.lg,
  },
  modalHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.sectionTitle,
    fontSize: 18,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: spacing.md,
  },
  timeInputCol: {
    flex: 1,
  },
  timeInputLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperInput: {
    flex: 1,
    height: 44,
    textAlign: 'center',
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    paddingHorizontal: 4,
  },
  quickPresetTitle: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  quickPresetChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  quickPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickPresetChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  quickPresetChipText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickPresetChipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  summaryText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  customErrorBox: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  customErrorText: {
    ...typography.caption,
    color: colors.danger,
    fontSize: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
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
