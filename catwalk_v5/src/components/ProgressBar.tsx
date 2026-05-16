'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  subLabel?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label, subLabel }) => {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <div className="w-full bg-white/60 p-5 rounded-2xl border border-white/40 shadow-sm">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-bold text-blue-600">
          <span className="text-lg">{current}</span> / {total}
        </span>
      </div>
      <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
      </div>
      {subLabel && <p className="mt-2 text-xs text-blue-500/80 font-medium">{subLabel}</p>}
    </div>
  );
};

export default ProgressBar;
