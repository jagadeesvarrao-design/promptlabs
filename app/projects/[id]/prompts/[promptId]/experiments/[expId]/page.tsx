'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import ABBarChart from '@/components/charts/ab-bar-chart'
import { ChevronLeft, Play, Loader2, Trophy, Clock, DollarSign, Hash, Star } from 'lucide-react'

interface Version {
  id: string; versionNumber: number; model: string; tag: string
  systemMessage: string | null; userTemplate: string; temperature: number; maxTokens: number
}
interface Result {
  id: string; versionId: string; output: string; latencyMs: number
  promptTokens: number; completionTokens: number; estimatedCostUsd: number
  qualityScore: number | null
  version: { versionNumber: number; model: string }
  testCase: { inputVariables: string; expectedOutput: string | null }
}
interface TestCase { id: string; inputVariables: string; expectedOutput: string | null; results: Result[] }
interface Experiment {
  id: string; name: string; status: string; createdAt: string; completedAt: string | null
  versionA: Version; versionB: Version; testCases: TestCase[]; results: Result[]
}

function avg(nums: number[]): number {
  if (!nums.length) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function pct(a: number, b: number): string {
  if (b === 0) return '—'
  return `${((a - b) / b * 100).toFixed(1)}%`
}

const METRIC_FMT: Record<string, (v: number) => string> = {
  'Quality Score': (v) => v.toFixed(2),
  'Latency (ms)': (v) => v.toFixed(0),
  'Cost (USD)': (v) => `$${v.toFixed(6)}`,
  'Total Tokens': (v) => v.toFixed(0),
}

export default function ExperimentResultsPage() {
  const { id: projectId, promptId, expId } = useParams<{ id: string; promptId: string; expId: string }>()
  const [exp, setExp] = useState<Experiment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [useJudge, setUseJudge] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const res = await fetch(`/api/experiments/${expId}`)
      if (!res.ok) return
      setExp(await res.json())
    } catch { /* ignore */ }
    finally { setIsLoading(false) }
  }

  useEffect(() => { load() }, [expId])

  const handleRun = async () => {
    setIsRunning(true); setError('')
    try {
      const res = await fetch(`/api/experiments/${expId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useJudge }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run experiment')
    } finally { setIsRunning(false) }
  }

  if (isLoading) return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    </div>
  )

  if (!exp) return null

  // Compute stats per version
  const aResults = exp.results.filter((r) => r.versionId === exp.versionA.id)
  const bResults = exp.results.filter((r) => r.versionId === exp.versionB.id)

  const aStats = {
    quality: avg(aResults.map((r) => r.qualityScore ?? 0)),
    latency: avg(aResults.map((r) => r.latencyMs)),
    cost: avg(aResults.map((r) => r.estimatedCostUsd)),
    tokens: avg(aResults.map((r) => r.promptTokens + r.completionTokens)),
  }
  const bStats = {
    quality: avg(bResults.map((r) => r.qualityScore ?? 0)),
    latency: avg(bResults.map((r) => r.latencyMs)),
    cost: avg(bResults.map((r) => r.estimatedCostUsd)),
    tokens: avg(bResults.map((r) => r.promptTokens + r.completionTokens)),
  }

  const hasResults = exp.results.length > 0
  const winner = hasResults
    ? aStats.quality > bStats.quality ? 'A' : bStats.quality > aStats.quality ? 'B' : 'TIE'
    : null

  const chartData = hasResults ? [
    { metric: 'Quality', A: aStats.quality, B: bStats.quality },
    { metric: 'Latency (s)', A: aStats.latency / 1000, B: bStats.latency / 1000 },
    { metric: 'Cost ($)', A: aStats.cost * 1000, B: bStats.cost * 1000 },
  ] : []

  const metricCards = [
    { icon: Star, label: 'Quality Score', aVal: aStats.quality, bVal: bStats.quality, fmt: (v: number) => v.toFixed(2), higherIsBetter: true },
    { icon: Clock, label: 'Avg Latency', aVal: aStats.latency, bVal: bStats.latency, fmt: (v: number) => `${v.toFixed(0)}ms`, higherIsBetter: false },
    { icon: DollarSign, label: 'Avg Cost', aVal: aStats.cost, bVal: bStats.cost, fmt: (v: number) => `$${v.toFixed(6)}`, higherIsBetter: false },
    { icon: Hash, label: 'Avg Tokens', aVal: aStats.tokens, bVal: bStats.tokens, fmt: (v: number) => v.toFixed(0), higherIsBetter: false },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <Link href={`/projects/${projectId}/prompts/${promptId}`} className="flex items-center gap-1.5 text-sm mb-6 transition-colors" style={{ color: 'var(--muted)' }}>
          <ChevronLeft size={14} /> Back to Prompt Editor
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">{exp.name}</h1>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: exp.status === 'completed' ? 'rgba(16,185,129,0.12)' : exp.status === 'running' ? 'rgba(245,158,11,0.12)' : 'rgba(148,163,184,0.1)',
                  color: exp.status === 'completed' ? '#10b981' : exp.status === 'running' ? '#f59e0b' : '#94a3b8',
                }}
              >
                {exp.status}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              v{exp.versionA.versionNumber} ({exp.versionA.model.split('-').slice(1).join('-')}) vs v{exp.versionB.versionNumber} ({exp.versionB.model.split('-').slice(1).join('-')})
              &nbsp;·&nbsp; {exp.testCases.length} test case{exp.testCases.length !== 1 ? 's' : ''}
            </p>
          </div>
          {exp.status === 'pending' && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--muted)' }}>
                <input type="checkbox" checked={useJudge} onChange={(e) => setUseJudge(e.target.checked)} className="accent-violet-500" />
                LLM-as-Judge scoring
              </label>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}
              >
                {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                {isRunning ? 'Running...' : 'Run Experiment'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {/* Running state */}
        {isRunning && (
          <div className="mb-6 px-5 py-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <Loader2 size={16} className="animate-spin" style={{ color: '#f59e0b' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#f59e0b' }}>Experiment running...</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Calling Gemini API for both versions × {exp.testCases.length} test cases. This may take 30-120 seconds.</p>
            </div>
          </div>
        )}

        {/* Winner banner */}
        {hasResults && winner && (
          <div
            className="mb-6 px-5 py-4 rounded-2xl flex items-center gap-4"
            style={{ background: winner === 'TIE' ? 'rgba(148,163,184,0.08)' : 'rgba(124,58,237,0.1)', border: `1px solid ${winner === 'TIE' ? 'rgba(148,163,184,0.2)' : 'rgba(124,58,237,0.3)'}` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Trophy size={18} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className="font-bold text-slate-100">
                {winner === 'TIE' ? '🤝 Tie — Both versions performed equally' : `🏆 Version ${winner} wins!`}
              </p>
              {winner !== 'TIE' && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  Quality score: v{winner === 'A' ? exp.versionA.versionNumber : exp.versionB.versionNumber} scored{' '}
                  <strong style={{ color: '#a78bfa' }}>{winner === 'A' ? aStats.quality.toFixed(2) : bStats.quality.toFixed(2)}</strong> vs{' '}
                  <strong>{winner === 'A' ? bStats.quality.toFixed(2) : aStats.quality.toFixed(2)}</strong>
                  {' '}({pct(
                    winner === 'A' ? aStats.quality : bStats.quality,
                    winner === 'A' ? bStats.quality : aStats.quality
                  )} better)
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stats grid */}
        {hasResults && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {metricCards.map(({ icon: Icon, label, aVal, bVal, fmt, higherIsBetter }) => {
                const aWins = higherIsBetter ? aVal > bVal : aVal < bVal
                const bWins = higherIsBetter ? bVal > aVal : bVal < aVal
                return (
                  <div key={label} className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon size={13} style={{ color: 'var(--muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs" style={{ color: '#a78bfa' }}>v{exp.versionA.versionNumber}</span>
                          {aWins && <Trophy size={10} style={{ color: '#f59e0b' }} />}
                        </div>
                        <span className="text-lg font-bold" style={{ color: aWins ? '#a78bfa' : '#64748b' }}>{fmt(aVal)}</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 mb-0.5 justify-end">
                          {bWins && <Trophy size={10} style={{ color: '#f59e0b' }} />}
                          <span className="text-xs" style={{ color: '#06b6d4' }}>v{exp.versionB.versionNumber}</span>
                        </div>
                        <span className="text-lg font-bold" style={{ color: bWins ? '#06b6d4' : '#64748b' }}>{fmt(bVal)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Chart */}
            <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-sm font-semibold text-slate-200">Metric Comparison</h3>
                <div className="flex items-center gap-3 ml-auto text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: '#7c3aed' }} /> v{exp.versionA.versionNumber} (A)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: '#06b6d4' }} /> v{exp.versionB.versionNumber} (B)</span>
                </div>
              </div>
              <ABBarChart
                data={chartData}
                labelA={`v${exp.versionA.versionNumber}`}
                labelB={`v${exp.versionB.versionNumber}`}
              />
              <p className="text-xs text-center mt-2" style={{ color: 'var(--muted)' }}>
                Cost multiplied ×1000 for visibility · Latency shown in seconds
              </p>
            </div>

            {/* Results table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="text-sm font-semibold text-slate-200">Per Test Case Results</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                      <th className="text-left px-5 py-3 font-medium">Test Case</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: '#a78bfa' }}>v{exp.versionA.versionNumber} Output</th>
                      <th className="text-center px-3 py-3 font-medium" style={{ color: '#a78bfa' }}>Quality</th>
                      <th className="text-left px-4 py-3 font-medium" style={{ color: '#06b6d4' }}>v{exp.versionB.versionNumber} Output</th>
                      <th className="text-center px-3 py-3 font-medium" style={{ color: '#06b6d4' }}>Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exp.testCases.map((tc, i) => {
                      const aRes = tc.results.find((r) => r.versionId === exp.versionA.id)
                      const bRes = tc.results.find((r) => r.versionId === exp.versionB.id)
                      const vars = JSON.parse(tc.inputVariables) as Record<string, string>
                      return (
                        <tr key={tc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="px-5 py-4 align-top">
                            <span className="text-slate-400 font-medium mb-1 block">#{i + 1}</span>
                            {Object.entries(vars).map(([k, v]) => (
                              <div key={k}>
                                <span style={{ color: '#a78bfa' }}>{k}:</span>{' '}
                                <span className="text-slate-300">{v}</span>
                              </div>
                            ))}
                          </td>
                          <td className="px-4 py-4 align-top max-w-xs">
                            <p className="text-slate-300 leading-relaxed line-clamp-4">{aRes?.output || '—'}</p>
                            {aRes && <p className="mt-1" style={{ color: 'var(--muted)' }}>{aRes.latencyMs}ms · {(aRes.promptTokens + aRes.completionTokens)} tok</p>}
                          </td>
                          <td className="px-3 py-4 text-center align-top">
                            {aRes?.qualityScore != null ? (
                              <span className="font-bold" style={{ color: (aRes.qualityScore || 0) >= (bRes?.qualityScore || 0) ? '#a78bfa' : '#64748b' }}>
                                {aRes.qualityScore.toFixed(1)}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-4 align-top max-w-xs">
                            <p className="text-slate-300 leading-relaxed line-clamp-4">{bRes?.output || '—'}</p>
                            {bRes && <p className="mt-1" style={{ color: 'var(--muted)' }}>{bRes.latencyMs}ms · {(bRes.promptTokens + bRes.completionTokens)} tok</p>}
                          </td>
                          <td className="px-3 py-4 text-center align-top">
                            {bRes?.qualityScore != null ? (
                              <span className="font-bold" style={{ color: (bRes.qualityScore || 0) > (aRes?.qualityScore || 0) ? '#06b6d4' : '#64748b' }}>
                                {bRes.qualityScore.toFixed(1)}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Not run yet */}
        {!hasResults && exp.status === 'pending' && !isRunning && (
          <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <Play size={36} className="mx-auto mb-4" style={{ color: 'var(--muted)' }} />
            <p className="text-lg font-semibold text-slate-200 mb-2">Ready to run</p>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Click "Run Experiment" to start comparing both prompt versions across {exp.testCases.length} test case{exp.testCases.length !== 1 ? 's' : ''}</p>
            <button
              onClick={handleRun}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}
            >
              <Play size={14} /> Run Experiment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
