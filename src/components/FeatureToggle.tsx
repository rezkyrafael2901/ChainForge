'use client'

import { ProjectType } from '@/types'
import { FeatureOption, getFeatures } from '@/lib/features'

interface FeatureToggleProps {
  type: ProjectType
  selected: string[]
  onChange: (features: string[]) => void
}

export default function FeatureToggle({ type, selected, onChange }: FeatureToggleProps) {
  const features = getFeatures(type)

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(f => f !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const gasColor = (impact: 'low' | 'medium' | 'high') => {
    switch (impact) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
    }
  }

  const gasLabel = (impact: 'low' | 'medium' | 'high') => {
    switch (impact) {
      case 'low': return '+low gas'
      case 'medium': return '+med gas'
      case 'high': return '+high gas'
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Features</p>
        <p className="text-xs text-gray-600">{selected.length} selected</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {features.map((feature) => {
          const isSelected = selected.includes(feature.id)
          return (
            <button
              key={feature.id}
              type="button"
              onClick={() => toggle(feature.id)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-accent-primary/10 border-accent-primary/50 shadow-sm shadow-accent-primary/10'
                  : 'bg-bg-tertiary/50 border-transparent hover:border-gray-700'
              }`}
            >
              {/* Toggle switch */}
              <div
                className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors ${
                  isSelected ? 'bg-accent-primary' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    isSelected ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{feature.icon}</span>
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                    {feature.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{feature.description}</p>
              </div>

              {/* Gas badge */}
              <span className={`text-[10px] font-mono flex-shrink-0 ${gasColor(feature.gasImpact)}`}>
                {gasLabel(feature.gasImpact)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
