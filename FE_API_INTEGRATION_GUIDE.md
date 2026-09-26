# Chốt Kèo — Hướng dẫn tích hợp API cho Frontend

> Cập nhật: 2026-09-25  
> API contract: v1.0  
> Base path: `/api/v1`  
> Nguồn đối chiếu: `Chot_Keo_API_Specification_v1.0` và OpenAPI sinh từ backend hiện tại.

## 1. Phạm vi tài liệu

Tài liệu này mô tả **55 path đang được backend expose thực tế**. FE nên coi:

1. `/openapi.json` là contract máy đọc tại runtime.
2. File này là hướng dẫn ghép API, state và lỗi.
3. API có trong Product/API Specification nhưng không có trong `/openapi.json` là chưa sẵn sàng để gọi.

Swagger UI khi chạy local thường ở `/docs`.

Ký hiệu schema trong tài liệu:

- `field: T`: bắt buộc.
- `field?: T`: có thể bỏ khỏi JSON.
- `T | null`: được phép gửi/trả `null`.
- `UUID`: UUID lowercase do server sinh.
- `DateTime`: RFC 3339 có timezone, ví dụ `2026-09-25T09:30:00Z`.
- `integer`: số nguyên; tiền VND không dùng float.
- Mọi command body hiện tại đều từ chối field lạ (`additionalProperties: false`).

## 2. Quy ước HTTP bắt buộc

### 2.1 Headers

| Header | Khi dùng | Ghi chú FE |
|---|---|---|
| `Authorization: Bearer <token>` | Endpoint protected | Không log access/refresh token. |
| `Content-Type: application/json` | POST/PUT thông thường | PATCH Room/Profile dùng loại được mô tả ở endpoint. |
| `Content-Type: application/merge-patch+json` | PATCH Room | Giữ đúng JSON Merge Patch semantics. |
| `Accept: application/json` | Request thành công | Lỗi trả `application/problem+json`. |
| `Idempotency-Key` | Command được đánh dấu | 16–128 ký tự; tạo mới cho một intent, giữ nguyên khi retry cùng body. |
| `If-Match` | PATCH/DELETE được đánh dấu | Dùng nguyên strong ETag gần nhất, kể cả dấu `"`. |
| `If-None-Match` | GET hỗ trợ cache validator | Backend có thể trả `304` không body. |
| `X-Request-Id` | Khuyến nghị | UUID; giữ lại để support/debug. |
| `X-App-Version` | First-party client | SemVer. |
| `X-Client-Platform` | Khi endpoint yêu cầu | `IOS`, `ANDROID`, `WEB`, `CMS`, `PARTNER`. |
| `X-Time-Zone` | Logic thời gian | IANA timezone; mặc định `Asia/Ho_Chi_Minh`. |
| `Accept-Language` | Localization | Mặc định `vi-VN`. |

### 2.2 Success envelope

Single resource:

```ts
type ResourceResponse<T> = {
  data: T;
  meta: {
    requestId: string;
    serverTime: DateTime;
  };
};

type ResponseMeta = ResourceResponse<never>["meta"];
```

List có cursor:

```ts
type CursorPage = {
  pageSize: number;
  hasNext: boolean;
  nextToken: string | null;
};

type ListResponse<T> = {
  data: T[];
  page: CursorPage;
  meta: ResponseMeta;
};
```

`204 No Content` không có JSON body. Không gọi `response.json()` khi status là `204` hoặc `304`.

### 2.3 Error envelope

```ts
type ProblemDetail = {
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
```

Xử lý status tối thiểu:

| Status | FE behavior |
|---|---|
| `400` | Request/header/query sai; hiển thị validation phù hợp. |
| `401` | Token thiếu/hết hạn; thử refresh đúng một lần rồi yêu cầu đăng nhập lại. |
| `403` | Actor không có capability/role. |
| `404` | Không tồn tại hoặc resource nằm ngoài scope; không suy đoán quyền sở hữu. |
| `409` | State/idempotency/ballot conflict; đọc `code`, không retry mù. |
| `410` | Resource/draw hết hạn vĩnh viễn. |
| `412` | ETag stale; GET lại snapshot rồi cho user thử lại. |
| `422` | Business rule không hợp lệ. |
| `428` | Thiếu `If-Match`; GET lại resource để lấy ETag. |
| `429` | Tôn trọng `Retry-After`. |
| `500/502/503/504` | Hiển thị lỗi an toàn; chỉ retry operation an toàn/idempotent. |

Các code FE cần branch riêng hiện có gồm `VALIDATION_FAILED`, `RESOURCE_NOT_FOUND`, `ROOM_NOT_OPEN`, `BALLOT_VERSION_MISMATCH`, `VOTE_LOCKED`, `IDEMPOTENCY_CONFLICT`, `CONSTRAINTS_TOO_STRICT`, `DRAW_EXPIRED`, `PRECONDITION_REQUIRED`, `PRECONDITION_FAILED`.

### 2.4 Cursor, array query và thời gian

- `pageToken` là opaque; FE chỉ lưu và gửi lại, không parse.
- Không dùng offset pagination.
- Query array dùng đúng alias có dấu ngoặc, ví dụ:
  `status[]=OPEN&status[]=CLOSED`, `categoryIds[]=<uuid>`.
