import React from 'react';
import { useApp } from '../context/AppContext';
import { Map, MapPin, BookOpen, Camera, Share2, Sparkles, ChevronRight, Search } from 'lucide-react';
import { CAT_COLORS, CAT_POSES, LEVELS } from '../constants';
import RarityBadge from '../components/RarityBadge';
import ProgressBar from '../components/ProgressBar';
import { motion } from 'motion/react';
import { getCollectionCardCover } from '../utils/catImages';

const ResultScreen: React.FC = () => {
  const { lastReport, user, navigateTo, setHighlightedDexEntry } = useApp();

  if (!lastReport) return null;

  const color = CAT_COLORS.find(c => c.key === lastReport.colorKey);
  const pose = CAT_POSES.find(p => p.key === lastReport.poseKey);
  
  const currentLevelInfo = LEVELS.find(l => l.level === user.currentLevel) || LEVELS[0];
  const nextLevelIndex = LEVELS.findIndex(l => l.level === user.currentLevel);
  const nextLevelInfo = nextLevelIndex !== -1 && nextLevelIndex + 1 < LEVELS.length ? LEVELS[nextLevelIndex + 1] : null;
  const isMaxLevel = !nextLevelInfo;

  const currentLevelBaseXp = currentLevelInfo.requiredTotalXp;
  const xpInCurrentLevel = user.totalXp - currentLevelBaseXp;
  const xpNeededForNextIncrement = isMaxLevel ? 100 : nextLevelInfo.requiredTotalXp - currentLevelBaseXp;
  const xpRemainingToNext = isMaxLevel ? 0 : nextLevelInfo.requiredTotalXp - user.totalXp;
  
  const handleDexClick = () => {
    if (lastReport) {
      setHighlightedDexEntry({ colorKey: lastReport.colorKey, poseKey: lastReport.poseKey });
      navigateTo('Dex');
    }
  };

  const dexImage = getCollectionCardCover(lastReport.colorKey, lastReport.poseKey, true);
  
  return (
    <div className="h-full flex flex-col bg-white font-sans relative overflow-hidden">
      {/* Background Illustration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="https://catwalk-v2.vercel.app/assets/report-flow/catwalk_report_flow_bg_city_street_4.jpg" 
          className="w-full h-full object-cover" 
          alt="Success Background" 
        />
        {/* Soft White Misty Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white/90 via-white/40 to-transparent" />
        
        {/* Confetti / Streamers Effect */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, x: Math.random() * 400, rotate: 0 }}
            animate={{ 
              y: 800, 
              x: (Math.random() * 400) + (Math.random() * 100 - 50),
              rotate: 360
            }}
            transition={{ 
              duration: 4 + Math.random() * 4, 
              repeat: Infinity, 
              delay: Math.random() * 2,
              ease: "linear" 
            }}
            className="absolute rounded-sm z-10"
            style={{
              width: Math.random() * 8 + 4,
              height: Math.random() * 12 + 6,
              backgroundColor: ['#60A5FA', '#FBBF24', '#34D399', '#A78BFA', '#F472B6'][i % 5],
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative z-10 pb-56">
        {/* Header */}
        <header className="px-6 pt-12 pb-6 relative z-10 flex-shrink-0">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 bg-black/80 px-4 py-1.5 rounded-full text-white text-[10px] font-bold tracking-widest uppercase mb-4 shadow-lg shadow-black/20">
              <Sparkles size={14} className="text-yellow-400" />
              報告成功！
            </div>
            <div className="flex items-center gap-1">
               <div className="w-8 h-1.5 bg-blue-500 rounded-full" />
               <div className="w-8 h-1.5 bg-blue-500 rounded-full" />
               <div className="w-8 h-1.5 bg-blue-500 rounded-full" />
               <div className="w-8 h-1.5 bg-blue-500 rounded-full" />
               <span className="text-xs font-black text-gray-400 ml-2">4 / 4</span>
            </div>
          </div>
        </header>

        <div className="px-5 space-y-6">
          <div className="text-center mb-6">
            <h1 className="text-[26px] font-black text-gray-900 tracking-tight leading-relaxed drop-shadow-sm">
              你捕捉到一隻療癒的貓咪！🐾
            </h1>
          </div>

          {/* Main Result Card */}
          <motion.section 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/80 backdrop-blur-2xl rounded-[48px] shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-white p-4"
          >
            <div className="relative w-full aspect-square rounded-[36px] overflow-hidden mb-6 group">
              <img src={dexImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cat Illustration" />
              <div className="absolute top-4 left-4">
                <RarityBadge rarity={lastReport.rarity} className="px-3 py-1 text-[10px] font-black shadow-lg" />
              </div>
              <button className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-90 hover:bg-black/50">
                <Share2 size={18} />
              </button>
              
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                 <div className="flex flex-col gap-1.5">
                    <h2 className="text-2xl font-black text-white leading-tight drop-shadow-lg">{color?.label} × {pose?.label} 🐾</h2>
                    <div className="flex items-center gap-1.5 text-white/90 text-[10px] font-black uppercase tracking-[0.1em] bg-black/30 backdrop-blur-md px-3 py-1 rounded-full w-fit border border-white/20">
                      <MapPin size={10} className="text-blue-400" />
                      {lastReport.location ? `台北市區域 (${lastReport.location.latitude?.toFixed(4) ?? '?'},${lastReport.location.longitude?.toFixed(4) ?? '?'})` : '台北市中正區'}
                    </div>
                 </div>
                 <div className="bg-white/95 backdrop-blur-md p-4 rounded-[28px] shadow-2xl flex flex-col items-center border border-white shrink-0">
                    <span className="text-blue-600 font-black text-2xl leading-none">+{lastReport.xpEarned} <span className="text-xs">XP</span></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">本次獲得</span>
                 </div>
              </div>
            </div>
          </motion.section>

        {/* XP Progress Card - 柔和白色漸層背景 */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-transparent pointer-events-none z-10 rounded-3xl" />
          <ProgressBar 
          current={xpInCurrentLevel} 
          total={xpNeededForNextIncrement} 
          label={`等級 ${user.currentLevel} 進度`}
          subLabel={isMaxLevel ? "恭喜你已達成最高等級！" : `再獲得 ${xpRemainingToNext} XP 即可升級！`}
        />
        </div>

        {/* New Dex Unlock Toast (if applicable) */}
        {lastReport.isNewDexUnlock && (
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={handleDexClick}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-3xl flex items-center justify-between text-white shadow-xl shadow-blue-500/30 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📖</div>
                <div className="flex flex-col">
                  <h3 className="font-black text-sm tracking-tight text-white">新圖鑑條目解鎖！</h3>
                  <p className="text-[10px] text-white/70 font-medium">{color?.label} × {pose?.label} 已加入你的圖鑑</p>
                </div>
            </div>
            <ChevronRight size={20} className="text-white/50" />
          </motion.div>
        )}

        {/* Level Up Section - Only shown when leveled up */}
        {lastReport.isLevelUp && (
          <motion.section 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white/90 backdrop-blur-2xl p-6 rounded-[40px] shadow-xl border border-yellow-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
               <div className="w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl" />
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white bg-gray-100">
                  <img
                    src={`https://catwalk-v2.vercel.app/assets/profile-page/badges/rank_badge_lv${String(user.currentLevel).padStart(2, '0')}.png`}
                    alt={`Lv${user.currentLevel}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://catwalk-v2.vercel.app/assets/profile-page/badges/rank_badge_lv01.png'; }}
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Rank</div>
              </div>

              <div className="flex flex-col">
                <div className="bg-yellow-500 text-white px-4 py-0.5 rounded-full text-[10px] font-black uppercase w-fit mb-2 shadow-sm">等級提升！</div>
                <h4 className="text-3xl font-black text-gray-800 tracking-tight">Lv.{user.currentLevel}</h4>
                <h3 className="font-black text-gray-800 text-xl tracking-tight">{user.currentTitle} 🐾</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium italic">
                  熟悉巷弄的模樣夥伴，溫柔守護這座城市的日常。
                </p>
              </div>
            </div>
            
            {/* Confetti simulation (dots) */}
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-sm animate-bounce`}
                style={{ 
                  left: `${10 + i * 15}%`, 
                  top: `${20 + (i % 3) * 20}%`,
                  backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ec4899'][i % 4],
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </motion.section>
        )}

        {/* Breakdown Summary */}
        <section className="bg-white/80 p-5 rounded-3xl shadow-lg border border-gray-100">
           <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">本次回報總結</h5>
           <div className="grid grid-cols-4 gap-2">
              <div className="bg-gray-50 p-2 rounded-2xl flex flex-col items-center gap-1">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm"><Camera size={18} /></div>
                 <span className="text-[8px] font-medium text-gray-400">累計拍攝</span>
                 <span className="text-xs font-black text-gray-800">{lastReport.captureCount} 次</span>
              </div>
              <div className="bg-gray-50 p-2 rounded-2xl flex flex-col items-center gap-1">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm"><Sparkles size={18} /></div>
                 <span className="text-[8px] font-medium text-gray-400">稀有度</span>
                 <span className="text-xs font-black text-gray-800">
                   {lastReport.rarity === 'rare' ? '稀有' : lastReport.rarity === 'uncommon' ? '少見' : '常見'}
                 </span>
              </div>
              <div className="bg-gray-50 p-2 rounded-2xl flex flex-col items-center gap-1">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm font-black text-[10px]">XP</div>
                 <span className="text-[8px] font-medium text-gray-400">獲得 XP</span>
                 <span className="text-xs font-black text-blue-600">+{lastReport.xpEarned}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded-2xl flex flex-col items-center gap-1">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm font-black text-[10px]"><BookOpen size={18} /></div>
                 <span className="text-[8px] font-medium text-gray-400">圖鑑解鎖</span>
                 <span className="text-xs font-black text-emerald-600">{lastReport.isNewDexUnlock ? '新解鎖' : '已存在'}</span>
              </div>
           </div>
        </section>
      </div>
    </main>

      {/* Buttons */}
      <footer className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent z-40 grid grid-cols-3 gap-3">
        <button 
          onClick={() => navigateTo('MockCamera')}
          className="h-16 bg-yellow-400/90 backdrop-blur-md rounded-2xl shadow-xl flex flex-col items-center justify-center gap-0.5 text-white transition-all active:scale-95"
        >
          <Search size={22} strokeWidth={3} className="text-white" />
          <span className="text-[10px] font-black tracking-tighter uppercase">繼續找貓</span>
        </button>
        <button 
          onClick={() => navigateTo('Map')}
          className="h-16 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center gap-0.5 text-blue-500 transition-all active:scale-95 border border-gray-100"
        >
          <Map size={22} strokeWidth={3} />
          <span className="text-[10px] font-black tracking-tighter uppercase">回地圖</span>
        </button>
        <button 
          onClick={() => navigateTo('Dex')}
          className="h-16 bg-indigo-500/90 backdrop-blur-md rounded-2xl shadow-xl flex flex-col items-center justify-center gap-0.5 text-white transition-all active:scale-95"
        >
          <BookOpen size={22} strokeWidth={3} />
          <span className="text-[10px] font-black tracking-tighter uppercase">查看圖鑑</span>
        </button>
      </footer>
    </div>
  );
};

export default ResultScreen;
