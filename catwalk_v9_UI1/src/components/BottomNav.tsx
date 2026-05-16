import React from 'react';
import { useApp } from '../context/AppContext';
import { Map, BookOpen, User } from 'lucide-react';
import { motion } from 'motion/react';

const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo, closeAllOverlays } = useApp();

  const tabs = [
    { name: 'Map', label: '地圖', icon: Map },
    { name: 'Dex', label: '圖鑑', icon: BookOpen },
    { name: 'Profile', label: '我的', icon: User },
  ];

  const handleTabClick = (tabName: string) => {
    closeAllOverlays();
    navigateTo(tabName as any);
  };

  // Only show on main screens
  if (!['Map', 'Dex', 'Profile'].includes(currentScreen)) return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[88%] max-w-[360px] bg-white/80 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-white/60 rounded-[40px] py-2 px-2 flex justify-between items-center z-50">
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.name;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.name}
            onClick={() => handleTabClick(tab.name)}
            className={`relative flex items-center justify-center gap-2 py-3 px-6 rounded-[32px] transition-all duration-300 ${
              isActive 
                ? 'bg-blue-50/50 text-blue-500 flex-1' 
                : 'text-gray-400 hover:text-gray-600 flex-1'
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 3 : 2} />
            {isActive && (
              <span className="text-sm font-black tracking-tight">{tab.label}</span>
            )}
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute bottom-1 w-4 h-1 bg-blue-500 rounded-full"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