- Sort/order do server quyết định và có stable tie-breaker.
- `lat/lng`: WGS84; GeoJSON coordinates theo `[longitude, latitude]`.
- Tất cả DateTime gửi kèm timezone.

## 3. Endpoint catalog

Legend: `Public` không cần Bearer; `User` cần Bearer USER; `Participant/Owner` còn kiểm tra object-level authorization.

### 3.1 Auth và account

| Method | Path | Access | Request | Success |
|---|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | `RegisterRequest` | `201 RegistrationEnvelope` |
| POST | `/api/v1/auth/login` | Public | `LoginRequest` | `200 LoginEnvelope` |
| POST | `/api/v1/auth/tokens/refresh` | Public + refresh token | `RefreshTokenRequest` | `200 RefreshTokenEnvelope` |
| POST | `/api/v1/auth/logout` | User | `LogoutRequest` | `204` |
| GET | `/api/v1/me` | User | `If-None-Match?` | `200 UserProfileEnvelope`, `304` |
| PATCH | `/api/v1/me` | User | `If-Match`, `UserProfilePatch` | `200 UserProfileEnvelope` |

### 3.2 Upload và media

| Method | Path | Access | Request | Success |
|---|---|---|---|---|
| POST | `/api/v1/uploads` | User | `Idempotency-Key`, `UploadCreate` | `201 UploadSessionEnvelope` |
| POST | `/api/v1/uploads/{uploadId}/complete` | User | `UploadComplete` | `200 MediaAssetEnvelope` |
| GET | `/api/v1/media/{mediaId}` | User | path UUID | `200 MediaAssetEnvelope` |

Upload flow: tạo session → PUT file trực tiếp vào `uploadUrl` với đúng `requiredHeaders` → gọi `/complete` → poll/get media đến khi `READY` hoặc terminal status.

### 3.3 Places, discovery và collections

| Method | Path | Access | Query/request | Success |
|---|---|---|---|---|
| GET | `/api/v1/places` | Public | `q`, `categoryIds[]`, `styleIds[]`, `priceMin`, `priceMax`, `openAt`, `lat`, `lng`, `radiusMeters`, `sort`, `pageSize`, `pageToken` | `PlaceListResponse` |
| GET | `/api/v1/places/{placeId}` | Public | `If-None-Match?` | `PlaceDetailResponse`, `304`; canonical redirect có thể là `308` |
| GET | `/api/v1/places/{placeId}/availability` | Public | `at` required, `partySize?` | `PlaceAvailabilityResponse` |
| GET | `/api/v1/places/{placeId}/directions` | Public | `mode` required, `fromLat?`, `fromLng?` | `DirectionOptionsResponse` |
| GET | `/api/v1/places/{placeId}/related` | Public | `context?`, `limit?` | `RelatedPlaceResponse` |
| GET | `/api/v1/place-search/suggestions` | Public | `q` required, `lat?`, `lng?`, `limit?` | `SearchSuggestionResponse` |
| GET | `/api/v1/place-map/clusters` | Public | `bbox`, `zoom`, filters | `MapClusterResponse` |
| GET | `/api/v1/discovery/feed` | User | `context?`, `pageSize?`, `pageToken?` | `DiscoveryFeedResponse` |
| GET | `/api/v1/collections` | Public | `theme?`, `context?`, cursor, `If-None-Match?` | `CollectionListResponse`, `304` |
| GET | `/api/v1/collections/{collectionId}` | Public | `If-None-Match?` | `CollectionDetailResponse`, `304` |
| GET | `/api/v1/collections/{collectionId}/places` | Public | Place filters + cursor | `PlaceListResponse` |
| POST | `/api/v1/place-reports` | User | `Idempotency-Key`, `PlaceReportCreate` | `201 PlaceReportResponse` |

`bbox` là chuỗi bbox theo contract backend; không gửi precise user location nếu UI không cần. `mode` hiện hỗ trợ `DRIVING`, `WALKING`.

### 3.4 Recommendation

| Method | Path | Access | Request | Success |
|---|---|---|---|---|
| POST | `/api/v1/recommendation-sessions` | User | `Idempotency-Key`, `RecommendationCreate` | `201 RecommendationSessionResponse` |
| GET | `/api/v1/recommendation-sessions/{sessionId}` | Owner | path UUID | `200 RecommendationSessionResponse` |
| POST | `/api/v1/recommendation-sessions/{sessionId}/regenerations` | Owner | `Idempotency-Key`, `RecommendationRegenerationRequest` | `200 RecommendationSessionResponse` |
| PUT | `/api/v1/recommendation-sessions/{sessionId}/locks/{placeId}` | Owner | no body | `200 RecommendationSessionResponse` |
| DELETE | `/api/v1/recommendation-sessions/{sessionId}/locks/{placeId}` | Owner | no body | `200 RecommendationSessionResponse` |
| PUT | `/api/v1/recommendation-sessions/{sessionId}/hidden/{placeId}` | Owner | no body | `204` |
| POST | `/api/v1/recommendation-sessions/{sessionId}/acceptances` | Owner | `Idempotency-Key`, `RecommendationAcceptanceCreate` | `201 RecommendationAcceptanceResponse` |

