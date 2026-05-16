'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Map, BookOpen, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo } = useApp();

  if (!['Map', 'Dex', 'Profile'].includes(currentScreen)) return null;

  const tabs = [
    { name: 'Map', label: '地圖', Icon: Map },
    { name: 'Dex', label: '圖鑑', Icon: BookOpen },
    { name: 'Profile', label: '我的', Icon: User },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[88%] max-w-[360px] bg-white/85 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-white/60 rounded-[40px] py-2 px-2 flex justify-between items-center z-50">
      {tabs.map(({ name, label, Icon }) => {
        const isActive = currentScreen === name;
        return (
          <button
            key={name}
            onClick={() => navigateTo(name as any)}
            className={`relative flex items-center justify-center gap-2 py-3 px-6 rounded-[28px] transition-all flex-1 ${isActive ? 'bg-blue-50/60 text-blue-500' : 'text-gray-400'}`}
          >
            <Icon size={20} strokeWidth={isActive ? 3 : 2} />
            {isActive && <span className="text-sm font-black tracking-tight">{label}</span>}
            {isActive && <div className="absolute bottom-1 w-4 h-1 bg-blue-500 rounded-full" />}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
