'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SavedProjectRecord } from '@/types'
import { deleteProject, getSavedProjects } from '@/lib/storage'

export default function DashboardPage() {
  const [projects, setProjects] = useState<SavedProjectRecord[]>([])

  useEffect(() => {
    setProjects(getSavedProjects())
  }, [])

  const openProject = (record: SavedProjectRecord) => {
    sessionStorage.setItem('blockpilot_project', JSON.stringify(record.project))
    localStorage.setItem('blockpilot_current_project_id', record.id)
    window.location.href = '/build'
  }

  const removeProject = (id: string) => {
    deleteProject(id)
    setProjects(getSavedProjects())
  }

  return (
    <div className="min-h-screen grid-bg">
      <Header />
      <main className="max-w-6xl mx-auto px-4 pt-28 pb-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-sm text-cyan-300 font-semibold uppercase tracking-[0.2em]">Dashboard</p>
            <h1 className="mt-3 text-4xl md:text-6xl font-bold text-white">Saved projects</h1>
            <p className="mt-4 text-gray-400 max-w-2xl">Projects are stored locally in your browser for this MVP. Export ZIP anytime or reopen the build page.</p>
          </div>
          <a href="/#builder" className="rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-5 py-3 text-sm font-semibold text-white">New project</a>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-3xl border border-gray-800 bg-bg-secondary/80 p-10 text-center">
            <div className="text-5xl mb-4">🛫</div>
            <h2 className="text-2xl font-bold text-white">No saved projects yet</h2>
            <p className="mt-3 text-gray-400">Generate a project and BlockPilot will save it here automatically.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {projects.map((record) => (
              <div key={record.id} className="rounded-3xl border border-gray-800 bg-bg-secondary/80 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{record.project.spec.name}</h2>
                    <p className="text-sm text-gray-400 mt-1">{record.project.spec.description}</p>
                  </div>
                  <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">{record.project.spec.type}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-gray-700 px-3 py-1 text-gray-300">{record.project.spec.chain}</span>
                  <span className="rounded-full border border-gray-700 px-3 py-1 text-gray-300">{record.project.contracts.length + record.project.frontend.length + 1} files</span>
                  <span className="rounded-full border border-gray-700 px-3 py-1 text-gray-300">{record.deploys?.length || 0} deploys</span>
                </div>
                {record.deploys?.[0] && (
                  <div className="mt-5 rounded-2xl bg-bg-primary/60 border border-gray-800 p-4 text-sm text-gray-400">
                    Latest deploy: <span className="text-gray-200 font-mono">{record.deploys[0].contractAddress || record.deploys[0].txHash}</span>
                  </div>
                )}
                <div className="mt-6 flex gap-3">
                  <button onClick={() => openProject(record)} className="flex-1 rounded-xl bg-accent-primary px-4 py-3 text-sm font-semibold text-white">Open</button>
                  <button onClick={() => removeProject(record.id)} className="rounded-xl border border-red-500/30 px-4 py-3 text-sm text-red-300 hover:bg-red-500/10">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
