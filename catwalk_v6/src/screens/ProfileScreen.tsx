'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, Bell, Camera, BookOpen, LogOut } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import { LEVELS, CAT_COLORS, CAT_POSES } from '../constants';

const ProfileScreen: React.FC = () => {
  const { user, reports, dexUnlocks, navigateTo, resetAllData, logout } = useApp();

  if (!user) return null;

  const totalEntries = CAT_COLORS.length * CAT_POSES.length;
  const unlockedCount = dexUnlocks.length;
  const nextLevelInfo = LEVELS.find(l => l.level === user.currentLevel + 1) || LEVELS[LEVELS.length - 1];

  return (
    <div className="h-full flex flex-col bg-gray-50 font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-32" style={{ scrollbarWidth: 'none' }}>

        {/* Hero Header */}
        <header className="relative px-6 pt-12 pb-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1541447271487-09612b3f49f7?w=1200"
              className="w-full h-full object-cover blur-sm brightness-110" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/20 to-gray-50" />
          </div>

          {/* Top bar */}
          <div className="relative z-10 flex justify-between items-center mb-10">
            <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">個人成就 <span>🐾</span></h1>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-600 relative">
                <Bell size={20} />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              </button>
            </div>
          </div>

          {/* 使用者資訊 */}
          <div className="relative z-10 flex items-center gap-5 mt-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-blue-100 flex items-center justify-center">
                <span className="text-5xl">🐾</span>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full border-2 border-white text-white flex items-center justify-center shadow-lg">
                <Camera size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <h2 className="text-3xl font-black text-gray-800 tracking-tighter">{user.nickname}</h2>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full w-fit border border-white text-gray-500">
                <span className="text-xs font-bold">📍 台北車站附近</span>
              </div>
            </div>
          </div>
        </header>

        <main className="px-5 -mt-16 relative z-20 space-y-4">
          {/* 等級卡 */}
          <section className="bg-white rounded-[40px] shadow-xl p-7 border border-white">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white shrink-0">
                <span className="text-3xl">🐾</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">目前等級</span>
                <h3 className="text-4xl font-black text-gray-800 leading-none mt-1">Lv.{user.currentLevel}</h3>
                <p className="text-xl font-black text-gray-800">{user.currentTitle} <span className="text-yellow-500">🐾</span></p>
              </div>
            </div>
            <div className="w-full flex justify-between items-end mb-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">累積 XP</span>
              <span className="text-lg font-black text-blue-600">
                {user.totalXp} <span className="text-xs text-gray-300">/ {nextLevelInfo.requiredTotalXp}</span>
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((user.totalXp / nextLevelInfo.requiredTotalXp) * 100, 100)}%` }}
              />
            </div>
          </section>

          {/* 統計格子 */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigateTo('Dex')}
              className="bg-white p-5 rounded-[28px] shadow-lg border border-white flex items-center gap-4 active:scale-95">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                <BookOpen size={22} />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black text-gray-400 uppercase">圖鑑進度</span>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-xl font-black text-gray-800">{unlockedCount}</span>
                  <span className="text-[10px] font-bold text-gray-300 mb-0.5">/ {totalEntries}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 ml-auto" />
            </button>

            <div className="bg-white p-5 rounded-[28px] shadow-lg border border-white flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500">
                <Camera size={22} />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black text-gray-400 uppercase">拍貓次數</span>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-xl font-black text-gray-800">{reports.length}</span>
                  <span className="text-[10px] font-bold text-gray-300 mb-0.5">次</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 ml-auto" />
            </div>
          </div>

          {/* 成就快捷 */}
          <section className="grid grid-cols-4 gap-3">
            {[
              { emoji: '📸', label: '我的回報', sub: `${reports.length} 筆`, active: true },
              { emoji: '📘', label: '圖鑑收藏', sub: `${unlockedCount}/${totalEntries}`, active: true, onClick: () => navigateTo('Dex') },
              { emoji: '🏆', label: '成就牆', sub: '即將登場', active: false },
              { emoji: '🏅', label: '勳章', sub: '尚未獲得', active: false },
            ].map((item, i) => (
              <button key={i} onClick={item.onClick}
                className={`bg-white p-4 pt-5 rounded-[28px] shadow-lg border border-white flex flex-col items-center gap-1.5 ${!item.active ? 'opacity-50' : 'active:scale-95'}`}>
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[9px] font-black text-gray-800 text-center">{item.label}</span>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${item.active ? 'text-blue-500 bg-blue-50' : 'text-gray-400 bg-gray-50'}`}>{item.sub}</span>
              </button>
            ))}
          </section>

          {/* 引言卡 */}
          <section className="bg-white/40 backdrop-blur-xl rounded-[28px] overflow-hidden border border-white shadow-xl flex items-center p-3 gap-4">
            <div className="w-28 h-18 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1573865526739-10659fef78a1?w=400" className="w-full h-full object-cover" alt="" />
            </div>
            <p className="text-[11px] font-black text-gray-600 leading-relaxed italic flex-1">
              " 在城市的每個角落，<br />都藏著貓咪與你的相遇。 "
            </p>
          </section>

          {/* 操作按鈕 */}
          <section className="pb-4 flex flex-col gap-2">
            <button
              onClick={() => { if (window.confirm('確定要重置所有資料？')) resetAllData(); }}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
              重置 Demo 資料
            </button>
            <button
              onClick={logout}
              className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-black text-red-400 uppercase tracking-widest">
              <LogOut size={14} /> 登出
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProfileScreen;
