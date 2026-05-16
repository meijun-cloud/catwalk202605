'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Edit2, Send } from 'lucide-react';
import { CAT_COLORS, CAT_POSES, ENVIRONMENTS, CAT_COUNTS, COLOR_EMOJI, POSE_EMOJI, ENV_EMOJI } from '../constants';

const ConfirmReportScreen: React.FC = () => {
  const { reportDraft, navigateTo, submitReport, isLoading } = useApp();

  const color = CAT_COLORS.find(c => c.key === reportDraft?.colorKey);
  const pose = CAT_POSES.find(p => p.key === reportDraft?.poseKey);
  const environment = ENVIRONMENTS.find(e => e.key === reportDraft?.environmentKey);
  const count = CAT_COUNTS.find(c => c.key === reportDraft?.catCount);

  const SummaryItem = ({ icon, label, value, onEdit }: { icon: string; label: string; value: string; onEdit: () => void }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-xl shadow-inner border border-gray-100">{icon}</div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{label}</span>
          <span className="text-lg font-black text-gray-800">{value}</span>
        </div>
      </div>
      <button onClick={onEdit} className="flex items-center gap-1.5 px-4 py-2 bg-gray-50/50 hover:bg-gray-100 rounded-full group">
        <Edit2 size={12} className="text-gray-400 group-hover:text-blue-500" />
        <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500">編輯</span>
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] font-sans relative overflow-hidden">
      <main className="flex-1 overflow-y-auto z-10 pb-40" style={{ scrollbarWidth: 'none' }}>
        <header className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateTo('Environment')} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">回報流程</span>
              <div className="flex items-center gap-1 mt-1">
                {[true, true, true, false].map((active, i) => (
                  <div key={i} className={`w-8 h-1.5 rounded-full ${active ? 'bg-blue-500' : 'bg-gray-200'}`} />
                ))}
                <span className="text-xs font-black text-gray-400 ml-2">3 / 4</span>
              </div>
            </div>
            <div className="w-10" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 text-center">確認回報內容✨</h1>
          <p className="text-sm text-gray-400 text-center mt-2 px-10 leading-relaxed">
            請確認以下資訊是否正確，送出後將幫助大家找到更多療癒的貓咪！
          </p>
        </header>

        <div className="px-5 space-y-5">
          <section className="bg-white rounded-[36px] shadow-2xl overflow-hidden border border-gray-100">
            <div className="relative w-full aspect-video bg-gray-100">
              {reportDraft?.photo && <img src={reportDraft.photo} className="w-full h-full object-cover" alt="" />}
              <div className="absolute top-3 left-3 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-bold flex items-center gap-1.5">
                <span>📸</span> 回報照片
              </div>
            </div>
            <div className="p-5 space-y-1 divide-y divide-gray-50">
              <SummaryItem icon={COLOR_EMOJI[reportDraft?.colorKey ?? ''] ?? '🐱'} label="花色" value={color?.label ?? '未選擇'} onEdit={() => navigateTo('CatSelect')} />
              <SummaryItem icon={POSE_EMOJI[reportDraft?.poseKey ?? ''] ?? '✨'} label="姿勢" value={pose?.label ?? '未選擇'} onEdit={() => navigateTo('CatSelect')} />
              <SummaryItem icon={ENV_EMOJI[reportDraft?.environmentKey ?? ''] ?? '🏘️'} label="環境" value={environment?.label ?? '未選擇'} onEdit={() => navigateTo('Environment')} />
              <SummaryItem icon="🐾" label="數量" value={count?.label ?? '未選擇'} onEdit={() => navigateTo('Environment')} />
            </div>
          </section>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-white via-white/90 to-transparent z-40 flex flex-col gap-3">
        <button
          onClick={submitReport}
          disabled={isLoading}
          className="w-full h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center gap-3 text-white font-black text-xl shadow-2xl shadow-blue-500/40 transition-transform active:scale-95 disabled:opacity-60"
        >
          <Send size={22} strokeWidth={3} />
          <span>{isLoading ? '送出中...' : '送出回報'}</span>
          <span>✨</span>
        </button>
        <button onClick={() => navigateTo('Environment')} className="w-full h-12 bg-gray-50 rounded-full flex items-center justify-center gap-2 text-gray-400 font-bold">
          <ChevronLeft size={18} /> 返回上一步
        </button>
      </footer>
    </div>
  );
};

export default ConfirmReportScreen;
