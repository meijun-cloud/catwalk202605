'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Search, MapPin, X, Clock, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { CAT_COLORS, CAT_POSES } from '../constants';
import RarityBadge from '../components/RarityBadge';

// ================================================================
// 地圖風格替換點
// 要換地圖風格，只需把下面這行的 URL 換成其他 Stadia 風格
// 目前：Alidade Bright (Beta)
// 其他可選：
//   https://tiles.stadiamaps.com/styles/alidade_smooth.json
//   https://tiles.stadiamaps.com/styles/stamen_watercolor.json
//   https://tiles.stadiamaps.com/styles/osm_bright.json
// ================================================================
const MAP_STYLE_URL = 'https://tiles.stadiamaps.com/styles/alidade_bright.json';

const MapScreen: React.FC = () => {
  const { user, reports, navigateTo, setHighlightedDexEntry } = useApp();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [isHintExpanded, setIsHintExpanded] = useState(false);
  const [gpsGranted, setGpsGranted] = useState(false);
  const [otherSpots, setOtherSpots] = useState<{ lat: number; lng: number }[]>([]);

  // 初始化地圖
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;
    let map: any;

    const initMap = async () => {
      const maplibregl = (await import('maplibre-gl')).default;

      map = new maplibregl.Map({
        container: mapContainer.current!,
        style: MAP_STYLE_URL,
        center: [121.5170, 25.0478], // 台北車站
        zoom: 15,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on('load', () => {
        // 嘗試 GPS 定位
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => {
              const { latitude, longitude } = pos.coords;
              setGpsGranted(true);
              map.flyTo({ center: [longitude, latitude], zoom: 16 });

              // 使用者藍點
              const el = document.createElement('div');
              el.className = 'user-location-dot';
              el.style.cssText = 'width:18px;height:18px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5)';
              if (userMarkerRef.current) userMarkerRef.current.remove();
              userMarkerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat([longitude, latitude])
                .addTo(map);
            },
            () => setGpsGranted(false)
          );
        }

        // 載入其他人的回報（藍色貓咪點）
        fetch('/api/reports?map=true')
          .then(r => r.json())
          .then(data => {
            if (data.points) {
              setOtherSpots(data.points);
              data.points.forEach((p: any) => addBlueMarker(map, maplibregl, p.lat, p.lng));
            }
          })
          .catch(() => {});
      });
    };

    initMap();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // 新增黃色我的回報點
  useEffect(() => {
    if (!mapRef.current) return;
    const initMarkers = async () => {
      const maplibregl = (await import('maplibre-gl')).default;

      // 清除舊的黃點
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      reports.forEach(report => {
        if (!report.location) return;
        const { latitude, longitude } = report.location;

        const el = document.createElement('div');
        el.innerHTML = `<div style="width:28px;height:28px;background:#facc15;border:3px solid white;border-radius:50%;box-shadow:0 3px 10px rgba(250,204,21,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;">📷</div>`;
        el.style.cssText = 'cursor:pointer';
        el.onclick = () => { setSelectedReport(report); setSelectedSpot(null); };

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      });
    };
    initMarkers();
  }, [reports]);

  const addBlueMarker = (map: any, maplibregl: any, lat: number, lng: number) => {
    const el = document.createElement('div');
    el.innerHTML = `<div style="width:28px;height:28px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 3px 10px rgba(59,130,246,0.4);display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;">🐱</div>`;
    el.onclick = () => { setSelectedSpot({ lat, lng }); setSelectedReport(null); };
    new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
  };

  const handleCameraPress = () => {
    if (!gpsGranted) {
      alert('請允許定位權限才能使用拍貓功能');
      return;
    }
    // 取得當前 GPS 位置後進入相機
    navigator.geolocation.getCurrentPosition(
      pos => navigateTo('Camera'),
      () => navigateTo('Camera') // 定位失敗仍可拍照，latitude/longitude 會使用預設值
    );
  };

  const relocate = () => {
    if (!mapRef.current || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      mapRef.current.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 16 });
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden font-sans">
      {/* ===== 地圖容器 ===== */}
      <div ref={mapContainer} className="absolute inset-0 z-0" />

      {/* MapLibre CSS */}
      <style>{`
        @import url('https://unpkg.com/maplibre-gl@4.5.2/dist/maplibre-gl.css');
        .maplibregl-ctrl-attrib { display: none !important; }
        .maplibregl-ctrl-logo { display: none !important; }
      `}</style>

      {/* ===== Header ===== */}
      <div className="absolute top-0 left-0 w-full px-5 pt-14 flex justify-between items-start z-40 pointer-events-none">
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[32px] font-black text-gray-800 tracking-tighter leading-none drop-shadow-sm">貓步漫遊</h1>
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce mt-1" />
          </div>
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md shadow-sm border border-white/50 px-3.5 py-1.5 rounded-full w-fit">
            <MapPin size={14} className="text-gray-500" />
            <span className="text-sm font-bold text-gray-700">台北車站附近</span>
            <div className="w-1.5 h-1.5 border-r border-b border-gray-400 rotate-45 ml-0.5 -mt-0.5" />
          </div>
        </div>

        <button
          onClick={() => navigateTo('Profile')}
          className="bg-white/90 backdrop-blur-md p-1.5 pr-5 rounded-full flex items-center gap-3 shadow-xl border border-white/50 pointer-events-auto transition-transform active:scale-95"
        >
          <div className="w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow-sm shrink-0 bg-blue-100 flex items-center justify-center">
            <span className="text-2xl">🐾</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-black text-gray-400">Lv.{user?.currentLevel}</span>
            <span className="text-sm font-black text-gray-800 leading-none">{user?.currentTitle}</span>
          </div>
          <ChevronRight size={16} className="text-gray-300 ml-1" />
        </button>
      </div>

      {/* ===== 提示卡 ===== */}
      <div
        onClick={() => setIsHintExpanded(!isHintExpanded)}
        className="absolute top-48 left-5 z-40 bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/60 cursor-pointer overflow-hidden transition-all duration-300"
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

      {/* ===== 右側控制按鈕 ===== */}
      <div className="absolute right-5 top-44 flex flex-col gap-3 z-40">
        <button
          onClick={relocate}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 transition-transform active:scale-95 border border-gray-100"
        >
          <MapPin size={18} strokeWidth={3} fill="currentColor" fillOpacity={0.1} />
        </button>
      </div>

      {/* ===== 藍點選取資訊卡 ===== */}
      {selectedSpot && (
        <div className="absolute bottom-32 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl p-5 rounded-[32px] shadow-2xl border border-white/50">
          <button onClick={() => setSelectedSpot(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-gray-500">
            <X size={16} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">🐱</div>
            <div>
              <h4 className="text-lg font-black text-gray-800">貓咪可能出沒地</h4>
              <span className="text-[10px] font-bold text-gray-400 uppercase">附近有其他人的回報</span>
            </div>
          </div>
          <button
            onClick={() => { setSelectedSpot(null); navigateTo('Camera'); }}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Camera size={16} /> 開始拍貓
          </button>
        </div>
      )}

      {/* ===== 黃點選取資訊卡 ===== */}
      {selectedReport && (
        <div className="absolute bottom-32 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl p-4 rounded-[32px] shadow-2xl border border-white/50">
          <button onClick={() => setSelectedReport(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-gray-500">
            <X size={16} />
          </button>
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 bg-gray-100">
              {selectedReport.photo && <img src={selectedReport.photo} className="w-full h-full object-cover" alt="" />}
            </div>
            <div className="flex flex-col flex-1 py-1">
              <h4 className="text-base font-black text-gray-800 leading-none mb-1">
                {CAT_COLORS.find(c => c.key === selectedReport.colorKey)?.label} × {CAT_POSES.find(p => p.key === selectedReport.poseKey)?.label}
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <RarityBadge rarity={selectedReport.rarity ?? 'common'} />
                <span className="text-emerald-500 font-bold text-[10px]">+{selectedReport.xpEarned} XP</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                <Clock size={10} />
                {selectedReport.submittedAt ? new Date(selectedReport.submittedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setHighlightedDexEntry({ colorKey: selectedReport.colorKey, poseKey: selectedReport.poseKey }); setSelectedReport(null); navigateTo('Dex'); }}
            className="mt-3 w-full h-10 bg-blue-500 text-white rounded-2xl text-[10px] font-black shadow-lg flex items-center justify-center gap-2"
          >
            <BookOpen size={14} /> 查看圖鑑詳情
          </button>
        </div>
      )}

      {/* ===== 底部圖例 ===== */}
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

      {/* ===== 拍貓咪 FAB ===== */}
      <button
        onClick={handleCameraPress}
        className="absolute right-6 bottom-28 z-40 flex flex-col items-center justify-center w-[88px] h-[88px] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-[0_15px_35px_rgba(59,130,246,0.4)] text-white border-[5px] border-white transition-all active:scale-95"
      >
        <Camera size={28} strokeWidth={3} />
        <span className="text-[11px] font-black mt-0.5 tracking-wider">拍貓咪</span>
      </button>
    </div>
  );
};

export default MapScreen;
