/**
 * Chốt Kèo Mock Data Fixtures
 * Realistic Hanoi Places, Categories, Styles, Rooms according to API spec v1.1
 */

import { PlaceSummary, PlaceDetail, Room, SearchSuggestion } from '../types/api';

export const MOCK_CATEGORIES = [
  { id: 'cat-all', code: 'all', label: 'Tất cả' },
  { id: 'cat-coffee', code: 'coffee', label: 'Cafe' },
  { id: 'cat-food', code: 'eat', label: 'Ăn uống' },
  { id: 'cat-drink', code: 'drink', label: 'Quán nhậu & Bar' },
  { id: 'cat-play', code: 'play', label: 'Vui chơi & Giải trí' },
];

export const MOCK_STYLES = [
  { id: 'style-quiet', code: 'quiet', label: 'Yên tĩnh' },
  { id: 'style-dating', code: 'dating', label: 'Hẹn hò' },
  { id: 'style-photo', code: 'photo', label: 'Sống ảo' },
  { id: 'style-work', code: 'work', label: 'Làm việc' },
  { id: 'style-street', code: 'street', label: 'Vỉa hè & Bụi' },
  { id: 'style-late', code: 'late', label: 'Mở muộn' },
  { id: 'style-budget', code: 'budget', label: 'Hạt dẻ' },
];

