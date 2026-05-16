'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Camera, MapPin, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

// 壓縮圖片
async function compressImage(file: File, maxWidth = 1280, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const MockCameraScreen: React.FC = () => {
  const { startNewReport, navigateTo } = useApp();
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedData, setCompressedData] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'waiting' | 'got' | 'denied'>('waiting');
  const [isCompressing, setIsCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const gpsRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus('denied'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => { gpsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setGpsStatus('got'); },
      () => setGpsStatus('denied'),
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 30000 }
    );
  }, []);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setCompressedData(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => setCompressedData(e.target?.result as string);
      reader.readAsDataURL(file);
    } finally { setIsCompressing(false); }
  };

  const handleUse = () => {
    if (!compressedData) return;
    startNewReport(compressedData, gpsRef.current?.lat, gpsRef.current?.lng);
  };

  return (
    <div className="absolute inset-0 bg-black z-[100] flex flex-col font-sans">
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />

      <div className="relative flex-1 bg-gray-900 overflow-hidden flex items-center justify-center rounded-b-[40px] shadow-2xl">
        {preview ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full relative">
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-white opacity-50">
            <Camera size={64} />
            <p className="text-sm font-bold">點擊下方按鈕開啟相機</p>
          </div>
        )}

        <div className="absolute top-12 left-0 w-full px-6 flex justify-between items-center text-white z-10">
          <button onClick={() => navigateTo('Map')} className="p-2 bg-black/20 backdrop-blur-md rounded-full"><X size={24} /></button>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${gpsStatus === 'got' ? 'bg-emerald-500/80' : gpsStatus === 'denied' ? 'bg-red-500/80' : 'bg-white/20'}`}>
            <MapPin size={10} />
            {gpsStatus === 'got' ? 'GPS 已定位' : gpsStatus === 'denied' ? 'GPS 未開啟' : 'GPS 定位中...'}
          </div>
          <div className="w-10" />
        </div>
        {isCompressing && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-4 py-2 rounded-full">壓縮照片中...</div>
        )}
      </div>

      <div className="h-56 bg-black flex flex-col items-center justify-center px-10 gap-5">
        {!preview ? (
          <button onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90">
            <div className="w-16 h-16 bg-white rounded-full border-2 border-black" />
          </button>
        ) : (
          <div className="flex flex-col w-full gap-4">
            {gpsStatus === 'denied' && <p className="text-[11px] text-yellow-400 text-center font-bold">⚠️ 未取得定位，回報將使用預設座標</p>}
            <button onClick={handleUse} disabled={isCompressing || !compressedData}
              className="w-full h-16 bg-blue-500 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-lg shadow-xl active:scale-95 disabled:opacity-50">
              <Camera size={22} />{isCompressing ? '處理照片中...' : '使用這張照片'}
            </button>
            <button onClick={() => { setPreview(null); setCompressedData(null); inputRef.current?.click(); }}
              className="w-full h-12 bg-white/10 rounded-2xl text-white/70 font-bold flex items-center justify-center gap-2">
              <RefreshCcw size={16} /> 重新拍攝
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockCameraScreen;
