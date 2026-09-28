import React from 'react';
import { PlaceSummary, RandomDraw } from '../../../types/api';
import { RandomAnimationStyle } from '../types';
import { CsgoRandomAnimation } from '../animations/CsgoRandomAnimation';
import { RocketRandomAnimation } from '../animations/RocketRandomAnimation';

export interface RandomAnimationRendererProps {
  style: RandomAnimationStyle;
  options: PlaceSummary[];
  winner: PlaceSummary | null;
  draw: RandomDraw | null;
  isRunning: boolean;
  reduceMotion?: boolean;
  onComplete: () => void;
}

export function RandomAnimationRenderer({
  style,
  options,
  winner,
  draw,
  isRunning,
  reduceMotion = false,
  onComplete,
}: RandomAnimationRendererProps) {
  if (style === 'ROCKET') {
    return (
      <RocketRandomAnimation
        options={options}
        winner={winner}
        draw={draw}
        isRunning={isRunning}
        reduceMotion={reduceMotion}
        onComplete={onComplete}
      />
    );
  }

  return (
    <CsgoRandomAnimation
      options={options}
      winner={winner}
      draw={draw}
      isRunning={isRunning}
      reduceMotion={reduceMotion}
      onComplete={onComplete}
    />
  );
}