export const MOCK_PLACES: PlaceSummary[] = [
  {
    id: 'plc-giang-cafe',
    name: 'Cafe Giảng - Cafe Trứng',
    category: { id: 'cat-coffee', code: 'coffee', label: 'Cafe' },
    styles: [
      { id: 'style-street', code: 'street', label: 'Vỉa hè & Bụi' },
      { id: 'style-dating', code: 'dating', label: 'Hẹn hò' },
    ],
    priceRange: {
      currency: 'VND',
      minAmount: 35000,
      maxAmount: 60000,
      basis: 'PER_PERSON',
      confidence: 'HIGH',
    },
    location: { type: 'Point', coordinates: [105.8542, 21.0345] },
    distanceMeters: 450,
    openState: 'OPEN',
    freshness: {
      status: 'FRESH',
      riskTier: 'LOW',
      verifiedAt: '2026-09-20T08:00:00Z',
      fields: ['openingHours', 'priceRange'],
    },
    heroMedia: null,
    heroImageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
  },
  {
    id: 'plc-pho-thin',
    name: 'Phở Thìn Lò Đúc',
    category: { id: 'cat-food', code: 'eat', label: 'Ăn uống' },
    styles: [
      { id: 'style-street', code: 'street', label: 'Vỉa hè & Bụi' },
      { id: 'style-budget', code: 'budget', label: 'Hạt dẻ' },
    ],
    priceRange: {
      currency: 'VND',
      minAmount: 70000,
      maxAmount: 95000,
      basis: 'PER_PERSON',
      confidence: 'HIGH',
    },
    location: { type: 'Point', coordinates: [105.8596, 21.0152] },
    distanceMeters: 1200,
    openState: 'OPEN',
    freshness: {
      status: 'FRESH',
      riskTier: 'LOW',
      verifiedAt: '2026-09-18T10:00:00Z',
      fields: ['priceRange'],
    },
    heroMedia: null,
    heroImageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
  },
  {
    id: 'plc-pizza-4ps',
    name: 'Pizza 4P’s Tràng Tiền',
    category: { id: 'cat-food', code: 'eat', label: 'Ăn uống' },
    styles: [
      { id: 'style-dating', code: 'dating', label: 'Hẹn hò' },
      { id: 'style-photo', code: 'photo', label: 'Sống ảo' },
    ],
    priceRange: {
      currency: 'VND',
      minAmount: 180000,
      maxAmount: 350000,
      basis: 'PER_PERSON',
      confidence: 'HIGH',
    },
    location: { type: 'Point', coordinates: [105.8568, 21.0253] },
    distanceMeters: 800,
    openState: 'OPEN',
    freshness: {
      status: 'FRESH',
      riskTier: 'LOW',
      verifiedAt: '2026-09-22T04:00:00Z',
      fields: ['openingHours', 'amenities'],
    },
    heroMedia: null,
    heroImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  },
  {
    id: 'plc-all-day-coffee',
    name: 'All Day Coffee Quang Trung',
    category: { id: 'cat-coffee', code: 'coffee', label: 'Cafe' },
    styles: [
      { id: 'style-work', code: 'work', label: 'Làm việc' },
      { id: 'style-photo', code: 'photo', label: 'Sống ảo' },
    ],
    priceRange: {
      currency: 'VND',
      minAmount: 55000,
      maxAmount: 95000,
      basis: 'PER_PERSON',
      confidence: 'HIGH',
    },
    location: { type: 'Point', coordinates: [105.8488, 21.0205] },
    distanceMeters: 650,
    openState: 'OPEN',
    freshness: {
      status: 'FRESH',
      riskTier: 'LOW',
      verifiedAt: '2026-09-21T02:00:00Z',
      fields: ['openingHours'],
    },
    heroMedia: null,
    heroImageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  },
  {
    id: 'plc-standing-bar',
    name: 'The Standing Bar Trúc Bạch',
    category: { id: 'cat-drink', code: 'drink', label: 'Quán nhậu & Bar' },
    styles: [
      { id: 'style-dating', code: 'dating', label: 'Hẹn hò' },
      { id: 'style-late', code: 'late', label: 'Mở muộn' },
    ],
    priceRange: {
      currency: 'VND',
      minAmount: 120000,
      maxAmount: 250000,
      basis: 'PER_PERSON',
      confidence: 'MEDIUM',
    },
    location: { type: 'Point', coordinates: [105.8398, 21.0478] },
    distanceMeters: 2100,
    openState: 'CLOSING_SOON',
    freshness: {
      status: 'FRESH',
      riskTier: 'LOW',
      verifiedAt: '2026-09-23T11:00:00Z',
      fields: [],
    },
    heroMedia: null,
    heroImageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
  },
  {
    id: 'plc-bun-cha-huong-lien',
    name: 'Bún Chả Hương Liên (Obama)',
    category: { id: 'cat-food', code: 'eat', label: 'Ăn uống' },
    styles: [
      { id: 'style-street', code: 'street', label: 'Vỉa hè & Bụi' },
      { id: 'style-budget', code: 'budget', label: 'Hạt dẻ' },
    ],
    priceRange: {
      currency: 'VND',
      minAmount: 50000,
      maxAmount: 85000,
      basis: 'PER_PERSON',
      confidence: 'HIGH',
    },
    location: { type: 'Point', coordinates: [105.856, 21.0135] },
    distanceMeters: 1400,
    openState: 'OPEN',
    freshness: {
      status: 'FRESH',
      riskTier: 'LOW',
      verifiedAt: '2026-09-19T06:00:00Z',
      fields: [],
    },
    heroMedia: null,
    heroImageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
  },
  {
    id: 'plc-loading-t',
    name: 'Loading T Cafe Chân Cầm',
    category: { id: 'cat-coffee', code: 'coffee', label: 'Cafe' },
    styles: [
      { id: 'style-quiet', code: 'quiet', label: 'Yên tĩnh' },
      { id: 'style-dating', code: 'dating', label: 'Hẹn hò' },
    ],
    priceRange: {
      currency: 'VND',
      minAmount: 45000,
      maxAmount: 75000,
      basis: 'PER_PERSON',
      confidence: 'HIGH',
    },
    location: { type: 'Point', coordinates: [105.849, 21.0312] },
    distanceMeters: 300,
    openState: 'OPEN',
    freshness: {
      status: 'FRESH',
      riskTier: 'LOW',
      verifiedAt: '2026-09-24T03:00:00Z',
      fields: [],
    },
    heroMedia: null,
    heroImageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  },
  {
    id: 'plc-boardgame-hub',
    name: 'The Nest Boardgame & Cafe',
    category: { id: 'cat-play', code: 'play', label: 'Vui chơi & Giải trí' },
    styles: [
      { id: 'style-work', code: 'work', label: 'Làm việc' },
      { id: 'style-budget', code: 'budget', label: 'Hạt dẻ' },
    ],
    priceRange: {
      currency: 'VND',
      minAmount: 40000,
      maxAmount: 90000,
      basis: 'PER_PERSON',
      confidence: 'HIGH',
    },
    location: { type: 'Point', coordinates: [105.821, 21.0185] },
    distanceMeters: 3200,
    openState: 'CLOSED',
    freshness: {
      status: 'DUE',
      riskTier: 'MEDIUM',
      verifiedAt: '2026-08-30T00:00:00Z',
      fields: [],
    },
    heroMedia: null,
    heroImageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&q=80',
  },
];

