'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FeatureToggle from '@/components/FeatureToggle'
import { ProjectType } from '@/types'
import { getDefaultFeatures } from '@/lib/features'

const CHAINS = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: '#627eea' },
  { id: 'base', name: 'Base', icon: '🔵', color: '#0052ff' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔷', color: '#28a0f0' },
  { id: 'polygon', name: 'Polygon', icon: '🟣', color: '#8247e5' },
  { id: 'bsc', name: 'BNB Chain', icon: '🟡', color: '#f3ba2f' },
  { id: 'avalanche', name: 'Avalanche', icon: '🔺', color: '#e84142' },
]

const PROJECT_TYPES = [
  { id: 'token', name: 'Token', icon: '💰', desc: 'ERC-20 with mint, burn, permit', color: '#10b981' },
  { id: 'nft', name: 'NFT Collection', icon: '🖼️', desc: 'ERC-721 with mint page & royalties', color: '#f59e0b' },
  { id: 'dex', name: 'DEX', icon: '🔄', desc: 'AMM swap like Uniswap', color: '#3b82f6' },
  { id: 'staking', name: 'Staking', icon: '📈', desc: 'Stake tokens, earn rewards', color: '#8b5cf6' },
  { id: 'dao', name: 'DAO', icon: '🏛️', desc: 'Governance & voting', color: '#ef4444' },
]

const EXAMPLE_PROMPTS = [
  'Bikin token ERC-20 bernama CryptoRupiah simbol CRP supply 1 juta di Ethereum',
  'Create an NFT collection called SpaceMonkeys with 10k supply on Base',
  'Build a DEX like Uniswap on Arbitrum',
  'Make a staking platform for my token with 15% APY',
  'Bikin DAO governance token bernama GovToken di Polygon',
]

