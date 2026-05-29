'use client'

import { useMemo } from 'react'
import * as Diff from 'diff'
import Modal from './modal'

interface DiffViewerProps {
  isOpen: boolean
  onClose: () => void
  versionA: { versionNumber: number; userTemplate: string; systemMessage: string | null } | null
  versionB: { versionNumber: number; userTemplate: string; systemMessage: string | null } | null
}

function DiffBlock({ label, textA, textB, vA, vB }: {
  label: string
  textA: string
  textB: string
  vA: number
  vB: number
}) {
  const changes = useMemo(() => Diff.diffWords(textA, textB), [textA, textB])

  return (
    <div>
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>{label}</p>
      <div className="flex gap-3">
        {/* Version A */}
        <div className="flex-1 rounded-lg p-3 text-xs leading-relaxed font-mono overflow-auto" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}>
          <div className="text-xs mb-2 font-sans font-medium text-slate-400">v{vA}</div>
          <div className="whitespace-pre-wrap break-words">
            {changes.map((part, i) =>
              part.removed ? (
                <span key={i} className="diff-removed px-0.5 rounded" style={{ color: '#f87171' }}>{part.value}</span>
              ) : !part.added ? (
                <span key={i} style={{ color: '#94a3b8' }}>{part.value}</span>
              ) : null
            )}
          </div>
        </div>

        {/* Version B */}
        <div className="flex-1 rounded-lg p-3 text-xs leading-relaxed font-mono overflow-auto" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}>
          <div className="text-xs mb-2 font-sans font-medium text-slate-400">v{vB}</div>
          <div className="whitespace-pre-wrap break-words">
            {changes.map((part, i) =>
              part.added ? (
                <span key={i} className="diff-added px-0.5 rounded" style={{ color: '#34d399' }}>{part.value}</span>
              ) : !part.removed ? (
                <span key={i} style={{ color: '#94a3b8' }}>{part.value}</span>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DiffViewer({ isOpen, onClose, versionA, versionB }: DiffViewerProps) {
  if (!versionA || !versionB) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Diff: v${versionA.versionNumber} → v${versionB.versionNumber}`} maxWidth="800px">
      <div className="flex flex-col gap-4">
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444' }} />
            <span style={{ color: 'var(--muted)' }}>Removed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981' }} />
            <span style={{ color: 'var(--muted)' }}>Added</span>
          </span>
        </div>

        {/* System message diff */}
        {(versionA.systemMessage || versionB.systemMessage) && (
          <DiffBlock
            label="System Message"
            textA={versionA.systemMessage || ''}
            textB={versionB.systemMessage || ''}
            vA={versionA.versionNumber}
            vB={versionB.versionNumber}
          />
        )}

        {/* User template diff */}
        <DiffBlock
          label="User Template"
          textA={versionA.userTemplate}
          textB={versionB.userTemplate}
          vA={versionA.versionNumber}
          vB={versionB.versionNumber}
        />
      </div>
    </Modal>
  )
}
