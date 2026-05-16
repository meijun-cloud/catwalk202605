import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '貓步漫遊',
  description: '記錄城市裡每一次與貓咪的相遇',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
