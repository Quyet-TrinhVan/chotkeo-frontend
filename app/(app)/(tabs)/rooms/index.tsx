import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../../src/theme/tokens';
import { RoomCard } from '../../../../src/components/RoomCard';
import { FilterChip } from '../../../../src/components/Chip';
import { EmptyState } from '../../../../src/components/EmptyState';
import { PrimaryButton } from '../../../../src/components/PrimaryButton';
import { roomApi } from '../../../../src/api/roomApi';
import { useRouter } from '../../../../src/navigation/router';
import { Room, RoomStatus, RoomListItem } from '../../../../src/types/api';
import { Plus, Users, Vote, CheckCircle2 } from 'lucide-react-native';

interface RoomsScreenProps {
  onSelectRoom?: (roomId: string) => void;
  onCreateRoom?: () => void;
}

export default function RoomsScreen({ onSelectRoom, onCreateRoom }: RoomsScreenProps) {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | RoomStatus>('ALL');

  const filterTabs: Array<{ id: 'ALL' | RoomStatus; label: string }> = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'OPEN', label: 'Đang mở' },
    { id: 'DRAFT', label: 'Bản nháp' },
    { id: 'CLOSED', label: 'Đã chốt' },
  ];

  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadRooms() {
      setIsLoading(true);
      try {
        const filterStatus = selectedFilter === 'ALL' ? undefined : [selectedFilter];
        const res = await roomApi.getRooms({ status: filterStatus });
        setRooms(res.rooms || []);
      } catch (err) {
        console.warn('roomApi.getRooms error:', err);
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadRooms();
  }, [selectedFilter]);

  const filteredRooms = rooms;

  const handleRoomPress = (roomId: string) => {
    if (onSelectRoom) {
      onSelectRoom(roomId);
    } else {
      router.push(`/rooms/${roomId}`);
    }
  };

  const handleCreatePress = () => {
    if (onCreateRoom) {
      onCreateRoom();
    } else {
      router.push('/rooms/create');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>Phòng kèo</Text>
            <Text style={styles.headerSubtitle}>
              Biểu quyết và chốt địa điểm cùng nhóm
            </Text>
          </View>
          <PrimaryButton
            title="Tạo phòng"
            icon={<Plus size={16} color={colors.textInverse} />}
            onPress={handleCreatePress}
            style={styles.headerCreateBtn}
          />
        </View>

        {/* Filter Segments */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterTabs.map((tab) => (
            <FilterChip
              key={tab.id}
              label={tab.label}
              selected={selectedFilter === tab.id}
              onPress={() => setSelectedFilter(tab.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Room Cards List */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onPress={() => handleRoomPress(room.id)}
            />
          ))
        ) : (
          <EmptyState
            title="Chưa có phòng nào ở đây"
            description="Hãy tạo một phòng mới và rủ bạn bè vào cùng bình chọn địa điểm nhé!"
            actionTitle="Tạo phòng ngay"
            onAction={handleCreatePress}
            icon={<Vote size={32} color={colors.primary} />}
            style={{ marginTop: spacing.xl }}
          />
        )}

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
  header: {
    backgroundColor: colors.surface,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.pageTitle,
    fontSize: 26,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerCreateBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
});
