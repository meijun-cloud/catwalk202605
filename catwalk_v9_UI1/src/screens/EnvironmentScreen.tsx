import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { ENVIRONMENTS, CAT_COUNTS } from '../constants';
import { motion } from 'motion/react';

const EnvironmentScreen: React.FC = () => {
  const { reportDraft, updateDraft, navigateTo } = useApp();

  const canContinue = !!reportDraft?.environmentKey && !!reportDraft?.catCount;

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] font-sans relative overflow-hidden">
      {/* Background Illustration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="https://catwalk-v2.vercel.app/assets/report-flow/catwalk_report_flow_bg_city_street_1.jpg" 
          className="w-full h-full object-cover" 
          alt="Background" 
        />
        {/* Bottom Soft White Misty Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white via-white/60 to-transparent opacity-80" />
        {/* Edge blurring for softness */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      </div>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto z-10 no-scrollbar pb-48">
        {/* Header - Moved inside scrollable area */}
        <header className="px-6 pt-12 pb-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateTo('CatSelect')} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-800 transition-transform active:scale-90">
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">回報流程</span>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-8 h-1.5 bg-blue-500 rounded-full" />
                <div className="w-8 h-1.5 bg-blue-500 rounded-full" />
                <div className="w-8 h-1.5 bg-gray-200 rounded-full" />
                <div className="w-8 h-1.5 bg-gray-200 rounded-full" />
                <span className="text-xs font-black text-gray-400 ml-2">2 / 4</span>
              </div>
            </div>
            <div className="w-10" />
          </div>
          <h1 className="text-[32px] font-black text-gray-800 text-center tracking-tighter leading-none">環境標注🐾</h1>
          <p className="text-sm text-gray-400 text-center mt-2 px-10 leading-relaxed">
            你的標注會讓貓熱點地圖更準確，<br />幫助其他玩家找到貓。
          </p>
        </header>

        <div className="px-5 space-y-6">
          {/* Photo Mini Preview */}
          <section className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-xl border-2 border-white">
            <img src={reportDraft?.photo} className="w-full h-full object-cover" alt="Preview" />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-2 left-4 px-2 py-0.5 bg-white/40 backdrop-blur-md rounded-full text-white text-[8px] font-bold uppercase">已選擇的照片</div>
          </section>

        {/* Section A: Environment */}
        <section className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <h2 className="text-sm font-bold text-gray-800">A 請選擇環境 <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">必填</span></h2>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {ENVIRONMENTS.map(env => (
              <button
                key={env.key}
                onClick={() => updateDraft({ environmentKey: env.key })}
                className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all duration-300 relative ${reportDraft?.environmentKey === env.key ? 'bg-blue-50 shadow-inner' : 'hover:bg-gray-50'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-300 ${reportDraft?.environmentKey === env.key ? 'scale-110' : ''}`}>
                  {env.key === 'alley' && '🏘️'}
                  {env.key === 'parking' && '🚗'}
                  {env.key === 'park' && '🌳'}
                  {env.key === 'mountain' && '⛰️'}
                  {env.key === 'temple' && '⛩️'}
                  {env.key === 'arcade' && '🏛️'}
                  {env.key === 'market' && '🥬'}
                  {env.key === 'wall' && '🧱'}
                  {env.key === 'shop' && '🏪'}
                  {env.key === 'station' && '🚉'}
                </div>
                <span className={`text-[9px] font-bold text-center leading-tight h-5 flex items-center ${reportDraft?.environmentKey === env.key ? 'text-blue-600' : 'text-gray-500'}`}>{env.label}</span>
                {reportDraft?.environmentKey === env.key && (
                  <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center border border-white shadow-sm">
                    <Check size={6} className="text-white" strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Section B: Cat Count */}
        <section className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <h2 className="text-sm font-bold text-gray-800">B 請選擇數量 <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">必填</span></h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {CAT_COUNTS.map(count => (
              <button
                key={count.key}
                onClick={() => updateDraft({ catCount: count.key })}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 relative border-2 ${reportDraft?.catCount === count.key ? 'bg-blue-50 border-blue-200' : 'bg-gray-50/50 border-transparent'}`}
              >
                <div className="text-2xl">
                  {count.key === 'one' && '🐱'}
                  {count.key === 'two_three' && '🐱🐱'}
                  {count.key === 'four_plus' && '🐱🐱🐱'}
                </div>
                <span className={`text-xs font-bold ${reportDraft?.catCount === count.key ? 'text-blue-600' : 'text-gray-500'}`}>{count.label}</span>
                {reportDraft?.catCount === count.key && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <Check size={10} className="text-white" strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        <p className="text-[11px] text-center text-gray-700 font-bold">ℹ️ 兩項皆為必填，完成後才能進入下一步</p>
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white/90 to-transparent z-40 flex gap-4">
        <button 
          onClick={() => navigateTo('CatSelect')}
          className="flex-1 h-14 rounded-full border border-gray-100 bg-white shadow-xl flex items-center justify-center gap-2 text-gray-400 font-bold"
        >
          <span>上一步</span>
        </button>
        <button 
          disabled={!canContinue}
          onClick={() => navigateTo('ConfirmReport')}
          className={`flex-[2] h-14 rounded-full flex items-center justify-center gap-2 text-white font-black text-lg transition-all duration-300 shadow-2xl ${canContinue ? 'bg-blue-500 shadow-blue-500/30' : 'bg-gray-300 shadow-none grayscale pointer-events-none'}`}
        >
          <span>下一步</span>
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      </footer>
    </div>
  );
};

export default EnvironmentScreen;