FE không được tự nới hard constraint. Khi options ít hơn 3, hiển thị `relaxationHints` và để user chủ động regenerate.

### 3.5 Random draw

| Method | Path | Access | Request | Success |
|---|---|---|---|---|
| POST | `/api/v1/random-draws` | User | `Idempotency-Key`, `RandomDrawCreate` | `201 RandomDrawResponse` |
| GET | `/api/v1/random-draws/{drawId}` | Owner | path UUID | `200 RandomDrawResponse` |
| POST | `/api/v1/random-draws/{drawId}/rerolls` | Owner | `Idempotency-Key`, `RandomDrawRerollRequest` | `201 RandomDrawResponse` |
| POST | `/api/v1/random-draws/{drawId}/acceptances` | Owner | `Idempotency-Key`, `RandomAcceptanceCreate` | `201 RandomAcceptanceResponse` |

Animation chỉ render `animationSpec`; kết quả thật luôn là `data.result` đã commit. FE tuyệt đối không tự random hay thay đổi `resultIndex`.

### 3.6 Rooms

| Method | Path | Access | Request | Success |
|---|---|---|---|---|
| POST | `/api/v1/room-joins` | User | `Idempotency-Key`, `RoomJoinCreate` | `200 RoomJoinResponse` |
| GET | `/api/v1/rooms` | User | `status[]?`, `role?`, cursor | `RoomListResponse` |
| POST | `/api/v1/rooms` | User | `Idempotency-Key`, `RoomCreate` | `201 RoomResponse` |
| GET | `/api/v1/rooms/{roomId}` | Participant | path UUID | `200 RoomResponse`, ETag |
| PATCH | `/api/v1/rooms/{roomId}` | Owner | `If-Match`, merge-patch `RoomPatch` | `200 RoomResponse`, ETag mới |
| DELETE | `/api/v1/rooms/{roomId}` | Owner | `If-Match` | `204` |
| GET | `/api/v1/rooms/{roomId}/ballot` | ACTIVE participant | path UUID | `200 BallotResponse`, ETag theo ballot version |
| PUT | `/api/v1/rooms/{roomId}/votes/me` | ACTIVE participant | `Idempotency-Key`, `VoteWrite` | `200 VoteResponse` |
| DELETE | `/api/v1/rooms/{roomId}/votes/me` | ACTIVE participant | query `ballotVersion`, `Idempotency-Key` | `204` |
| GET | `/api/v1/rooms/{roomId}/vote-summary` | ACTIVE participant | path UUID | `200 VoteSummaryResponse` |
| GET | `/api/v1/rooms/{roomId}/result` | ACTIVE participant | path UUID | `200 RoomResultViewResponse`; chỉ `CLOSED` |
| GET | `/api/v1/rooms/{roomId}/participants` | Participant | cursor | `RoomParticipantListResponse` |
| PATCH | `/api/v1/rooms/{roomId}/participants/me` | Participant | `If-Match`, merge-patch `RoomParticipantPatch` | `RoomParticipantResponse` |
| DELETE | `/api/v1/rooms/{roomId}/participants/{participantId}` | Owner hoặc self | path UUID | `204` |
| POST | `/api/v1/rooms/{roomId}/ownership-transfers` | Owner + recent reauth | `Idempotency-Key`, `RoomOwnershipTransfer` | `RoomResponse` |
| POST | `/api/v1/rooms/{roomId}/options` | Owner | `Idempotency-Key`, `RoomOptionCreate` | `201 RoomOptionResponse` |
| DELETE | `/api/v1/rooms/{roomId}/options/{optionId}` | Owner | `If-Match` | `204` |
| POST | `/api/v1/rooms/{roomId}/open` | Owner | `Idempotency-Key`, `RoomOpen` | `RoomResponse` |
| POST | `/api/v1/rooms/{roomId}/extensions` | Owner | `Idempotency-Key`, `RoomExtension` | `RoomResponse` |
| POST | `/api/v1/rooms/{roomId}/close` | Owner/system | `Idempotency-Key`, `RoomClose` | `RoomResultResponse` |
| POST | `/api/v1/rooms/{roomId}/cancel` | Owner | `Idempotency-Key`, `RoomCancel` | `RoomResponse` |
| POST | `/api/v1/rooms/{roomId}/share-links` | Owner | `Idempotency-Key`, `RoomShareLinkCreate` | `201 RoomShareLinkResponse` |
| DELETE | `/api/v1/rooms/{roomId}/share-links/{linkId}` | Owner | path UUID | `204` |

Lưu ý Room:

- `RoomOption.id` là option ID dùng để vote; không gửi `placeSnapshot.id` vào `optionIds`.
- `vetoOptionIds` cũng chứa **RoomOption IDs**.
- `ballotVersion` phải lấy từ GET ballot gần nhất.
- `roomVersion` dùng cho ETag/concurrency; `votingRoundVersion` dùng cho ballot.
- Sau OPEN, option set và snapshot bị freeze.
- `GET /result` hiện chỉ hỗ trợ ACTIVE participant. Share token hiện dùng để join, chưa phải read token cho result.
- POST close trả `winnerOptionId`; GET result trả đầy đủ frozen `winner: RoomOption` và `availableActions`.

