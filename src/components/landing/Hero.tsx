import React from 'react';
import { Hero as AnimatedHero } from '../ui/animated-hero';

export interface HeroProps {
  onCtaClick?: () => void;
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  return <AnimatedHero onCtaClick={onCtaClick} />;
};
