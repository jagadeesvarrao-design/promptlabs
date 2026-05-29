'use client'

import { useState, useEffect, useMemo } from 'react'
import { Play, Loader2, Zap, DollarSign, Hash, Clock } from 'lucide-react'
import { extractVariables } from '@/lib/prompt-utils'

interface TestPanelProps {
  systemMessage: string | null
  userTemplate: string
  model: string
  temperature: number
  maxTokens: number
}

interface RunResult {
  output: string
  latencyMs: number
  promptTokens: number
  completionTokens: number
  estimatedCostUsd: number
}

export default function TestPanel({ systemMessage, userTemplate, model, temperature, maxTokens }: TestPanelProps) {
  const variables = useMemo(() => extractVariables(userTemplate), [userTemplate])
  const [varValues, setVarValues] = useState<Record<string, string>>({})
  const [result, setResult] = useState<RunResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  // Reset var values when template variables change
  useEffect(() => {
    setVarValues((prev) => {
      const next: Record<string, string> = {}
      variables.forEach((v) => { next[v] = prev[v] || '' })
      return next
    })
  }, [variables])

  const handleRun = async () => {
    if (!userTemplate.trim()) return
    setIsRunning(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemMessage, userTemplate, variables: varValues, model, temperature, maxTokens }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to run')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Variable inputs */}
      {variables.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>
            Template Variables
          </p>
          <div className="grid grid-cols-2 gap-2">
            {variables.map((v) => (
              <div key={v}>
                <label className="text-xs mb-1 block" style={{ color: 'var(--accent-light)' }}>
                  {'{'}
                  {v}
                  {'}'}
                </label>
                <input
                  type="text"
                  value={varValues[v] || ''}
                  onChange={(e) => setVarValues((prev) => ({ ...prev, [v]: e.target.value }))}
                  placeholder={`Enter ${v}...`}
                  className="w-full px-3 py-1.5 rounded-lg text-sm text-slate-200 placeholder-slate-500 transition-all"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No variables notice */}
      {variables.length === 0 && (
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          No template variables detected. Add <code className="text-violet-400">{'{variable}'}</code> to your prompt template.
        </p>
      )}

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={isRunning || !userTemplate.trim()}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color: 'white',
          boxShadow: isRunning ? 'none' : '0 4px 15px rgba(124,58,237,0.3)',
        }}
      >
        {isRunning ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Play size={14} />
            Run Prompt
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="fade-in flex flex-col gap-3">
          {/* Metrics row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Clock, label: 'Latency', value: `${result.latencyMs}ms` },
              { icon: Hash, label: 'Tokens', value: (result.promptTokens + result.completionTokens).toLocaleString() },
              { icon: DollarSign, label: 'Cost', value: `$${result.estimatedCostUsd.toFixed(6)}` },
              { icon: Zap, label: 'Model', value: model.split('-').slice(-1)[0] },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg p-2 text-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}>
                <Icon size={12} className="mx-auto mb-1" style={{ color: 'var(--accent-light)' }} />
                <div className="text-xs font-semibold text-slate-200">{value}</div>
                <div className="text-xs" style={{ color: 'var(--muted)', fontSize: '10px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Output */}
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Output</p>
            <div
              className="rounded-xl p-4 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', minHeight: '80px', maxHeight: '300px', overflowY: 'auto' }}
            >
              {result.output}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
