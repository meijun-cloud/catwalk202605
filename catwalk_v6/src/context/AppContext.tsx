'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserState, Report, DexUnlock, ScreenName, ReportDraft } from '../types';
import { CAT_COLORS, LEVELS } from '../constants';
import { getLevelFromXp } from '../services/xpService';

interface AppContextType {
  user: UserState | null;
  userPageId: string | null;
  reports: Report[];
  dexUnlocks: DexUnlock[];
  currentScreen: ScreenName;
  reportDraft: ReportDraft | null;
  lastReport: Report | null;
  highlightedDexEntry: { colorKey: string; poseKey: string } | null;
  isLoading: boolean;

  login: (nickname: string, email: string) => Promise<void>;
  logout: () => void;
  navigateTo: (screen: ScreenName) => void;
  startNewReport: (photo: string, lat?: number, lng?: number) => void;
  updateDraft: (update: Partial<ReportDraft>) => void;
  submitReport: () => Promise<void>;
  setHighlightedDexEntry: (entry: { colorKey: string; poseKey: string } | null) => void;
  resetAllData: () => void;
  refreshReports: () => Promise<void>;
  refreshDex: () => Promise<void>;
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
  const [user, setUser] = useState<UserState | null>(() => lsGet(LS.USER, null));
  const [userPageId, setUserPageId] = useState<string | null>(() => lsGet(LS.USER_PAGE_ID, null));
  const [reports, setReports] = useState<Report[]>(() => lsGet(LS.REPORTS, []));
  const [dexUnlocks, setDexUnlocks] = useState<DexUnlock[]>(() => lsGet(LS.DEX, []));
  const [lastReport, setLastReport] = useState<Report | null>(() => lsGet(LS.LAST_REPORT, null));
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(() => lsGet(LS.USER, null) ? 'Map' : 'Login');
  const [reportDraft, setReportDraft] = useState<ReportDraft | null>(null);
  const [highlightedDexEntry, setHighlightedDexEntry] = useState<{ colorKey: string; poseKey: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 同步 localStorage
  useEffect(() => { if (user) localStorage.setItem(LS.USER, JSON.stringify(user)); }, [user]);
  useEffect(() => { if (userPageId) localStorage.setItem(LS.USER_PAGE_ID, JSON.stringify(userPageId)); }, [userPageId]);
  useEffect(() => { localStorage.setItem(LS.REPORTS, JSON.stringify(reports)); }, [reports]);
  useEffect(() => { localStorage.setItem(LS.DEX, JSON.stringify(dexUnlocks)); }, [dexUnlocks]);
  useEffect(() => { if (lastReport) localStorage.setItem(LS.LAST_REPORT, JSON.stringify(lastReport)); }, [lastReport]);

  const login = async (nickname: string, email: string) => {
    setIsLoading(true);
    try {
      // 先查詢 GPS 權限狀態
      let gpsPermission = false;
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          gpsPermission = result.state === 'granted';
        } catch { /* 部分瀏覽器不支援 */ }
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, email, gpsPermission }),
      });
      const data = await res.json();
      const levelInfo = getLevelFromXp(data.totalXp ?? 0);
      const newUser: UserState = {
        nickname: data.nickname,
        email: data.email,
        totalXp: data.totalXp ?? 0,
        currentLevel: levelInfo.level,
        currentTitle: levelInfo.title,
      };
      setUser(newUser);
      setUserPageId(data.pageId);

      // 從 Notion 載入歷史資料
      await Promise.all([
        refreshReportsForUser(nickname),
        refreshDexForUser(nickname),
      ]);

      setCurrentScreen('Map');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Object.values(LS).forEach(k => localStorage.removeItem(k));
    setUser(null); setUserPageId(null); setReports([]); setDexUnlocks([]);
    setLastReport(null); setCurrentScreen('Login');
  };

  const refreshReportsForUser = async (nickname: string) => {
    try {
      const res = await fetch(`/api/reports?nickname=${encodeURIComponent(nickname)}`);
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch { /* 失敗時保留 localStorage 資料 */ }
  };

  const refreshReports = async () => {
    if (user) await refreshReportsForUser(user.nickname);
  };

  const refreshDexForUser = async (nickname: string) => {
    try {
      const res = await fetch(`/api/dex?nickname=${encodeURIComponent(nickname)}`);
      const data = await res.json();
      if (data.unlocks) {
        setDexUnlocks(data.unlocks.map((u: any) => ({
          colorKey: u.colorKey, poseKey: u.poseKey, unlockedAt: u.unlockedAt,
          reportId: '', photo: '', xpEarned: 0,
        })));
      }
    } catch { /* 保留 localStorage */ }
  };

  const refreshDex = async () => {
    if (user) await refreshDexForUser(user.nickname);
  };

  const navigateTo = (screen: ScreenName) => setCurrentScreen(screen);

  const startNewReport = (photo: string, lat?: number, lng?: number) => {
    setReportDraft({ photo, latitude: lat, longitude: lng });
    navigateTo('CatSelect');
  };

  const updateDraft = (update: Partial<ReportDraft>) => {
    setReportDraft(prev => prev ? { ...prev, ...update } : null);
  };

  const submitReport = async () => {
    if (!reportDraft?.colorKey || !reportDraft?.poseKey || !reportDraft?.environmentKey || !reportDraft?.catCount || !user) return;
    setIsLoading(true);
    try {
      // 1. 上傳照片到 R2（支援 base64 dataURL 和 blob URL）
      let photoUrl = '';
      try {
        let blob: Blob;
        if (reportDraft.photo.startsWith('data:')) {
          const fetchRes = await fetch(reportDraft.photo);
          blob = await fetchRes.blob();
        } else {
          blob = await fetch(reportDraft.photo).then(r => r.blob());
        }
        const form = new FormData();
        form.append('file', blob, 'cat.jpg');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.url || '';
        if (!photoUrl) console.warn('R2 upload no url:', uploadData);
      } catch (uploadErr) {
        console.warn('Upload failed:', uploadErr);
        photoUrl = '';
      }

      // 2. 送出回報
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: user.nickname,
          photoUrl,
          colorKey: reportDraft.colorKey,
          poseKey: reportDraft.poseKey,
          environmentKey: reportDraft.environmentKey,
          catCount: reportDraft.catCount,
          latitude: reportDraft.latitude ?? 25.0478,
          longitude: reportDraft.longitude ?? 121.5170,
          existingDexUnlocks: dexUnlocks,
          currentTotalXp: user.totalXp,
          userPageId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const result = await res.json();
      const color = CAT_COLORS.find(c => c.key === reportDraft.colorKey);
      const isLevelUp = result.newLevel > user.currentLevel;

      const newReport: Report = {
        reportId: result.reportId,
        photo: photoUrl,
        colorKey: reportDraft.colorKey!,
        poseKey: reportDraft.poseKey!,
        environmentKey: reportDraft.environmentKey!,
        catCount: reportDraft.catCount!,
        submittedAt: new Date().toISOString(),
        xpEarned: result.xpEarned,
        rarity: result.rarity,
        isNewDexUnlock: result.isNewDexUnlock,
        isLevelUp,
        location: { latitude: reportDraft.latitude ?? 25.0478, longitude: reportDraft.longitude ?? 121.5170 },
      };

      setReports(prev => [newReport, ...prev]);
      if (result.isNewDexUnlock) {
        setDexUnlocks(prev => [...prev, {
          colorKey: reportDraft.colorKey!, poseKey: reportDraft.poseKey!,
          unlockedAt: new Date().toISOString(), reportId: result.reportId,
          photo: photoUrl, xpEarned: result.xpEarned,
        }]);
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
    if (user) {
      const levelInfo = getLevelFromXp(0);
      setUser({ ...user, totalXp: 0, currentLevel: levelInfo.level, currentTitle: levelInfo.title });
    }
    setReports([]); setDexUnlocks([]); setLastReport(null);
  };

  return (
    <AppContext.Provider value={{
      user, userPageId, reports, dexUnlocks, currentScreen, reportDraft, lastReport,
      highlightedDexEntry, isLoading,
      login, logout, navigateTo, startNewReport, updateDraft, submitReport,
      setHighlightedDexEntry, resetAllData, refreshReports, refreshDex,
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
