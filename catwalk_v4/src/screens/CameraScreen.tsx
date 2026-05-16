'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Camera, MapPin } from 'lucide-react';

const CameraScreen: React.FC = () => {
  const { startNewReport, navigateTo } = useApp();
  const [preview, setPreview] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'waiting' | 'got' | 'denied'>('waiting');
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const gpsRef = useRef<{ lat: number; lng: number } | null>(null);

  // 進入相機頁就嘗試取得 GPS（不擋拍照）
  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus('denied'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        gpsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGpsStatus('got');
      },
      err => {
        console.warn('GPS error:', err.code, err.message);
        setGpsStatus('denied');
      },
      { timeout: 10000, enableHighAccuracy: false, maximumAge: 30000 }
    );
  }, []);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    fileRef.current = file;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleUse = async () => {
    if (!fileRef.current) return;
    // 轉 base64 確保手機不失效
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      startNewReport(dataUrl, gpsRef.current?.lat, gpsRef.current?.lng);
    };
    reader.readAsDataURL(fileRef.current);
  };

  return (
    <div className="absolute inset-0 bg-black z-[100] flex flex-col font-sans">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
      />

      {/* 預覽區 */}
      <div className="relative flex-1 overflow-hidden flex items-center justify-center bg-gray-900 rounded-b-[40px]">
        {preview ? (
          <img src={preview} className="w-full h-full object-cover" alt="Preview" />
        ) : (
          <div className="flex flex-col items-center gap-6 text-white opacity-50">
            <Camera size={64} />
            <p className="text-sm font-bold">點擊下方按鈕開啟相機</p>
          </div>
        )}

        {/* 關閉 */}
        <button
          onClick={() => navigateTo('Map')}
          className="absolute top-12 left-6 p-2 bg-black/30 backdrop-blur-md rounded-full text-white"
        >
          <X size={24} />
        </button>

        {/* GPS 狀態提示（不擋拍照） */}
        <div className={`absolute top-12 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${
          gpsStatus === 'got' ? 'bg-emerald-500/80 text-white' :
          gpsStatus === 'denied' ? 'bg-red-500/80 text-white' :
          'bg-white/20 text-white'
        }`}>
          <MapPin size={10} />
          {gpsStatus === 'got' ? 'GPS 已定位' : gpsStatus === 'denied' ? 'GPS 未開啟' : 'GPS 定位中...'}
        </div>
      </div>

      {/* 操作區 */}
      <div className="h-56 bg-black flex flex-col items-center justify-center px-10 gap-5">
        {!preview ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform"
          >
            <div className="w-16 h-16 bg-white rounded-full border-2 border-black" />
          </button>
        ) : (
          <div className="flex flex-col w-full gap-4">
            {gpsStatus === 'denied' && (
              <p className="text-[11px] text-yellow-400 text-center font-bold">
                ⚠️ 未取得定位，回報將使用預設座標
              </p>
            )}
            <button
              onClick={handleUse}
              className="w-full h-16 bg-blue-500 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-lg shadow-xl active:scale-95"
            >
              <Camera size={22} /> 使用這張照片
            </button>
            <button
              onClick={() => { setPreview(null); fileRef.current = null; inputRef.current?.click(); }}
              className="w-full h-12 bg-white/10 rounded-2xl text-white/70 font-bold"
            >
              重新拍攝
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraScreen;
