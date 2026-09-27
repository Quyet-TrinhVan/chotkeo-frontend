import React, { useState, useEffect, useRef } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../src/theme/tokens';
import { AppHeader } from '../../src/components/AppHeader';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SecondaryButton } from '../../src/components/SecondaryButton';
import { roomApi } from '../../src/api/roomApi';
import { placeApi } from '../../src/api/placeApi';
import { PlaceSummary, ProblemDetail } from '../../src/types/api';
import { useRouter } from '../../src/navigation/router';
import { Plus, Trash2, Check, Users, Sparkles, Clock, X, Minus, AlertCircle } from 'lucide-react-native';

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
  const { width: windowWidth, fontScale } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [step2Y, setStep2Y] = useState<number>(0);

  // Responsive check: wrap header when available card width is tight or font is enlarged
  const shouldWrapHeader = windowWidth - 64 < 355 || fontScale > 1.05;

  const [title, setTitle] = useState('');
  const [availablePlaces, setAvailablePlaces] = useState<PlaceSummary[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [allowChange, setAllowChange] = useState(true);

  // Field & form validation errors
  const [optionError, setOptionError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [closesAtError, setClosesAtError] = useState<string | null>(null);
  const [votingRuleError, setVotingRuleError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

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

  const clearErrors = () => {
    setOptionError(null);
    setTitleError(null);
    setClosesAtError(null);
    setVotingRuleError(null);
    setGeneralError(null);
  };

  const scrollToOptionsSection = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, step2Y - 16),
        animated: true,
      });
    }, 50);
  };

  const handleTogglePlace = (id: string) => {
    let nextIds: string[];
    if (selectedPlaceIds.includes(id)) {
      nextIds = selectedPlaceIds.filter((p) => p !== id);
    } else {
      if (selectedPlaceIds.length >= 10) {
        setOptionError('Phòng kèo chỉ được có tối đa 10 địa điểm.');
        return;
      }
      nextIds = [...selectedPlaceIds, id];
    }
    setSelectedPlaceIds(nextIds);

    // Clear option error if within valid range [2, 10]
    if (nextIds.length >= 2 && nextIds.length <= 10) {
      setOptionError(null);
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleCreateRoomError = (error: unknown) => {
    let mappedAnyField = false;

    if (error && typeof error === 'object') {
      const anyErr = error as any;
      const problem: ProblemDetail | undefined = anyErr.problem;
      const errors = problem?.errors;

      if (Array.isArray(errors) && errors.length > 0) {
        for (const err of errors) {
          const field = (err.field || '').toLowerCase();
          const msg = err.message || '';

          if (field.includes('option') || field.includes('place')) {
            mappedAnyField = true;
            const friendlyMsg =
              selectedPlaceIds.length < 2
                ? selectedPlaceIds.length === 0
                  ? 'Bạn cần thêm ít nhất 2 địa điểm để tạo phòng kèo.'
                  : 'Thêm ít nhất 1 địa điểm nữa để tạo phòng kèo.'
                : selectedPlaceIds.length > 10
                ? 'Phòng kèo chỉ được có tối đa 10 địa điểm.'
                : msg && !msg.includes('_') && !msg.includes('{')
                ? msg
                : 'Bạn cần thêm ít nhất 2 địa điểm để tạo phòng kèo.';
            setOptionError(friendlyMsg);
            scrollToOptionsSection();
          } else if (field.includes('title')) {
            mappedAnyField = true;
            setTitleError(msg || 'Tên phòng không hợp lệ.');
          } else if (field.includes('close')) {
            mappedAnyField = true;
            setClosesAtError(msg || 'Thời gian đóng bình chọn không hợp lệ.');
          } else if (field.includes('voting') || field.includes('rule')) {
            mappedAnyField = true;
            setVotingRuleError(msg || 'Quy tắc bình chọn không hợp lệ.');
          }
        }
      } else if (
        problem?.code === 'VALIDATION_FAILED' ||
        anyErr.code === 'VALIDATION_FAILED' ||
        anyErr.status === 400 ||
        anyErr.status === 422
      ) {
        if (selectedPlaceIds.length < 2) {
          mappedAnyField = true;
          setOptionError(
            selectedPlaceIds.length === 0
              ? 'Bạn cần thêm ít nhất 2 địa điểm để tạo phòng kèo.'
              : 'Thêm ít nhất 1 địa điểm nữa để tạo phòng kèo.'
          );
          scrollToOptionsSection();
        }
      }
    }

    if (!mappedAnyField) {
      setGeneralError('Không thể tạo phòng kèo. Vui lòng kiểm tra lại thông tin.');
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
    clearErrors();

    const optionCount = selectedPlaceIds.length;
    if (optionCount < 2) {
      setOptionError(
        optionCount === 0
          ? 'Bạn cần thêm ít nhất 2 địa điểm để tạo phòng kèo.'
          : 'Thêm ít nhất 1 địa điểm nữa để tạo phòng kèo.'
      );
      scrollToOptionsSection();
      return;
    }

    if (optionCount > 10) {
      setOptionError('Phòng kèo chỉ được có tối đa 10 địa điểm.');
      scrollToOptionsSection();
      return;
    }

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

      // Navigate to room detail or rooms list on success only
      if (newRoom?.id) {
        router.replace(`/rooms/${newRoom.id}`);
      } else {
        router.replace('/(app)/(tabs)/rooms');
      }
    } catch (error) {
      handleCreateRoomError(error);
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
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Tên phòng */}
        <View style={styles.section}>
          <Text style={styles.stepTitle}>Bước 1: Tên phòng kèo (tùy chọn)</Text>
          <TextInput
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (titleError) setTitleError(null);
              if (generalError) setGeneralError(null);
            }}
            placeholder="Ví dụ: Tối nay quẩy ở đâu cả nhà? 🍕"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, titleError ? styles.inputError : null]}
          />
          {titleError ? (
            <View style={styles.fieldErrorBox}>
              <AlertCircle size={14} color={colors.danger} />
              <Text style={styles.fieldErrorText}>{titleError}</Text>
            </View>
          ) : null}
        </View>

        {/* Step 2: Chọn phương án địa điểm (2-10 chỗ) */}
        <View
          style={[styles.section, optionError ? styles.sectionError : null]}
          onLayout={(e) => {
            setStep2Y(e.nativeEvent.layout.y);
          }}
        >
          <View style={[styles.sectionHeader, shouldWrapHeader && styles.sectionHeaderWrapped]}>
            <View style={[styles.sectionTitleWrap, shouldWrapHeader && styles.sectionTitleWrapFull]}>
              <Text
                style={[styles.sectionTitle, optionError ? styles.stepTitleError : null]}
                allowFontScaling={true}
              >
                Bước 2: Danh sách phương án ({selectedPlaceIds.length}/10)
              </Text>
            </View>

            <Pressable
              onPress={() => setShowPlacePicker((v) => !v)}
              style={styles.addPlaceButton}
              accessibilityRole="button"
              accessibilityLabel="Thêm quán"
            >
              <Plus size={16} color={colors.primary} />
              <Text
                style={styles.addPlaceButtonText}
                numberOfLines={1}
                allowFontScaling={true}
              >
                Thêm quán
              </Text>
            </Pressable>
          </View>

          {optionError ? (
            <View style={styles.inlineErrorBox}>
              <AlertCircle size={15} color={colors.danger} />
              <Text style={styles.inlineErrorText}>{optionError}</Text>
            </View>
          ) : (
            <Text style={styles.hintText}>Cần tối thiểu 2 phương án để mở bình chọn</Text>
          )}

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

              <Pressable
                onPress={() => handleTogglePlace(plc.id)}
                style={styles.removeBtn}
                accessibilityLabel="Xóa phương án này"
              >
                <Trash2 size={16} color={colors.danger} />
              </Pressable>
            </View>
          ))}

          {selectedPlaces.length === 0 ? (
            <View style={styles.emptyPlacesBox}>
              <Text style={styles.emptyPlacesText}>
                Chưa có địa điểm nào được chọn. Hãy bấm "+ Thêm quán" để thêm phương án.
              </Text>
            </View>
          ) : null}

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
              onPress={() => {
                setAllowChange((v) => !v);
                if (votingRuleError) setVotingRuleError(null);
                if (generalError) setGeneralError(null);
              }}
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

          {votingRuleError ? (
            <View style={styles.fieldErrorBox}>
              <AlertCircle size={14} color={colors.danger} />
              <Text style={styles.fieldErrorText}>{votingRuleError}</Text>
            </View>
          ) : null}
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
                    if (closesAtError) setClosesAtError(null);
                    if (generalError) setGeneralError(null);
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
              onPress={() => {
                handleOpenCustomModal();
                if (closesAtError) setClosesAtError(null);
                if (generalError) setGeneralError(null);
              }}
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
              onPress={() => {
                setCloseMode('MANUAL');
                if (closesAtError) setClosesAtError(null);
                if (generalError) setGeneralError(null);
              }}
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

          {closesAtError ? (
            <View style={styles.fieldErrorBox}>
              <AlertCircle size={14} color={colors.danger} />
              <Text style={styles.fieldErrorText}>{closesAtError}</Text>
            </View>
          ) : null}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Primary CTA */}
      <View style={styles.stickyCTA}>
        {generalError ? (
          <View style={styles.generalErrorBox}>
            <AlertCircle size={16} color={colors.danger} />
            <Text style={styles.generalErrorText}>{generalError}</Text>
          </View>
        ) : null}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    marginBottom: 8,
  },
  sectionHeaderWrapped: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
  },
  sectionTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitleWrapFull: {
    flex: undefined,
    width: '100%',
  },
  sectionTitle: {
    ...typography.cardTitle,
    fontSize: 16,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  addPlaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minHeight: 44,
    backgroundColor: colors.primaryLight,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  addPlaceButtonText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
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
  sectionError: {
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  stepTitleError: {
    color: colors.danger,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inlineErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  inlineErrorText: {
    ...typography.captionMedium,
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  fieldErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  fieldErrorText: {
    ...typography.caption,
    color: colors.danger,
    fontSize: 12,
  },
  generalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  generalErrorText: {
    ...typography.captionMedium,
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  emptyPlacesBox: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  emptyPlacesText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
