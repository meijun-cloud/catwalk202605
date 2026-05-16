'use client';

import React from 'react';
import { Rarity } from '../types';

interface RarityBadgeProps { rarity: Rarity; className?: string; }

const RarityBadge: React.FC<RarityBadgeProps> = ({ rarity, className = '' }) => {
  const styles = {
    common: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    uncommon: 'bg-blue-500/10 text-blue-600 border-blue-200',
    rare: 'bg-purple-500/10 text-purple-600 border-purple-200',
  };
  const labels = { common: '常見', uncommon: '少見', rare: '稀有' };
  return (
    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${styles[rarity]} ${className}`}>
      {labels[rarity]}
    </span>
  );
};

export default RarityBadge;
