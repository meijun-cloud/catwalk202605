'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { ENVIRONMENTS, CAT_COUNTS, ENV_EMOJI } from '../constants';

const EnvironmentScreen: React.FC = () => {
  const { reportDraft, updateDraft, navigateTo } = useApp();
  const canContinue = !!reportDraft?.environmentKey && !!reportDraft?.catCount;

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] font-sans relative overflow-hidden">
      <main className="flex-1 overflow-y-auto z-10 pb-32" style={{ scrollbarWidth: 'none' }}>
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateTo('CatSelect')} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">回報流程</span>
              <div className="flex items-center gap-1 mt-1">
                {[true, true, false, false].map((active, i) => (
                  <div key={i} className={`w-8 h-1.5 rounded-full ${active ? 'bg-blue-500' : 'bg-gray-200'}`} />
                ))}
                <span className="text-xs font-black text-gray-400 ml-2">2 / 4</span>
              </div>
            </div>
            <div className="w-10" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 text-center tracking-tight">環境標注🐾</h1>
          <p className="text-sm text-gray-400 text-center mt-2 px-8 leading-relaxed">
            你的標注會讓貓熱點地圖更準確，<br />幫助其他玩家找到貓。
          </p>
        </header>

        <div className="px-5 space-y-5">
          {/* 照片縮圖 */}
          <section className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-xl border-2 border-white bg-gray-100">
            {reportDraft?.photo && <img src={reportDraft.photo} className="w-full h-full object-cover" alt="" />}
            <div className="absolute bottom-2 left-3 px-2 py-0.5 bg-white/40 backdrop-blur-md rounded-full text-white text-[8px] font-bold">已選擇的照片</div>
          </section>

          {/* A: 環境 */}
          <section className="bg-white/80 backdrop-blur-xl p-5 rounded-[28px] shadow-xl border border-white/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-bold text-gray-800">A 請選擇環境 <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">必填</span></h2>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {ENVIRONMENTS.map(env => (
                <button key={env.key} onClick={() => updateDraft({ environmentKey: env.key })}
                  className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all relative ${reportDraft?.environmentKey === env.key ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${reportDraft?.environmentKey === env.key ? 'scale-110' : ''}`}>
                    {ENV_EMOJI[env.key] ?? '📍'}
                  </div>
                  <span className={`text-[9px] font-bold text-center leading-tight ${reportDraft?.environmentKey === env.key ? 'text-blue-600' : 'text-gray-500'}`}>{env.label}</span>
                  {reportDraft?.environmentKey === env.key && (
                    <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                      <Check size={6} className="text-white" strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* B: 數量 */}
          <section className="bg-white/80 backdrop-blur-xl p-5 rounded-[28px] shadow-xl border border-white/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-bold text-gray-800">B 請選擇數量 <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">必填</span></h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {CAT_COUNTS.map(count => (
                <button key={count.key} onClick={() => updateDraft({ catCount: count.key })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all relative border-2 ${reportDraft?.catCount === count.key ? 'bg-blue-50 border-blue-200' : 'bg-gray-50/50 border-transparent'}`}>
                  <div className="text-2xl">
                    {count.key === 'one' ? '🐱' : count.key === 'two_three' ? '🐱🐱' : '🐱🐱🐱'}
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
          <p className="text-[10px] text-center text-gray-400">ℹ️ 兩項皆為必填，完成後才能進入下一步</p>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-white via-white/90 to-transparent z-40 flex gap-4">
        <button onClick={() => navigateTo('CatSelect')} className="flex-1 h-14 rounded-full border border-gray-100 bg-white shadow-xl flex items-center justify-center text-gray-400 font-bold">
          上一步
        </button>
        <button disabled={!canContinue} onClick={() => navigateTo('ConfirmReport')}
          className={`flex-[2] h-14 rounded-full flex items-center justify-center gap-2 text-white font-black text-lg shadow-2xl ${canContinue ? 'bg-blue-500 shadow-blue-500/30' : 'bg-gray-300 pointer-events-none'}`}>
          <span>下一步</span><ChevronRight size={20} strokeWidth={3} />
        </button>
      </footer>
    </div>
  );
};

export default EnvironmentScreen;
