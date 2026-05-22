'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PromptInput from '@/components/PromptInput';

const PROJECT_TYPES = [
  { value: 'token', label: '🪙 Token', desc: 'ERC-20 token with custom supply' },
  { value: 'nft', label: '🎨 NFT Collection', desc: 'ERC-721 with minting & metadata' },
  { value: 'dex', label: '🔄 DEX', desc: 'Decentralized exchange' },
  { value: 'staking', label: '🥩 Staking', desc: 'Token staking rewards' },
  { value: 'dao', label: '🏛️ DAO', desc: 'Governance & voting' },
  { value: 'marketplace', label: '🛒 Marketplace', desc: 'NFT or goods marketplace' },
] as const;

const CHAINS = [
  { value: 'ethereum', label: 'Ethereum', icon: '⟠' },
  { value: 'base', label: 'Base', icon: '🔵' },
  { value: 'arbitrum', label: 'Arbitrum', icon: '🔷' },
  { value: 'polygon', label: 'Polygon', icon: '🟣' },
  { value: 'sepolia', label: 'Sepolia (Test)', icon: '🧪' },
] as const;

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [projectType, setProjectType] = useState('token');
  const [chain, setChain] = useState('sepolia');
  const [isBuilding, setIsBuilding] = useState(false);
  const [error, setError] = useState('');

  const handleBuild = async () => {
    if (!prompt.trim()) return;
    setIsBuilding(true);
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: projectType, chain }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Build failed');
      }

      const data = await res.json();
      sessionStorage.setItem('chainforge_result', JSON.stringify(data));
      router.push('/build');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            CF
          </div>
          <span className="text-lg font-bold gradient-text">ChainForge</span>
        </div>
        <a
          href="https://github.com/nousresearch/chainforge"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          GitHub ↗
        </a>
      </nav>

      {/* Hero + Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full glass text-xs font-medium text-brand-300 tracking-wide uppercase">
            AI-Powered Web3 Builder
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            <span className="gradient-text">Describe it.</span>
            <br />
            <span className="text-white">We&apos;ll build it.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Tell ChainForge what you want to build in plain English.
            Get production-ready smart contracts, compiled and deployable.
          </p>
        </div>

        {/* Build Card */}
        <div className="w-full max-w-2xl animate-slide-up">
          <div className="glass gradient-border p-6 sm:p-8">
            {/* Prompt */}
            <PromptInput value={prompt} onChange={setPrompt} />

            {/* Options Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* Project Type */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="select-dark"
                >
                  {PROJECT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chain */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Target Chain
                </label>
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                  className="select-dark"
                >
                  {CHAINS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            {/* Build Button */}
            <button
              onClick={handleBuild}
              disabled={!prompt.trim() || isBuilding}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              {isBuilding ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating Contracts...
                </>
              ) : (
                <>
                  ⚡ Build My dApp
                </>
              )}
            </button>
          </div>

          {/* Quick Examples */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-3">Try an example:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'ERC-20 token with 1M supply and burn',
                'NFT collection with royalties',
                'Token staking with 10% APY',
                'Simple governance DAO',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setPrompt(example)}
                  className="text-xs px-3 py-1.5 rounded-full glass glass-hover text-gray-400 hover:text-brand-300 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-600 border-t border-white/[0.04]">
        ChainForge — Built with Next.js, Tailwind & Solidity
      </footer>
    </main>
  );
}