### 3.7 Bootstrap, taxonomy, legal, policy và flags

| Method | Path | Access | Query/header | Success |
|---|---|---|---|---|
| GET | `/api/v1/bootstrap` | Public | `platform`, `appVersion`, `locale?`, `If-None-Match?` | `BootstrapEnvelope`, `304` |
| GET | `/api/v1/taxonomies` | Public | `keys[]?`, `locale?`, `If-None-Match?` | `TaxonomyCollectionEnvelope`, `304` |
| GET | `/api/v1/taxonomies/{taxonomyKey}` | Public | `locale?`, `If-None-Match?` | `TaxonomyEnvelope`, `304` |
| GET | `/api/v1/legal-documents/{documentType}` | Public | `locale?`, `If-None-Match?` | `LegalDocumentEnvelope`, `304` |
| GET | `/api/v1/client-policies` | Public | `platform`, `appVersion` | `ClientPolicyEnvelope` |
| GET | `/api/v1/feature-flags` | User | `keys[]?`, `X-App-Version`, `X-Client-Platform` | `ClientFeatureFlagEnvelope` |

## 4. Request schemas

```ts
type RegisterRequest = {
  username: string;      // 1..320
  password: string;      // 1..1024; không log
  email: string;
  firstName: string;     // 1..255
  lastName: string;      // 1..255
};

type LoginRequest = { username: string; password: string };
type RefreshTokenRequest = { refreshToken: string };
type LogoutRequest = { refreshToken: string };

type UserProfilePatch = {
  displayName?: string;       // 1..80
  avatar?: UUID | null;       // null để clear
};

type UploadCreate = {
  purpose: "AVATAR";
  fileName: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  sizeBytes: number;
  sha256: string;
};
type UploadComplete = { etag: string };

type PlaceReportCreate = {
  placeId: UUID;
  issueType:
    | "WRONG_INFORMATION" | "WRONG_ADDRESS" | "WRONG_HOURS"
    | "CLOSED" | "DUPLICATE" | "OTHER";
  note?: string | null;
  evidenceMediaIds?: UUID[] | null;
};
```

### 4.1 Recommendation request

```ts
type MoneyRangeInput = {
  currency?: "VND";
  minAmount: number;
  maxAmount: number;
  basis?: "PER_PERSON";
};

type RecommendationConstraint = { type: string; value: unknown };
type RecommendationPreference = { type: string; value: unknown };
type RecommendationGeoPoint = {
  type?: "Point";
  coordinates: [longitude: number, latitude: number];
};

type RecommendationCreate = {
  areaId: UUID;
  activityType: "EAT" | "DRINK" | "COFFEE" | "PLAY" | "COMBO";
  plannedAt?: DateTime | null;
  partySize: number; // 1..50
  budgetPerPerson?: MoneyRangeInput | null;
  styleIds?: UUID[];
  hardConstraints?: RecommendationConstraint[];
  softPreferences?: RecommendationPreference[];
  origin?: RecommendationGeoPoint | null;
};

type RecommendationChangedConstraints = Partial<{
  areaId: UUID | null;
  activityType: RecommendationCreate["activityType"] | null;
  plannedAt: DateTime | null;
  partySize: number | null;
  budgetPerPerson: MoneyRangeInput | null;
  styleIds: UUID[] | null;
  hardConstraints: RecommendationConstraint[] | null;
  softPreferences: RecommendationPreference[] | null;
  origin: RecommendationGeoPoint | null;
}>;

type RecommendationRegenerationRequest = {
  keepPlaceIds?: UUID[] | null;
  excludedPlaceIds?: UUID[] | null;
  changedConstraints?: RecommendationChangedConstraints | null;
};

type RecommendationAcceptanceCreate = {
  placeId: UUID;
  nextAction: "SAVE" | "DIRECTIONS" | "DRAW" | "ROOM";
};
```

`origin` chỉ dùng khi tính recommendation, không phải long-term persisted constraint.

### 4.2 Random draw request

```ts
type RandomPlaceQuery = {
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

type RandomDrawSource =
  | { type: "PLACE_QUERY"; query: RandomPlaceQuery }
  | { type: "PLACE_IDS"; placeIds: UUID[] }
  | { type: "RECOMMENDATION_SESSION"; sessionId: UUID };

type RandomDrawConstraints = {
  plannedAt: DateTime | null;
  partySize: number | null;
  budgetPerPerson: MoneyRangeInput | null;
  styleIds: UUID[];
  hardConstraints: RecommendationConstraint[];
};

type RandomDrawCreate = {
  source: RandomDrawSource;
  constraints: RandomDrawConstraints;
  excludedPlaceIds?: UUID[] | null;
};

type RandomDrawRerollRequest = {
  excludePrevious?: boolean | null;
  reason?: string | null;
};

type RandomAcceptanceCreate = {
  nextAction: "SAVE" | "DIRECTIONS" | "ROOM";
};
```

### 4.3 Room request

