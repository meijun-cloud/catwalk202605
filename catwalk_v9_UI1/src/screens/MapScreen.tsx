'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, MapPin, X, Clock, BookOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { CAT_COLORS, CAT_POSES } from '../constants';
import RarityBadge from '../components/RarityBadge';

// ================================================================
// 地圖風格替換點 — 換地圖只需改這一行 URL
// ================================================================
const MAP_STYLE_URL = 'https://tiles.stadiamaps.com/styles/alidade_bright.json';

// GPS 座標轉換為區域名稱（使用 reverse geocoding）
async function getLocationName(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh-TW`,
      { headers: { 'User-Agent': 'CatwalkApp/1.0' } }
    );
    const data = await res.json();
    const addr = data.address;
    // 優先顯示：縣市 + 區
    const city = addr.city || addr.county || '';
    const district = addr.city_district || addr.suburb || addr.town || '';
    if (city && district) return `${city}${district}`;
    if (city) return city;
    return '台北市中正區';
  } catch {
    return '台北車站附近';
  }
}

const MapScreen: React.FC = () => {
  const { user, reports, navigateTo, setHighlightedDexEntry,
    mapSelectedReport: selectedReport, setMapSelectedReport: setSelectedReport,
    mapSelectedSpot: selectedSpot, setMapSelectedSpot: setSelectedSpot,
  } = useApp();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const yellowMarkersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isHintExpanded, setIsHintExpanded] = useState(false);
  const [locationName, setLocationName] = useState('台北車站附近');
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

  // 從 reports 取得曾拍照的地區（最多 5 筆，不重複）
  const reportLocations = Array.from(new Set(
    reports
      .filter(r => r.location?.latitude && r.location?.longitude)
      .slice(0, 10)
      .map(r => `${r.location!.latitude.toFixed(4)},${r.location!.longitude.toFixed(4)}`)
  )).slice(0, 5);

  // 重新定位
  const relocate = useCallback(() => {
    if (!mapRef.current || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      mapRef.current.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 16 });
      getLocationName(pos.coords.latitude, pos.coords.longitude).then(setLocationName);
    });
  }, []);

  useEffect(() => {
    if (!document.getElementById('maplibre-css')) {
      const link = document.createElement('link');
      link.id = 'maplibre-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@4.5.2/dist/maplibre-gl.css';
      document.head.appendChild(link);
    }
    if (mapRef.current) return;

    const timer = setTimeout(async () => {
      if (!mapContainer.current) return;
      const maplibregl = (await import('maplibre-gl')).default;

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: MAP_STYLE_URL,
        center: [121.5170, 25.0478],
        zoom: 14,
        attributionControl: false,
      });
      mapRef.current = map;

      map.on('load', () => {
        setMapLoaded(true);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => {
              const { latitude, longitude } = pos.coords;
              map.flyTo({ center: [longitude, latitude], zoom: 16 });
              // 取得位置名稱
              getLocationName(latitude, longitude).then(setLocationName);
              const el = document.createElement('div');
              el.style.cssText = 'width:14px;height:14px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.6)';
              if (userMarkerRef.current) userMarkerRef.current.remove();
              userMarkerRef.current = new maplibregl.Marker({ element: el })
                .setLngLat([longitude, latitude]).addTo(map);
            },
            () => {},
            { timeout: 8000, enableHighAccuracy: false }
          );
        }
        // 藍點：貓咪可能出沒地（CatData database）
        fetch('/api/catdata').then(r => r.json()).then(data => {
          (data.spots || []).forEach((spot: any) => {
            if (!spot.latitude || !spot.longitude) return;
            const el = document.createElement('div');
            el.innerHTML = '<div style="position:relative;cursor:pointer"><div style="width:32px;height:32px;background:#3b82f6;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 3px 10px rgba(59,130,246,0.5)">🐱</div><div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #3b82f6"></div></div>';
            el.onclick = () => { setSelectedSpot(spot); setSelectedReport(null); };
            new maplibregl.Marker({ element: el }).setLngLat([spot.longitude, spot.latitude]).addTo(map);
          });
        }).catch(() => {});
      });

      map.on('error', (e: any) => console.error('Map error:', e));
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // 我的黃點
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const addMarkers = async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      yellowMarkersRef.current.forEach(m => m.remove());
      yellowMarkersRef.current = [];
      reports.forEach(report => {
        if (!report.location) return;
        const { latitude, longitude } = report.location;
        const el = document.createElement('div');
        el.innerHTML = '<div style="position:relative;cursor:pointer"><div style="width:36px;height:36px;background:#facc15;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(250,204,21,0.6)"><svg xmlns=\'http://www.w3.org/2000/svg\' width=\'18\' height=\'18\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2.5\'><path d=\'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\'/><circle cx=\'12\' cy=\'13\' r=\'4\'/></svg></div><div style=\'position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #facc15\'></div></div>';
        el.onclick = () => { setSelectedReport(report); setSelectedSpot(null); };
        const marker = new maplibregl.Marker({ element: el }).setLngLat([longitude, latitude]).addTo(mapRef.current);
        yellowMarkersRef.current.push(marker);
      });
    };
    addMarkers();
  }, [reports, mapLoaded]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', fontFamily: 'sans-serif' }}>

      {/* 地圖容器 */}
      <div ref={mapContainer} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }} />

      {/* 載入中 */}
      {!mapLoaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', zIndex: 1 }}>
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
            <p style={{ fontSize: 13, fontWeight: 700 }}>地圖載入中...</p>
          </div>
        </div>
      )}

      {/* ===== Header ===== */}
      <div className="absolute top-0 left-0 w-full px-5 pt-14 flex justify-between items-start z-40 pointer-events-none">
        {/* 左側：標題 + 位置 */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[32px] font-black text-[#4A4A4A] tracking-tighter leading-none drop-shadow-sm">貓步漫遊</h1>
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce mt-1" />
          </div>

          {/* 位置選單 */}
          <div className="relative">
            <button
              onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
              className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md shadow-sm border border-white/50 px-3.5 py-1.5 rounded-full w-fit transition-all hover:bg-white active:scale-95"
            >
              <MapPin size={14} className="text-gray-500" />
              <span className="text-sm font-bold text-gray-700 tracking-tight">{locationName}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isLocationMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLocationMenuOpen && (
              <>
                <div className="fixed inset-0 z-0" onClick={() => setIsLocationMenuOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden z-10">
                  {/* 重新 GPS 定位 */}
                  <button
                    onClick={() => { relocate(); setIsLocationMenuOpen(false); }}
                    className="w-full px-4 py-3 text-left text-sm font-bold text-blue-500 border-b border-gray-100 flex items-center gap-2 hover:bg-blue-50"
                  >
                    <MapPin size={14} /> 重新定位目前位置
                  </button>
                  {reportLocations.length > 0 ? reportLocations.map((locKey, idx) => {
                    const r = reports.find(rep =>
                      rep.location &&
                      `${rep.location.latitude.toFixed(4)},${rep.location.longitude.toFixed(4)}` === locKey
                    );
                    const displayName = r?.submittedAt
                      ? `我的回報 ${idx + 1}`
                      : `地點 ${idx + 1}`;
                    return (
                      <button key={locKey} onClick={() => {
                        if (r?.location && mapRef.current) {
                          mapRef.current.flyTo({ center: [r.location.longitude, r.location.latitude], zoom: 16 });
                          setLocationName(r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }) + ' 的回報' : '我的回報');
                        }
                        setIsLocationMenuOpen(false);
                      }}
                        className="w-full px-4 py-3 text-left text-sm font-bold transition-colors hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                        <span className="text-yellow-500">📷</span>
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-black">{r?.submittedAt ? new Date(r.submittedAt).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }) + ` · ${r.colorKey ? (CAT_COLORS.find(c => c.key === r.colorKey)?.label ?? '') : ''}` : `回報 ${idx + 1}`}</span>
                          <span className="text-[10px] text-gray-400">{r?.location ? `${r.location.latitude.toFixed(3)}, ${r.location.longitude.toFixed(3)}` : ''}</span>
                        </div>
                      </button>
                    );
                  }) : (
                    <div className="px-4 py-3 text-sm text-gray-400">尚無回報紀錄</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 右側：個人頭像（使用 user.avatarUrl） */}
        <button
          onClick={() => navigateTo('Profile')}
          className="bg-white/90 backdrop-blur-md p-1.5 pr-5 rounded-full flex items-center gap-2.5 shadow-xl border border-white/50 pointer-events-auto active:scale-95"
        >
          <div className="w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow-sm shrink-0 bg-blue-100">
            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://catwalk-v2.vercel.app/assets/avatars/calico.png'; }} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black text-gray-400">Lv.{user.currentLevel}</span>
            <span className="text-sm font-black text-gray-800 leading-none">{user.currentTitle}</span>
          </div>
          <ChevronRight size={14} className="text-gray-300" />
        </button>
      </div>

      {/* ===== 小提示（左下角，對應 UI 設計） ===== */}
      <div
        onClick={() => setIsHintExpanded(!isHintExpanded)}
        className="absolute bottom-32 left-5 z-40 bg-white/90 backdrop-blur-xl rounded-[28px] shadow-xl border border-white/60 cursor-pointer overflow-hidden transition-all duration-300"
        style={{ width: isHintExpanded ? 240 : 'auto', whiteSpace: 'nowrap' }}
      >
        <div className="p-3 px-4">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 text-xs">✨</span>
            <h3 className="text-sm font-black text-gray-800 whitespace-nowrap">小提示</h3>
            <ChevronRight size={12} className={`text-gray-300 transition-transform ${isHintExpanded ? 'rotate-90' : ''}`} />
          </div>
          {isHintExpanded && (
            <p className="text-[11px] font-bold text-gray-500 leading-relaxed mt-1.5 whitespace-nowrap">
              <span className="text-blue-500">藍點</span> 是貓咪可能出沒地，<span className="text-yellow-500">黃點</span> 是你的回報！
            </p>
          )}
        </div>
      </div>

      {/* ===== 右下角控制群組：定位 + 拍貓咪 ===== */}
      <div className="absolute right-5 bottom-28 z-40 flex flex-col items-center gap-4">
        {/* 定位 icon（靠近拍照按鈕上方） */}
        <button onClick={relocate}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100 active:scale-95">
          <MapPin size={18} className="text-gray-600" strokeWidth={2.5} />
        </button>

        {/* 拍貓咪 FAB */}
        <button
          onClick={() => navigateTo('MockCamera')}
          className="flex flex-col items-center justify-center w-[88px] h-[88px] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-[0_12px_30px_rgba(59,130,246,0.4)] text-white border-[5px] border-white active:scale-95"
        >
          <Camera size={28} strokeWidth={3} />
          <span className="text-[11px] font-black mt-0.5">拍貓咪</span>
        </button>
      </div>

      {/* ===== 黃點 popup ===== */}
      {selectedReport && (
        <div className="absolute bottom-40 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl p-4 rounded-[28px] shadow-2xl border border-white/50">
          <button onClick={() => setSelectedReport(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
            <X size={16} />
          </button>
          <div className="flex gap-3">
            <div className="w-18 h-18 rounded-2xl overflow-hidden border border-gray-100 bg-gray-100 flex-shrink-0" style={{ width: 72, height: 72 }}>
              {selectedReport.photo && <img src={selectedReport.photo} className="w-full h-full object-cover" alt="" />}
            </div>
            <div className="flex flex-col flex-1 py-0.5">
              <h4 className="text-base font-black text-gray-800 mb-1">
                {CAT_COLORS.find(c => c.key === selectedReport.colorKey)?.label} × {CAT_POSES.find(p => p.key === selectedReport.poseKey)?.label}
              </h4>
              <RarityBadge rarity={selectedReport.rarity ?? 'common'} />
              <span className="text-emerald-500 font-bold text-[10px] mt-1">+{selectedReport.xpEarned} XP</span>
            </div>
          </div>
          <button onClick={() => { setHighlightedDexEntry({ colorKey: selectedReport.colorKey, poseKey: selectedReport.poseKey }); setSelectedReport(null); navigateTo('Dex'); }}
            className="mt-3 w-full h-10 bg-blue-500 text-white rounded-2xl text-[10px] font-black flex items-center justify-center gap-2">
            <BookOpen size={14} /> 查看圖鑑詳情
          </button>
        </div>
      )}
      {/* 藍點 popup */}
      {selectedSpot && (
        <div className="absolute bottom-40 left-4 right-4 z-50 bg-white/95 backdrop-blur-xl p-5 rounded-[28px] shadow-2xl border border-white/50">
          <button onClick={() => setSelectedSpot(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-gray-500 text-lg">✕</button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">🐱</div>
            <div>
              <h4 className="text-base font-black text-gray-800">貓咪可能出沒地</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">{selectedSpot.district || ''} · {selectedSpot.name || '熱點'}</p>
            </div>
          </div>
          {selectedSpot.color_key && (
            <p className="text-[12px] text-gray-600 mb-3">
              附近常見花色：<span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold ml-1">{selectedSpot.color_key}</span>
            </p>
          )}
          {selectedSpot.environment && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 mb-3">
              <span>🏘️</span>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">常見環境</p>
                <p className="text-sm font-black text-gray-700">{selectedSpot.environment}</p>
              </div>
            </div>
          )}
          <button onClick={() => { setSelectedSpot(null); navigateTo('MockCamera'); }}
            className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl text-[13px] font-black flex items-center justify-center gap-2">
            📷 開始找貓
          </button>
        </div>
      )}
    </div>
  );
};

export default MapScreen;
