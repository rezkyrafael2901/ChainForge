'use client'

import { ProjectSpec } from '@/types'
import { estimateGas, getChainLinks, recommendChain, scanSecurity } from '@/lib/intelligence'

interface Props {
  spec: ProjectSpec
}

const severityClasses = {
  low: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  high: 'border-red-500/30 bg-red-500/10 text-red-300',
}

export default function ProjectInsights({ spec }: Props) {
  const gas = estimateGas(spec)
  const findings = scanSecurity(spec)
  const recommendation = recommendChain(`${spec.description} ${spec.name}`, spec.type)
  const links = getChainLinks(spec.chain)

  return (
    <div className="grid lg:grid-cols-3 gap-4 mb-8">
      <div className="rounded-2xl border border-gray-800 bg-bg-secondary/80 p-5">
        <div className="text-sm text-gray-500 mb-2">Gas estimator</div>
        <div className="text-2xl font-bold text-white">{gas.estimatedCostUsd}</div>
        <p className="mt-2 text-sm text-gray-400">~{gas.deployGas.toLocaleString()} gas on {gas.chain}</p>
        <p className="mt-2 text-xs text-gray-500">{gas.note}</p>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-bg-secondary/80 p-5">
        <div className="text-sm text-gray-500 mb-2">Chain recommendation</div>
        <div className="text-2xl font-bold text-white capitalize">{recommendation.chain}</div>
        <p className="mt-2 text-sm text-gray-400">{recommendation.reason}</p>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-bg-secondary/80 p-5">
        <div className="text-sm text-gray-500 mb-2">Explorer & faucet</div>
        <div className="flex flex-wrap gap-2">
          <a href={links.explorer} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-bg-tertiary px-3 py-2 text-sm text-gray-300 hover:text-white">Explorer</a>
          {links.faucet && <a href={links.faucet} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-bg-tertiary px-3 py-2 text-sm text-gray-300 hover:text-white">Faucet</a>}
        </div>
      </div>

      <div className="lg:col-span-3 rounded-2xl border border-gray-800 bg-bg-secondary/80 p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Security scanner</h3>
            <p className="text-sm text-gray-400">Basic static risk signals before deployment.</p>
          </div>
          <span className="rounded-full bg-bg-tertiary px-3 py-1 text-xs text-gray-300">{findings.length} findings</span>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {findings.map((finding) => (
            <div key={finding.title} className={`rounded-xl border p-4 ${severityClasses[finding.severity]}`}>
              <div className="text-xs uppercase tracking-wider opacity-80">{finding.severity}</div>
              <h4 className="mt-1 font-semibold text-white">{finding.title}</h4>
              <p className="mt-1 text-sm opacity-90">{finding.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
