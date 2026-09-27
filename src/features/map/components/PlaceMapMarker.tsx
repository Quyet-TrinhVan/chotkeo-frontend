import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { MapCluster } from '../../../types/api';
import { colors } from '../../../theme/tokens';
import { MapPin } from 'lucide-react-native';

interface PlaceMapMarkerProps {
  cluster: MapCluster;
  isSelected?: boolean;
  onPress: (placeId: string) => void;
}

export const PlaceMapMarker = React.memo(function PlaceMapMarker({
  cluster,
  isSelected = false,
  onPress,
}: PlaceMapMarkerProps) {
  const [lng, lat] = cluster.geometry.coordinates;
  const placeId = cluster.representativePlaceIds?.[0] || '';

  return (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      onPress={() => onPress(placeId)}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 1.0 }}
    >
      <View style={[styles.pinWrapper, isSelected && styles.pinWrapperSelected]}>
        <View style={[styles.pinCircle, isSelected && styles.pinCircleSelected]}>
          <MapPin
            size={isSelected ? 18 : 15}
            color="#FFFFFF"
            fill="#FFFFFF"
          />
        </View>
        <View style={[styles.pinTriangle, isSelected && styles.pinTriangleSelected]} />
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  pinWrapper: {
    alignItems: 'center',
  },
  pinWrapperSelected: {
    transform: [{ scale: 1.18 }],
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  pinCircleSelected: {
    backgroundColor: colors.secondary,
    borderColor: '#FFFFFF',
    borderWidth: 2.5,
  },
  pinTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 0,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
    marginTop: -1,
  },
  pinTriangleSelected: {
    borderTopColor: colors.secondary,
  },
});
