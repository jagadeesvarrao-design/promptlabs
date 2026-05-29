'use client'

import { formatDistanceToNow } from 'date-fns'
import { Clock, Tag, GitCommit, Cpu } from 'lucide-react'

interface Version {
  id: string
  versionNumber: number
  systemMessage: string | null
  userTemplate: string
  model: string
  temperature: number
  maxTokens: number
  tag: string
  commitMessage: string | null
  createdAt: string
}

interface VersionSidebarProps {
  versions: Version[]
  activeVersionId: string | null
  onLoad: (version: Version) => void
  onTagChange: (versionId: string, tag: string) => void
  onCompare: (v1: Version, v2: Version) => void
}

const TAG_COLORS: Record<string, string> = {
  production: 'tag-production',
  staging: 'tag-staging',
  draft: 'tag-draft',
}

const MODEL_SHORT: Record<string, string> = {
  'gemini-2.5-flash': '2.5F',
  'gemini-2.0-flash-lite': '2.0L',
  'gemini-1.5-flash': '1.5F',
}

export default function VersionSidebar({
  versions,
  activeVersionId,
  onLoad,
  onTagChange,
  onCompare,
}: VersionSidebarProps) {
  const tags = ['draft', 'staging', 'production']

  if (versions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
          <GitCommit size={18} style={{ color: 'var(--accent-light)' }} />
        </div>
        <p className="text-sm font-medium text-slate-300">No versions yet</p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>Save your first version to start tracking changes</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      {versions.map((v, i) => {
        const isActive = v.id === activeVersionId
        const isLatest = i === 0
        return (
          <div
            key={v.id}
            className="rounded-xl p-3 transition-all duration-200 cursor-pointer group"
            style={{
              background: isActive ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isActive ? 'rgba(124,58,237,0.4)' : 'var(--border)'}`,
            }}
            onClick={() => onLoad(v)}
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="version-badge">v{v.versionNumber}</span>
                {isLatest && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4', fontSize: '10px' }}>
                    latest
                  </span>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[v.tag] || 'tag-draft'}`}>
                {v.tag}
              </span>
            </div>

            {/* Commit message */}
            {v.commitMessage && (
              <p className="text-xs text-slate-300 mb-2 line-clamp-1">{v.commitMessage}</p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
              <span className="flex items-center gap-1">
                <Cpu size={10} />
                {MODEL_SHORT[v.model] || v.model}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
              </span>
            </div>

            {/* Actions - only show on hover or active */}
            <div
              className="mt-2 pt-2 flex items-center gap-1.5 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              style={{ borderTop: '1px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagChange(v.id, tag)}
                  disabled={v.tag === tag}
                  className="text-xs px-2 py-0.5 rounded-md transition-colors disabled:opacity-30"
                  style={{
                    background: v.tag === tag ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                    color: v.tag === tag ? '#a78bfa' : '#94a3b8',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Tag size={8} className="inline mr-1" />
                  {tag}
                </button>
              ))}
              {versions.length > 1 && (
                <button
                  onClick={() => {
                    const other = versions.find((x) => x.id !== v.id)
                    if (other) onCompare(v, other)
                  }}
                  className="text-xs px-2 py-0.5 rounded-md transition-colors ml-auto"
                  style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}
                >
                  Diff
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
