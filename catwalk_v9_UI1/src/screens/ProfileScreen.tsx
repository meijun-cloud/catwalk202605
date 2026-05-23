import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, Bell, Edit2, MapPin, Camera, BookOpen, X, Check, Upload } from 'lucide-react';
import { LEVELS, CAT_COLORS, CAT_POSES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

const avatarOptions = [
  {
    id: "black",
    label: "黑貓",
    url: "https://catwalk-v2.vercel.app/assets/avatars/black.png"
  },
  {
    id: "calico",
    label: "三花貓",
    url: "https://catwalk-v2.vercel.app/assets/avatars/calico.png"
  },
  {
    id: "orange",
    label: "橘貓",
    url: "https://catwalk-v2.vercel.app/assets/avatars/orange.png"
  },
  {
    id: "tabby",
    label: "虎斑貓",
    url: "https://catwalk-v2.vercel.app/assets/avatars/tabby.png"
  },
  {
    id: "white",
    label: "白貓",
    url: "https://catwalk-v2.vercel.app/assets/avatars/white.png"
  }
];

const rankImageMap: Record<number, string> = {
  1: "https://catwalk-v2.vercel.app/assets/profile-page/rank/lv01.png",
  2: "https://catwalk-v2.vercel.app/assets/profile-page/rank/lv02.png",
  3: "https://catwalk-v2.vercel.app/assets/profile-page/rank/lv03.png",
  4: "https://catwalk-v2.vercel.app/assets/profile-page/rank/lv04.png",
  5: "https://catwalk-v2.vercel.app/assets/profile-page/rank/lv05.png",
  6: "https://catwalk-v2.vercel.app/assets/profile-page/rank/lv06.png",
  7: "https://catwalk-v2.vercel.app/assets/profile-page/rank/lv07.png",
  8: "https://catwalk-v2.vercel.app/assets/profile-page/rank/lv08.png",
  9: "https://catwalk-v2.vercel.app/assets/profile-page/rank/lv09.png",
  10: "https://catwalk-v2.vercel.app/assets/profile-page/rank/lv10.png",
};

const ProfileScreen: React.FC = () => {
  const { user, reports, dexUnlocks, navigateTo, resetAllData, updateUserProfile } = useApp();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [tempName, setTempName] = useState(user.displayName);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "新圖鑑已解鎖",
      summary: "你成功解鎖了新的貓咪圖鑑條目：台北虎斑貓。",
      time: "2小時前",
      read: false,
      type: "unlock"
    },
    {
      id: "2",
      title: "等級提升",
      summary: "恭喜你升上 Lv.10 貓部宗師！你已經是這座城市的貓咪專家了。",
      time: "5小時前",
      read: false,
      type: "level"
    },
    {
      id: "3",
      title: "拍攝紀錄已同步",
      summary: "你最近在台北車站附近的拍攝紀錄已成功雲端同步。",
      time: "昨天",
      read: true,
      type: "sync"
    },
    {
      id: "4",
      title: "徽章已獲得",
      summary: "獲得「巷弄探險家」成就勳章，快去櫃子看看！",
      time: "2天前",
      read: true,
      type: "badge"
    },
    {
      id: "5",
      title: "每日提醒",
      summary: "今天也是個尋貓的好天氣，去城市角落看看吧！",
      time: "3天前",
      read: true,
      type: "reminder"
    }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalEntries = CAT_COLORS.length * CAT_POSES.length;
  const unlockedCount = dexUnlocks.length;
  const percentage = Math.round((unlockedCount / totalEntries) * 100);

  const nextLevelInfo = LEVELS.find(l => l.level === user.currentLevel + 1) || LEVELS[LEVELS.length - 1];

  const hasUnreadNotifications = notifications.some(n => !n.read);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleAvatarSelect = (option: typeof avatarOptions[0]) => {
    updateUserProfile({
      avatarType: 'preset',
      selectedPresetAvatarId: option.id,
      avatarUrl: option.url
    });
    setIsAvatarModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      updateUserProfile({
        avatarType: 'custom',
        avatarUrl: result,
        selectedPresetAvatarId: null
      });
      setIsAvatarModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      updateUserProfile({ displayName: tempName.trim() });
      setIsNameModalOpen(false);
    }
  };

  const isAnyModalOpen = isAvatarModalOpen || isNameModalOpen || isReportsModalOpen || isAchievementModalOpen || isBadgesModalOpen || isNotificationsModalOpen;

  return (
    <div className={`h-full flex flex-col bg-[#F7F9FC] font-sans relative overflow-hidden transition-[z-index] duration-0 ${isAnyModalOpen ? 'z-[60]' : 'z-10'}`}>
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto pb-48 no-scrollbar relative z-10">
        {/* Hero Header with Background */}
        <header className="relative w-full h-[440px] z-10 overflow-hidden">
          {/* Background Image - Full Bleed */}
          <div className="absolute inset-x-0 top-0 h-full z-0">
            <img 
              src="https://catwalk-v2.vercel.app/assets/profile-page/catwalk_profile_achievement_bg.jpg" 
              className="w-full h-full object-cover" 
              alt="Taipei background"
            />
            {/* Top Shadow for UI Contrast */}
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/50 to-transparent" />
            {/* Bottom Soft White Misty Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#F7F9FC] via-white/40 to-transparent pointer-events-none" />
          </div>

          {/* Top UI Bar */}
          <div className="relative z-10 flex justify-between items-center px-6 pt-12">
            <h1 className="text-[32px] font-black text-white drop-shadow-md flex items-center gap-2 tracking-tighter leading-none">個人成就 <span className="text-xl">🐾</span></h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setIsNotificationsModalOpen(true);
                  markAllAsRead();
                }}
                className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-white relative transition-transform active:scale-90 border border-white/30"
              >
                 <Bell size={22} strokeWidth={2} />
                 {hasUnreadNotifications && (
                   <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                 )}
              </button>
            </div>
          </div>

          {/* User Info Capsule Card - Positioned at 20% approx height to overlap character */}
          <div className="absolute top-[160px] inset-x-6 z-20 flex justify-center">
             <div className="bg-white/95 backdrop-blur-md p-3 pr-8 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.25)] border border-white flex items-center gap-4 w-fit max-w-full">
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] border-white shadow-lg overflow-hidden shrink-0 cursor-pointer relative group"
                  onClick={() => setIsAvatarModalOpen(true)}
                >
                  <img src={user.avatarUrl} className="w-full h-full object-cover" alt="User Avatar" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera size={16} className="text-white" />
                  </div>
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight truncate">{user.displayName}</span>
                    <button 
                      onClick={() => {
                        setTempName(user.displayName);
                        setIsNameModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                    >
                      <Edit2 size={16} strokeWidth={3} />
                    </button>
                  </div>

                </div>
             </div>
          </div>
        </header>

        <main className="px-5 -mt-44 relative z-30 space-y-6">
          {/* Level Stats Card - Redesigned to Centered Layout */}
          <section className="bg-white rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.06)] p-10 border border-white relative overflow-hidden group">
            {/* Decorative background circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-50 rounded-full opacity-40 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-yellow-50 rounded-full opacity-30 blur-3xl" />

            <div className="flex flex-col items-center text-center relative z-10">
               {/* Badge Icon - Centered at Top */}
               <div className="w-40 h-40 flex items-center justify-center bg-gray-50 rounded-full shadow-inner p-1 mb-6">
                  <img 
                    src={rankImageMap[user.currentLevel] || rankImageMap[1]} 
                    className="w-full h-full object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)]" 
                    alt={`Level ${user.currentLevel}`} 
                  />
               </div>

               {/* Level Text Block - Centered with Refined Font Size */}
               <div className="flex flex-col items-center gap-2 mb-4">
                  <span className="bg-blue-500/10 text-blue-600 text-[11px] font-black px-4 py-1.5 rounded-full tracking-[0.2em] uppercase">目前等級</span>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight leading-tight">
                      Lv.{user.currentLevel} {user.currentTitle}
                    </h3>
                    <span className="text-xl">🐾</span>
                  </div>
               </div>
               
               <p className="text-[13px] text-gray-400 font-medium leading-relaxed max-w-[240px] mb-8">
                 熟悉巷弄的貓咪夥伴，<br />在這座城市裡溫柔守護每個相遇的日常。
               </p>
            </div>
            
            {/* XP Section */}
            <div className="pt-8 border-t border-gray-50 flex flex-col gap-5">
              <div className="flex justify-between items-end px-2">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-gray-300 tracking-[0.15em] uppercase">累積冒險能量</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-blue-600 tracking-tighter">{user.totalXp}</span>
                      <span className="text-xs font-bold text-gray-300 uppercase">/ {nextLevelInfo.requiredTotalXp} XP</span>
                    </div>
                 </div>
                 {user.currentLevel < 10 && (
                   <div className="text-right">
                      <span className="text-[10px] font-black text-blue-400/60 italic tracking-tight">
                        再獲得 {nextLevelInfo.requiredTotalXp - user.totalXp} XP 即可升級
                      </span>
                   </div>
                 )}
              </div>
              
              <div className="h-3.5 w-full bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min((user.totalXp / nextLevelInfo.requiredTotalXp) * 100, 100)}%` }}
                   transition={{ duration: 1.5, ease: "circOut" }}
                   className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full relative"
                 >
                   <div className="absolute inset-0 bg-white/20 animate-pulse" />
                 </motion.div>
              </div>
            </div>
          </section>

          {/* Detailed Function Grid (4 cards) - Interactions Added */}
          <section className="grid grid-cols-4 gap-3 pt-2">
             {/* Card 1: Reports */}
             <button 
              onClick={() => setIsReportsModalOpen(true)}
              className="bg-white p-3 pt-6 pb-4 rounded-[32px] shadow-[0_15px_30px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center gap-2 group transition-transform active:scale-95 text-left"
             >
                <div className="w-16 h-12 flex items-center justify-center mb-1">
                   <img src="https://catwalk-v2.vercel.app/assets/profile-page/icon/icon_report_camera.png" className="w-10 h-10 object-contain drop-shadow-md" alt="" />
                </div>
                <span className="text-[11px] font-black text-gray-800 tracking-tight">我的回報</span>
                <span className="text-[9px] font-bold text-blue-500 whitespace-nowrap">{reports.length} 筆回報</span>
                <ChevronRight size={14} className="text-gray-200 mt-1" />
             </button>

             {/* Card 2: Collection */}
             <button 
              onClick={() => navigateTo('Dex')}
              className="bg-white p-3 pt-6 pb-4 rounded-[32px] shadow-[0_15px_30px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center gap-2 group transition-transform active:scale-95 text-left"
             >
                <div className="w-16 h-12 flex items-center justify-center mb-1">
                   <img src="https://catwalk-v2.vercel.app/assets/profile-page/icon/icon_collection_book.png" className="w-10 h-10 object-contain drop-shadow-md" alt="" />
                </div>
                <span className="text-[11px] font-black text-gray-800 tracking-tight">收藏</span>
                <span className="text-[9px] font-bold text-blue-500 whitespace-nowrap">{unlockedCount} 隻貓咪</span>
                <ChevronRight size={14} className="text-gray-200 mt-1" />
             </button>

             {/* Card 3: Achievement */}
             <button 
              onClick={() => setIsAchievementModalOpen(true)}
              className="bg-white p-3 pt-6 pb-4 rounded-[32px] shadow-[0_15px_30px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center gap-2 group transition-transform active:scale-95 text-left"
             >
                <div className="w-16 h-12 flex items-center justify-center mb-1 scale-110">
                   <img src="https://catwalk-v2.vercel.app/assets/profile-page/icon/icon_achievement_trophy.png" className="w-11 h-11 object-contain drop-shadow-md" alt="" />
                </div>
                <span className="text-[11px] font-black text-gray-800 tracking-tight">成就</span>
                <span className="text-[9px] font-bold text-blue-500 leading-none">等級進度</span>
                <ChevronRight size={14} className="text-gray-200 mt-1" />
             </button>

             {/* Card 4: Badge */}
             <button 
              onClick={() => setIsBadgesModalOpen(true)}
              className="bg-white p-3 pt-6 pb-4 rounded-[32px] shadow-[0_15px_30px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center gap-2 group transition-transform active:scale-95 text-left"
             >
                <div className="w-16 h-12 flex items-center justify-center mb-1 scale-110">
                   <img src="https://catwalk-v2.vercel.app/assets/profile-page/icon/icon_badge_medal.png" className="w-11 h-11 object-contain drop-shadow-md" alt="" />
                </div>
                <span className="text-[11px] font-black text-gray-800 tracking-tight">徽章</span>
                <span className="text-[9px] font-bold text-blue-500 leading-none">{user.currentLevel} 枚徽章</span>
                <ChevronRight size={14} className="text-gray-200 mt-1" />
             </button>
          </section>

          {/* Quote Card - Redesigned to Top Image / Bottom Text */}
          <section className="bg-white rounded-[48px] overflow-hidden border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col relative group transition-transform active:scale-[0.98]">
             <div className="w-full aspect-[21/9] overflow-hidden relative shadow-inner">
               <img 
                 src="https://catwalk-v2.vercel.app/assets/profile-page/catwalk-profile-quote-card-image.jpg" 
                 className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000" 
                 alt="" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
             </div>
             
             <div className="px-10 py-10 relative flex flex-col items-center text-center">
                {/* Visual quote decorations */}
                <div className="absolute top-6 left-10 opacity-[0.1] text-7xl font-serif text-blue-600 -translate-y-2 pointer-events-none">“</div>
                
                <div className="relative z-10 space-y-2">
                  <p className="text-[18px] font-black text-gray-800 leading-tight tracking-tight">
                    在城市的每個角落，
                  </p>
                  <p className="text-[18px] font-black text-blue-500 leading-tight tracking-tight">
                    都藏著貓咪與你的相遇。
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2">
                   <div className="w-8 h-[1px] bg-gray-200" />
                   <span className="text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">CatWalk 城市冒險</span>
                   <div className="w-8 h-[1px] bg-gray-200" />
                </div>
                
                <div className="absolute bottom-6 right-10 opacity-10">
                  <span className="text-3xl grayscale">🐾</span>
                </div>
             </div>
          </section>

          {/* Reset Data Link (Keep it subtle) */}
          <section className="pb-24 pt-4 flex justify-center">
             <button 
               onClick={() => {
                 if(window.confirm('確定要重置所有資料嗎？這將會清除你的等級、紀錄與圖鑑進度。')) {
                   resetAllData();
                 }
               }}
               className="text-[10px] font-black text-gray-300 hover:text-gray-400 tracking-widest uppercase py-4 px-6 rounded-full transition-colors"
             >
               重置系統資料
             </button>
          </section>
        </main>
      </div>

      {/* Styled Modals */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAvatarModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[56px] shadow-2xl overflow-hidden border border-white p-10 relative z-10"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">更換頭像</h3>
                <button onClick={() => setIsAvatarModalOpen(false)} className="w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-12">
                {avatarOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAvatarSelect(option)}
                    className={`relative aspect-square rounded-[32px] overflow-hidden transition-all duration-300 ${
                      user.selectedPresetAvatarId === option.id 
                        ? 'ring-4 ring-blue-500 ring-offset-4 scale-105 shadow-xl' 
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={option.url} alt={option.label} className="w-full h-full object-cover" />
                    {user.selectedPresetAvatarId === option.id && (
                      <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                        <div className="bg-blue-500 text-white rounded-full p-1.5 shadow-md">
                          <Check size={14} strokeWidth={4} />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-[32px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-white hover:border-blue-200 hover:text-blue-400 transition-all active:scale-95"
                >
                  <Upload size={24} />
                  <span className="text-[11px] font-bold">自定義</span>
                </button>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload} 
              />
              
              <button 
                onClick={() => setIsAvatarModalOpen(false)}
                className="w-full py-5 bg-gray-900 text-white rounded-[28px] font-black tracking-widest text-sm shadow-xl active:scale-95 transition-transform"
              >
                返回個人成就
              </button>
            </motion.div>
          </motion.div>
        )}

        {isNameModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsNameModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[56px] shadow-2xl overflow-hidden border border-white p-10 relative z-10"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">編輯冒險家名稱</h3>
                <button onClick={() => setIsNameModalOpen(false)} className="w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-12">
                <label className="block text-[11px] font-black text-blue-500 uppercase tracking-widest mb-4 px-2">冒險家代號</label>
                <input 
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="輸入你的稱號..."
                  className="w-full px-8 py-5 bg-gray-50 rounded-[30px] border-2 border-transparent focus:border-blue-400 focus:bg-white outline-none font-black text-xl text-gray-800 transition-all shadow-inner"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsNameModalOpen(false)}
                  className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-[28px] font-black tracking-widest text-sm active:scale-95 transition-transform"
                >
                  取消
                </button>
                <button 
                  onClick={handleNameSave}
                  className="flex-[1.5] py-5 bg-blue-500 text-white rounded-[28px] font-black tracking-widest text-sm shadow-xl shadow-blue-200 active:scale-95 transition-transform"
                >
                  更新名稱
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* My Reports Modal */}
        {isReportsModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsReportsModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm h-[75vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative z-20"
            >
              <div className="px-8 pt-8 pb-4 flex justify-between items-center bg-white sticky top-0 z-20 border-b border-gray-50">
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-gray-800 tracking-tight">拍攝紀錄與照片</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{reports.length} 筆紀錄</span>
                  </div>
                </div>
                <button onClick={() => setIsReportsModalOpen(false)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 active:scale-90 transition-transform">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
                {reports.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                       <Camera size={32} className="text-gray-200" />
                    </div>
                    <p className="text-lg font-black text-gray-400">尚未有任何拍攝紀錄</p>
                    <p className="text-xs font-bold text-gray-300 mt-1 leading-relaxed">快去地圖上尋找躲藏的小貓吧！</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {reports.map((report, idx) => (
                      <div key={idx} className="bg-white rounded-[32px] p-4 border border-gray-100 flex gap-4 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-inner relative">
                           <img src={report.photo} className="w-full h-full object-cover" alt="Cat" />
                           <div className="absolute top-1.5 left-1.5 bg-black/50 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                              #{reports.length - idx}
                           </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                               <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                                 {new Date(report.submittedAt).toLocaleDateString('zh-TW')}
                               </span>
                               <span className="text-[9px] font-black text-green-500 flex items-center gap-1">
                                 <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                 已上傳
                               </span>
                            </div>
                            <h4 className="text-base font-black text-gray-800 truncate leading-tight">
                              {report.location ? `台北市區域 (${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)})` : '未知地點'}
                            </h4>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                               <span className="bg-gray-50 text-[9px] font-bold text-gray-400 px-2 py-0.5 rounded-full border border-gray-100">
                                 #{CAT_COLORS.find(c => c.key === report.colorKey)?.label || report.colorKey}
                               </span>
                               <span className="bg-gray-50 text-[9px] font-bold text-gray-400 px-2 py-0.5 rounded-full border border-gray-100">
                                 #{CAT_POSES.find(p => p.key === report.poseKey)?.label || report.poseKey}
                               </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                             <div className="flex items-center gap-1">
                               <span className="text-[9px] font-bold text-gray-400">稀有度:</span>
                               <span className="text-[9px] font-black text-yellow-500">{report.rarity}</span>
                             </div>
                             <span className="text-[10px] font-black text-blue-600">+{report.xpEarned} XP</span>
                          </div>
                        </div>
                      </div>
                    )).reverse()}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Achievement Modal */}
        {isAchievementModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAchievementModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm h-[85vh] rounded-[56px] shadow-2xl overflow-hidden border border-white flex flex-col relative z-20 text-center"
            >
              <div className="relative pt-10 px-10 shrink-0">
                <div className="flex justify-end absolute top-6 right-6">
                  <button onClick={() => setIsAchievementModalOpen(false)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                    <X size={20} />
                  </button>
                </div>

                <div className="w-24 h-24 bg-blue-50 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm">
                   <img src="https://catwalk-v2.vercel.app/assets/profile-page/icon/icon_achievement_trophy.png" className="w-16 h-16 object-contain" alt="" />
                </div>

                <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-2">冒險成就進度</h3>
                <p className="text-sm font-bold text-gray-400 mb-6 leading-relaxed">持續捕捉更多貓咪，<br />提升你的城市貓咪觀察家等級！</p>
              </div>

              <div className="flex-1 overflow-y-auto px-10 py-2 no-scrollbar">
                <div className="bg-gray-50 rounded-[40px] px-8 py-10 mb-8 text-center space-y-8">
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] font-black text-gray-300 tracking-[0.2em] uppercase">目前等級</span>
                      <span className="text-3xl font-black text-gray-800">Lv.{user.currentLevel}</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] font-black text-gray-300 tracking-[0.2em] uppercase">總累積能量</span>
                      <span className="text-3xl font-black text-blue-600 whitespace-nowrap">{user.totalXp} XP</span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-200 text-left">
                     {user.currentLevel >= 10 ? (
                       <div className="text-center py-2">
                          <span className="text-lg font-black text-yellow-500">已達成最高等級！🏆</span>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">城市傳說級別的貓咪守護者</p>
                       </div>
                     ) : (
                       <div className="space-y-4">
                          <div className="flex justify-between items-end">
                              <span className="text-[11px] font-black text-gray-800">距離升級還差</span>
                              <span className="text-xl font-black text-blue-500">{nextLevelInfo.requiredTotalXp - user.totalXp} XP</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner flex">
                              <div 
                                className="h-full bg-blue-500" 
                                style={{ width: `${Math.min((user.totalXp / nextLevelInfo.requiredTotalXp) * 100, 100)}%` }} 
                              />
                          </div>
                          <p className="text-center text-[10px] font-bold text-blue-400 bg-blue-50 py-3 rounded-2xl tracking-tighter">
                            「再接再厲！再獲得 {nextLevelInfo.requiredTotalXp - user.totalXp} XP 即可升級」
                          </p>
                       </div>
                     )}
                  </div>
                </div>
              </div>

              <div className="px-10 pb-10 pt-4 shrink-0">
                <button 
                  onClick={() => setIsAchievementModalOpen(false)}
                  className="w-full py-5 bg-gray-900 text-white rounded-[28px] font-black tracking-widest text-sm shadow-xl active:scale-95 transition-transform"
                >
                  繼續冒險
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Badges Modal */}
        {isBadgesModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsBadgesModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm h-[75vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative z-20"
            >
              <div className="px-8 pt-10 pb-6 flex justify-between items-center bg-white sticky top-0 z-20">
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">冒險家徽章櫃</h3>
                  <p className="text-[11px] font-black text-gray-300 tracking-widest mt-1 uppercase">解鎖更多等級以收集稀有徽章</p>
                </div>
                <button onClick={() => setIsBadgesModalOpen(false)} className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 transition-transform active:scale-90">
                  <X size={22} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-10 py-6 no-scrollbar">
                <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                  {Object.entries(rankImageMap).map(([lvlStr, url]) => {
                    const l = parseInt(lvlStr);
                    const isUnlocked = l <= user.currentLevel;
                    const isCurrent = l === user.currentLevel;
                    const levelData = LEVELS.find(lev => lev.level === l);

                    return (
                      <div 
                        key={l} 
                        className={`flex flex-col items-center gap-5 transition-all duration-700 ${
                          !isUnlocked ? 'opacity-20 grayscale border-gray-100' : 'opacity-100'
                        } ${isCurrent ? 'scale-110' : ''}`}
                      >
                         <div className={`w-32 h-32 flex items-center justify-center relative p-5 rounded-full transition-all ${isCurrent ? 'bg-blue-50 ring-[6px] ring-blue-100 ring-offset-4 shadow-xl' : 'bg-gray-50/50'}`}>
                            <img src={url} className={`w-full h-full object-contain ${isUnlocked ? 'drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)]' : ''}`} alt={`Lv.${l}`} />
                            {!isUnlocked && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="text-gray-300">
                                    <BookOpen size={20} />
                                 </div>
                              </div>
                            )}
                         </div>
                         <div className="text-center space-y-1">
                            <span className={`text-[10px] font-black tracking-[0.2em] uppercase block ${isCurrent ? 'text-blue-500' : 'text-gray-300'}`}>
                              Lv.{l} {isCurrent && '● 當前'}
                            </span>
                            <span className={`text-[15px] font-black block leading-tight ${isCurrent ? 'text-gray-800' : 'text-gray-400'}`}>
                              {levelData?.title || '冒險家'}
                            </span>
                         </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="h-24" />
              </div>
              
              <div className="p-8 bg-white border-t border-gray-100 sticky bottom-0 z-20">
                 <button 
                  onClick={() => setIsBadgesModalOpen(false)}
                  className="w-full py-5 bg-gray-900 text-white rounded-[32px] font-black tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-transform"
                 >
                  關閉櫃子
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Notifications Modal */}
        {isNotificationsModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsNotificationsModalOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm h-[75vh] rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative z-20"
            >
              <div className="px-8 pt-10 pb-6 flex justify-between items-center bg-white sticky top-0 z-20 border-b border-gray-50">
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">通知中心</h3>
                  <p className="text-[11px] font-black text-gray-300 tracking-widest mt-1 uppercase underline decoration-blue-500/30 underline-offset-4">所有最新消息</p>
                </div>
                <button onClick={() => setIsNotificationsModalOpen(false)} className="w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 active:scale-90 transition-transform">
                  <X size={22} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
                <div className="space-y-4">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-5 rounded-[32px] border transition-all ${notif.read ? 'bg-white border-gray-100 opacity-70' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}>
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          notif.type === 'unlock' ? 'bg-blue-100 text-blue-500' :
                          notif.type === 'level' ? 'bg-yellow-100 text-yellow-600' :
                          notif.type === 'sync' ? 'bg-green-100 text-green-600' :
                          notif.type === 'badge' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {notif.type === 'unlock' && <BookOpen size={20} />}
                          {notif.type === 'level' && <Upload size={20} />}
                          {notif.type === 'sync' && <Check size={20} />}
                          {notif.type === 'badge' && <Check size={20} />}
                          {notif.type === 'reminder' && <Bell size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-base font-black tracking-tight ${notif.read ? 'text-gray-600' : 'text-gray-800'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] font-black text-gray-300 uppercase whitespace-nowrap">{notif.time}</span>
                          </div>
                          <p className="text-[13px] font-medium text-gray-400 leading-relaxed">
                            {notif.summary}
                          </p>
                          {!notif.read && (
                            <div className="mt-3 flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">未讀訊息</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-10" />
              </div>

              <div className="p-8 bg-white border-t border-gray-100 bottom-0 z-20">
                 <button 
                  onClick={() => setIsNotificationsModalOpen(false)}
                  className="w-full py-5 bg-gray-900 text-white rounded-[32px] font-black tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-transform"
                 >
                  我知道了
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileScreen;
