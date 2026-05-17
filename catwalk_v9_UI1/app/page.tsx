'use client';

import dynamic from 'next/dynamic';

const CatwalkApp = dynamic(
  () => import('../src/components/CatwalkApp'),
  { ssr: false }
);

export default function Home() {
  return <CatwalkApp />;
}