```ts
type RoomOptionSourceType =
  | "MANUAL" | "RECOMMENDATION_SESSION" | "RANDOM_DRAW"
  | "COLLECTION" | "SAVED_PLACES";

type RoomOptionSource = {
  type: RoomOptionSourceType;
  sourceId?: UUID | null;
};

// MANUAL: sourceId phải null.
// RECOMMENDATION_SESSION/RANDOM_DRAW/COLLECTION: sourceId bắt buộc.
// SAVED_PLACES: sourceId nullable.

type RoomVotingRule = {
  type: "ONE_CHOICE";
  maxSelections: 1;
  allowChange: boolean;
  allowVeto: boolean;
  tieBreakPolicy: "FEWER_VETOES_THEN_RANDOM";
};

type RoomOptionCreate = { placeId: UUID; note?: string | null };

type RoomCreate = {
  title?: string | null;
  optionSource: RoomOptionSource;
  options: RoomOptionCreate[]; // 2..10
  votingRule: RoomVotingRule;
  closesAt?: DateTime | null;
};

type RoomPatch = {
  title?: string | null;
  votingRule?: RoomVotingRule | null;
  closesAt?: DateTime | null;
  privacyMode?: "AGGREGATE" | null;
};

type RoomJoinCreate = {
  inviteToken: string; // 32..2048; chỉ gửi trong body
  displayName?: string | null;
};

type RoomOpen = {
  closesAt?: DateTime | null;
  allowVoteChange?: boolean | null;
};

type RoomExtension = { newClosesAt: DateTime; reason?: string | null };
type RoomClose = { expectedRoomVersion: number; reason: string };
type RoomCancel = { reasonCode: string };
type RoomShareLinkCreate = {
  expiresAt?: DateTime | null;
  maxUses?: number | null;
};
type RoomOwnershipTransfer = { participantId: UUID };
type RoomParticipantPatch = {
  displayName?: string | null;
  notifications?: Record<string, unknown> | null;
};
type VoteWrite = {
  optionIds: UUID[];
  vetoOptionIds?: UUID[];
  ballotVersion: number;
};
```

PATCH semantics: field vắng mặt = giữ nguyên; field nullable gửi `null` = clear. Không gửi field immutable.

## 5. Response và shared schemas

### 5.1 Auth, profile, media và system

```ts
type SessionActor = {
  id: UUID;
  type?: "USER";
  permissions?: string[];
};

type SessionTokenPair = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  tokenType: "Bearer";
  actor: SessionActor;
};

type LoginEnvelope = ResourceResponse<SessionTokenPair>;
type RefreshTokenEnvelope = ResourceResponse<SessionTokenPair>;
type RegistrationEnvelope = ResourceResponse<Record<string, never>>;

type UserProfile = {
  id: UUID;
  displayName: string;
  avatar?: MediaAsset | null;
  locale: string;
  timeZone: string;
  profileState: "ACTIVE" | "RESTRICTED" | "DELETION_PENDING";
  createdAt: DateTime;
  updatedAt: DateTime;
  version: number;
};

type UploadSession = {
  id: UUID;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: DateTime;
  limits: { maxSizeBytes: number };
};

type MediaAsset = {
  id: UUID;
  status: "UPLOADING" | "SCANNING" | "READY" | "REJECTED" | "DELETED";
  contentType: string;
  sizeBytes: number;
  sha256: string;
  renditions?: Array<{
    kind: "ORIGINAL";
    url: string;
    expiresAt: DateTime;
  }> | null;
  attribution?: Record<string, unknown> | null;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED";
};

type BootstrapData = {
  serverTime: DateTime;
  minimumSupportedVersion: string;
  maintenanceMode: boolean;
  taxonomyVersions: Record<string, string>;
  legalVersions: Record<string, string>;
};

type Taxonomy = {
  key: string;
  version: string;
  status: "DRAFT" | "PUBLISHED" | "RETIRED";
  items: Array<{ id: UUID; code: string; label: string }>;
};

type LegalDocument = {
  version: string;
  effectiveAt: DateTime;
  contentUrl: string;
  checksum: string;
};

type ClientPolicy = {
  platform: "IOS" | "ANDROID" | "WEB" | "CMS" | "PARTNER";
  minimumVersion: string;
  upgradeMode: string;
  consentPurposes: string[];
  ageGateMode: string;
  disabledCapabilities: string[];
};

type ClientFeatureFlag = { key: string; enabled: boolean };

type UserProfileEnvelope = ResourceResponse<UserProfile>;
type UploadSessionEnvelope = ResourceResponse<UploadSession>;
type MediaAssetEnvelope = ResourceResponse<MediaAsset>;
type BootstrapEnvelope = ResourceResponse<BootstrapData>;
type TaxonomyCollectionEnvelope = ResourceResponse<Taxonomy[]>;
type TaxonomyEnvelope = ResourceResponse<Taxonomy>;
type LegalDocumentEnvelope = ResourceResponse<LegalDocument>;
type ClientPolicyEnvelope = ResourceResponse<ClientPolicy>;
type ClientFeatureFlagEnvelope = ResourceResponse<ClientFeatureFlag[]>;
```

### 5.2 Place schemas

