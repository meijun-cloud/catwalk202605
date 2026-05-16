'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Map, BookOpen, Search, Camera, Share2, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { CAT_COLORS, CAT_POSES, LEVELS } from '../constants';
import RarityBadge from '../components/RarityBadge';
import ProgressBar from '../components/ProgressBar';

const ResultScreen: React.FC = () => {
  const { lastReport, user, navigateTo, setHighlightedDexEntry } = useApp();
  if (!lastReport || !user) return null;

  const color = CAT_COLORS.find(c => c.key === lastReport.colorKey);
  const pose = CAT_POSES.find(p => p.key === lastReport.poseKey);
  const nextLevelInfo = LEVELS.find(l => l.level === user.currentLevel + 1) || LEVELS[LEVELS.length - 1];

  const handleDexClick = () => {
    setHighlightedDexEntry({ colorKey: lastReport.colorKey, poseKey: lastReport.poseKey });
    navigateTo('Dex');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 font-sans relative overflow-hidden">
      {/* 動態背景 */}
      <div className="absolute inset-0 z-0">
        {lastReport.photo && <img src={lastReport.photo} className="w-full h-full object-cover blur-3xl opacity-30 scale-125" alt="" />}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-gray-50" />
      </div>

      <main className="flex-1 overflow-y-auto relative z-10 pb-28" style={{ scrollbarWidth: 'none' }}>
        {/* Header */}
        <header className="px-6 pt-12 pb-4 flex flex-col items-center">
          <div className="flex items-center gap-2 bg-black/80 px-4 py-1.5 rounded-full text-white text-[10px] font-bold mb-3">
            <Camera size={14} /> 回報成功！
          </div>
          <div className="flex items-center gap-1">
            {[true, true, true, true].map((_, i) => (
              <div key={i} className="w-8 h-1.5 bg-blue-500 rounded-full" />
            ))}
            <span className="text-xs font-black text-gray-400 ml-2">4 / 4</span>
          </div>
        </header>

        <div className="px-5 space-y-5">
          <div className="text-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
              你捕捉到一隻<br />療癒的貓咪！🐾
            </h1>
          </div>

          {/* 主卡片 */}
          <section className="bg-white/70 backdrop-blur-2xl rounded-[36px] shadow-2xl border border-white p-4">
            <div className="relative w-full aspect-video rounded-[28px] overflow-hidden mb-5 bg-gray-100">
              {lastReport.photo && <img src={lastReport.photo} className="w-full h-full object-cover" alt="" />}
              <div className="absolute top-3 left-3">
                <RarityBadge rarity={lastReport.rarity} className="px-3 py-1 shadow-lg" />
              </div>
              <button className="absolute top-3 right-3 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                <Share2 size={18} />
              </button>
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div className="drop-shadow-lg">
                  <h2 className="text-2xl font-black text-white">{color?.label} × {pose?.label} 🐾</h2>
                  <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full w-fit mt-1">
                    <MapPin size={10} />
                    附近區域
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-3xl shadow-xl flex flex-col items-center border border-white">
                  <span className="text-blue-500 font-black text-2xl">+{lastReport.xpEarned} <span className="text-xs">XP</span></span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">本次獲得</span>
                </div>
              </div>
            </div>
          </section>

          {/* XP 進度 */}
          <ProgressBar
            current={user.totalXp}
            total={nextLevelInfo.requiredTotalXp || user.totalXp}
            label="XP 進度"
            subLabel={user.currentLevel < 10 ? `再獲得 ${Math.max(0, nextLevelInfo.requiredTotalXp - user.totalXp)} XP 即可升級！` : '已達最高等級'}
          />

          {/* 新圖鑑解鎖 */}
          {lastReport.isNewDexUnlock && (
            <div onClick={handleDexClick} className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-3xl flex items-center justify-between text-white shadow-xl shadow-blue-500/30 cursor-pointer active:scale-95 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📖</div>
                <div>
                  <h3 className="font-black text-sm">新圖鑑條目解鎖！</h3>
                  <p className="text-[10px] text-white/70">{color?.label} × {pose?.label} 已加入你的圖鑑</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-white/50" />
            </div>
          )}

          {/* 升等 */}
          {lastReport.isLevelUp && (
            <section className="bg-white/90 backdrop-blur-2xl p-6 rounded-[36px] shadow-xl border border-yellow-100">
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 bg-gradient-to-b from-yellow-200 to-yellow-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white shrink-0">
                  <span className="text-4xl">🐾</span>
                </div>
                <div>
                  <div className="bg-yellow-500 text-white px-3 py-0.5 rounded-full text-[10px] font-black w-fit mb-2">等級提升！</div>
                  <h4 className="text-3xl font-black text-gray-800">Lv.{user.currentLevel}</h4>
                  <h3 className="text-xl font-black text-gray-800">{user.currentTitle} 🐾</h3>
                </div>
              </div>
            </section>
          )}

          {/* 底部說明 */}
          <p className="text-center text-[11px] text-gray-400 font-medium">你的回報讓貓熱點地圖更準確 🗺️</p>
        </div>
      </main>

      {/* 底部三按鈕 */}
      <footer className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent z-40 grid grid-cols-3 gap-3">
        <button onClick={() => navigateTo('Camera')} className="h-16 bg-yellow-400/90 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-0.5 text-white active:scale-95">
          <Search size={22} strokeWidth={3} />
          <span className="text-[10px] font-black">繼續找貓</span>
        </button>
        <button onClick={() => navigateTo('Map')} className="h-16 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center gap-0.5 text-blue-500 active:scale-95 border border-gray-100">
          <Map size={22} strokeWidth={3} />
          <span className="text-[10px] font-black">回地圖</span>
        </button>
        <button onClick={handleDexClick} className="h-16 bg-indigo-500/90 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-0.5 text-white active:scale-95">
          <BookOpen size={22} strokeWidth={3} />
          <span className="text-[10px] font-black">查看圖鑑</span>
        </button>
      </footer>
    </div>
  );
};

export default ResultScreen;
