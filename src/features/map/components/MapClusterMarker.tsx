import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { MapCluster } from '../../../types/api';
import { colors, typography } from '../../../theme/tokens';

interface MapClusterMarkerProps {
  cluster: MapCluster;
  onPress: (cluster: MapCluster) => void;
}

export const MapClusterMarker = React.memo(function MapClusterMarker({
  cluster,
  onPress,
}: MapClusterMarkerProps) {
  const [lng, lat] = cluster.geometry.coordinates;
  const count = cluster.pointCount;

  // Adapt size based on cluster point count
  const size = count > 50 ? 46 : count > 10 ? 40 : 34;

  return (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      onPress={() => onPress(cluster)}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Text style={styles.countText}>{count}</Text>
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 5,
  },
  countText: {
    ...typography.captionMedium,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
