'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { CAT_COLORS, CAT_POSES, COLOR_EMOJI, POSE_EMOJI } from '../constants';

const CatSelectScreen: React.FC = () => {
  const { reportDraft, updateDraft, navigateTo } = useApp();
  const canContinue = !!reportDraft?.colorKey && !!reportDraft?.poseKey;

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] font-sans relative overflow-hidden">
      <main className="flex-1 overflow-y-auto z-10 pb-32" style={{ scrollbarWidth: 'none' }}>
        {/* Header */}
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateTo('Map')} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-800 transition-transform active:scale-90">
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">回報流程</span>
              <div className="flex items-center gap-1 mt-1">
                {[true, false, false, false].map((active, i) => (
                  <div key={i} className={`w-8 h-1.5 rounded-full ${active ? 'bg-blue-500' : 'bg-gray-200'}`} />
                ))}
                <span className="text-xs font-black text-gray-400 ml-2">1 / 4</span>
              </div>
            </div>
            <div className="w-10" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 text-center tracking-tight">選擇花色與姿勢✨</h1>
          <p className="text-sm text-gray-400 text-center mt-1">請依照照片選擇最接近的選項</p>
        </header>

        <div className="px-5 space-y-5">
          {/* 照片預覽 */}
          <section className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
            {reportDraft?.photo && <img src={reportDraft.photo} className="w-full h-full object-cover" alt="Preview" />}
            <div className="absolute top-3 left-3 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-bold">照片預覽</div>
          </section>

          {/* A: 花色 */}
          <section className="bg-white/80 backdrop-blur-xl p-5 rounded-[28px] shadow-xl border border-white/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-bold text-gray-800">A 請選擇花色 <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">必填</span></h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {CAT_COLORS.map(color => (
                <button key={color.key} onClick={() => updateDraft({ colorKey: color.key })}
                  className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all relative ${reportDraft?.colorKey === color.key ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform ${reportDraft?.colorKey === color.key ? 'scale-110' : ''}`}>
                    {COLOR_EMOJI[color.key] ?? '🐱'}
                  </div>
                  <span className={`text-[10px] font-bold text-center ${reportDraft?.colorKey === color.key ? 'text-blue-600' : 'text-gray-500'}`}>{color.label}</span>
                  {reportDraft?.colorKey === color.key && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                      <Check size={8} className="text-white" strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* B: 姿勢 */}
          <section className="bg-white/80 backdrop-blur-xl p-5 rounded-[28px] shadow-xl border border-white/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-bold text-gray-800">B 請選擇姿勢 <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">必填</span></h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {CAT_POSES.map(pose => (
                <button key={pose.key} onClick={() => updateDraft({ poseKey: pose.key })}
                  className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all relative ${reportDraft?.poseKey === pose.key ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${reportDraft?.poseKey === pose.key ? 'scale-110' : ''}`}>
                    {POSE_EMOJI[pose.key] ?? '🐾'}
                  </div>
                  <span className={`text-[10px] font-bold text-center ${reportDraft?.poseKey === pose.key ? 'text-blue-600' : 'text-gray-500'}`}>{pose.label}</span>
                  {reportDraft?.poseKey === pose.key && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                      <Check size={8} className="text-white" strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
          <p className="text-[10px] text-center text-gray-400">ℹ️ 兩項皆為必填，完成後才能進入下一步</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-white via-white/90 to-transparent z-40 flex gap-4">
        <button onClick={() => navigateTo('Map')} className="flex-1 h-14 rounded-full border border-gray-100 bg-white shadow-xl flex items-center justify-center gap-2 text-gray-400 font-bold">
          <ChevronLeft size={20} /><span>上一步</span>
        </button>
        <button disabled={!canContinue} onClick={() => navigateTo('Environment')}
          className={`flex-[2] h-14 rounded-full flex items-center justify-center gap-2 text-white font-black text-lg shadow-2xl transition-all ${canContinue ? 'bg-blue-500 shadow-blue-500/30' : 'bg-gray-300 pointer-events-none'}`}>
          <span>下一步</span><ChevronRight size={20} strokeWidth={3} />
        </button>
      </footer>
    </div>
  );
};

export default CatSelectScreen;
