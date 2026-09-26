import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Modal,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../src/theme/tokens';
import { AppHeader } from '../../src/components/AppHeader';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { SecondaryButton } from '../../src/components/SecondaryButton';
import { StatusBadge } from '../../src/components/StatusBadge';
import { ParticipantAvatarStack } from '../../src/components/ParticipantAvatarStack';
import { roomApi } from '../../src/api/roomApi';
import { MOCK_ROOMS } from '../../src/api/mockData';
import { Room, RoomOption } from '../../src/types/api';
import { useRouter } from '../../src/navigation/router';
import {
  Users,
  Clock,
  Share2,
  CheckCircle,
  Vote as VoteIcon,
  Navigation,
  Trophy,
  AlertCircle,
  Check,
  Lock,
} from 'lucide-react-native';

interface RoomDetailScreenProps {
  roomId?: string;
  onBack?: () => void;
}

export default function RoomDetailScreen({ roomId = 'room-weekend-coffee', onBack }: RoomDetailScreenProps) {
  const router = useRouter();

  const initialRoom = MOCK_ROOMS.find((r) => r.id === roomId) || MOCK_ROOMS[0];
  const [room, setRoom] = useState<Room>(initialRoom);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [ballotModal, setBallotModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoom() {
      try {
        const data = await roomApi.getRoom(roomId);
        if (data) {
          setRoom(data);
        }
      } catch (err) {
        console.warn('getRoom failed, using fallback:', err);
      }
    }
    loadRoom();
  }, [roomId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenVoting = async () => {
    const updated = await roomApi.openRoom(room.id);
    setRoom({ ...updated });
    showToast('Đã mở bình chọn cho phòng kèo!');
  };

  const handleSubmitVote = async () => {
    if (!selectedOptionId) return;
    await roomApi.submitVote(room.id, {
      optionIds: [selectedOptionId],
      ballotVersion: room.votingRoundVersion,
    });
    setHasVoted(true);
    setBallotModal(false);
    showToast('Bỏ phiếu thành công!');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const isOwner = true; // In mock MVP, actor has owner controls
  const winningOption = room.options[0]; // Example winner when closed

  return (
    <View style={styles.container}>
      <AppHeader
        title={room.title || 'Phòng kèo'}
        subtitle={`Trạng thái: ${room.status === 'OPEN' ? 'Đang mở bình chọn' : room.status === 'DRAFT' ? 'Bản nháp' : 'Đã chốt'}`}
        onBack={handleBack}
        rightAction={
          <Pressable
            onPress={() => showToast('Đã sao chép link tham gia phòng!')}
            style={styles.shareBtn}
            accessibilityRole="button"
            accessibilityLabel="Chia sẻ phòng"
          >
            <Share2 size={18} color={colors.textPrimary} />
          </Pressable>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status & Live Countdown Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusTag,
                room.status === 'OPEN' && { backgroundColor: colors.openLight },
                room.status === 'DRAFT' && { backgroundColor: colors.accentLight },
                room.status === 'CLOSED' && { backgroundColor: colors.secondaryLight },
              ]}
            >
              <Text
                style={[
                  styles.statusTagText,
                  room.status === 'OPEN' && { color: colors.open },
                  room.status === 'DRAFT' && { color: '#B45309' },
                  room.status === 'CLOSED' && { color: colors.secondary },
                ]}
              >
                {room.status === 'OPEN' ? '● LIVE BÌNH CHỌN' : room.status === 'DRAFT' ? 'DRAFT' : 'ĐÃ CHỐT KÈO'}
              </Text>
            </View>

            {room.closesAt && room.status === 'OPEN' ? (
              <View style={styles.countdownBox}>
                <Clock size={13} color={colors.warning} style={{ marginRight: 4 }} />
                <Text style={styles.countdownText}>Còn 2 giờ 45 phút</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.roomHeadline}>{room.title}</Text>

          {/* Participant count */}
          <View style={styles.participantsRow}>
            <ParticipantAvatarStack count={room.participantCount || 4} />
            <Text style={styles.participantsCountText}>
              {room.participantCount || 4} bạn bè đã tham gia
            </Text>
          </View>
        </View>

        {/* If CLOSED: Celebratory Winner Card */}
        {room.status === 'CLOSED' ? (
          <View style={styles.winnerCard}>
            <View style={styles.winnerBanner}>
              <Trophy size={18} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={styles.winnerBannerText}>CHỐT KÈO CHIẾN THẮNG!</Text>
            </View>

            <Image
              source={{
                uri:
                  winningOption.placeSnapshot.heroImageUrl ||
                  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
              }}
              style={styles.winnerImage}
            />

            <View style={styles.winnerBody}>
              <Text style={styles.winnerName}>{winningOption.placeSnapshot.name}</Text>
              <Text style={styles.winnerCategory}>
                {winningOption.placeSnapshot.category.label} • 4/6 phiếu bầu (67%)
              </Text>

              <PrimaryButton
                title="Chỉ đường tới quán"
                icon={<Navigation size={18} color={colors.textInverse} />}
                onPress={() => router.push(`/places/${winningOption.placeSnapshot.id}`)}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </View>
        ) : null}

        {/* List of Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionHeaderTitle}>
            Các phương án ({room.options.length})
          </Text>

          {room.options.map((opt, idx) => {
            const isUserChoice = selectedOptionId === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => {
                  if (room.status === 'OPEN') {
                    setSelectedOptionId(opt.id);
                    setBallotModal(true);
                  } else {
                    router.push(`/places/${opt.placeSnapshot.id}`);
                  }
                }}
                style={[
                  styles.optionCard,
                  isUserChoice && styles.optionCardSelected,
                ]}
              >
                <Image
                  source={{
                    uri:
                      opt.placeSnapshot.heroImageUrl ||
                      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=80',
                  }}
                  style={styles.optionThumb}
                />
                <View style={styles.optionInfo}>
                  <View style={styles.optionTop}>
                    <Text style={styles.optionName} numberOfLines={1}>
                      {opt.placeSnapshot.name}
                    </Text>
                    <StatusBadge status={opt.placeSnapshot.openState} />
                  </View>

                  <Text style={styles.optionMeta}>
                    {opt.placeSnapshot.category.label} • {Math.round(opt.placeSnapshot.priceRange.minAmount / 1000)}k VND
                  </Text>

                  {/* Progress bar in OPEN mode */}
                  {room.status === 'OPEN' ? (
                    <View style={styles.voteBarWrap}>
                      <View
                        style={[
                          styles.voteBarFill,
                          { width: idx === 0 ? '60%' : idx === 1 ? '30%' : '10%' },
                        ]}
                      />
                    </View>
                  ) : null}
                </View>

                {room.status === 'OPEN' ? (
                  <View
                    style={[
                      styles.radioSelect,
                      isUserChoice && styles.radioSelectActive,
                    ]}
                  >
                    {isUserChoice ? <Check size={14} color={colors.textInverse} /> : null}
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky Bottom Actions depending on Room Status */}
      <View style={styles.stickyBottom}>
        {room.status === 'DRAFT' ? (
          <PrimaryButton
            title="Mở bình chọn ngay"
            icon={<VoteIcon size={18} color={colors.textInverse} />}
            onPress={handleOpenVoting}
            style={styles.primaryCTA}
          />
        ) : room.status === 'OPEN' ? (
          <PrimaryButton
            title={hasVoted ? 'Đổi lựa chọn của bạn' : 'Bỏ phiếu ngay'}
            icon={<VoteIcon size={18} color={colors.textInverse} />}
            onPress={() => setBallotModal(true)}
            style={styles.primaryCTA}
          />
        ) : (
          <SecondaryButton
            title="Xem kết quả chi tiết"
            onPress={() => showToast('Đang tải thống kê chi tiết...')}
            style={styles.primaryCTA}
          />
        )}
      </View>

      {/* Ballot Modal (Section 15: Bạn chọn chỗ nào?) */}
      <Modal visible={ballotModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setBallotModal(false)}
          />
          <View style={styles.ballotContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.ballotTitle}>Bạn chọn chỗ nào?</Text>
            <Text style={styles.ballotSubtitle}>
              Phiếu bầu của bạn là ẩn danh. Mỗi thành viên được chọn đúng 1 địa điểm.
            </Text>

            {room.options.map((opt) => {
              const selected = selectedOptionId === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setSelectedOptionId(opt.id)}
                  style={[
                    styles.ballotCard,
                    selected && styles.ballotCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.ballotRadio,
                      selected && styles.ballotRadioSelected,
                    ]}
                  >
                    {selected ? <Check size={14} color={colors.textInverse} /> : null}
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.ballotName}>{opt.placeSnapshot.name}</Text>
                    <Text style={styles.ballotCategory}>
                      {opt.placeSnapshot.category.label} • {Math.round(opt.placeSnapshot.priceRange.minAmount / 1000)}k/người
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            <PrimaryButton
              title="Gửi phiếu bầu"
              disabled={!selectedOptionId}
              onPress={handleSubmitVote}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>
      </Modal>

      {/* Feedback Toast */}
      {toastMessage ? (
        <View style={styles.toastWrap}>
          <Text style={styles.toastText}>{toastMessage}</Text>
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
    padding: spacing.md,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  statusBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusTagText: {
    ...typography.captionMedium,
    fontSize: 11,
    fontWeight: '700',
  },
  countdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownText: {
    ...typography.captionMedium,
    color: colors.warning,
    fontSize: 11,
  },
  roomHeadline: {
    ...typography.pageTitle,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsCountText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginLeft: 8,
    fontSize: 12,
  },
  winnerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: spacing.md,
  },
  winnerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
  },
  winnerBannerText: {
    ...typography.captionMedium,
    color: '#B45309',
    fontWeight: '800',
    fontSize: 12,
  },
  winnerImage: {
    width: '100%',
    height: 160,
  },
  winnerBody: {
    padding: spacing.md,
  },
  winnerName: {
    ...typography.cardTitle,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  winnerCategory: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  optionsSection: {
    marginBottom: spacing.lg,
  },
  sectionHeaderTitle: {
    ...typography.sectionTitle,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 8,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  optionInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  optionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  optionName: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    marginRight: 6,
  },
  optionMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  voteBarWrap: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  voteBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  radioSelect: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelectActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  primaryCTA: {
    height: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  ballotContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  ballotTitle: {
    ...typography.pageTitle,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  ballotSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  ballotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 8,
  },
  ballotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  ballotRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballotRadioSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ballotName: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  ballotCategory: {
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
