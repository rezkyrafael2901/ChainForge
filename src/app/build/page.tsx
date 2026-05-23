'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CodePreview from '@/components/CodePreview'
import DeployPanel from '@/components/DeployPanel'
import { GeneratedProject, GeneratedFile } from '@/types'

const BUILD_STEPS = [
  { id: 'parse', label: 'Parsing prompt' },
  { id: 'generate', label: 'Generating contracts' },
  { id: 'validate', label: 'Validating code' },
  { id: 'complete', label: 'Build complete' },
]

export default function BuildPage() {
  const router = useRouter()
  const [project, setProject] = useState<GeneratedProject | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState<'contracts' | 'frontend' | 'deploy' | 'readme'>('contracts')
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [isZipping, setIsZipping] = useState(false)

  useEffect(() => {
    const data = sessionStorage.getItem('blockpilot_project')
    if (!data) {
      router.push('/')
      return
    }
    
    const parsed = JSON.parse(data) as GeneratedProject
    const timers = [
      setTimeout(() => setCurrentStep(1), 800),
      setTimeout(() => setCurrentStep(2), 1600),
      setTimeout(() => setCurrentStep(3), 2400),
      setTimeout(() => setProject(parsed), 2800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [router])

  const copyCode = (file: GeneratedFile) => {
    navigator.clipboard.writeText(file.content)
    setCopiedPath(file.path)
    setTimeout(() => setCopiedPath(null), 2000)
  }

  const downloadZip = async () => {
    if (!project || isZipping) return
    setIsZipping(true)
    try {
      const { downloadProjectAsZip } = await import('@/lib/zip')
      await downloadProjectAsZip(project)
    } catch (err) {
      console.error('ZIP download failed:', err)
      alert('Failed to generate ZIP. Try again.')
    } finally {
      setIsZipping(false)
    }
  }

  const chainColors: Record<string, string> = {
    ethereum: '#627eea',
    base: '#0052ff',
    arbitrum: '#28a0f0',
    polygon: '#8247e5',
    bsc: '#f3ba2f',
    avalanche: '#e84142',
  }

  if (!project && currentStep < 4) {
    return (
      <div className="min-h-screen grid-bg">
        <Header />
        <main className="max-w-3xl mx-auto px-4 pt-32">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Building your project...</h2>
          <div className="space-y-4">
            {BUILD_STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i < currentStep ? 'bg-green-500 text-white' :
                  i === currentStep ? 'bg-accent-primary text-white animate-pulse' :
                  'bg-bg-tertiary text-gray-500'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-lg ${
                  i <= currentStep ? 'text-white' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (!project) return null

  const tabs = [
    { id: 'contracts' as const, label: 'Contracts', count: project.contracts.length },
    { id: 'frontend' as const, label: 'Frontend', count: project.frontend.length },
    { id: 'deploy' as const, label: 'Deploy', count: 1 },
    { id: 'readme' as const, label: 'README', count: 0 },
  ]

  const activeFiles: GeneratedFile[] =
    activeTab === 'contracts' ? project.contracts :
    activeTab === 'frontend' ? project.frontend :
    activeTab === 'deploy' ? [project.deployScript] :
    []

  const lineCount = (content: string) => content.split('\n').length

  return (
    <div className="min-h-screen grid-bg">
      <Header />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-32">
        {/* Back + Actions */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <div className="flex gap-3">
            <button
              onClick={downloadZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
            >
              {isZipping ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Zipping...
                </>
              ) : (
                <>📥 Download ZIP</>
              )}
            </button>
            <button
              onClick={() => setActiveTab('deploy')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium hover:shadow-lg hover:shadow-accent-primary/25 transition-all"
            >
              🚀 Deploy
            </button>
          </div>
        </div>

        {/* Project Summary */}
        <div className="card-glow rounded-2xl mb-8">
          <div className="bg-bg-secondary rounded-2xl p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{project.spec.name}</h1>
                <p className="text-gray-400 mb-4">{project.spec.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-sm text-white"
                    style={{ backgroundColor: (chainColors[project.spec.chain] || '#6366f1') + '30', border: `1px solid ${chainColors[project.spec.chain] || '#6366f1'}` }}
                  >
                    {project.spec.chain}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm bg-accent-primary/20 border border-accent-primary text-accent-glow">
                    {project.spec.type.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm bg-bg-tertiary border border-gray-700 text-gray-300">
                    ~{project.estimatedGas}
                  </span>
                  {project.spec.features.map((f) => (
                    <span key={f} className="px-3 py-1 rounded-full text-sm bg-green-500/10 border border-green-500/30 text-green-400">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold gradient-text">
                  {project.contracts.length + project.frontend.length + 1}
                </div>
                <div className="text-sm text-gray-500">files generated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-bg-secondary rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-accent-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label} {tab.count > 0 && <span className="text-xs opacity-60">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* File List */}
        {activeTab === 'readme' ? (
          <div className="card-glow rounded-xl">
            <div className="bg-bg-secondary rounded-xl p-6">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                {project.readme}
              </pre>
            </div>
          </div>
        ) : activeTab === 'deploy' ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <DeployPanel
              spec={project.spec}
              contractSource={project.contracts[0]?.content || ''}
            />
            <div className="space-y-4">
              {activeFiles.map((file, i) => (
                <div key={i} className="card-glow rounded-xl">
                  <div className="bg-bg-secondary rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📄</span>
                        <div>
                          <h3 className="text-white font-medium font-mono text-sm">{file.path}</h3>
                          <p className="text-xs text-gray-500">{file.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => copyCode(file)}
                        className="px-3 py-1 rounded text-xs bg-bg-tertiary hover:bg-accent-primary text-gray-300 hover:text-white transition-all border border-gray-700"
                      >
                        {copiedPath === file.path ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <CodePreview code={file.content} language={file.language} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeFiles.map((file, i) => (
              <div key={i} className="card-glow rounded-xl">
                <div className="bg-bg-secondary rounded-xl overflow-hidden">
                  {/* File Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {file.language === 'solidity' ? '📄' : file.language === 'html' ? '🌐' : '📝'}
                      </span>
                      <div>
                        <h3 className="text-white font-medium font-mono text-sm">{file.path}</h3>
                        <p className="text-xs text-gray-500">{file.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {lineCount(file.content)} lines
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs bg-bg-tertiary text-gray-400 border border-gray-700">
                        {file.language}
                      </span>
                      <button
                        onClick={() => copyCode(file)}
                        className="px-3 py-1 rounded text-xs bg-bg-tertiary hover:bg-accent-primary text-gray-300 hover:text-white transition-all border border-gray-700"
                      >
                        {copiedPath === file.path ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  {/* Code Preview */}
                  <CodePreview code={file.content} language={file.language} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-8 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 text-sm">
          ⚠️ Generated contracts are templates. Always audit before deploying to mainnet. Run <code className="bg-bg-tertiary px-1 rounded">slither .</code> and <code className="bg-bg-tertiary px-1 rounded">forge test</code> before use.
        </div>
      </main>
      <Footer />
    </div>
  )
}
