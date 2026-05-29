'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { Key, Plus, Trash2, Copy, Check, Loader2, ShieldAlert } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed: string | null
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') loadKeys()
  }, [status, router])

  const loadKeys = async () => {
    try {
      const res = await fetch('/api/keys')
      if (res.ok) setKeys(await res.json())
    } catch { /* ignore */ }
    finally { setIsLoading(false) }
  }

  const handleGenerate = async () => {
    if (!newKeyName.trim()) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
      if (res.ok) {
        setNewKeyName('')
        loadKeys()
      }
    } catch { /* ignore */ }
    finally { setIsGenerating(false) }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure? Any apps using this key will immediately stop working.')) return
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' })
      if (res.ok) loadKeys()
    } catch { /* ignore */ }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <Loader2 size={24} className="animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account and security preferences.</p>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {/* Header */}
          <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <Key size={24} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100 mb-1">API Keys</h2>
                <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                  API keys allow external applications and microservices to authenticate with PromptLab's Deployment API. 
                  Do not share your API keys in publicly accessible areas like GitHub or client-side code.
                </p>
              </div>
            </div>
          </div>

          {/* Generator */}
          <div className="p-6" style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border)' }}>
            <label className="block text-xs font-semibold text-slate-400 mb-2">CREATE NEW SECRET KEY</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Key Name (e.g., Production Customer Support Bot)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#f8fafc' }}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !newKeyName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white' }}
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Generate Key
              </button>
            </div>
          </div>

          {/* Key List */}
          <div className="p-6">
            {keys.length === 0 ? (
              <div className="text-center py-10">
                <ShieldAlert size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium text-slate-300">No API keys found</p>
                <p className="text-xs text-slate-500 mt-1">Generate one above to start using the API.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {keys.map((k) => (
                  <div key={k.id} className="p-4 rounded-xl flex items-center justify-between group transition-all" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 mb-1">{k.name}</h4>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-amber-500/80">
                          {k.key.substring(0, 8)}••••••••••••••••
                        </span>
                        <span>Created {formatDistanceToNow(new Date(k.createdAt))} ago</span>
                        {k.lastUsed ? (
                          <span className="text-emerald-500/80">Last used {formatDistanceToNow(new Date(k.lastUsed))} ago</span>
                        ) : (
                          <span>Never used</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(k.id, k.key)}
                        className="p-2 rounded-lg transition-colors hover:bg-white/10"
                        title="Copy full key"
                      >
                        {copiedId === k.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-slate-400" />}
                      </button>
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-500/20 text-red-400"
                        title="Revoke key"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
