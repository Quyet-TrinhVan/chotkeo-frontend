import { PlaceSummary, RandomDraw } from '../../types/api';

export type RandomAnimationStyle =
  | 'CSGO'
  | 'ROCKET'
  | 'SLOT_MACHINE'
  | 'GACHA_CAPSULE';

export const DEFAULT_RANDOM_STYLE: RandomAnimationStyle = 'CSGO';

export interface RandomAnimationProps {
  options: PlaceSummary[];
  winner: PlaceSummary | null;
  draw: RandomDraw | null;
  isRunning: boolean;
  reduceMotion?: boolean;
  onComplete: () => void;
}
