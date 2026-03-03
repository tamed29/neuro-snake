'use client';

import { Direction } from '@/types/game.types';
import { FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

import VirtualJoystick from './VirtualJoystick';

interface MobileControlsProps {
  onDirectionChange: (direction: Direction) => void;
}

export default function MobileControls({ onDirectionChange }: MobileControlsProps) {
  return (
    <div className="md:hidden flex flex-col items-center justify-center py-10 px-6">
      <VirtualJoystick onDirectionChange={onDirectionChange} />
    </div>
  );
}
