'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserState, Report, DexUnlock, ScreenName, ReportDraft } from '../types';
import { CAT_COLORS, LEVELS } from '../constants';
import { getLevelFromXp } from '../services/xpService';

const DEFAULT_USER: UserState = {
  nickname: '小貓探險家',
  displayName: '小貓探險家',
  totalXp: 0,
  currentLevel: 1,
  currentTitle: '巷口新貓友',
  avatarType: 'preset',
  avatarUrl: 'https://catwalk-v2.vercel.app/assets/avatars/calico.png',
  selectedPresetAvatarId: 'calico',
};

interface AppContextType {
  user: UserState;
  userPageId: string | null;
  reports: Report[];
  dexUnlocks: DexUnlock[];
  currentScreen: ScreenName;
  reportDraft: ReportDraft | null;
  lastReport: Report | null;
  highlightedDexEntry: { colorKey: string; poseKey: string } | null;
  isLoading: boolean;
  mapSelectedReport: Report | null;
  setMapSelectedReport: (r: Report | null) => void;
  mapSelectedSpot: any | null;
  setMapSelectedSpot: (s: any | null) => void;
  dexSelectedEntry: any | null;
  setDexSelectedEntry: (e: any | null) => void;
  closeAllOverlays: () => void;
  setHighlightedDexEntry: (e: { colorKey: string; poseKey: string } | null) => void;
  updateUserProfile: (update: Partial<Pick<UserState, 'displayName' | 'avatarType' | 'avatarUrl' | 'selectedPresetAvatarId'>>) => void;
  login: (nickname: string, email: string) => Promise<void>;
  logout: () => void;
  navigateTo: (screen: ScreenName) => void;
  startNewReport: (photo: string, lat?: number, lng?: number) => void;
  updateDraft: (update: Partial<ReportDraft>) => void;
  submitReport: () => Promise<void>;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LS = {
  USER: 'catwalk_user',
  USER_PAGE_ID: 'catwalk_user_page_id',
  REPORTS: 'catwalk_reports',
  DEX: 'catwalk_dex',
  LAST_REPORT: 'catwalk_last_report',
};

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState>(() => {
    const saved = lsGet<any>(LS.USER, null);
    if (!saved) return DEFAULT_USER;
    return { ...DEFAULT_USER, ...saved, displayName: saved.displayName || saved.nickname || DEFAULT_USER.displayName };
  });
  const [userPageId, setUserPageId] = useState<string | null>(() => lsGet(LS.USER_PAGE_ID, null));
  const [reports, setReports] = useState<Report[]>(() => lsGet(LS.REPORTS, []));
  const [dexUnlocks, setDexUnlocks] = useState<DexUnlock[]>(() => lsGet(LS.DEX, []));
  const [lastReport, setLastReport] = useState<Report | null>(() => lsGet(LS.LAST_REPORT, null));
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(() =>
    lsGet<any>(LS.USER, null) ? 'Map' : 'Login'
  );
  const [reportDraft, setReportDraft] = useState<ReportDraft | null>(null);
  const [highlightedDexEntry, setHighlightedDexEntry] = useState<{ colorKey: string; poseKey: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapSelectedReport, setMapSelectedReport] = useState<Report | null>(null);
  const [mapSelectedSpot, setMapSelectedSpot] = useState<any | null>(null);
  const [dexSelectedEntry, setDexSelectedEntry] = useState<any | null>(null);

  useEffect(() => { localStorage.setItem(LS.USER, JSON.stringify(user)); }, [user]);
  useEffect(() => { if (userPageId) localStorage.setItem(LS.USER_PAGE_ID, JSON.stringify(userPageId)); }, [userPageId]);
  useEffect(() => { localStorage.setItem(LS.REPORTS, JSON.stringify(reports)); }, [reports]);
  useEffect(() => { localStorage.setItem(LS.DEX, JSON.stringify(dexUnlocks)); }, [dexUnlocks]);
  useEffect(() => { if (lastReport) localStorage.setItem(LS.LAST_REPORT, JSON.stringify(lastReport)); }, [lastReport]);

  const closeAllOverlays = () => {
    setMapSelectedReport(null); setMapSelectedSpot(null);
    setDexSelectedEntry(null); setHighlightedDexEntry(null);
  };

  const updateUserProfile = (update: Partial<Pick<UserState, 'displayName' | 'avatarType' | 'avatarUrl' | 'selectedPresetAvatarId'>>) => {
    setUser(prev => ({ ...prev, ...update, nickname: update.displayName ?? prev.nickname }));
  };