```ts
type GeoPoint = {
  type?: "Point";
  coordinates: [longitude: number, latitude: number];
};

type PlaceTaxonomyItem = { id: UUID; code: string; label: string };

type PriceRange = {
  currency?: "VND";
  minAmount: number;
  maxAmount: number;
  basis?: "PER_PERSON";
  confidence: "LOW" | "MEDIUM" | "HIGH";
};

type PlaceFreshness = {
  status: "FRESH" | "DUE" | "STALE" | "UNKNOWN";
  riskTier: "LOW" | "MEDIUM" | "HIGH";
  verifiedAt: DateTime | null;
  fields?: string[];
};

type PlaceSummary = {
  id: UUID;
  name: string;
  category: PlaceTaxonomyItem;
  styles: PlaceTaxonomyItem[];
  priceRange: PriceRange;
  location: GeoPoint;
  distanceMeters: number | null;
  openState: "OPEN" | "CLOSED" | "CLOSING_SOON" | "UNKNOWN";
  freshness: PlaceFreshness;
  heroMedia: MediaAsset | null;
  sponsorship?: Record<string, unknown> | null;
};

type PlaceDetail = {
  summary: PlaceSummary;
  address: { displayAddress: string; normalizedAddress: string };
  openingHours: {
    timeZone?: "Asia/Ho_Chi_Minh";
    weeklyPeriods?: Array<{ dayOfWeek: number; opensAt: string; closesAt: string }>;
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

type PlaceListResponse = ListResponse<PlaceSummary>;
type PlaceDetailResponse = ResourceResponse<PlaceDetail>;
```

Các projection khác:

```ts
type PlaceAvailability = {
  placeId: UUID;
  at: DateTime;
  timeZone: "Asia/Ho_Chi_Minh";
  openState: PlaceSummary["openState"];
  nextTransitionAt: DateTime | null;
  providerAvailability?: "UNKNOWN";
};

type DirectionOptions = {
  placeId: UUID;
  mode: "DRIVING" | "WALKING";
  destination: GeoPoint;
  deepLink: string;
  estimate: { distanceMeters: number | null; durationSeconds: number | null };
};

type SearchSuggestion = {
  type: "PLACE" | "CATEGORY";
  text: string;
  normalizedText: string;
  targetId: UUID | null;
  highlightRanges: Array<{ start: number; end: number }>;
};

type MapCluster = {
  type: "CLUSTER" | "PLACE";
  geometry: GeoPoint;
  pointCount: number;
  representativePlaceIds: UUID[];
};

type CollectionSummary = {
  id: UUID;
  title: string;
  description: string | null;
  theme: string | null;
  coverMedia: MediaAsset | null;
  effectiveAt: DateTime;
  expiresAt: DateTime | null;
};

type CollectionDetail = CollectionSummary & {
  curatorAttribution: string | null;
  sponsorAttribution: string | null;
};

type DiscoverySection = {
  id: string;
  type: "PLACE_LIST";
  title: string;
  places: PlaceSummary[];
};

type PlaceReport = {
  id: UUID;
  placeId: UUID;
  issueType: PlaceReportCreate["issueType"];
  note: string | null;
  evidenceMediaIds: UUID[];
  status: "PENDING";
  createdAt: DateTime;
};

type CollectionListResponse = ListResponse<CollectionSummary>;
type CollectionDetailResponse = ResourceResponse<CollectionDetail>;
type DiscoveryFeedResponse = ListResponse<DiscoverySection>;
type PlaceReportResponse = ResourceResponse<PlaceReport>;
```

### 5.3 Recommendation schemas

```ts
type RecommendationOption = {
  id: UUID;
  place: PlaceSummary;
  scoreBand: "HIGH" | "MEDIUM" | "LOW";
  explanationCodes: string[];
  constraintsSatisfied: string[];
  rank: number;
};

type RecommendationSession = {
  id: UUID;
  version: number;
  status: "ACTIVE" | "ACCEPTED" | "EXPIRED";
  constraints: RecommendationCreate;
  options: RecommendationOption[];
  relaxationHints: Array<{ constraintType: string; message: string }>;
  ruleVersion: string;
  candidateSetVersion: string;
  expiresAt: DateTime;
};

type RecommendationAcceptance = {
  id: UUID;
  sessionId: UUID;
  version: number;
  placeId: UUID;
  nextAction: "SAVE" | "DIRECTIONS" | "DRAW" | "ROOM";
  createdAt: DateTime;
};

type RecommendationSessionResponse = ResourceResponse<RecommendationSession>;
type RecommendationAcceptanceResponse = ResourceResponse<RecommendationAcceptance>;
```

Raw ranking score không được trả cho FE.

### 5.4 Random draw schemas

```ts
type AnimationSpec = {
  version: string;
  durationMs: number;
  itemIds: UUID[];
  resultIndex: number;
  easingPreset: string;
};

type RandomDraw = {
  id: UUID;
  status: "COMMITTED" | "ACCEPTED" | "REPLACED" | "EXPIRED";
  result: PlaceSummary;
  poolSize: number;
  poolVersion: string;
  ruleVersion: string;
  animationSpec: AnimationSpec;
  reduceMotionFallback: { mode: string; durationMs: number };
  replacedDrawId: UUID | null;
  createdAt: DateTime;
};

type RandomAcceptance = {
  id: UUID;
  drawId: UUID;
  nextAction: "SAVE" | "DIRECTIONS" | "ROOM";
  createdAt: DateTime;
};

type RandomDrawResponse = ResourceResponse<RandomDraw>;
type RandomAcceptanceResponse = ResourceResponse<RandomAcceptance>;
```

