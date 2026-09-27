import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';
import { MapArea, STANDARD_HANOI_AREAS } from '../types';
import { MapPin, ChevronDown, Check, X } from 'lucide-react-native';

interface AreaSelectorProps {
  selectedAreaId: string;
  onSelectArea: (area: MapArea) => void;
  areas?: MapArea[];
}

export const AreaSelector = React.memo(function AreaSelector({
  selectedAreaId,
  onSelectArea,
  areas = STANDARD_HANOI_AREAS,
}: AreaSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedArea = areas.find((a) => a.id === selectedAreaId) || areas[0];

  const handleChoose = (area: MapArea) => {
    setModalVisible(false);
    onSelectArea(area);
  };

  return (
    <>
      {/* Floating Pill Trigger */}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => [
          styles.triggerPill,
          pressed && styles.triggerPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Khu vực: ${selectedArea.name}. Nhấn để đổi khu vực`}
      >
        <MapPin size={14} color={colors.primary} style={{ marginRight: 5 }} />
        <Text style={styles.triggerText} numberOfLines={1}>
          Khu vực: <Text style={styles.triggerBold}>{selectedArea.name}</Text>
        </Text>
        <ChevronDown size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
      </Pressable>

      {/* Area Selection Modal / BottomSheet */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.sheetContainer}>
            <View style={styles.handleBar} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Chọn khu vực</Text>
                <Text style={styles.sheetSubtitle}>
                  Di chuyển bản đồ đến khu vực bạn muốn tìm kèo
                </Text>
              </View>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Đóng"
              >
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.areaList}
              contentContainerStyle={styles.areaListContent}
              showsVerticalScrollIndicator={false}
            >
              {areas.map((area) => {
                const isSelected = area.id === selectedAreaId;
                return (
                  <Pressable
                    key={area.id}
                    onPress={() => handleChoose(area)}
                    style={({ pressed }) => [
                      styles.areaItem,
                      isSelected && styles.areaItemSelected,
                      pressed && styles.areaItemPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.areaItemLeft}>
                      <View
                        style={[
                          styles.areaIconWrap,
                          isSelected && styles.areaIconWrapSelected,
                        ]}
                      >
                        <MapPin
                          size={16}
                          color={isSelected ? colors.primary : colors.textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.areaName,
                          isSelected && styles.areaNameSelected,
                        ]}
                      >
                        {area.name}
                      </Text>
                    </View>

                    {isSelected ? (
                      <Check size={18} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  triggerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  triggerPressed: {
    backgroundColor: '#F9FAFB',
    transform: [{ scale: 0.98 }],
  },
  triggerText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  triggerBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetTitle: {
    ...typography.sectionTitle,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: radius.pill,
    backgroundColor: '#F3F4F6',
  },
  areaList: {
    maxHeight: 380,
  },
  areaListContent: {
    paddingBottom: 20,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
  },
  areaItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  areaItemPressed: {
    backgroundColor: '#F3F4F6',
  },
  areaItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  areaIconWrapSelected: {
    backgroundColor: '#FFFFFF',
  },
  areaName: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  areaNameSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
});
