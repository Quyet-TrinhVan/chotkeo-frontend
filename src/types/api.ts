/**
 * Chốt Kèo API Specification v1.0 Types
 * Sourced directly from FE_API_INTEGRATION_GUIDE.md
 */

export type UUID = string;
export type DateTime = string;

// ==========================================
// 2. Success & Error Envelopes
// ==========================================

export type ResourceResponse<T> = {
  data: T;
  meta: {
    requestId: string;
    serverTime: DateTime;
  };
};

export type ResponseMeta = ResourceResponse<never>['meta'];

export type CursorPage = {
  pageSize: number;
  hasNext: boolean;
  nextToken: string | null;
};

export type ListResponse<T> = {
  data: T[];
  page: CursorPage;
  meta: ResponseMeta;
};

export type ProblemDetail = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  requestId: string;
  retryable: boolean;
  errors?: Array<{
    field: string;
    reason: string;
    message: string;
  }> | null;
};

// Aliases for backward compatibility in codebase
export type ApiResponse<T> = ResourceResponse<T>;
export type ApiListResponse<T> = ListResponse<T>;

// ==========================================
// 3. Auth, Account, Profile & Upload
// ==========================================

export type SessionActor = {
  id: UUID;
  type?: 'USER';
  permissions?: string[];
};

export type SessionTokenPair = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  tokenType: 'Bearer';
  actor: SessionActor;
};

