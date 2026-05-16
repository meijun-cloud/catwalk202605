import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Edit2, Send } from 'lucide-react';
import { CAT_COLORS, CAT_POSES, ENVIRONMENTS, CAT_COUNTS } from '../constants';
import { motion } from 'motion/react';

const ConfirmReportScreen: React.FC = () => {
  const { reportDraft, navigateTo, submitReport } = useApp();

  const color = CAT_COLORS.find(c => c.key === reportDraft?.colorKey);
  const pose = CAT_POSES.find(p => p.key === reportDraft?.poseKey);
  const environment = ENVIRONMENTS.find(e => e.key === reportDraft?.environmentKey);
  const count = CAT_COUNTS.find(c => c.key === reportDraft?.catCount);

  const SummaryItem = ({ icon, label, value, onEdit }: { icon: string, label: string, value: string, onEdit: () => void }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-xl shadow-inner border border-gray-100">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{label}</span>
          <span className="text-lg font-black text-gray-800">{value}</span>
        </div>
      </div>
      <button 
        onClick={onEdit}
        className="flex items-center gap-1.5 px-4 py-2 bg-gray-50/50 hover:bg-gray-100 rounded-full transition-colors group"
      >
        <Edit2 size={12} className="text-gray-400 group-hover:text-blue-500" />
        <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500">編輯</span>
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] font-sans relative overflow-hidden">
      {/* Background Illustration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="https://catwalk-v2.vercel.app/assets/report-flow/catwalk_report_flow_bg_city_street_3.jpg" 
          className="w-full h-full object-cover" 
          alt="Background" 
        />
        {/* Bottom Soft White Misty Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white via-white/60 to-transparent opacity-80" />
        {/* Edge blurring for softness */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      </div>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto z-10 no-scrollbar pb-56">
        {/* Header - Moved inside scrollable area */}
        <header className="px-6 pt-12 pb-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateTo('Environment')} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-800 transition-transform active:scale-90">
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">回報流程</span>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-8 h-1.5 bg-blue-500 rounded-full" />
                <div className="w-8 h-1.5 bg-blue-500 rounded-full" />
                <div className="w-8 h-1.5 bg-blue-500 rounded-full" />
                <div className="w-8 h-1.5 bg-gray-200 rounded-full" />
                <span className="text-xs font-black text-gray-400 ml-2">3 / 4</span>
              </div>
            </div>
            <div className="w-10" />
          </div>
          <h1 className="text-[32px] font-black text-gray-800 text-center tracking-tighter leading-none">確認回報內容✨</h1>
          <p className="text-sm text-gray-400 text-center mt-2 px-10 leading-relaxed">
            請確認以下資訊是否正確，送出後將幫助大家找到更多療癒的貓咪！
          </p>
        </header>

        <div className="px-5 space-y-6">
          {/* Main Card */}
          <section className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
            {/* Photo */}
            <div className="relative w-full aspect-video border-b border-gray-50">
              <img src={reportDraft?.photo} className="w-full h-full object-cover" alt="Report" />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-bold flex items-center gap-2">
                <span className="text-xs">📸</span>
                回報照片
              </div>
            </div>

          {/* Details */}
          <div className="p-6 space-y-2 divide-y divide-gray-50">
            <SummaryItem 
              icon="🐈" 
              label="花色" 
              value={color?.label || '未選擇'} 
              onEdit={() => navigateTo('CatSelect')} 
            />
            <SummaryItem 
              icon="✨" 
              label="姿勢" 
              value={pose?.label || '未選擇'} 
              onEdit={() => navigateTo('CatSelect')} 
            />
            <SummaryItem 
              icon="🏘️" 
              label="環境" 
              value={environment?.label || '未選擇'} 
              onEdit={() => navigateTo('Environment')} 
            />
            <SummaryItem 
              icon="🐾" 
              label="數量" 
              value={count?.label || '未選擇'} 
              onEdit={() => navigateTo('Environment')} 
            />
          </div>
        </section>

        {/* Footnote */}
        <div className="bg-blue-50/50 p-4 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm flex-shrink-0">
            <img src="https://catwalk-v2.vercel.app/assets/report-flow/catwalk_report_flow_bg_city_street_4_avatars.jpg" className="w-full h-full object-cover" alt="" />
          </div>
          <p className="text-xs text-blue-600 font-medium leading-relaxed">
            感謝你的回報！你的每一次分享，<br />都讓這座城市對貓咪更友善 🐾
          </p>
        </div>
        </div>
      </main>

      {/* Primary Action */}
      <footer className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white/90 to-transparent z-40 flex flex-col gap-3">
        <button 
          onClick={submitReport}
          className="w-full h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center gap-3 text-white font-black text-xl shadow-2xl shadow-blue-500/40 transition-transform active:scale-95"
        >
          <Send size={24} strokeWidth={3} />
          <span>送出回報</span>
          <span className="text-xl">✨</span>
        </button>
        <button 
          onClick={() => navigateTo('Environment')}
          className="w-full h-14 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center gap-2 text-gray-400 font-bold transition-colors"
        >
          <ChevronLeft size={20} />
          <span>返回上一步</span>
        </button>
      </footer>
    </div>
  );
};

export default ConfirmReportScreen;
