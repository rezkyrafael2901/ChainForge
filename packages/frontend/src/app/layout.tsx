import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChainForge — AI-Powered Web3 Builder',
  description: 'Describe your dApp in plain English. ChainForge generates smart contracts, compiles, and deploys them to testnet.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-gray-200 antialiased">
        {/* Ambient background orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07]"
            style={{
              background: 'radial-gradient(circle, #8b4cf6, transparent 70%)',
              top: '-200px',
              right: '-100px',
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05]"
            style={{
              background: 'radial-gradient(circle, #6366f1, transparent 70%)',
              bottom: '-150px',
              left: '-100px',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04]"
            style={{
              background: 'radial-gradient(circle, #a78bfa, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* Noise texture overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-[1] opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