export type RegisterRequest = {
  username: string; // 1..320
  password: string; // 1..1024
  email: string;
  firstName: string; // 1..255
  lastName: string; // 1..255
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type LogoutRequest = {
  refreshToken: string;
};

export type UserProfile = {
  id: UUID;
  displayName: string;
  avatar?: MediaAsset | null;
  locale: string;
  timeZone: string;
  profileState: 'ACTIVE' | 'RESTRICTED' | 'DELETION_PENDING';
  createdAt: DateTime;
  updatedAt: DateTime;
  version: number;
};

export type UserProfilePatch = {
  displayName?: string; // 1..80
  avatar?: UUID | null; // null để clear
};

export type UploadCreate = {
  purpose: 'AVATAR';
  fileName: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  sizeBytes: number;
  sha256: string;
};

export type UploadComplete = {
  etag: string;
};

export type UploadSession = {
  id: UUID;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: DateTime;
  limits: { maxSizeBytes: number };
};

export type MediaAsset = {
  id: UUID;
  status: 'UPLOADING' | 'SCANNING' | 'READY' | 'REJECTED' | 'DELETED';
  contentType: string;
  sizeBytes: number;
  sha256: string;
  renditions?: Array<{
    kind: 'ORIGINAL';
    url: string;
    expiresAt: DateTime;
  }> | null;
  attribution?: Record<string, unknown> | null;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
};

// ==========================================
// 4. Bootstrap, Taxonomy & Policies
// ==========================================

export type BootstrapData = {
  serverTime: DateTime;
  minimumSupportedVersion: string;
  maintenanceMode: boolean;
  taxonomyVersions: Record<string, string>;
  legalVersions: Record<string, string>;
};

export type Taxonomy = {
  key: string;
  version: string;
  status: 'DRAFT' | 'PUBLISHED' | 'RETIRED';
  items: Array<{ id: UUID; code: string; label: string }>;
};

export type LegalDocument = {
  version: string;
  effectiveAt: DateTime;
  contentUrl: string;
  checksum: string;
};

export type ClientPolicy = {
  platform: 'IOS' | 'ANDROID' | 'WEB' | 'CMS' | 'PARTNER';
  minimumVersion: string;
  upgradeMode: string;
  consentPurposes: string[];
  ageGateMode: string;
  disabledCapabilities: string[];
};

export type ClientFeatureFlag = {
  key: string;
  enabled: boolean;
};

// ==========================================
// 5. Places, Discovery & Collections
// ==========================================

export type GeoPoint = {
  type?: 'Point';
  coordinates: [longitude: number, latitude: number];
};

export type PlaceTaxonomyItem = {
  id: UUID;
  code: string;
  label: string;
};

export type PriceRange = {
  currency?: 'VND';
  minAmount: number;
  maxAmount: number;
  basis?: 'PER_PERSON';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type PlaceFreshness = {
  status: 'FRESH' | 'DUE' | 'STALE' | 'UNKNOWN';
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
  verifiedAt: DateTime | null;
  fields?: string[];
};

export type OpenState = 'OPEN' | 'CLOSED' | 'CLOSING_SOON' | 'UNKNOWN';

export type PlaceSummary = {
  id: UUID;
  name: string;
  category: PlaceTaxonomyItem;
  styles: PlaceTaxonomyItem[];
  priceRange: PriceRange;
  location: GeoPoint;
  distanceMeters: number | null;
  openState: OpenState;
  freshness: PlaceFreshness;
  heroMedia: MediaAsset | null;
  heroImageUrl?: string; // Client convenient mapped URL from heroMedia or mock
  sponsorship?: Record<string, unknown> | null;
};

export type OpeningPeriod = {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
};

export type PlaceDetail = {
  summary: PlaceSummary;
  address: { displayAddress: string; normalizedAddress: string };
  openingHours: {
    timeZone?: 'Asia/Ho_Chi_Minh';
    weeklyPeriods?: OpeningPeriod[];
    exceptions?: Array<{
      localDate: string;
      isClosed: boolean;
      opensAt: string | null;
      closesAt: string | null;
    }>;
    verifiedAt?: DateTime | null;
  };
  contact: { phone: string | null; website: string | null } | null;
  amenities: PlaceTaxonomyItem[];
  dietaryOptions: PlaceTaxonomyItem[];
  media: MediaAsset[];
  sources: Array<{ source: string; attribution: string | null; license: string | null }>;
  bookingOptions: Record<string, unknown>[];
  availableActions: string[];
};

export type PlaceAvailability = {
  placeId: UUID;
  at: DateTime;
  timeZone: 'Asia/Ho_Chi_Minh';
  openState: PlaceSummary['openState'];
  nextTransitionAt: DateTime | null;
  providerAvailability?: 'UNKNOWN';
};

export type DirectionOptions = {
  placeId: UUID;
  mode: 'DRIVING' | 'WALKING';
  destination: GeoPoint;
  deepLink: string;
  estimate: { distanceMeters: number | null; durationSeconds: number | null };
};

export type SearchSuggestion = {
  type: 'PLACE' | 'CATEGORY';
  text: string;
  normalizedText: string;
  targetId: UUID | null;
  highlightRanges: Array<{ start: number; end: number }>;
};

export type MapCluster = {
  type: 'CLUSTER' | 'PLACE';
  geometry: GeoPoint;
  pointCount: number;
  representativePlaceIds: UUID[];
};

export type CollectionSummary = {
  id: UUID;
  title: string;
  description: string | null;
  theme: string | null;
  coverMedia: MediaAsset | null;
  effectiveAt: DateTime;
  expiresAt: DateTime | null;
};

export type CollectionDetail = CollectionSummary & {
  curatorAttribution: string | null;
  sponsorAttribution: string | null;
};

export type DiscoverySection = {
  id: string;
  type: 'PLACE_LIST';
  title: string;
  places: PlaceSummary[];
};

export type PlaceReportCreate = {
  placeId: UUID;
  issueType:
    | 'WRONG_INFORMATION'
    | 'WRONG_ADDRESS'
    | 'WRONG_HOURS'
    | 'CLOSED'
    | 'DUPLICATE'
    | 'OTHER';
  note?: string | null;
  evidenceMediaIds?: UUID[] | null;
};

export type PlaceReport = {
  id: UUID;
  placeId: UUID;
  issueType: PlaceReportCreate['issueType'];
  note: string | null;
  evidenceMediaIds: UUID[];
  status: 'PENDING';
  createdAt: DateTime;
};

export type PlaceQuery = {
  q?: string;
  categoryIds?: UUID[];
  styleIds?: UUID[];
  priceMin?: number;
  priceMax?: number;
  openAt?: DateTime;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  sort?: 'relevance' | 'distanceMeters' | 'price' | 'name' | '-relevance' | '-price';
  pageSize?: number;
  pageToken?: string;
};

// ==========================================
// 6. Recommendation
// ==========================================

export type MoneyRangeInput = {
  currency?: 'VND';
  minAmount: number;
  maxAmount: number;
  basis?: 'PER_PERSON';
};

export type RecommendationConstraint = { type: string; value: unknown };
export type RecommendationPreference = { type: string; value: unknown };
export type RecommendationGeoPoint = {
  type?: 'Point';
  coordinates: [longitude: number, latitude: number];
};

export type RecommendationCreate = {
  areaId: UUID;
  activityType: 'EAT' | 'DRINK' | 'COFFEE' | 'PLAY' | 'COMBO';
  plannedAt?: DateTime | null;
  partySize: number; // 1..50
  budgetPerPerson?: MoneyRangeInput | null;
  styleIds?: UUID[];
  hardConstraints?: RecommendationConstraint[];
  softPreferences?: RecommendationPreference[];
  origin?: RecommendationGeoPoint | null;
};

export type RecommendationChangedConstraints = Partial<{
  areaId: UUID | null;
  activityType: RecommendationCreate['activityType'] | null;
  plannedAt: DateTime | null;
  partySize: number | null;
  budgetPerPerson: MoneyRangeInput | null;
  styleIds: UUID[] | null;
  hardConstraints: RecommendationConstraint[] | null;
  softPreferences: RecommendationPreference[] | null;
  origin: RecommendationGeoPoint | null;
}>;

export type RecommendationRegenerationRequest = {
  keepPlaceIds?: UUID[] | null;
  excludedPlaceIds?: UUID[] | null;
  changedConstraints?: RecommendationChangedConstraints | null;
};

export type RecommendationAcceptanceCreate = {
  placeId: UUID;
  nextAction: 'SAVE' | 'DIRECTIONS' | 'DRAW' | 'ROOM';
};

export type RecommendationOption = {
  id: UUID;
  place: PlaceSummary;
  scoreBand: 'HIGH' | 'MEDIUM' | 'LOW';
  explanationCodes: string[];
  constraintsSatisfied: string[];
  rank: number;
};

export type RecommendationSession = {
  id: UUID;
  version: number;
  status: 'ACTIVE' | 'ACCEPTED' | 'EXPIRED';
  constraints: RecommendationCreate;
  options: RecommendationOption[];
  relaxationHints: Array<{ constraintType: string; message: string }>;
  ruleVersion: string;
  candidateSetVersion: string;
  expiresAt: DateTime;
};

export type RecommendationAcceptance = {
  id: UUID;
  sessionId: UUID;
  version: number;
  placeId: UUID;
  nextAction: 'SAVE' | 'DIRECTIONS' | 'DRAW' | 'ROOM';
  createdAt: DateTime;
};

// ==========================================
// 7. Random Draw
// ==========================================

export type RandomPlaceQuery = {
  q?: string | null;
  categoryIds?: UUID[];
  styleIds?: UUID[];
  priceMin?: number | null;
  priceMax?: number | null;
  openAt?: DateTime | null;
  lat?: number | null;
  lng?: number | null;
  radiusMeters?: number | null;
  sort?: string | null;
  pageSize?: number;
  pageToken?: string | null;
};

export type RandomDrawSource =
  | { type: 'PLACE_QUERY'; query: RandomPlaceQuery }
  | { type: 'PLACE_IDS'; placeIds: UUID[] }
  | { type: 'RECOMMENDATION_SESSION'; sessionId: UUID };

export type RandomDrawConstraints = {
  plannedAt: DateTime | null;
  partySize: number | null;
  budgetPerPerson: MoneyRangeInput | null;
  styleIds: UUID[];
  hardConstraints: RecommendationConstraint[];
};

export type RandomDrawCreate = {
  source: RandomDrawSource;
  constraints: RandomDrawConstraints;
  excludedPlaceIds?: UUID[] | null;
};

export type RandomDrawRerollRequest = {
  excludePrevious?: boolean | null;
  reason?: string | null;
};

export type RandomAcceptanceCreate = {
  nextAction: 'SAVE' | 'DIRECTIONS' | 'ROOM';
};

export type AnimationSpec = {
  version: string;
  durationMs: number;
  itemIds: UUID[];
  resultIndex: number;
  easingPreset: string;
};

export type RandomDraw = {
  id: UUID;
  status: 'COMMITTED' | 'ACCEPTED' | 'REPLACED' | 'EXPIRED';
  result: PlaceSummary;
  poolSize: number;
  poolVersion: string;
  ruleVersion: string;
  animationSpec: AnimationSpec;
  reduceMotionFallback: { mode: string; durationMs: number };
  replacedDrawId: UUID | null;
  createdAt: DateTime;
};

export type RandomAcceptance = {
  id: UUID;
  drawId: UUID;
  nextAction: 'SAVE' | 'DIRECTIONS' | 'ROOM';
  createdAt: DateTime;
};

// ==========================================
// 8. Rooms & Voting
// ==========================================

export type RoomStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED' | 'EXPIRED';
export type ParticipantRole = 'OWNER' | 'MEMBER';
export type ParticipantStatus = 'ACTIVE' | 'LEFT' | 'REMOVED';

export type RoomOptionSourceType =
  | 'MANUAL'
  | 'RECOMMENDATION_SESSION'
  | 'RANDOM_DRAW'
  | 'COLLECTION'
  | 'SAVED_PLACES';

export type RoomOptionSource = {
  type: RoomOptionSourceType;
  sourceId?: UUID | null;
};

export type RoomVotingRule = {
  type: 'ONE_CHOICE';
  maxSelections: 1;
  allowChange: boolean;
  allowVeto: boolean;
  tieBreakPolicy: 'FEWER_VETOES_THEN_RANDOM';
};

export type RoomOptionCreate = {
  placeId: UUID;
  note?: string | null;
};

export type RoomCreate = {
  title?: string | null;
  optionSource: RoomOptionSource;
  options: RoomOptionCreate[]; // 2..10
  votingRule: RoomVotingRule;
  closesAt?: DateTime | null;
};

export type RoomPatch = {
  title?: string | null;
  votingRule?: RoomVotingRule | null;
  closesAt?: DateTime | null;
  privacyMode?: 'AGGREGATE' | null;
};

export type RoomJoinCreate = {
  inviteToken: string; // 32..2048; chỉ gửi trong body
  displayName?: string | null;
};

export type RoomOpen = {
  closesAt?: DateTime | null;
  allowVoteChange?: boolean | null;
};

export type RoomExtension = {
  newClosesAt: DateTime;
  reason?: string | null;
};

export type RoomClose = {
  expectedRoomVersion: number;
  reason: string;
};

export type RoomCancel = {
  reasonCode: string;
};

export type RoomShareLinkCreate = {
  expiresAt?: DateTime | null;
  maxUses?: number | null;
};

export type RoomOwnershipTransfer = {
  participantId: UUID;
};

export type RoomParticipantPatch = {
  displayName?: string | null;
  notifications?: Record<string, unknown> | null;
};

export type VoteWrite = {
  optionIds: UUID[];
  vetoOptionIds?: UUID[];
  ballotVersion: number;
};

export type RoomOption = {
  id: UUID;
  placeSnapshot: PlaceSummary;
  sourceType: RoomOptionSourceType | null;
  addedBy: UUID | null;
  position: number;
};

export type RoomParticipantSummary = {
  id: UUID;
  displayName: string;
  role: ParticipantRole;
  status: ParticipantStatus;
};

export type Room = {
  id: UUID;
  ownerActorId: UUID;
  status: RoomStatus;
  title?: string | null;
  options: RoomOption[];
  votingRule: RoomVotingRule;
  privacyMode: 'AGGREGATE';
  closesAt: DateTime | null;
  votingRoundVersion: number;
  roomVersion: number;
  participants?: RoomParticipantSummary[];
  availableActions: string[];
  participantCount?: number;
};

export type Ballot = {
  roomId: UUID;
  ballotVersion: number;
  options: RoomOption[];
  votingRule: RoomVotingRule;
  closesAt: DateTime | null;
  currentVote: Vote | null;
};

export type Vote = {
  id: UUID;
  roomId: UUID;
  participantId: UUID;
  optionIds: UUID[];
  vetoOptionIds: UUID[] | null;
  ballotVersion: number;
  submittedAt: DateTime;
  version: number;
};

export type OptionAggregate = {
  optionId: UUID;
  choiceCount: number;
  vetoCount?: number | null;
};

export type VoteSummary = {
  roomId: UUID;
  ballotVersion: number;
  eligibleCount: number;
  submittedCount: number;
  optionAggregates: OptionAggregate[];
};

export type RoomParticipantListItem = {
  id: UUID;
  displayName: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedAt: DateTime;
  canRemove?: boolean | null;
};

export type RoomResultRankingItem = {
  optionId: UUID;
  rank: number;
  choiceCount: number;
  vetoCount: number;
};

export type TieBreakTrace = {
  policyVersion: string;
  vetoCounts: Record<UUID, number>;
  tiedOptionIds: UUID[];
  randomDrawId?: UUID | null;
};

// Response của POST /close
export type RoomResultData = {
  id: UUID;
  roomId: UUID;
  winnerOptionId: UUID;
  ranking: RoomResultRankingItem[];
  tieBreakTrace: TieBreakTrace | null;
  resultVersion: 1;
  closedAt: DateTime;
  closedBy: 'OWNER' | 'SYSTEM_TIMEOUT' | 'POLICY';
};

// Response của GET /result
export type RoomResultViewData = {
  id: UUID;
  roomId: UUID;
  winner: RoomOption;
  ranking: RoomResultRankingItem[];
  tieBreakTrace: TieBreakTrace | null;
  resultVersion: 1;
  closedAt: DateTime;
  closedBy: 'OWNER' | 'SYSTEM_TIMEOUT' | 'POLICY';
  availableActions: string[];
};

export type RoomShareLink = {
  linkId: UUID;
  inviteToken: string; // plaintext chỉ trả lúc tạo
  expiresAt: DateTime | null;
  maxUses: number | null;
};

export type RoomListItem = {
  id: UUID;
  title?: string | null;
  status: RoomStatus;
  closesAt: DateTime | null;
  roomVersion: number;
  votingRoundVersion: number;
  options: RoomOption[];
  optionCount: number;
  participantCount: number;
  role: ParticipantRole;
  availableActions: string[];
};

export type RoomJoinResult = {
  room: Room;
  participant: RoomParticipantSummary;
  permissions: string[];
};

export type RoomParticipant = {
  id: UUID;
  displayName: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  notifications?: Record<string, unknown> | null;
  joinedAt: DateTime;
};
