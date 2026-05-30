import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Check, Camera, Image as ImageIcon, X } from 'lucide-react';
import { CAT_COLORS, CAT_POSES } from '../constants';
import { motion } from 'motion/react';

const CatSelectScreen: React.FC = () => {
  const { reportDraft, updateDraft, navigateTo } = useApp();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showPoseOtherModal, setShowPoseOtherModal] = useState(false);
  const [poseOtherInput, setPoseOtherInput] = useState(reportDraft?.poseNote ?? '');

  const canContinue = !!reportDraft?.colorKey && !!reportDraft?.poseKey;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateDraft({ 
          photo: reader.result as string,
          colorKey: '',
          poseKey: ''
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePoseOtherConfirm = () => {
    if (poseOtherInput.trim()) {
      updateDraft({ poseKey: 'other', poseNote: poseOtherInput.trim() });
    }
    setShowPoseOtherModal(false);
  };

  const handlePoseOtherOpen = () => {
    setPoseOtherInput(reportDraft?.poseNote ?? '');
    setShowPoseOtherModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] font-sans relative overflow-hidden">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* "其他姿勢" Modal */}
      {showPoseOtherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-gray-800">其他姿勢</h3>
              <button onClick={() => setShowPoseOtherModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={14} className="text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">請用文字描述你觀察到的貓咪姿勢</p>
            <input
              autoFocus
              type="text"
              value={poseOtherInput}
              onChange={e => setPoseOtherInput(e.target.value)}
              placeholder="例如：趴著伸懶腰"
              maxLength={30}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowPoseOtherModal(false)}
                className="flex-1 h-12 rounded-full border border-gray-200 bg-white text-gray-400 font-bold text-sm"
              >
                取消
              </button>
              <button
                onClick={handlePoseOtherConfirm}
                disabled={!poseOtherInput.trim()}
                className={`flex-[2] h-12 rounded-full font-black text-sm text-white transition-all ${poseOtherInput.trim() ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Illustration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="https://catwalk-v2.vercel.app/assets/report-flow/catwalk_report_flow_bg_city_street_2.jpg" 
          className="w-full h-full object-cover" 
          alt="Background" 
        />
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white via-white/60 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      </div>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto z-10 no-scrollbar pb-48">
        {/* Header */}
        <header className="px-6 pt-12 pb-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateTo('Map')} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-800 transition-transform active:scale-90">
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">回報流程</span>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-8 h-1.5 bg-blue-500 rounded-full" />
                <div className="w-8 h-1.5 bg-gray-200 rounded-full" />
                <div className="w-8 h-1.5 bg-gray-200 rounded-full" />
                <div className="w-8 h-1.5 bg-gray-200 rounded-full" />
                <span className="text-xs font-black text-gray-400 ml-2">1 / 4</span>
              </div>
            </div>
            <div className="w-10" />
          </div>
          <h1 className="text-[32px] font-black text-gray-800 text-center tracking-tighter leading-none">選擇花色與姿勢✨</h1>
          <p className="text-sm text-gray-400 text-center mt-1">請依照照片選擇最接近的選項</p>
        </header>

        <div className="px-5 space-y-6">
          {/* Photo Preview */}
          <section className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
            <img 
              src={reportDraft?.photo || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600'} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              alt="Preview" 
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-bold tracking-widest uppercase">照片預覽</div>
            
            <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
              <button 
                onClick={() => {
                  updateDraft({ colorKey: '', poseKey: '' });
                  navigateTo('MockCamera');
                }}
                className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-blue-500 transition-all hover:scale-110 active:scale-95 group-hover:ring-4 ring-blue-500/20"
                title="重新拍攝"
              >
                <Camera size={20} />
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-indigo-500 transition-all hover:scale-110 active:scale-95 group-hover:ring-4 ring-indigo-500/20"
                title="從相簿選取"
              >
                <ImageIcon size={20} />
              </button>
            </div>
            
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-white/50 text-[10px] font-black text-blue-500 flex items-center gap-1">
                <Camera size={10} /> 重新拍攝
              </div>
              <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-white/50 text-[10px] font-black text-indigo-500 flex items-center gap-1">
                <ImageIcon size={10} /> 從相簿選取
              </div>
            </div>
            
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </section>

          {/* Section A: Colors */}
          <section className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-bold text-gray-800">A 請選擇花色 <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">必填</span></h2>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {CAT_COLORS.map(color => (
                <button
                  key={color.key}
                  onClick={() => updateDraft({ colorKey: color.key })}
                  className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-300 relative ${reportDraft?.colorKey === color.key ? 'bg-blue-50 shadow-inner' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 ${reportDraft?.colorKey === color.key ? 'scale-110' : ''}`}>
                    <img
                      src={`https://catwalk-v2.vercel.app/assets/collection-page/${
                        color.key === 'black_white' ? 'black-white/black_white_sit-idle' :
                        color.key === 'orange' ? 'orange/orange_sit-idle' :
                        color.key === 'white' ? 'white/white_sit-idle' :
                        color.key === 'gray' ? 'gray/gray_sit-idle' :
                        color.key === 'black' ? 'black/black_sit-idle' :
                        color.key === 'calico' ? 'calico/calico_sit-idle' :
                        color.key === 'tortoiseshell' ? 'tortoiseshell/tortoiseshell_sit-idle' :
                        color.key === 'tabby' ? 'tabby/tabby_sit-idle' :
                        color.key === 'siamese' ? 'siamese/siamese_sit-idle' :
                        color.key === 'white_tabby' ? 'tabby-white/white_tabby_sit-idle' :
                        color.key === 'orange_white' ? 'orange-white/orange_white_sit-idle' :
                        'brown-white/brown_white_sit-idle'
                      }.jpg`}
                      alt={color.label}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                    />
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

          {/* Section B: Poses */}
          <section className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] shadow-xl border border-white/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <h2 className="text-sm font-bold text-gray-800">B 請選擇姿勢 <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">必填</span></h2>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {CAT_POSES.map(pose => (
                <button
                  key={pose.key}
                  onClick={() => updateDraft({ poseKey: pose.key, poseNote: undefined })}
                  className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-300 relative ${reportDraft?.poseKey === pose.key ? 'bg-blue-50 shadow-inner' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 ${reportDraft?.poseKey === pose.key ? 'scale-110' : ''}`}>
                    {pose.key === 'basking' && '☀️'}
                    {pose.key === 'curled_sleep' && '🌙'}
                    {pose.key === 'walking' && '🐾'}
                    {pose.key === 'grooming' && '🛁'}
                    {pose.key === 'alert_standing' && '👂'}
                    {pose.key === 'sitting' && '🛋️'}
                    {pose.key === 'eating' && '🍱'}
                  </div>
                  <span className={`text-[10px] font-bold text-center ${reportDraft?.poseKey === pose.key ? 'text-blue-600' : 'text-gray-500'}`}>{pose.label}</span>
                  {reportDraft?.poseKey === pose.key && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                      <Check size={8} className="text-white" strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}

              {/* 其他 button */}
              <button
                onClick={handlePoseOtherOpen}
                className={`flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-300 relative ${reportDraft?.poseKey === 'other' ? 'bg-blue-50 shadow-inner' : 'hover:bg-gray-50'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 bg-gray-100 ${reportDraft?.poseKey === 'other' ? 'scale-110' : ''}`}>
                  ✏️
                </div>
                <span className={`text-[10px] font-bold text-center ${reportDraft?.poseKey === 'other' ? 'text-blue-600' : 'text-gray-500'}`}>
                  {reportDraft?.poseKey === 'other' && reportDraft?.poseNote
                    ? reportDraft.poseNote.length > 4 ? reportDraft.poseNote.slice(0, 4) + '…' : reportDraft.poseNote
                    : '其他'}
                </span>
                {reportDraft?.poseKey === 'other' && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                    <Check size={8} className="text-white" strokeWidth={4} />
                  </div>
                )}
              </button>
            </div>
          </section>

          <p className="text-[11px] text-center text-gray-600 font-bold">ℹ️ 兩項皆為必填，完成後才能進入下一步</p>
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white/90 to-transparent z-40 flex gap-4">
        <button 
          onClick={() => navigateTo('Map')}
          className="flex-1 h-14 rounded-full border border-gray-100 bg-white shadow-xl flex items-center justify-center gap-2 text-gray-400 font-bold"
        >
          <ChevronLeft size={20} />
          <span>上一步</span>
        </button>
        <button 
          disabled={!canContinue}
          onClick={() => navigateTo('Environment')}
          className={`flex-[2] h-14 rounded-full flex items-center justify-center gap-2 text-white font-black text-lg transition-all duration-300 shadow-2xl ${canContinue ? 'bg-blue-500 shadow-blue-500/30' : 'bg-gray-300 shadow-none grayscale pointer-events-none'}`}
        >
          <span>下一步</span>
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      </footer>
    </div>
  );
};

export default CatSelectScreen;
