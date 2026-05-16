'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, MapPin, X, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { CAT_COLORS, CAT_POSES } from '../constants';
import RarityBadge from '../components/RarityBadge';

// ================================================================
// 地圖風格替換點 — 換地圖只需改這一行 URL
// alidade_bright / alidade_smooth / stamen_watercolor / osm_bright
// ================================================================
const MAP_STYLE_URL = 'https://tiles.stadiamaps.com/styles/alidade_bright.json';

const MapScreen: React.FC = () => {
  const { user, reports, navigateTo, setHighlightedDexEntry } = useApp();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const yellowMarkersRef = useRef<any[]>([]);

  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [isHintExpanded, setIsHintExpanded] = useState(false);
  const [gpsGranted, setGpsGranted] = useState(false);

  // 初始化地圖（含 CSS 動態載入）
  useEffect(() => {
    // 插入 MapLibre CSS
    if (!document.getElementById('maplibre-css')) {
      const link = document.createElement('link');
      link.id = 'maplibre-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@4.5.2/dist/maplibre-gl.css';
      document.head.appendChild(link);
    }

    if (mapRef.current || !mapContainer.current) return;

    const init = async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      if (!mapContainer.current || mapRef.current) return;

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: MAP_STYLE_URL,
        center: [121.5170, 25.0478],
        zoom: 15,
        attributionControl: false,
      });
      mapRef.current = map;

      map.on('load', () => {
        // GPS 定位
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => {
              const { latitude, longitude } = pos.coords;
              setGpsGranted(true);
              map.flyTo({ center: [longitude, latitude], zoom: 16 });
              const el = document.createElement('div');
              el.style.cssText = 'width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5);position:relative;z-index:10';
              if (userMarkerRef.current) userMarkerRef.current.remove();
              userMarkerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat([longitude, latitude])
                .addTo(map);
            },
            () => setGpsGranted(false),
            { timeout: 8000, enableHighAccuracy: false }
          );
        }

        // 其他人的藍色回報點
        fetch('/api/reports?map=true')
          .then(r => r.json())
          .then(data => {
            (data.points || []).forEach((p: any) => {
              if (!p.lat || !p.lng) return;
              const el = document.createElement('div');
              el.innerHTML = '<div style="width:28px;height:28px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 3px 10px rgba(59,130,246,0.4);display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;">🐱</div>';
              new maplibregl.Marker({ element: el })
                .setLngLat([p.lng, p.lat])
                .addTo(map);
            });
          })
          .catch(() => {});
      });
    };

    init();

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // 我的回報黃點
  useEffect(() => {
    if (!mapRef.current) return;
    const addMarkers = async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      yellowMarkersRef.current.forEach(m => m.remove());
      yellowMarkersRef.current = [];
      reports.forEach(report => {
        if (!report.location) return;
        const { latitude, longitude } = report.location;
        const el = document.createElement('div');
        el.innerHTML = '<div style="width:28px;height:28px;background:#facc15;border:3px solid white;border-radius:50%;box-shadow:0 3px 10px rgba(250,204,21,0.5);display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;">📷</div>';
        el.onclick = () => { setSelectedReport(report); setSelectedSpot(null); };
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);
        yellowMarkersRef.current.push(marker);
      });
    };
    addMarkers();
  }, [reports]);

  const relocate = () => {
    if (!mapRef.current || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      mapRef.current.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 16 });
    });
  };

  const handleCameraPress = () => {
    if (!gpsGranted) {
      // 嘗試再次請求定位
      navigator.geolocation?.getCurrentPosition(
        pos => { setGpsGranted(true); navigateTo('Camera'); },
        () => alert('請在手機設定中允許定位，才能使用拍貓功能')
      );
      return;
    }
    navigateTo('Camera');
  };

  return (
    <div className="relative w-full h-full overflow-hidden font-sans">
      {/* 地圖容器 */}
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Header */}
      <div className="absolute top-0 left-0 w-full px-5 pt-14 flex justify-between items-start z-40 pointer-events-none">
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[32px] font-black text-gray-800 tracking-tighter leading-none drop-shadow-sm">貓步漫遊</h1>
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce mt-1" />
          </div>
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md shadow-sm border border-white/50 px-3.5 py-1.5 rounded-full w-fit">
            <MapPin size={14} className="text-gray-500" />
            <span className="text-sm font-bold text-gray-700">台北車站附近</span>
          </div>
        </div>
        <button
          onClick={() => navigateTo('Profile')}
          className="bg-white/90 backdrop-blur-md p-1.5 pr-5 rounded-full flex items-center gap-3 shadow-xl border border-white/50 pointer-events-auto transition-transform active:scale-95"
        >
          <div className="w-11 h-11 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-2xl">🐾</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-black text-gray-400">Lv.{user?.currentLevel}</span>
            <span className="text-sm font-black text-gray-800 leading-none">{user?.currentTitle}</span>
          </div>
          <ChevronRight size={16} className="text-gray-300 ml-1" />
        </button>
      </div>

      {/* 提示卡 */}
      <div
        onClick={() => setIsHintExpanded(!isHintExpanded)}
        className="absolute top-48 left-5 z-40 bg-white/90 backdrop-blur-xl rounded-[28px] shadow-2xl border border-white/60 cursor-pointer overflow-hidden transition-all duration-300"
        style={{ width: isHintExpanded ? 210 : 110 }}
      >
        <div className="p-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400 text-xs">✨</span>
              <h3 className="text-sm font-black text-gray-800">小提示</h3>
            </div>
            <ChevronRight size={14} className={`text-gray-300 transition-transform ${isHintExpanded ? 'rotate-90' : ''}`} />
          </div>
          {isHintExpanded && (
            <p className="text-[11px] font-bold text-gray-500 leading-relaxed mt-2">
              <span className="text-blue-500">藍點</span> 是貓咪可能出沒地，<br />
              <span className="text-yellow-500">黃點</span> 是你的回報喔！
            </p>
          )}
        </div>
      </div>

      {/* 定位按鈕 */}
      <button
        onClick={relocate}
        className="absolute right-5 top-48 z-40 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 border border-gray-100 active:scale-95"
      >
        <MapPin size={18} strokeWidth={3} />
      </button>

      {/* 藍點 popup */}
      {selectedSpot && (
        <div className="absolute bottom-32 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl p-5 rounded-[32px] shadow-2xl border border-white/50">
          <button onClick={() => setSelectedSpot(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
            <X size={16} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl">🐱</div>
            <div>
              <h4 className="text-lg font-black text-gray-800">貓咪可能出沒地</h4>
              <span className="text-[10px] text-gray-400">附近有其他人的回報</span>
            </div>
          </div>
          <button onClick={() => { setSelectedSpot(null); navigateTo('Camera'); }}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl flex items-center justify-center gap-2 active:scale-95">
            <Camera size={16} /> 開始拍貓
          </button>
        </div>
      )}

      {/* 黃點 popup */}
      {selectedReport && (
        <div className="absolute bottom-32 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl p-4 rounded-[32px] shadow-2xl border border-white/50">
          <button onClick={() => setSelectedReport(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
            <X size={16} />
          </button>
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 bg-gray-100 flex-shrink-0">
              {selectedReport.photo && <img src={selectedReport.photo} className="w-full h-full object-cover" alt="" />}
            </div>
            <div className="flex flex-col flex-1 py-1">
              <h4 className="text-base font-black text-gray-800 mb-1">
                {CAT_COLORS.find(c => c.key === selectedReport.colorKey)?.label} × {CAT_POSES.find(p => p.key === selectedReport.poseKey)?.label}
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <RarityBadge rarity={selectedReport.rarity ?? 'common'} />
                <span className="text-emerald-500 font-bold text-[10px]">+{selectedReport.xpEarned} XP</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-gray-400">
                <Clock size={10} />
                {selectedReport.submittedAt ? new Date(selectedReport.submittedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setHighlightedDexEntry({ colorKey: selectedReport.colorKey, poseKey: selectedReport.poseKey }); setSelectedReport(null); navigateTo('Dex'); }}
            className="mt-3 w-full h-10 bg-blue-500 text-white rounded-2xl text-[10px] font-black flex items-center justify-center gap-2"
          >
            <BookOpen size={14} /> 查看圖鑑詳情
          </button>
        </div>
      )}

      {/* 圖例 */}
      <div className="absolute bottom-28 left-5 z-40 bg-white/80 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-lg border border-white/60">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[8px]">🐱</div>
            <span className="text-[10px] font-bold text-gray-600">貓咪可能出沒地</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[8px]">📷</div>
            <span className="text-[10px] font-bold text-gray-600">我的回報</span>
          </div>
        </div>
      </div>

      {/* 拍貓咪 FAB */}
      <button
        onClick={handleCameraPress}
        className="absolute right-6 bottom-28 z-40 flex flex-col items-center justify-center w-[88px] h-[88px] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-[0_15px_35px_rgba(59,130,246,0.4)] text-white border-[5px] border-white transition-all active:scale-95"
      >
        <Camera size={28} strokeWidth={3} />
        <span className="text-[11px] font-black mt-0.5">拍貓咪</span>
      </button>
    </div>
  );
};

export default MapScreen;
