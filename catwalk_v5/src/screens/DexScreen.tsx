'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, BookOpen, Lock, X, Calendar, Sparkles } from 'lucide-react';
import { CAT_COLORS, CAT_POSES, LEVELS } from '../constants';
import RarityBadge from '../components/RarityBadge';

const DexScreen: React.FC = () => {
  const { dexUnlocks, user, reports, navigateTo, highlightedDexEntry, setHighlightedDexEntry } = useApp();
  const [selectedColorKey, setSelectedColorKey] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  useEffect(() => {
    if (highlightedDexEntry) {
      setSelectedColorKey(highlightedDexEntry.colorKey);
      const unlockData = dexUnlocks.find(d => d.colorKey === highlightedDexEntry.colorKey && d.poseKey === highlightedDexEntry.poseKey);
      const latestReport = reports.find(r => r.colorKey === highlightedDexEntry.colorKey && r.poseKey === highlightedDexEntry.poseKey);
      setSelectedEntry({ ...highlightedDexEntry, isUnlocked: true, unlockData, latestReport,
        rarity: CAT_COLORS.find(c => c.key === highlightedDexEntry.colorKey)?.rarity ?? 'common',
        colorLabel: CAT_COLORS.find(c => c.key === highlightedDexEntry.colorKey)?.label ?? '',
        poseLabel: CAT_POSES.find(p => p.key === highlightedDexEntry.poseKey)?.label ?? '',
      });
      const t = setTimeout(() => setHighlightedDexEntry(null), 5000);
      return () => clearTimeout(t);
    }
  }, [highlightedDexEntry]);

  const totalEntries = CAT_COLORS.length * CAT_POSES.length;
  const unlockedCount = dexUnlocks.length;
  const percentage = Math.round((unlockedCount / totalEntries) * 100);

  const filteredColors = selectedColorKey ? CAT_COLORS.filter(c => c.key === selectedColorKey) : CAT_COLORS;
  const filteredEntries = filteredColors.flatMap(color =>
    CAT_POSES.map(pose => ({
      colorKey: color.key, poseKey: pose.key,
      colorLabel: color.label, poseLabel: pose.label, rarity: color.rarity,
      isUnlocked: dexUnlocks.some(d => d.colorKey === color.key && d.poseKey === pose.key),
    }))
  );

  const nextLevelXp = LEVELS.find(l => l.level === (user?.currentLevel ?? 1) + 1)?.requiredTotalXp ?? user?.totalXp ?? 0;

  return (
    <div className="h-full flex flex-col bg-gray-50 font-sans relative overflow-hidden">
      <main className="flex-1 px-5 pt-12 overflow-y-auto pb-32" style={{ scrollbarWidth: 'none' }}>
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-2">圖鑑 <span className="text-2xl text-yellow-500">🐾</span></h1>
            <button onClick={() => navigateTo('Map')} className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 active:scale-90">
              <ChevronLeft size={24} />
            </button>
          </div>
          <p className="text-sm font-bold text-gray-400 mb-6">記錄你在城市遇見的貓咪們</p>

          {/* 兩個統計卡 */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 bg-white p-4 rounded-[24px] shadow-lg border border-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-blue-500 rounded-lg text-white"><BookOpen size={10} /></div>
                <span className="text-[10px] font-black text-gray-700">收藏進度</span>
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-2xl font-black text-gray-800">{unlockedCount}</span>
                <span className="text-[10px] font-bold text-gray-400 mb-0.5">/ {totalEntries}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
              </div>
            </div>
            <div className="flex-1 bg-white p-4 rounded-[24px] shadow-lg border border-white">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 font-black text-[10px]">Lv.{user?.currentLevel}</div>
                <span className="text-[10px] font-black text-gray-800 leading-tight">{user?.currentTitle}</span>
              </div>
              <div className="w-full h-1 bg-gray-100 rounded-full mt-2">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.min(((user?.totalXp ?? 0) / nextLevelXp) * 100, 100)}%` }} />
              </div>
              <p className="text-[8px] text-gray-400 mt-1">
                {(user?.currentLevel ?? 1) < 10 ? `再 ${Math.max(0, nextLevelXp - (user?.totalXp ?? 0))} XP 可晉階` : '已達最高稱號'}
              </p>
            </div>
          </div>

          {/* 花色篩選 */}
          <div className="flex gap-2 overflow-x-auto py-1 pb-2" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => setSelectedColorKey(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-2xl text-[10px] font-black ${!selectedColorKey ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-400 shadow-sm'}`}>
              全部
            </button>
            {CAT_COLORS.map(color => (
              <button key={color.key} onClick={() => setSelectedColorKey(color.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl text-[10px] font-black ${selectedColorKey === color.key ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-400 shadow-sm'}`}>
                {color.label}
              </button>
            ))}
          </div>
        </header>

        {/* 統計列 */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-[10px] font-black text-gray-800">已解鎖 {filteredEntries.filter(e => e.isUnlocked).length}</span>
          </div>
          <span className="text-[10px] font-black text-gray-400 opacity-40">未蒐集 {filteredEntries.filter(e => !e.isUnlocked).length}</span>
        </div>

        {/* 圖鑑格子 */}
        <div className="grid grid-cols-3 gap-3">
          {filteredEntries.map(entry => {
            const isHighlighted = highlightedDexEntry?.colorKey === entry.colorKey && highlightedDexEntry?.poseKey === entry.poseKey;
            const unlockData = dexUnlocks.find(d => d.colorKey === entry.colorKey && d.poseKey === entry.poseKey);
            const latestReport = reports.find(r => r.colorKey === entry.colorKey && r.poseKey === entry.poseKey);

            return (
              <div
                key={`${entry.colorKey}-${entry.poseKey}`}
                onClick={() => entry.isUnlocked && setSelectedEntry({ ...entry, unlockData, latestReport })}
                className={`relative aspect-[3/4] rounded-3xl p-3 flex flex-col justify-end bg-white shadow-lg border-2 overflow-hidden transition-all ${isHighlighted ? 'border-blue-500 scale-105' : 'border-white'} ${!entry.isUnlocked ? 'grayscale brightness-90' : 'cursor-pointer hover:shadow-xl'}`}
              >
                {isHighlighted && <div className="absolute top-2 right-2 z-20 bg-blue-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">NEW</div>}
                {entry.isUnlocked ? (
                  <img src={latestReport?.photo || `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&sig=${entry.colorKey}-${entry.poseKey}`}
                    className="absolute inset-0 w-full h-full object-cover" alt="" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-40">
                    <Lock size={20} className="text-black" />
                  </div>
                )}
                <div className={`relative z-10 p-1 rounded-2xl ${entry.isUnlocked ? 'bg-white/90 backdrop-blur-sm' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black">{entry.isUnlocked ? entry.colorLabel : '???'}</span>
                    <span className="text-[8px] text-gray-400">{entry.poseLabel}</span>
                  </div>
                  {entry.isUnlocked && <RarityBadge rarity={entry.rarity} />}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 詳情 Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-5 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedEntry(null)}>
          <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedEntry(null)} className="absolute top-6 right-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-10">
              <X size={20} />
            </button>
            <div className="relative w-full aspect-square bg-gray-100">
              {selectedEntry.latestReport?.photo && <img src={selectedEntry.latestReport.photo} className="w-full h-full object-cover" alt="" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <RarityBadge rarity={selectedEntry.rarity} className="mb-2 px-3 py-1" />
                <h3 className="text-3xl font-black text-white">{selectedEntry.colorLabel} × {selectedEntry.poseLabel} 🐾</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 bg-gray-50 p-4 rounded-3xl">
                  <div className="flex items-center gap-1 text-blue-500 text-[10px] font-black mb-1"><Calendar size={10} /> 解鎖時間</div>
                  <span className="text-sm font-bold text-gray-800">
                    {selectedEntry.unlockData ? new Date(selectedEntry.unlockData.unlockedAt).toLocaleDateString('zh-TW') : '---'}
                  </span>
                </div>
                <div className="flex-1 bg-blue-50 p-4 rounded-3xl">
                  <div className="flex items-center gap-1 text-blue-500 text-[10px] font-black mb-1"><Sparkles size={10} /> 本次 XP</div>
                  <span className="text-2xl font-black text-blue-600">+{selectedEntry.latestReport?.xpEarned ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DexScreen;