### 5.5 Room schemas

```ts
type RoomStatus = "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED" | "EXPIRED";
type ParticipantRole = "OWNER" | "MEMBER";
type ParticipantStatus = "ACTIVE" | "LEFT" | "REMOVED";

type RoomOption = {
  id: UUID;
  placeSnapshot: PlaceSummary;
  sourceType: RoomOptionSourceType | null;
  addedBy: UUID | null;
  position: number;
};

type RoomParticipantSummary = {
  id: UUID;
  displayName: string;
  role: ParticipantRole;
  status: ParticipantStatus;
};

type Room = {
  id: UUID;
  ownerActorId: UUID;
  status: RoomStatus;
  title?: string | null;
  options: RoomOption[];
  votingRule: RoomVotingRule;
  privacyMode: "AGGREGATE";
  closesAt: DateTime | null;
  votingRoundVersion: number;
  roomVersion: number;
  participants?: RoomParticipantSummary[];
  availableActions: string[];
};

type Ballot = {
  roomId: UUID;
  ballotVersion: number;
  options: RoomOption[];
  votingRule: RoomVotingRule;
  closesAt: DateTime | null;
  currentVote: Vote | null;
};

type Vote = {
  id: UUID;
  roomId: UUID;
  participantId: UUID;
  optionIds: UUID[];
  vetoOptionIds: UUID[] | null;
  ballotVersion: number;
  submittedAt: DateTime;
  version: number;
};

type VoteSummary = {
  roomId: UUID;
  ballotVersion: number;
  eligibleCount: number;
  submittedCount: number;
  optionAggregates: Array<{
    optionId: UUID;
    choiceCount: number;
    vetoCount?: number | null;
  }>;
};

type RoomParticipantListItem = {
  id: UUID;
  displayName: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedAt: DateTime;
  canRemove?: boolean | null;
};

type RoomResultRankingItem = {
  optionId: UUID;
  rank: number;
  choiceCount: number;
  vetoCount: number;
};

type TieBreakTrace = {
  policyVersion: string;
  vetoCounts: Record<UUID, number>;
  tiedOptionIds: UUID[];
  randomDrawId?: UUID | null;
};

// Response của POST /close
type RoomResultData = {
  id: UUID;
  roomId: UUID;
  winnerOptionId: UUID;
  ranking: RoomResultRankingItem[];
  tieBreakTrace: TieBreakTrace | null;
  resultVersion: 1;
  closedAt: DateTime;
  closedBy: "OWNER" | "SYSTEM_TIMEOUT" | "POLICY";
};

// Response của GET /result
type RoomResultViewData = {
  id: UUID;
  roomId: UUID;
  winner: RoomOption;
  ranking: RoomResultRankingItem[];
  tieBreakTrace: TieBreakTrace | null;
  resultVersion: 1;
  closedAt: DateTime;
  closedBy: "OWNER" | "SYSTEM_TIMEOUT" | "POLICY";
  availableActions: string[];
};

type RoomShareLink = {
  linkId: UUID;
  inviteToken: string; // plaintext chỉ trả lúc tạo
  expiresAt: DateTime | null;
  maxUses: number | null;
};

type RoomListItem = {
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

type RoomJoinResult = {
  room: Room;
  participant: RoomParticipantSummary;
  permissions: string[];
};

type RoomParticipant = {
  id: UUID;
  displayName: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  notifications?: Record<string, unknown> | null;
  joinedAt: DateTime;
};

type RoomResponse = ResourceResponse<Room>;
type RoomListResponse = ListResponse<RoomListItem>;
type RoomJoinResponse = ResourceResponse<RoomJoinResult>;
type BallotResponse = ResourceResponse<Ballot>;
type VoteResponse = ResourceResponse<Vote>;
type VoteSummaryResponse = ResourceResponse<VoteSummary>;
type RoomParticipantListResponse = ListResponse<RoomParticipantListItem>;
type RoomParticipantResponse = ResourceResponse<RoomParticipant>;
type RoomOptionResponse = ResourceResponse<RoomOption>;
type RoomShareLinkResponse = ResourceResponse<RoomShareLink>;
type RoomResultResponse = ResourceResponse<RoomResultData>;
type RoomResultViewResponse = ResourceResponse<RoomResultViewData>;
```

## 6. Payload mẫu quan trọng

### 6.1 Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "demo@example.com",
  "password": "<password>"
}
```

### 6.2 Recommendation

```http
POST /api/v1/recommendation-sessions
Authorization: Bearer <access-token>
Idempotency-Key: rec-create-0199f2b8-972b-75fd
Content-Type: application/json

