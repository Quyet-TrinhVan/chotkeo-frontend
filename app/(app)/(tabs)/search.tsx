import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../src/theme/tokens';
import { SearchBar } from '../../../src/components/SearchBar';
import { FilterChip } from '../../../src/components/Chip';
import { PlaceCardHorizontal } from '../../../src/components/PlaceCardHorizontal';
import { EmptyState } from '../../../src/components/EmptyState';
import { placeApi } from '../../../src/api/placeApi';
import { useRouter } from '../../../src/navigation/router';
import { PlaceSummary, SearchSuggestion } from '../../../src/types/api';
import { List, Map as MapIcon, SlidersHorizontal, MapPin, Sparkles, Navigation } from 'lucide-react-native';

interface SearchScreenProps {
  onSelectPlace?: (placeId: string) => void;
}

export default function SearchScreen({ onSelectPlace }: SearchScreenProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('cat-all');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [selectedMapPlace, setSelectedMapPlace] = useState<PlaceSummary | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; label: string }>>([
    { id: 'cat-all', label: 'Tất cả' },
  ]);
  const [stylesList, setStylesList] = useState<Array<{ id: string; label: string }>>([]);

  // Load taxonomies from API
  useEffect(() => {
    let active = true;
    placeApi.getTaxonomies().then((res) => {
      if (active) {
        if (res.categories && res.categories.length > 0) {
          setCategories([{ id: 'cat-all', label: 'Tất cả' }, ...res.categories]);
        }
        if (res.styles && res.styles.length > 0) {
          setStylesList(res.styles);
        }
      }
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Search API integration with debounce
  useEffect(() => {
    let active = true;
    async function search() {
      try {
        const catFilter = selectedCategory !== 'cat-all' ? [selectedCategory] : undefined;
        const styleFilter = selectedStyle ? [selectedStyle] : undefined;
        const res = await placeApi.getPlaces({
          q: searchText.trim() || undefined,
          categoryIds: catFilter,
          styleIds: styleFilter,
          pageSize: 50,
        });
        if (active) {
          const list = res.places || [];
          setPlaces(list);
          if (list.length > 0) {
            setSelectedMapPlace(list[0]);
          } else {
            setSelectedMapPlace(null);
          }
        }
      } catch (err) {
        if (active) {
          setPlaces([]);
          setSelectedMapPlace(null);
        }
      }
    }
    const timer = setTimeout(search, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchText, selectedCategory, selectedStyle]);

  // Suggestions API integration
  useEffect(() => {
    if (!searchText.trim()) {
      setSuggestions([]);
      return;
    }
    let active = true;
    placeApi.getSearchSuggestions(searchText.trim()).then((sug) => {
      if (active) {
        setSuggestions(sug || []);
      }
    }).catch(() => {
      if (active) {
        setSuggestions([]);
      }
    });
    return () => {
      active = false;
    };
  }, [searchText]);

  // Filtered places
  const filteredPlaces = places.filter((p) => {
    if (onlyOpen && p.openState !== 'OPEN') {
      return false;
    }
    return true;
  });

  const handlePlacePress = (id: string) => {
    if (onSelectPlace) {
      onSelectPlace(id);
    } else {
      router.push(`/places/${id}`);
    }
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedCategory('cat-all');
    setSelectedStyle(null);
    setOnlyOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Header Search Area */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={searchText}
              onChangeText={(txt) => {
                setSearchText(txt);
                setShowSuggestions(txt.trim().length > 0);
              }}
              onFocus={() => setShowSuggestions(searchText.trim().length > 0)}
              onClear={() => {
                setSearchText('');
                setShowSuggestions(false);
              }}
            />
          </View>

          {/* List / Map toggle */}
          <Pressable
            onPress={() => setViewMode((m) => (m === 'list' ? 'map' : 'list'))}
            style={styles.toggleViewBtn}
            accessibilityRole="button"
            accessibilityLabel={viewMode === 'list' ? 'Xem bản đồ' : 'Xem danh sách'}
          >
            {viewMode === 'list' ? (
              <MapIcon size={20} color={colors.primary} />
            ) : (
              <List size={20} color={colors.primary} />
            )}
          </Pressable>
        </View>

        {/* Suggestion Dropdown if typing */}
        {showSuggestions && suggestions.length > 0 ? (
          <View style={styles.suggestionsBox}>
            {suggestions.map((s, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  setSearchText(s.text);
                  setShowSuggestions(false);
                  if (s.targetId) {
                    handlePlacePress(s.targetId);
                  }
                }}
                style={styles.suggestionItem}
              >
                <View style={styles.suggestionIconWrap}>
                  {s.type === 'PLACE' ? (
                    <MapPin size={14} color={colors.primary} />
                  ) : (
                    <Sparkles size={14} color={colors.secondary} />
                  )}
                </View>
                <Text style={styles.suggestionText}>{s.text}</Text>
                <Text style={styles.suggestionTypeTag}>
                  {s.type === 'PLACE' ? 'Địa điểm' : 'Danh mục'}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* Filter Chips Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((cat) => (
            <FilterChip
              key={cat.id}
              label={cat.label}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
            />
          ))}

          {/* Đang mở */}
          <FilterChip
            label="Đang mở"
            selected={onlyOpen}
            onPress={() => setOnlyOpen((v) => !v)}
          />

          {/* Styles */}
          {stylesList.slice(0, 3).map((st) => (
            <FilterChip
              key={st.id}
              label={st.label}
              selected={selectedStyle === st.id}
              onPress={() =>
                setSelectedStyle((curr) => (curr === st.id ? null : st.id))
              }
            />
          ))}
        </ScrollView>
      </View>

      {/* Main Content: List or Map View */}
      {viewMode === 'list' ? (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultSummaryRow}>
            <Text style={styles.resultCountText}>
              Tìm thấy <Text style={{ fontWeight: '700' }}>{filteredPlaces.length}</Text> địa điểm phù hợp
            </Text>
          </View>

          {filteredPlaces.length > 0 ? (
            filteredPlaces.map((place) => (
              <PlaceCardHorizontal
                key={place.id}
                place={place}
                onPress={() => handlePlacePress(place.id)}
              />
            ))
          ) : (
            <EmptyState
              title="Chưa tìm thấy chỗ phù hợp"
              description="Thử tìm từ khóa khác hoặc nới rộng bộ lọc tìm kiếm nhé!"
              actionTitle="Đặt lại bộ lọc"
              onAction={handleResetFilters}
              style={{ marginTop: spacing.xl }}
            />
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      ) : (
        /* Map View with bottom preview card */
        <View style={styles.mapContainer}>
          {/* Simulated Map Canvas */}
          <View style={styles.simulatedMap}>
            {/* Grid styling to look like a clean modern map */}
            <View style={styles.mapRoadH} />
            <View style={styles.mapRoadV} />
            <View style={styles.mapLake}>
              <Text style={styles.mapLakeText}>Hồ Hoàn Kiếm</Text>
            </View>

            {/* Map Markers for places */}
            {filteredPlaces.slice(0, 6).map((place, idx) => {
              const isSelected = selectedMapPlace?.id === place.id;
              // spread markers organically
              const positions = [
                { top: '25%', left: '22%' },
                { top: '38%', left: '55%' },
                { top: '60%', left: '30%' },
                { top: '48%', left: '78%' },
                { top: '18%', left: '68%' },
                { top: '68%', left: '62%' },
              ];
              const pos = positions[idx % positions.length];

              return (
                <Pressable
                  key={place.id}
                  onPress={() => setSelectedMapPlace(place)}
                  style={[
                    styles.mapMarker,
                    pos as any,
                    isSelected && styles.mapMarkerSelected,
                  ]}
                >
                  <MapPin
                    size={isSelected ? 22 : 16}
                    color={isSelected ? colors.textInverse : colors.primary}
                  />
                  <Text
                    style={[
                      styles.mapMarkerLabel,
                      isSelected && styles.mapMarkerLabelSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {place.name.split('-')[0].trim()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Bottom Floating Place Preview Card */}
          {selectedMapPlace ? (
            <View style={styles.bottomMapCardWrap}>
              <PlaceCardHorizontal
                place={selectedMapPlace}
                onPress={() => handlePlacePress(selectedMapPlace.id)}
              />
            </View>
          ) : null}
        </View>
      )}
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
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 100,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  toggleViewBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  suggestionsBox: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  suggestionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  suggestionText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  suggestionTypeTag: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  resultSummaryRow: {
    marginBottom: spacing.sm,
  },
  resultCountText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    fontSize: 13,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  simulatedMap: {
    flex: 1,
    backgroundColor: '#F3EFE9',
    position: 'relative',
    overflow: 'hidden',
  },
  mapRoadH: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: '#E5DFD5',
  },
  mapRoadV: {
    position: 'absolute',
    left: '48%',
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#E5DFD5',
  },
  mapLake: {
    position: 'absolute',
    top: '32%',
    left: '35%',
    width: 120,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#C7E4F9',
    borderWidth: 2,
    borderColor: '#B0D8F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLakeText: {
    ...typography.captionMedium,
    color: '#0369A1',
    fontSize: 11,
    fontWeight: '700',
  },
  mapMarker: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  mapMarkerSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.surface,
    transform: [{ scale: 1.1 }],
    zIndex: 50,
  },
  mapMarkerLabel: {
    ...typography.captionMedium,
    fontSize: 11,
    color: colors.textPrimary,
    marginLeft: 4,
    fontWeight: '600',
    maxWidth: 90,
  },
  mapMarkerLabelSelected: {
    color: colors.textInverse,
  },
  bottomMapCardWrap: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
});
