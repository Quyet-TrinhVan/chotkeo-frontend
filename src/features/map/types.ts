import { Region } from 'react-native-maps';

export interface MapArea {
  id: string;
  name: string;
  region: Region;
}

export const HANOI_DEFAULT_REGION: Region = {
  latitude: 21.0285,
  longitude: 105.8542,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const STANDARD_HANOI_AREAS: MapArea[] = [
  {
    id: 'area-all',
    name: 'Tất cả (Hà Nội)',
    region: {
      latitude: 21.0285,
      longitude: 105.8342,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    },
  },
  {
    id: 'area-hoan-kiem',
    name: 'Hoàn Kiếm',
    region: {
      latitude: 21.0285,
      longitude: 105.8542,
      latitudeDelta: 0.035,
      longitudeDelta: 0.035,
    },
  },
  {
    id: 'area-tay-ho',
    name: 'Tây Hồ',
    region: {
      latitude: 21.0600,
      longitude: 105.8250,
      latitudeDelta: 0.045,
      longitudeDelta: 0.045,
    },
  },
  {
    id: 'area-ba-dinh',
    name: 'Ba Đình',
    region: {
      latitude: 21.0348,
      longitude: 105.8242,
      latitudeDelta: 0.035,
      longitudeDelta: 0.035,
    },
  },
  {
    id: 'area-dong-da',
    name: 'Đống Đa',
    region: {
      latitude: 21.0180,
      longitude: 105.8260,
      latitudeDelta: 0.035,
      longitudeDelta: 0.035,
    },
  },
  {
    id: 'area-cau-giay',
    name: 'Cầu Giấy',
    region: {
      latitude: 21.0333,
      longitude: 105.7939,
      latitudeDelta: 0.040,
      longitudeDelta: 0.040,
    },
  },
  {
    id: 'area-hai-ba-trung',
    name: 'Hai Bà Trưng',
    region: {
      latitude: 21.0069,
      longitude: 105.8524,
      latitudeDelta: 0.035,
      longitudeDelta: 0.035,
    },
  },
  {
    id: 'area-thanh-xuan',
    name: 'Thanh Xuân',
    region: {
      latitude: 20.9937,
      longitude: 105.8118,
      latitudeDelta: 0.035,
      longitudeDelta: 0.035,
    },
  },
];
