import { DeployRecord, GeneratedProject, SavedProjectRecord } from '@/types'

const PROJECTS_KEY = 'blockpilot_saved_projects'
const CURRENT_PROJECT_ID_KEY = 'blockpilot_current_project_id'

export function makeProjectId(project: GeneratedProject): string {
  const base = `${project.spec.name}-${project.spec.chain}-${project.spec.type}-${Date.now()}`
  return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function getSavedProjects(): SavedProjectRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedProjectRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveProject(project: GeneratedProject, existingId?: string): SavedProjectRecord {
  const records = getSavedProjects()
  const now = new Date().toISOString()
  const found = existingId ? records.find(r => r.id === existingId) : undefined

  const record: SavedProjectRecord = found
    ? { ...found, project, updatedAt: now }
    : { id: makeProjectId(project), project, createdAt: now, updatedAt: now, deploys: [] }

  const next = [record, ...records.filter(r => r.id !== record.id)].slice(0, 30)
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(next))
  localStorage.setItem(CURRENT_PROJECT_ID_KEY, record.id)
  return record
}

export function getProject(id: string): SavedProjectRecord | null {
  return getSavedProjects().find(r => r.id === id) || null
}

export function deleteProject(id: string) {
  const next = getSavedProjects().filter(r => r.id !== id)
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(next))
}

export function getCurrentProjectId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CURRENT_PROJECT_ID_KEY)
}

export function addDeployRecord(record: DeployRecord) {
  const records = getSavedProjects()
  const next = records.map(project => {
    if (project.id !== record.projectId) return project
    return {
      ...project,
      updatedAt: new Date().toISOString(),
      deploys: [record, ...(project.deploys || [])].slice(0, 20),
    }
  })
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(next))
}

export function exportProjectShare(project: GeneratedProject): string {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(project))))
  return `${window.location.origin}/build?project=${payload}`
}

export function importProjectShare(payload: string): GeneratedProject | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(payload)))) as GeneratedProject
  } catch {
    return null
  }
}
