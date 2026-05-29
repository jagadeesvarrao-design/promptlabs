'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Modal from '@/components/modal'
import { FolderOpen, Plus, Layers, ArrowRight, Trash2, Search, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  _count: { prompts: number }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch { /* ignore */ }
    finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) { setError('Name is required'); return }
    setIsCreating(true); setError('')
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProjects((prev) => [data, ...prev])
      setShowModal(false); setNewName(''); setNewDesc('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally { setIsCreating(false) }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!confirm('Delete this project and all its prompts?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const filtered = Array.isArray(projects) ? projects.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase())
  ) : []

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
  const inputStyle = { background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">Projects</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Organize your prompts into projects</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}
          >
            <Plus size={14} /> New Project
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-500 outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', maxWidth: '360px' }}
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(124,58,237,0.1)' }}>
              <FolderOpen size={28} style={{ color: 'var(--accent-light)' }} />
            </div>
            <p className="text-lg font-semibold text-slate-200 mb-2">{search ? 'No results found' : 'No projects yet'}</p>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
              {search ? 'Try a different search term' : 'Create your first project to start organizing prompts'}
            </p>
            {!search && (
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa' }}>
                <Plus size={14} /> Create Project
              </button>
            )}
          </div>
        )}

        {/* Projects grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] block"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.12)' }}>
                    <FolderOpen size={18} style={{ color: 'var(--accent-light)' }} />
                  </div>
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <h3 className="font-semibold text-slate-100 mb-1 line-clamp-1">{project.name}</h3>
                {project.description && (
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>{project.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                    <Layers size={11} />
                    {project._count.prompts} prompt{project._count.prompts !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1 text-xs transition-all" style={{ color: 'var(--accent-light)' }}>
                    Open <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--muted-dark)', fontSize: '10px' }}>
                  Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setError('') }} title="New Project">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Project Name *</label>
            <input className={inputCls} style={inputStyle} placeholder="e.g. Customer Support Bot" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreate()} autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Description</label>
            <textarea className={inputCls} style={{ ...inputStyle, resize: 'none' }} placeholder="What are these prompts for?" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button onClick={handleCreate} disabled={isCreating} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
            {isCreating ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
