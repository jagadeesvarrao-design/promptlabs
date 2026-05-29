'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Modal from '@/components/modal'
import { ChevronLeft, Plus, Layers, FlaskConical, GitBranch, Trash2, ArrowRight, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Version { versionNumber: number; tag: string; model: string }
interface Prompt {
  id: string
  name: string
  description: string | null
  createdAt: string
  versions: Version[]
  _count: { versions: number; experiments: number }
}
interface Project { id: string; name: string; description: string | null; prompts: Prompt[] }

const TAG_COLORS: Record<string, string> = {
  production: '#10b981', staging: '#f59e0b', draft: '#94a3b8',
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`)
      if (!res.ok) { router.push('/projects'); return }
      setProject(await res.json())
    } catch { router.push('/projects') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [id])

  const handleCreate = async () => {
    if (!newName.trim()) { setError('Name is required'); return }
    setIsCreating(true); setError('')
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim(), projectId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/projects/${id}/prompts/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
      setIsCreating(false)
    }
  }

  const handleDelete = async (promptId: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!confirm('Delete this prompt and all its versions?')) return
    await fetch(`/api/prompts/${promptId}`, { method: 'DELETE' })
    setProject((prev) => prev ? { ...prev, prompts: prev.prompts.filter((p) => p.id !== promptId) } : prev)
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm text-slate-200 placeholder-slate-500 outline-none"
  const inputStyle = { background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }

  if (isLoading) return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    </div>
  )

  if (!project) return null

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <Link href="/projects" className="flex items-center gap-1.5 text-sm mb-6 transition-colors" style={{ color: 'var(--muted)' }}>
          <ChevronLeft size={14} /> Projects
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">{project.name}</h1>
            {project.description && <p className="text-sm" style={{ color: 'var(--muted)' }}>{project.description}</p>}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}
          >
            <Plus size={14} /> New Prompt
          </button>
        </div>

        {/* Empty state */}
        {project.prompts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(124,58,237,0.1)' }}>
              <Layers size={28} style={{ color: 'var(--accent-light)' }} />
            </div>
            <p className="text-lg font-semibold text-slate-200 mb-2">No prompts yet</p>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Create your first prompt to start versioning</p>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', color: '#a78bfa' }}>
              <Plus size={14} /> Create Prompt
            </button>
          </div>
        )}

        {/* Prompts grid */}
        {project.prompts.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.prompts.map((prompt) => {
              const latestVersion = prompt.versions[0]
              return (
                <Link
                  key={prompt.id}
                  href={`/projects/${id}/prompts/${prompt.id}`}
                  className="group rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] block"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.1)' }}>
                      <Layers size={18} style={{ color: '#06b6d4' }} />
                    </div>
                    <button onClick={(e) => handleDelete(prompt.id, e)} className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-red-400 hover:bg-red-400/10">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <h3 className="font-semibold text-slate-100 mb-1 line-clamp-1">{prompt.name}</h3>
                  {prompt.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>{prompt.description}</p>}

                  {/* Latest version badge */}
                  {latestVersion && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="version-badge">v{latestVersion.versionNumber}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${TAG_COLORS[latestVersion.tag] || '#94a3b8'}18`, color: TAG_COLORS[latestVersion.tag] || '#94a3b8', border: `1px solid ${TAG_COLORS[latestVersion.tag] || '#94a3b8'}35` }}>
                        {latestVersion.tag}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
                    <span className="flex items-center gap-1">
                      <GitBranch size={11} />{prompt._count.versions} version{prompt._count.versions !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <FlaskConical size={11} />{prompt._count.experiments} exp{prompt._count.experiments !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1 ml-auto" style={{ color: 'var(--accent-light)' }}>
                      Edit <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError('') }} title="New Prompt">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Prompt Name *</label>
            <input className={inputCls} style={inputStyle} placeholder="e.g. Email Summarizer" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreate()} autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Description</label>
            <textarea className={inputCls} style={{ ...inputStyle, resize: 'none' }} rows={2} placeholder="What does this prompt do?" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button onClick={handleCreate} disabled={isCreating} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
            {isCreating ? 'Creating...' : 'Create Prompt'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
