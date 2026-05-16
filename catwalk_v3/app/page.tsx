import dynamic from 'next/dynamic';

// 動態載入避免 SSR 問題（MapLibre 需要 browser 環境）
const CatwalkApp = dynamic(() => import('../src/components/CatwalkApp'), { ssr: false });

export default function Home() {
  return <CatwalkApp />;
}