export const MOCK_PLACE_DETAILS: Record<string, PlaceDetail> = {
  'plc-giang-cafe': {
    summary: MOCK_PLACES[0],
    address: {
      displayAddress: '39 Nguyễn Hữu Huân, Hàng Bạc, Hoàn Kiếm, Hà Nội',
      normalizedAddress: '39 Nguyen Huu Huan, Hang Bac, Hoan Kiem, Ha Noi',
    },
    openingHours: {
      timeZone: 'Asia/Ho_Chi_Minh',
      weeklyPeriods: [
        { dayOfWeek: 1, opensAt: '07:00', closesAt: '22:30' },
        { dayOfWeek: 2, opensAt: '07:00', closesAt: '22:30' },
        { dayOfWeek: 3, opensAt: '07:00', closesAt: '22:30' },
        { dayOfWeek: 4, opensAt: '07:00', closesAt: '22:30' },
        { dayOfWeek: 5, opensAt: '07:00', closesAt: '23:00' },
        { dayOfWeek: 6, opensAt: '07:00', closesAt: '23:00' },
        { dayOfWeek: 7, opensAt: '07:00', closesAt: '23:00' },
      ],
      verifiedAt: '2026-09-20T08:00:00Z',
    },
    contact: {
      phone: '0989892265',
      website: 'https://cafegiang.vn',
    },
    amenities: [
      { id: 'amen-wifi', code: 'wifi', label: 'Wifi miễn phí' },
      { id: 'amen-ac', code: 'ac', label: 'Điều hòa' },
      { id: 'amen-parking', code: 'parking', label: 'Có chỗ gửi xe' },
    ],
    media: [
      {
        id: 'med-1',
        status: 'READY',
        contentType: 'image/jpeg',
        sizeBytes: 420000,
        sha256: 'a1b2c3d4e5',
        moderationStatus: 'APPROVED',
        renditions: [
          {
            kind: 'ORIGINAL',
            url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
            expiresAt: '2026-10-01T00:00:00Z',
          },
        ],
      },
    ],
    dietaryOptions: [],
    sources: [{ source: "CHOT_KEO", attribution: null, license: null }],
    bookingOptions: [],
    availableActions: ['DIRECTIONS', 'ADD_TO_ROOM', 'RANDOM_DRAW', 'SHARE', 'REPORT'],
  },
};

