'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const LoginScreen: React.FC = () => {
  const { login, isLoading } = useApp();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!nickname.trim() || !email.trim()) { setError('暱稱和 Email 都是必填的'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('請輸入正確的 Email 格式'); return; }
    setError('');
    await login(nickname.trim(), email.trim());
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 font-sans relative overflow-hidden">
      {/* 背景插畫 */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://catwalk-v2.vercel.app/assets/map-page/catwalk-map-bg-giant-cat-city.png"
          className="w-full h-full object-cover"
          alt="bg"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://catwalk-v2.vercel.app/assets/map-page/bg_map_cat_hotspots_v2.jpg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/60 to-white/95" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <h1 className="text-4xl font-black text-gray-800 tracking-tight mb-2">貓步漫遊</h1>
        <p className="text-sm text-gray-500 font-medium mb-10">記錄城市裡每一次與貓咪的相遇 🐾</p>

        <div className="w-full space-y-4">
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">暱稱</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="小貓探險家"
              className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 text-gray-800 font-bold shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 text-gray-800 font-bold shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
          <button onClick={handleLogin} disabled={isLoading}
            style={{ backgroundColor: '#4a54f2' }}
            className="w-full h-14 rounded-2xl text-white font-black text-lg shadow-xl transition-transform active:scale-95 disabled:opacity-50">
            {isLoading ? '登入中...' : '開始漫遊 🐾'}
          </button>
        </div>

        <p className="text-xs text-gray-400 font-medium mt-8 text-center">
          輸入暱稱與 Email 即可開始，<br />你的貓咪回報會自動儲存
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
