import React from 'react';
import { PlaceSummary, RandomDraw } from '../../../types/api';
import { RandomAnimationStyle } from '../types';
import { CsgoRandomAnimation } from '../animations/CsgoRandomAnimation';
import { RocketRandomAnimation } from '../animations/RocketRandomAnimation';
import { SlotMachineRandomAnimation } from '../animations/SlotMachineRandomAnimation';

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
  switch (style) {
    case 'CSGO':
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

    case 'ROCKET':
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

    case 'SLOT_MACHINE':
      return (
        <SlotMachineRandomAnimation
          options={options}
          winner={winner}
          draw={draw}
          isRunning={isRunning}
          reduceMotion={reduceMotion}
          onComplete={onComplete}
        />
      );
  }
}