export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-weekend-coffee',
    ownerActorId: '0199f2b8-7b11-7c41-8d7a-2a7b0c9e1301',
    status: 'OPEN',
    title: 'Kèo Cafe Cuối Tuần Này Nhé ☕',
    options: [
      {
        id: 'opt-1',
        placeSnapshot: MOCK_PLACES[0], // Cafe Giảng
        sourceType: 'RECOMMENDATION_SESSION',
        addedBy: '0199f2b8-7b11-7c41-8d7a-2a7b0c9e1301',
        position: 1,
      },
      {
        id: 'opt-2',
        placeSnapshot: MOCK_PLACES[3], // All Day Coffee
        sourceType: 'MANUAL',
        addedBy: '0199f2b8-7b11-7c41-8d7a-2a7b0c9e1301',
        position: 2,
      },
      {
        id: 'opt-3',
        placeSnapshot: MOCK_PLACES[6], // Loading T Cafe
        sourceType: 'MANUAL',
        addedBy: 'user-2',
        position: 3,
      },
    ],
    votingRule: {
      type: 'ONE_CHOICE',
      maxSelections: 1,
      allowChange: true,
      allowVeto: false,
      tieBreakPolicy: 'FEWER_VETOES_THEN_RANDOM',
    },
    privacyMode: 'AGGREGATE',
    closesAt: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    votingRoundVersion: 1,
    roomVersion: 3,
    participantCount: 5,
    availableActions: ['VOTE', 'SHARE', 'EXTEND', 'CLOSE', 'CANCEL'],
  },
  {
    id: 'room-dinner-tonight',
    ownerActorId: 'user-lan',
    status: 'OPEN',
    title: 'Tối nay cả đám ăn gì?',
    options: [
      {
        id: 'opt-4',
        placeSnapshot: MOCK_PLACES[1], // Phở Thìn
        sourceType: 'MANUAL',
        addedBy: 'user-lan',
        position: 1,
      },
      {
        id: 'opt-5',
        placeSnapshot: MOCK_PLACES[2], // Pizza 4Ps
        sourceType: 'MANUAL',
        addedBy: 'user-lan',
        position: 2,
      },
      {
        id: 'opt-6',
        placeSnapshot: MOCK_PLACES[5], // Bún chả Hương Liên
        sourceType: 'MANUAL',
        addedBy: 'user-3',
        position: 3,
      },
    ],
    votingRule: {
      type: 'ONE_CHOICE',
      maxSelections: 1,
      allowChange: true,
      allowVeto: false,
      tieBreakPolicy: 'FEWER_VETOES_THEN_RANDOM',
    },
    privacyMode: 'AGGREGATE',
    closesAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    votingRoundVersion: 2,
    roomVersion: 5,
    participantCount: 8,
    availableActions: ['VOTE', 'SHARE'],
  },
  {
    id: 'room-draft-hanoi',
    ownerActorId: '0199f2b8-7b11-7c41-8d7a-2a7b0c9e1301',
    status: 'DRAFT',
    title: 'Lên kèo Hồ Tây Chill',
    options: [
      {
        id: 'opt-7',
        placeSnapshot: MOCK_PLACES[4], // Standing Bar
        sourceType: 'MANUAL',
        addedBy: '0199f2b8-7b11-7c41-8d7a-2a7b0c9e1301',
        position: 1,
      },
      {
        id: 'opt-8',
        placeSnapshot: MOCK_PLACES[3], // All Day Coffee
        sourceType: 'MANUAL',
        addedBy: '0199f2b8-7b11-7c41-8d7a-2a7b0c9e1301',
        position: 2,
      },
    ],
    votingRule: {
      type: 'ONE_CHOICE',
      maxSelections: 1,
      allowChange: true,
      allowVeto: false,
      tieBreakPolicy: 'FEWER_VETOES_THEN_RANDOM',
    },
    privacyMode: 'AGGREGATE',
    closesAt: null,
    votingRoundVersion: 1,
    roomVersion: 1,
    participantCount: 2,
    availableActions: ['OPEN', 'EDIT', 'ADD_OPTION', 'DELETE'],
  },
  {
    id: 'room-closed-phoco',
    ownerActorId: '0199f2b8-7b11-7c41-8d7a-2a7b0c9e1301',
    status: 'CLOSED',
    title: 'Chốt kèo ăn đêm thứ Sáu trước',
    options: [
      {
        id: 'opt-9',
        placeSnapshot: MOCK_PLACES[1],
        sourceType: 'MANUAL',
        addedBy: '0199f2b8-7b11-7c41-8d7a-2a7b0c9e1301',
        position: 1,
      },
      {
        id: 'opt-10',
        placeSnapshot: MOCK_PLACES[5],
        sourceType: 'MANUAL',
        addedBy: '0199f2b8-7b11-7c41-8d7a-2a7b0c9e1301',
        position: 2,
      },
    ],
    votingRule: {
      type: 'ONE_CHOICE',
      maxSelections: 1,
      allowChange: false,
      allowVeto: false,
      tieBreakPolicy: 'FEWER_VETOES_THEN_RANDOM',
    },
    privacyMode: 'AGGREGATE',
    closesAt: '2026-09-19T20:00:00Z',
    votingRoundVersion: 1,
    roomVersion: 4,
    participantCount: 6,
    availableActions: ['VIEW_RESULT', 'DIRECTIONS'],
  },
];

export const MOCK_SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { type: 'CATEGORY', text: 'Quán cafe gần đây', normalizedText: 'quan cafe gan day', targetId: null, highlightRanges: [] },
  { type: 'CATEGORY', text: 'Ăn đồ nướng lẩu', normalizedText: 'an do nuong lau', targetId: null, highlightRanges: [] },
  { type: 'PLACE', text: 'Cafe Giảng - Nguyễn Hữu Huân', normalizedText: 'cafe giang nguyen huu huan', targetId: 'plc-giang-cafe', highlightRanges: [] },
  { type: 'PLACE', text: 'Phở Thìn Lò Đúc', normalizedText: 'pho thin lo duc', targetId: 'plc-pho-thin', highlightRanges: [] },
  { type: 'PLACE', text: 'Pizza 4P’s Tràng Tiền', normalizedText: 'pizza 4ps trang tien', targetId: 'plc-pizza-4ps', highlightRanges: [] },
  { type: 'CATEGORY', text: 'Quán bar acoustic cuối tuần', normalizedText: 'quan bar acoustic cuoi tuan', targetId: null, highlightRanges: [] },
];
