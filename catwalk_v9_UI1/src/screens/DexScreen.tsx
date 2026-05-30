import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Info, Filter, ArrowUpDown, Lock, BookOpen, Sparkles, X, Calendar, MapPin, Camera } from 'lucide-react';
import { CAT_COLORS, CAT_POSES, LEVELS } from '../constants';
import RarityBadge from '../components/RarityBadge';
import { motion, AnimatePresence } from 'motion/react';
import { getCollectionCardCover } from '../utils/catImages';

const DexScreen: React.FC = () => {
  const { 
    dexUnlocks, user, navigateTo, highlightedDexEntry, 
    setHighlightedDexEntry, reports,
    dexSelectedEntry: selectedEntry, setDexSelectedEntry: setSelectedEntry
  } = useApp();

  const [selectedColorKey, setSelectedColorKey] = useState<string | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [isRarityMenuOpen, setIsRarityMenuOpen] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    if (highlightedDexEntry && Array.isArray(dexUnlocks) && Array.isArray(reports)) {
      setSelectedColorKey(highlightedDexEntry.colorKey);
      
      const unlockData = (dexUnlocks || []).find(d => d.colorKey === highlightedDexEntry.colorKey && d.poseKey === highlightedDexEntry.poseKey);
      const entryReports = (reports || [])
        .filter(r => r && r.colorKey === highlightedDexEntry.colorKey && r.poseKey === highlightedDexEntry.poseKey)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      
      const entry = {
        colorKey: highlightedDexEntry.colorKey,
        poseKey: highlightedDexEntry.poseKey,
        isUnlocked: true,
        rarity: CAT_COLORS.find(c => c.key === highlightedDexEntry.colorKey)?.rarity || 'common',
        colorLabel: CAT_COLORS.find(c => c.key === highlightedDexEntry.colorKey)?.label || '',
        poseLabel: CAT_POSES.find(p => p.key === highlightedDexEntry.poseKey)?.label || '',
        unlockData,
        reports: entryReports
      };
      setSelectedEntry(entry);
      setActivePhotoIdx(0);
      
      // Clear the signal immediately so it doesn't re-trigger on remount
      setHighlightedDexEntry(null);
    }
  }, [highlightedDexEntry, dexUnlocks, reports]);

  const totalEntries = CAT_COLORS.length * CAT_POSES.length;
  const unlockedCount = Array.isArray(dexUnlocks) ? dexUnlocks.length : 0;
  const percentage = Math.round((unlockedCount / (totalEntries || 1)) * 100);

  // Filter entries based on selected color and rarity
  const filteredEntriesRaw = (CAT_COLORS || [])
    .filter(c => c && (!selectedColorKey || c.key === selectedColorKey) && (!selectedRarity || c.rarity === selectedRarity))
    .flatMap(color => 
      (CAT_POSES || []).map(pose => ({
        colorKey: color.key,
        poseKey: pose.key,
        colorLabel: color.label,
        poseLabel: pose.label,
        rarity: color.rarity,
        isUnlocked: Array.isArray(dexUnlocks) && dexUnlocks.some(d => d.colorKey === color.key && d.poseKey === pose.key)
      }))
    );

  // 「其他」姿勢的回報：從 reports 中找 poseKey === 'other' 的，依花色篩選後加入
  const otherEntries = (Array.isArray(reports) ? reports : [])
    .filter(r => r && r.poseKey === 'other' && (!selectedColorKey || r.colorKey === selectedColorKey) && (!selectedRarity || (CAT_COLORS.find(c => c.key === r.colorKey)?.rarity || 'common') === selectedRarity))
    .map(r => ({
      colorKey: r.colorKey,
      poseKey: 'other' as const,
      poseNote: (r as any).poseNote || '其他',
      colorLabel: CAT_COLORS.find(c => c.key === r.colorKey)?.label || r.colorKey,
      poseLabel: (r as any).poseNote || '其他',
      rarity: CAT_COLORS.find(c => c.key === r.colorKey)?.rarity || ('common' as const),
      isUnlocked: true,
      isOther: true,
      reportData: r,
    }));
  // 去重：同一 colorKey 的 other 只取最新一筆顯示（避免同花色多筆 other 重複顯示一樣的卡）
  const otherEntriesDeduped = otherEntries.filter((entry, idx, arr) =>
    arr.findIndex(e => e.colorKey === entry.colorKey) === idx
  );

  // 排序邏輯：全部 → 已解鎖依解鎖時間置頂，個別花色 → 依姿勢順序
  const POSE_ORDER = ['basking', 'curled_sleep', 'walking', 'grooming', 'alert_standing', 'sitting', 'eating'];
  const filteredEntries = filteredEntriesRaw.slice().sort((a, b) => {
    if (!selectedColorKey) {
      // 全部：已解鎖置頂，再依解鎖時間排序
      if (a.isUnlocked && !b.isUnlocked) return -1;
      if (!a.isUnlocked && b.isUnlocked) return 1;
      if (a.isUnlocked && b.isUnlocked) {
        const aUnlock = Array.isArray(dexUnlocks) ? dexUnlocks.find(d => d.colorKey === a.colorKey && d.poseKey === a.poseKey) : null;
        const bUnlock = Array.isArray(dexUnlocks) ? dexUnlocks.find(d => d.colorKey === b.colorKey && d.poseKey === b.poseKey) : null;
        const aTime = aUnlock?.unlockedAt ? new Date(aUnlock.unlockedAt).getTime() : 0;
        const bTime = bUnlock?.unlockedAt ? new Date(bUnlock.unlockedAt).getTime() : 0;
        return bTime - aTime; // 最新解鎖的排最前
      }
      return 0;
    } else {
      // 個別花色：依姿勢順序排序
      return POSE_ORDER.indexOf(a.poseKey) - POSE_ORDER.indexOf(b.poseKey);
    }
  });
  // 合併 other entries 到顯示列表（排在最後）
  const allDisplayedEntries = [...filteredEntries, ...otherEntriesDeduped];
  // 數字統計只算標準 84 張（不含 other）
  const displayedUnlockedCount = filteredEntries.filter(e => e.isUnlocked).length;
  const displayedTotalCount = filteredEntries.length;

  return (
    <div className="h-full flex flex-col bg-white font-sans relative overflow-hidden">
      {/* Hero Background */}
      <div className="absolute top-0 left-0 w-full h-[450px] z-0">
        <img 
          src="https://catwalk-v2.vercel.app/assets/collection-page/collection-bg.jpg" 
          className="w-full h-full object-cover" 
          alt="Dex Hero" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 overflow-y-auto no-scrollbar flex flex-col">
        {/* Top Header */}
        <div className="px-7 pt-14 pb-4">
          <div className="flex justify-between items-start mb-1">
            <h1 className="text-[32px] font-black text-blue-900 tracking-tighter leading-none flex items-center gap-2 drop-shadow-sm">
              圖鑑 <span className="text-2xl text-yellow-500">🐾</span>
            </h1>
            <button 
              onClick={() => navigateTo('Map')} 
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 active:scale-90 transition-transform"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
          <p className="text-sm font-bold text-blue-900/80 drop-shadow-sm">記錄你在城市遇見的貓咪們</p>
        </div>

        {/* Floating Stats Cards */}
        <div className="px-7 flex flex-col gap-3 mb-4">
          <div className="flex gap-4 items-start">
            {/* Progress Card */}
            <div className="w-[180px] bg-white/70 backdrop-blur-md p-4 rounded-[32px] shadow-xl border border-white/40 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  <BookOpen size={10} strokeWidth={3} />
                </div>
                <span className="text-xs font-black text-gray-700 tracking-tight">收藏進度</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-800">{unlockedCount}</span>
                <span className="text-xs font-bold text-gray-400">/ {totalEntries}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-[10px] font-black text-gray-400">{percentage}%</span>
              </div>
            </div>
          </div>

          {/* Level Card & Rarity Button */}
          <div className="flex items-center justify-between gap-4">
            <div className="w-[200px] bg-white/70 backdrop-blur-md p-3 pr-4 rounded-[32px] shadow-xl border border-white/40 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border-2 border-yellow-400 overflow-hidden shadow-sm shrink-0">
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="User" />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-yellow-600 tracking-tight">Lv.{user.currentLevel}</span>
                  <Sparkles size={8} className="text-yellow-500" />
                </div>
                <span className="text-[11px] font-black text-gray-800 leading-tight">{user.displayName}</span>
                <p className="text-[8px] font-medium text-gray-400 leading-tight mt-0.5">
                  {user.currentLevel < 10 
                    ? `再收集 ${(LEVELS.find(l => l.level === user.currentLevel + 1)?.requiredTotalXp || 0) - user.totalXp} XP 可晉階` 
                    : '已達最高等'}
                </p>
                <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all duration-700" 
                    style={{ width: `${Math.min((user.totalXp / (LEVELS.find(l => l.level === user.currentLevel + 1)?.requiredTotalXp || 1)) * 100, 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Floating Filter Button - Rarity Only */}
            <div className="relative">
              <button 
                onClick={() => setIsRarityMenuOpen(!isRarityMenuOpen)}
                className={`w-14 h-14 rounded-full shadow-xl flex flex-col items-center justify-center transition-all active:scale-90 border ${isRarityMenuOpen ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-100'}`}
              >
                <ArrowUpDown size={18} className={isRarityMenuOpen ? 'text-white mb-0.5' : 'text-gray-400 mb-0.5'} />
                <span className="text-[8px] font-black">{selectedRarity ? (selectedRarity === 'common' ? '常見' : selectedRarity === 'uncommon' ? '少見' : '稀有') : '稀有度'}</span>
              </button>

              <AnimatePresence>
                {isRarityMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 bottom-16 w-32 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-[60]"
                  >
                    {[
                      { key: null, label: '全部稀有度' },
                      { key: 'common', label: '常見' },
                      { key: 'uncommon', label: '少見' },
                      { key: 'rare', label: '稀有' },
                    ].map((option) => (
                      <button
                        key={option.key || 'all'}
                        onClick={() => {
                          setSelectedRarity(option.key);
                          setIsRarityMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black transition-colors ${selectedRarity === option.key ? 'bg-blue-50 text-blue-500' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <section className="bg-white rounded-t-[40px] pt-4 px-7 pb-32">
          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
            <button 
              onClick={() => setSelectedColorKey(null)}
              className={`flex-shrink-0 px-6 py-3 rounded-full text-[13px] font-black transition-all ${!selectedColorKey ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
            >
              全部
            </button>
            {[
              { key: 'black_white', label: '黑白貓', img: 'black-white/black_white_sit-idle' },
              { key: 'orange', label: '橘貓', img: 'orange/orange_sit-idle' },
              { key: 'white', label: '白貓', img: 'white/white_sit-idle' },
              { key: 'gray', label: '灰貓', img: 'gray/gray_sit-idle' },
              { key: 'black', label: '黑貓', img: 'black/black_sit-idle' },
              { key: 'calico', label: '三花貓', img: 'calico/calico_sit-idle' },
              { key: 'tortoiseshell', label: '玳瑁貓', img: 'tortoiseshell/tortoiseshell_sit-idle' },
              { key: 'tabby', label: '虎斑貓', img: 'tabby/tabby_sit-idle' },
              { key: 'siamese', label: '暹羅貓', img: 'siamese/siamese_sit-idle' },
              { key: 'white_tabby', label: '白底虎斑', img: 'tabby-white/white_tabby_sit-idle' },
              { key: 'orange_white', label: '橘白貓', img: 'orange-white/orange_white_sit-idle' },
              { key: 'brown_white', label: '棕白貓', img: 'brown-white/brown_white_sit-idle' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedColorKey(cat.key)}
                className={`flex-shrink-0 pl-1.5 pr-4 py-1.5 rounded-full text-[13px] font-black transition-all flex items-center gap-2 ${selectedColorKey === cat.key ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-100">
                  <img
                    src={`https://catwalk-v2.vercel.app/assets/collection-page/${cat.img}.jpg`}
                    alt={cat.label}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                  />
                </div>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Unlock Statistics */}
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
              <div className="flex items-baseline gap-1">
                <span className="text-[12px] font-black text-gray-800">已解鎖</span>
                <span className="text-[12px] font-black text-blue-500">{displayedUnlockedCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
              <div className="flex items-baseline gap-1">
                <span className="text-[12px] font-black text-gray-400">未蒐集</span>
                <span className="text-[12px] font-black text-gray-400">
                  {selectedColorKey
                    ? (CAT_POSES.length - displayedUnlockedCount)
                    : (totalEntries - unlockedCount)}
                </span>
              </div>
            </div>
          </div>

          {/* Dex Grid - 2 Columns */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-7 min-h-[200px]">
            {allDisplayedEntries.length > 0 ? (
              allDisplayedEntries.map((entry, idx) => {
                const isUnlocked = entry.isUnlocked;
                const isOther = 'isOther' in entry && (entry as any).isOther;
                const otherPhoto = isOther ? (entry as any).reportData?.photo : null;
                const coverUrl = isOther && otherPhoto
                  ? otherPhoto
                  : getCollectionCardCover(entry.colorKey, entry.poseKey, isUnlocked);
                const isHighlight = highlightedDexEntry?.colorKey === entry.colorKey && highlightedDexEntry?.poseKey === entry.poseKey;

                return (
                  <motion.div 
                    key={`${entry.colorKey}-${entry.poseKey}-${'reportData' in entry ? (entry as any).reportData?.reportId : idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (idx % 10) * 0.05 }}
                    onClick={() => {
                      if (isUnlocked) {
                        if (isOther) {
                          // other 姿勢：直接用該回報資料
                          const reportData = (entry as any).reportData;
                          setSelectedEntry({
                            ...entry,
                            poseLabel: (entry as any).poseNote || '其他',
                            unlockData: {
                              colorKey: entry.colorKey,
                              poseKey: 'other',
                              poseNote: (entry as any).poseNote,
                              unlockedAt: reportData?.submittedAt || new Date().toISOString(),
                            },
                            reports: (reports || [])
                              .filter(r => r && r.colorKey === entry.colorKey && r.poseKey === 'other')
                              .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
                          });
                        } else {
                          const entryReports = (reports || [])
                            .filter(r => r && r.colorKey === entry.colorKey && r.poseKey === entry.poseKey)
                            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
                          const unlockData = (dexUnlocks || []).find(d => d.colorKey === entry.colorKey && d.poseKey === entry.poseKey);
                          setSelectedEntry({ ...entry, unlockData, reports: entryReports });
                        }
                        setActivePhotoIdx(0);
                      }
                    }}
                    className={`flex flex-col group ${isUnlocked ? 'cursor-pointer' : ''}`}
                  >
                    {/* Card Image Container */}
                    <div className={`relative aspect-[1/1.2] rounded-[32px] overflow-hidden mb-3 shadow-md transition-shadow hover:shadow-xl ${!isUnlocked ? 'opacity-90' : ''}`}>
                      {/* Fog effect for locked */}
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-10" />
                      )}
                      
                      <img 
                        src={coverUrl} 
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://catwalk-v2.vercel.app/assets/collection-page/locked/lock.png";
                        }}
                        className={`w-full h-full object-cover transition-transform duration-500 ${isUnlocked ? 'group-hover:scale-110' : ''}`} 
                        alt="Cat" 
                      />
                      
                      {/* Rarity Tag */}
                      {(isUnlocked || entry.rarity === 'rare') && (
                        <div className="absolute top-3 left-3 z-20">
                          <RarityBadge rarity={entry.rarity} className="px-2.5 py-0.5 text-[9px] font-black shadow-lg" />
                        </div>
                      )}

                      {/* Lock Icon */}
                      {!isUnlocked && (
                        <div className="absolute bottom-3 right-3 z-20 w-6 h-6 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                          <Lock size={12} strokeWidth={3} />
                        </div>
                      )}

                      {isHighlight && (
                         <div className="absolute inset-0 border-4 border-blue-500 rounded-[32px] z-30" />
                      )}
                    </div>

                    {/* Card Info */}
                    <div className="flex flex-col gap-0.5 px-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[15px] font-black ${isUnlocked ? 'text-gray-800' : 'text-gray-300'}`}>
                          {isUnlocked ? entry.colorLabel : '???'}
                        </span>
                        <span className="text-[12px] font-bold text-gray-400">
                          {entry.poseLabel}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-2 py-20 flex flex-col items-center justify-center text-gray-300 gap-4">
                <Filter size={48} strokeWidth={1} />
                <div className="text-center">
                  <p className="text-sm font-black text-gray-400">目前沒有符合要求的貓咪</p>
                  <p className="text-[10px] font-bold text-gray-300 mt-1">換個篩選條件試試看吧！🐾</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

        {/* Modal Entry Details */}
        <AnimatePresence>
          {selectedEntry && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center p-6 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedEntry(null)}
            >
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-md rounded-[48px] overflow-hidden shadow-2xl relative"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setSelectedEntry(null)}
                  className="absolute top-6 right-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-20"
                >
                  <X size={20} />
                </button>

                <div className="max-h-[85vh] overflow-y-auto no-scrollbar pb-10">
                  <div className="relative w-full aspect-square">
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={`${selectedEntry.colorKey}-${selectedEntry.poseKey}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        src={
                          (selectedEntry as any).isOther && (selectedEntry as any).reportData?.photo
                            ? (selectedEntry as any).reportData.photo
                            : getCollectionCardCover(selectedEntry.colorKey, selectedEntry.poseKey, true)
                        }
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://catwalk-v2.vercel.app/assets/collection-page/locked/lock.png";
                        }}
                        className="w-full h-full object-cover" 
                        alt="Cat Detail" 
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8">
                      <RarityBadge rarity={selectedEntry.rarity} className="mb-3 px-4 py-1 shadow-lg" />
                      <h3 className="text-4xl font-black text-white tracking-tighter drop-shadow-xl">{selectedEntry.colorLabel} × {(selectedEntry as any).isOther ? ((selectedEntry as any).poseNote || '其他') : selectedEntry.poseLabel} 🐾</h3>
                    </div>

                    {/* Thumbnail Switcher - Now just for previewing user photos if they want, but the hero stays as the cover? No, the user says "DexDetail 上方主圖 = 正式圖鑑封面圖". So the switcher might not be needed for the hero if it stays static? Actually, the switcher was for user photos. But the requirement says "下方『本次拍攝紀錄 / 所有拍攝照片』才顯示使用者上傳或回報照片". So I should probably remove the hero switcher if it's supposed to stay as the formal cover. */}
                  </div>

                  <div className="p-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-1 bg-gray-50 p-4 rounded-3xl flex flex-col gap-1 border border-gray-100">
                      <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase">
                        <Calendar size={12} />
                        首次解鎖
                      </div>
                      <span className="text-sm font-bold text-gray-800">
                        {selectedEntry.unlockData ? new Date(selectedEntry.unlockData.unlockedAt).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }) : '---'}
                      </span>
                    </div>
                    <div className="flex-1 bg-gray-50 p-4 rounded-3xl flex flex-col gap-1 border border-gray-100">
                      <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase">
                        <Camera size={12} />
                        拍攝次數
                      </div>
                      <span className="text-sm font-bold text-gray-800">
                        {selectedEntry.reports.length} 次
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">累積經驗收益</span>
                      <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-[10px] font-bold">已解鎖</div>
                    </div>
                    <div className="flex items-end gap-2">
                       <span className="text-3xl font-black text-blue-600 leading-none">
                         +{Array.isArray(selectedEntry.reports) ? selectedEntry.reports.reduce((acc: number, r: any) => acc + (r.xpEarned || 0), 0) : 0}
                       </span>
                       <span className="text-xs font-bold text-blue-400 mb-1">XP 經驗值</span>
                    </div>
                  </div>

                  {/* New section: My Photos / Record */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <h4 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                        <Camera size={18} className="text-blue-500" />
                        拍攝紀錄與照片
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400">{Array.isArray(selectedEntry.reports) ? selectedEntry.reports.length : 0} 筆紀錄</span>
                    </div>

                    <div className="space-y-6">
                      {(Array.isArray(selectedEntry.reports) ? selectedEntry.reports : []).map((report: any, idx: number) => {
                        const capturePhoto = report.photo || report.mockPhoto || report.imageUrl || report.capturedPhoto || report.previewImage || null;
                        const reportCount = Array.isArray(selectedEntry.reports) ? selectedEntry.reports.length : 0;
                        
                        return (
                          <div key={report.reportId} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
                            <div className="aspect-[4/3] w-full relative bg-gray-100">
                              {capturePhoto ? (
                                <img 
                                  src={capturePhoto} 
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://catwalk-v2.vercel.app/assets/report-flow/catwalk_report_flow_bg_city_street_4_avatars.jpg";
                                  }}
                                  className="w-full h-full object-cover" 
                                  alt="Captured Record" 
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                  <Camera size={32} />
                                  <span className="text-[10px] font-bold">照片載入中...</span>
                                </div>
                              )}
                              <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase">
                                #{reportCount - idx}
                              </div>
                            </div>
                            
                            <div className="p-5 bg-gray-50/50">
                              <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">拍攝時間</span>
                                  <span className="text-xs font-black text-gray-700 flex items-center gap-1">
                                    <Calendar size={12} className="text-gray-400" />
                                    {new Date(report.submittedAt).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">回報地點</span>
                                  <span className="text-xs font-black text-gray-700 flex items-center gap-1">
                                    <MapPin size={12} className="text-gray-400" />
                                    {(report as any).locationName || '台灣'}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">獲得積分</span>
                                  <span className="text-xs font-black text-blue-500">
                                    +{report.xpEarned} XP
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">狀態</span>
                                  <span className="text-xs font-black text-emerald-500">
                                    已上傳
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400 justify-center">
                    <Info size={12} />
                    <span className="text-[10px] font-bold tracking-tight italic">探索更多巷弄，收集更多獨特的貓咪瞬間。</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
};

export default DexScreen;