  const login = async (nickname: string, email: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, email }),
      });
      const data = await res.json();
      const levelInfo = getLevelFromXp(data.totalXp ?? 0);
      setUser(prev => ({
        ...prev, nickname: data.nickname, displayName: data.nickname,
        email: data.email, totalXp: data.totalXp ?? 0,
        currentLevel: levelInfo.level, currentTitle: levelInfo.title,
      }));
      setUserPageId(data.pageId);
      // 載入歷史資料
      try {
        const [rRes, dRes] = await Promise.all([
          fetch(`/api/reports?nickname=${encodeURIComponent(nickname)}`),
          fetch(`/api/dex?nickname=${encodeURIComponent(nickname)}`),
        ]);
        const rData = await rRes.json();
        const dData = await dRes.json();
        if (rData.reports) setReports(rData.reports);
        if (dData.unlocks) setDexUnlocks(dData.unlocks);
      } catch { /* 保留 localStorage */ }
      setCurrentScreen('Map');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Object.values(LS).forEach(k => localStorage.removeItem(k));
    setUser(DEFAULT_USER); setUserPageId(null); setReports([]); setDexUnlocks([]);
    setLastReport(null); setCurrentScreen('Login');
  };

  const navigateTo = (screen: ScreenName) => setCurrentScreen(screen);
  const startNewReport = (photo: string, lat?: number, lng?: number) => {
    setReportDraft({ photo, latitude: lat, longitude: lng });
    navigateTo('CatSelect');
  };
  const updateDraft = (update: Partial<ReportDraft>) => setReportDraft(prev => prev ? { ...prev, ...update } : null);

  const submitReport = async () => {
    if (!reportDraft?.colorKey || !reportDraft?.poseKey || !reportDraft?.environmentKey || !reportDraft?.catCount || !user) return;
    setIsLoading(true);
    try {
      // 上傳照片
      let photoUrl = '';
      try {
        let blob: Blob;
        if (reportDraft.photo.startsWith('data:')) {
          blob = await fetch(reportDraft.photo).then(r => r.blob());
        } else {
          blob = await fetch(reportDraft.photo).then(r => r.blob());
        }
        const form = new FormData();
        form.append('file', blob, 'cat.jpg');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.url || '';
      } catch (err) { console.warn('Upload failed:', err); }

      // 送出回報
      const res = await fetch('/api/reports', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: user.nickname, photoUrl,
          colorKey: reportDraft.colorKey, poseKey: reportDraft.poseKey,
          poseNote: reportDraft.poseNote,
          environmentKey: reportDraft.environmentKey, environmentNote: reportDraft.environmentNote,
          catCount: reportDraft.catCount,
          latitude: reportDraft.latitude ?? 25.0478, longitude: reportDraft.longitude ?? 121.5170,
          existingDexUnlocks: dexUnlocks, currentTotalXp: user.totalXp, userPageId,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      const color = CAT_COLORS.find(c => c.key === reportDraft.colorKey);
      const isLevelUp = result.newLevel > user.currentLevel;

      // captureCount
      const existingDex = dexUnlocks.find(d => d.colorKey === reportDraft.colorKey && d.poseKey === reportDraft.poseKey);
      const captureCount = existingDex ? (existingDex.captureCount ?? 1) + 1 : 1;

      const newReport: Report = {
        reportId: result.reportId,
        photo: photoUrl || reportDraft.photo,
        colorKey: reportDraft.colorKey!,
        poseKey: reportDraft.poseKey!,
        environmentKey: reportDraft.environmentKey!,
        catCount: reportDraft.catCount!,
        submittedAt: new Date().toISOString(),
        xpEarned: result.xpEarned,
        rarity: result.rarity,
        isNewDexUnlock: result.isNewDexUnlock,
        isLevelUp,
        captureCount,
        locationName: result.locationName ?? '',
        poseNote: reportDraft.poseNote,
        environmentNote: reportDraft.environmentNote,
        location: {
          latitude: reportDraft.latitude ?? 25.0478,
          longitude: reportDraft.longitude ?? 121.5170,
          mapX: 20 + Math.random() * 60,
          mapY: 30 + Math.random() * 40,
        },
      };

      setReports(prev => [newReport, ...prev]);
      if (result.isNewDexUnlock) {
        setDexUnlocks(prev => [...prev, {
          colorKey: reportDraft.colorKey!, poseKey: reportDraft.poseKey!,
          unlockedAt: new Date().toISOString(), reportId: result.reportId,
          photo: photoUrl, xpEarned: result.xpEarned, captureCount: 1,
        }]);
      } else if (existingDex) {
        setDexUnlocks(prev => prev.map(d =>
          d.colorKey === reportDraft.colorKey && d.poseKey === reportDraft.poseKey
            ? { ...d, captureCount, lastCapturedAt: new Date().toISOString() } : d
        ));
      }
      setUser(prev => prev ? {
        ...prev, totalXp: result.newTotalXp,
        currentLevel: result.newLevel, currentTitle: result.newTitle,
      } : prev);
      setLastReport(newReport);
      setReportDraft(null);
      navigateTo('Result');
    } catch (err) {
      console.error('submitReport error:', err);
      alert(`送出失敗：${err instanceof Error ? err.message : '請稍後再試'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAllData = () => {
    Object.values(LS).forEach(k => localStorage.removeItem(k));
    setUser(DEFAULT_USER); setReports([]); setDexUnlocks([]); setLastReport(null);
  };

  return (
    <AppContext.Provider value={{
      user, userPageId, reports, dexUnlocks, currentScreen, reportDraft, lastReport,
      highlightedDexEntry, isLoading,
      mapSelectedReport, setMapSelectedReport, mapSelectedSpot, setMapSelectedSpot,
      dexSelectedEntry, setDexSelectedEntry, closeAllOverlays,
      setHighlightedDexEntry, updateUserProfile,
      login, logout, navigateTo, startNewReport, updateDraft, submitReport, resetAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
