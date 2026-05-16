'use client';
// ================================================================
// LoginScreen — UI 替換區
// 這個畫面功能完整（email + nickname 登入），視覺為暫定版本
// 你提供新的 UI 設計後，只需替換這個檔案的 JSX 部分
// 邏輯函數 handleLogin 不需要動
// ================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cat } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { login, isLoading } = useApp();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!nickname.trim() || !email.trim()) {
      setError('暱稱和 Email 都是必填的');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('請輸入正確的 Email 格式');
      return;
    }
    setError('');
    await login(nickname.trim(), email.trim());
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-white px-8 font-sans">
      <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-blue-300">
        <Cat size={48} className="text-white" />
      </div>

      <h1 className="text-4xl font-black text-gray-800 tracking-tight mb-2">貓步漫遊</h1>
      <p className="text-sm text-gray-400 font-medium mb-10">記錄城市裡每一次與貓咪的相遇 🐾</p>

      <div className="w-full max-w-sm space-y-4">
        <div>
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">暱稱</label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="小貓探險家"
            className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 text-gray-800 font-bold shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-14 bg-white border border-gray-200 rounded-2xl px-5 text-gray-800 font-bold shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full h-14 bg-blue-500 rounded-2xl text-white font-black text-lg shadow-xl shadow-blue-300 transition-transform active:scale-95 disabled:opacity-50"
        >
          {isLoading ? '登入中...' : '開始漫遊 🐾'}
        </button>
      </div>

      <p className="text-xs text-gray-300 font-medium mt-8 text-center">
        輸入暱稱與 Email 即可開始，<br />你的貓咪回報會自動儲存
      </p>
    </div>
  );
};

export default LoginScreen;