{
  "areaId": "0199f2b8-4b1d-7a31-9c68-934e08e501ab",
  "activityType": "COFFEE",
  "plannedAt": "2026-09-25T12:00:00Z",
  "partySize": 2,
  "budgetPerPerson": {
    "currency": "VND",
    "minAmount": 60000,
    "maxAmount": 150000,
    "basis": "PER_PERSON"
  },
  "styleIds": [],
  "hardConstraints": [],
  "softPreferences": [],
  "origin": {
    "type": "Point",
    "coordinates": [105.8342, 21.0278]
  }
}
```

### 6.3 Random draw từ place IDs

```json
{
  "source": {
    "type": "PLACE_IDS",
    "placeIds": [
      "30000000-0000-4000-8000-000000000001",
      "30000000-0000-4000-8000-000000000002"
    ]
  },
  "constraints": {
    "plannedAt": null,
    "partySize": 2,
    "budgetPerPerson": null,
    "styleIds": [],
    "hardConstraints": []
  },
  "excludedPlaceIds": []
}
```

### 6.4 Tạo Room

```http
POST /api/v1/rooms
Authorization: Bearer <access-token>
Idempotency-Key: room-create-0199f2b8-972b-75fd
Content-Type: application/json

{
  "title": "Cà phê chiều nay",
  "optionSource": {
    "type": "MANUAL",
    "sourceId": null
  },
  "options": [
    {
      "placeId": "30000000-0000-4000-8000-000000000001",
      "note": "Gần văn phòng"
    },
    {
      "placeId": "30000000-0000-4000-8000-000000000002",
      "note": null
    }
  ],
  "votingRule": {
    "type": "ONE_CHOICE",
    "maxSelections": 1,
    "allowChange": true,
    "allowVeto": false,
    "tieBreakPolicy": "FEWER_VETOES_THEN_RANDOM"
  },
  "closesAt": null
}
```

### 6.5 Vote

```http
PUT /api/v1/rooms/{roomId}/votes/me
Authorization: Bearer <access-token>
Idempotency-Key: room-vote-0199f2b8-972b-75fd
Content-Type: application/json

{
  "optionIds": ["81000000-0000-4000-8000-000000000001"],
  "vetoOptionIds": [],
  "ballotVersion": 1
}
```

`optionIds` ở đây là `Ballot.options[i].id`, không phải Place ID.

### 6.6 PATCH với ETag

```http
PATCH /api/v1/rooms/{roomId}
Authorization: Bearer <access-token>
Content-Type: application/merge-patch+json
If-Match: "room-80000000-0000-4000-8000-000000000001-v3"

{
  "title": "Tên mới",
  "closesAt": null
}
```

## 7. Flow FE khuyến nghị

### 7.1 App startup

1. GET bootstrap với platform/appVersion.
2. Áp dụng maintenance/minimum version.
3. Dùng version map để GET taxonomy/legal khi cache stale.
4. Sau auth, GET feature flags và `/me`.

### 7.2 Token refresh

1. Serialize refresh request để tránh nhiều refresh đồng thời.
2. Khi API trả `401`, refresh đúng một lần.
3. Thay cả access token và refresh token bằng pair mới.
4. Nếu refresh thất bại, xóa credential và về login.

### 7.3 Recommendation → Random/Room

1. POST recommendation session.
2. Render options theo `rank`; không dùng raw score vì backend không expose.
3. Lock/hide/regenerate bằng session ID và Place ID đúng contract.
4. Có thể tạo random từ `RECOMMENDATION_SESSION` hoặc tạo Room với options user chọn.

### 7.4 Room lifecycle

```text
DRAFT --open--> OPEN --close--> CLOSED
  |               |
  +--cancel-------+-----------> CANCELLED
                  +-----------> EXPIRED (policy/system)
```

1. DRAFT: owner sửa metadata/options.
2. OPEN: options frozen; participant GET ballot và vote.
3. Đồng bộ bằng REST snapshot; realtime event chỉ là tín hiệu refetch.
4. CLOSED: GET result; không tính winner ở client.
5. CANCELLED/EXPIRED: không hiển thị winner.

### 7.5 Idempotency helper

```ts
async function command<T>(
  url: string,
  init: RequestInit,
  idempotencyKey: string,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
      ...init.headers,
    },
  });
  if (!response.ok) throw await response.json() as ProblemDetail;
  return await response.json() as T;
}
```

Không tạo key mới khi retry do timeout nếu intent/body không đổi. Nếu user thay body, tạo key mới.

## 8. Checklist trước khi FE merge

- [ ] Generate/validate TypeScript types từ `/openapi.json` trong CI.
- [ ] Không hardcode host; base URL theo environment.
- [ ] Không log password, token, inviteToken hoặc precise location.
- [ ] `204/304` không parse JSON.
- [ ] UUID, enum và timestamps giữ nguyên case/format contract.
- [ ] Query arrays encode đúng key có `[]`.
- [ ] Cursor được coi là opaque.
- [ ] Mutation có `Idempotency-Key` tái sử dụng key khi retry.
- [ ] PATCH/DELETE có `If-Match` dùng đúng ETag mới nhất.
- [ ] Handle `412`, `428`, `BALLOT_VERSION_MISMATCH`, `VOTE_LOCKED` riêng.
- [ ] Room vote dùng RoomOption ID.
- [ ] Random animation không quyết định result.
- [ ] Không suy winner/ranking từ vote-summary; dùng `/result`.
- [ ] `availableActions` là capability server-derived; UI không tự cấp quyền dựa chỉ vào role.