export default function HomePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [selectedChain, setSelectedChain] = useState('ethereum')
  const [selectedType, setSelectedType] = useState<ProjectType>('token')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(getDefaultFeatures('token'))
  const [isBuilding, setIsBuilding] = useState(false)
  const [error, setError] = useState('')
  const [showFeatures, setShowFeatures] = useState(false)

  // Reset features when type changes
  useEffect(() => {
    setSelectedFeatures(getDefaultFeatures(selectedType))
  }, [selectedType])

  // Parse prompt to detect type and pre-select features
  const handleParsePreview = async () => {
    if (!prompt.trim()) return
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      if (res.ok) {
        const spec = await res.json()
        if (spec.type && spec.type !== selectedType) {
          setSelectedType(spec.type as ProjectType)
        }
        if (spec.features?.length) {
          setSelectedFeatures(spec.features)
        }
      }
    } catch {}
  }

  const handleBuild = async () => {
    if (!prompt.trim()) return
    setIsBuilding(true)
    setError('')

    try {
      // Parse prompt
      const parseRes = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      if (!parseRes.ok) throw new Error('Failed to parse prompt')
      const spec = await parseRes.json()

      // Override with manual selections + feature toggles
      spec.chain = selectedChain
      spec.type = selectedType
      spec.features = selectedFeatures

      // Generate project
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spec),
      })
      if (!genRes.ok) throw new Error('Failed to generate project')
      const project = await genRes.json()

      // Save to sessionStorage and redirect
      sessionStorage.setItem('blockpilot_project', JSON.stringify(project))
      router.push('/build')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsBuilding(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
  }

  return (
    <div className="min-h-screen grid-bg">
      <Header />

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-4 pt-20 pb-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-sm text-indigo-200 mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Prompt → Generate → Deploy
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Build <span className="gradient-text">On-Chain Products</span>
            <br />with AI
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Describe your idea in natural language. BlockPilot turns it into smart contracts,
            frontend, and deploy-ready files — fast, clean, and chain-aware.
          </p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            {[
              ['1 prompt', 'to structured spec'],
              ['1 click', 'to generate'],
              ['1 ZIP', 'for instant export'],
              ['1 deploy', 'to testnet'],
            ].map(([top, bottom]) => (
              <div key={top} className="rounded-2xl border border-gray-800 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="text-white font-semibold">{top}</div>
                <div className="text-xs text-gray-400 mt-1">{bottom}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div id="builder" className="max-w-3xl mx-auto mb-8 scroll-mt-24">
          <div className="card-glow rounded-2xl">
            <div className="bg-bg-secondary rounded-2xl p-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onBlur={handleParsePreview}
                placeholder='Describe your blockchain project... e.g. "Bikin DEX kayak Uniswap di Base"'
                className="w-full bg-transparent text-lg text-white placeholder-gray-500 resize-none outline-none min-h-[120px]"
                rows={4}
              />

              {/* Chain Selector */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Select Chain</p>
                <div className="flex flex-wrap gap-2">
                  {CHAINS.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => setSelectedChain(chain.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedChain === chain.id
                          ? 'text-white'
                          : 'bg-bg-tertiary text-gray-400 hover:text-white'
                      }`}
                      style={selectedChain === chain.id ? { backgroundColor: chain.color + '30', border: `1px solid ${chain.color}` } : {}}
                    >
                      <span>{chain.icon}</span>
                      <span>{chain.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Type Selector */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Project Type</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {PROJECT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id as ProjectType)}
                      className={`flex flex-col items-center p-3 rounded-xl text-center transition-all ${
                        selectedType === type.id
                          ? 'bg-bg-tertiary border border-accent-primary'
                          : 'bg-bg-tertiary/50 border border-transparent hover:border-gray-700'
                      }`}
                    >
                      <span className="text-2xl mb-1">{type.icon}</span>
                      <span className="text-xs font-medium text-white">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Toggle Section */}
              <div className="mt-4">
                <button
                  onClick={() => setShowFeatures(!showFeatures)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <span className={`transition-transform ${showFeatures ? 'rotate-90' : ''}`}>▶</span>
                  <span>Customize Features</span>
                  <span className="text-xs text-gray-600">({selectedFeatures.length} active)</span>
                </button>

                {showFeatures && (
                  <FeatureToggle
                    type={selectedType}
                    selected={selectedFeatures}
                    onChange={setSelectedFeatures}
                  />
                )}
              </div>

              {/* Build Button */}
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleBuild}
                  disabled={!prompt.trim() || isBuilding}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold text-lg transition-all hover:shadow-lg hover:shadow-accent-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBuilding ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Building...
                    </span>
                  ) : (
                    '🚀 Generate Project'
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="max-w-3xl mx-auto mb-20">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(ex)}
                className="text-sm text-gray-400 bg-bg-secondary hover:bg-bg-tertiary border border-gray-800 hover:border-gray-600 rounded-lg px-3 py-2 text-left transition-all"
              >
                {ex.length > 60 ? ex.slice(0, 60) + '...' : ex}
              </button>
            ))}
          </div>
        </div>

        {/* Workflow */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid md:grid-cols-4 gap-3">
            {[
              ['01', 'Describe', 'Type your token, NFT, DEX, staking, or DAO idea in plain language.'],
              ['02', 'Tune', 'Pick the chain, project type, and feature toggles before generation.'],
              ['03', 'Generate', 'Get contracts, frontend files, deployment scripts, and README.'],
              ['04', 'Launch', 'Export ZIP or deploy ERC-20 directly with MetaMask on testnet.'],
            ].map(([step, title, desc]) => (
              <div key={step} className="rounded-2xl border border-gray-800 bg-bg-secondary/70 p-5 hover:border-indigo-500/40 transition-colors">
                <div className="text-xs text-cyan-300 font-semibold mb-4">{step}</div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: '🤖',
              title: 'AI-Powered',
              desc: 'Describe your project in any language. Our AI understands intent and generates production-ready code.',
            },
            {
              icon: '⛓️',
              title: 'Multi-Chain',
              desc: 'Deploy to Ethereum, Base, Arbitrum, Polygon, BSC, Avalanche. More chains coming soon.',
            },
            {
              icon: '🚀',
              title: 'Full Stack',
              desc: 'Get complete smart contracts + frontend + deploy scripts. Not just boilerplate — real projects.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="card-glow rounded-xl"
            >
              <div className="bg-bg-secondary rounded-xl p-6 h-full">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
