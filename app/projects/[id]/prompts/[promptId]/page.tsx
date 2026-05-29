'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import VersionSidebar from '@/components/version-sidebar'
import TestPanel from '@/components/test-panel'
import DiffViewer from '@/components/diff-viewer'
import ExperimentCreator from '@/components/experiment-creator'
import ApiIntegrationModal from '@/components/api-integration-modal'
import {
  ChevronLeft, Save, Play, GitBranch, FlaskConical, Loader2,
  Thermometer, Hash, Cpu, ChevronDown, ChevronUp, ArrowRight, Server,
} from 'lucide-react'
import { extractVariables } from '@/lib/prompt-utils'

const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', badge: 'Best' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', badge: 'Fast' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', badge: 'Stable' },
]

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

interface Experiment {
  id: string
  name: string
  status: string
  createdAt: string
  versionA: { versionNumber: number; tag: string }
  versionB: { versionNumber: number; tag: string }
}

interface PromptData {
  id: string
  name: string
  description: string | null
  project: { id: string; name: string }
  versions: Version[]
  experiments: Experiment[]
}

export default function PromptEditorPage() {
  const { id: projectId, promptId } = useParams<{ id: string; promptId: string }>()

  const [prompt, setPrompt] = useState<PromptData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null)

  // Editor state
  const [systemMessage, setSystemMessage] = useState('')
  const [userTemplate, setUserTemplate] = useState('')
  const [model, setModel] = useState('gemini-2.5-flash')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(500)
  const [commitMessage, setCommitMessage] = useState('')

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showTest, setShowTest] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [diffVersions, setDiffVersions] = useState<{ a: Version | null; b: Version | null }>({ a: null, b: null })
  const [showExpCreator, setShowExpCreator] = useState(false)
  const [showApiModal, setShowApiModal] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'experiments'>('editor')

  const variables = useMemo(() => extractVariables(userTemplate), [userTemplate])

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/prompts/${promptId}`)
      if (!res.ok) return
      const data: PromptData = await res.json()
      setPrompt(data)
      if (data.versions.length > 0) {
        const latest = data.versions[0]
        loadVersion(latest)
        setActiveVersionId(latest.id)
      }
    } catch { /* ignore */ }
    finally { setIsLoading(false) }
  }, [promptId])

  useEffect(() => { load() }, [load])

  const loadVersion = (v: Version) => {
    setSystemMessage(v.systemMessage || '')
    setUserTemplate(v.userTemplate)
    setModel(v.model)
    setTemperature(v.temperature)
    setMaxTokens(v.maxTokens)
    setCommitMessage('')
    setActiveVersionId(v.id)
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    if (!userTemplate.trim()) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, systemMessage: systemMessage.trim() || null, userTemplate, model, temperature, maxTokens, commitMessage: commitMessage.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPrompt((prev) => prev ? { ...prev, versions: [data, ...prev.versions] } : prev)
      setActiveVersionId(data.id)
      setCommitMessage('')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch { /* ignore */ }
    finally { setIsSaving(false) }
  }

  const handleTagChange = async (versionId: string, tag: string) => {
    await fetch(`/api/versions/${versionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag }),
    })
    setPrompt((prev) => prev ? {
      ...prev,
      versions: prev.versions.map((v) => v.id === versionId ? { ...v, tag } : v),
    } : prev)
  }

  const handleCompare = (v1: Version, v2: Version) => {
    setDiffVersions({ a: v1, b: v2 })
    setShowDiff(true)
  }

  const handleExpCreated = (exp: { id: string }) => {
    load()
    setActiveTab('experiments')
  }

  const labelStyle = { color: 'var(--muted)' }
  const textareaBase = "prompt-textarea w-full rounded-xl px-4 py-3"
  const inputBase = "w-full px-3 py-2 rounded-lg text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
  const inputStyle = { background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }

  if (isLoading) return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    </div>
  )

  if (!prompt) return null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Navbar />

      {/* Header bar */}
      <div className="sticky top-14 z-40" style={{ background: 'rgba(7,7,15,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm min-w-0">
            <Link href="/projects" className="transition-colors flex-shrink-0" style={{ color: 'var(--muted)' }}>Projects</Link>
            <span style={{ color: 'var(--muted-dark)' }}>/</span>
            <Link href={`/projects/${projectId}`} className="transition-colors flex-shrink-0" style={{ color: 'var(--muted)' }}>{prompt.project.name}</Link>
            <span style={{ color: 'var(--muted-dark)' }}>/</span>
            <span className="text-slate-200 font-medium truncate">{prompt.name}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowApiModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-white/5"
              style={{ color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)' }}
            >
              <Server size={13} />
              API
            </button>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Describe changes..."
              className={inputBase}
              style={{ ...inputStyle, width: '200px', fontSize: '12px' }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              onClick={handleSave}
              disabled={isSaving || !userTemplate.trim()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: saveSuccess ? '#10b981' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', minWidth: '110px', justifyContent: 'center' }}
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saveSuccess ? 'Saved!' : isSaving ? 'Saving...' : 'Save Version'}
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 gap-5">
        {/* Left — Editor */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {(['editor', 'experiments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
                style={{
                  background: activeTab === tab ? 'rgba(124,58,237,0.2)' : 'transparent',
                  color: activeTab === tab ? '#a78bfa' : '#94a3b8',
                }}
              >
                {tab === 'editor' ? (
                  <span className="flex items-center gap-1.5"><GitBranch size={13} /> Editor</span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <FlaskConical size={13} /> Experiments
                    {prompt.experiments.length > 0 && (
                      <span className="text-xs px-1.5 py-0 rounded-full" style={{ background: 'rgba(124,58,237,0.3)', fontSize: '10px' }}>
                        {prompt.experiments.length}
                      </span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Editor Tab */}
          {activeTab === 'editor' && (
            <div className="flex flex-col gap-4 fade-in">
              {/* System Message */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <label className="block text-xs font-semibold mb-2" style={labelStyle}>
                  SYSTEM MESSAGE <span className="font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  className={textareaBase}
                  rows={3}
                  placeholder="You are a helpful assistant that..."
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.target.value)}
                />
              </div>

              {/* User Template */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold" style={labelStyle}>USER TEMPLATE</label>
                  {variables.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {variables.map((v) => (
                        <span key={v} className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)', fontSize: '11px' }}>
                          {'{' + v + '}'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <textarea
                  className={textareaBase}
                  rows={10}
                  placeholder={"Write your prompt here...\n\nUse {variable_name} for dynamic inputs.\nExample: Summarize this text: {text}"}
                  value={userTemplate}
                  onChange={(e) => setUserTemplate(e.target.value)}
                />
                {variables.length > 0 && (
                  <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                    💡 {variables.length} variable{variables.length !== 1 ? 's' : ''} detected — fill them in the Test Panel below
                  </p>
                )}
              </div>

              {/* Model settings */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <button
                  className="flex items-center justify-between w-full text-xs font-semibold mb-3"
                  style={labelStyle}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <span className="flex items-center gap-1.5"><Cpu size={12} /> MODEL SETTINGS</span>
                  {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                <div className="grid grid-cols-3 gap-3">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setModel(m.id)}
                      className="p-3 rounded-xl text-left transition-all"
                      style={{
                        background: model === m.id ? 'rgba(124,58,237,0.15)' : 'rgba(0,0,0,0.2)',
                        border: `1px solid ${model === m.id ? 'rgba(124,58,237,0.5)' : 'var(--border)'}`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-200">{m.name.split(' ').slice(1).join(' ')}</span>
                        <span className="text-xs px-1.5 py-0 rounded font-medium" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4', fontSize: '10px' }}>
                          {m.badge}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--muted)', fontSize: '10px' }}>{m.name}</span>
                    </button>
                  ))}
                </div>

                {showAdvanced && (
                  <div className="grid grid-cols-2 gap-4 mt-4 fade-in">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs flex items-center gap-1" style={labelStyle}><Thermometer size={11} /> Temperature</label>
                        <span className="text-xs font-mono text-slate-300">{temperature.toFixed(1)}</span>
                      </div>
                      <input
                        type="range" min="0" max="2" step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full accent-violet-500"
                      />
                      <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted-dark)', fontSize: '10px' }}>
                        <span>Precise</span><span>Creative</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs flex items-center gap-1 mb-2" style={labelStyle}><Hash size={11} /> Max Tokens</label>
                      <input
                        type="number" min="50" max="8192" step="50"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                        className={inputBase}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Test Panel */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <button
                  className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-semibold transition-colors"
                  style={{ ...labelStyle, borderBottom: showTest ? '1px solid var(--border)' : 'none' }}
                  onClick={() => setShowTest(!showTest)}
                >
                  <span className="flex items-center gap-1.5 text-slate-300"><Play size={12} /> QUICK TEST</span>
                  {showTest ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {showTest && (
                  <div className="p-5 fade-in">
                    <TestPanel
                      systemMessage={systemMessage || null}
                      userTemplate={userTemplate}
                      model={model}
                      temperature={temperature}
                      maxTokens={maxTokens}
                    />
                  </div>
                )}
              </div>

              {/* Create experiment CTA */}
              {prompt.versions.length >= 2 && (
                <button
                  onClick={() => setShowExpCreator(true)}
                  className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition-all hover:scale-[1.01]"
                  style={{ background: 'rgba(6,182,212,0.08)', border: '1px dashed rgba(6,182,212,0.3)', color: '#06b6d4' }}
                >
                  <FlaskConical size={14} />
                  Create A/B Experiment
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          )}

          {/* Experiments Tab */}
          {activeTab === 'experiments' && (
            <div className="fade-in flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">{prompt.experiments.length} experiment{prompt.experiments.length !== 1 ? 's' : ''}</p>
                {prompt.versions.length >= 2 && (
                  <button
                    onClick={() => setShowExpCreator(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}
                  >
                    <FlaskConical size={11} /> New Experiment
                  </button>
                )}
              </div>

              {prompt.experiments.length === 0 ? (
                <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <FlaskConical size={28} className="mx-auto mb-3" style={{ color: 'var(--muted)' }} />
                  <p className="text-sm font-medium text-slate-300 mb-1">No experiments yet</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
                    {prompt.versions.length < 2 ? 'Save at least 2 versions to create an A/B experiment' : 'Create an experiment to compare prompt versions'}
                  </p>
                  {prompt.versions.length >= 2 && (
                    <button onClick={() => setShowExpCreator(true)} className="text-sm px-4 py-2 rounded-xl font-medium" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>
                      Create Experiment
                    </button>
                  )}
                </div>
              ) : (
                prompt.experiments.map((exp) => (
                  <Link
                    key={exp.id}
                    href={`/projects/${projectId}/prompts/${promptId}/experiments/${exp.id}`}
                    className="rounded-2xl p-4 flex items-center justify-between transition-all hover:scale-[1.01] group"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-200">{exp.name}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: exp.status === 'completed' ? 'rgba(16,185,129,0.12)' : exp.status === 'running' ? 'rgba(245,158,11,0.12)' : 'rgba(148,163,184,0.1)',
                            color: exp.status === 'completed' ? '#10b981' : exp.status === 'running' ? '#f59e0b' : '#94a3b8',
                          }}
                        >
                          {exp.status}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        v{exp.versionA.versionNumber} vs v{exp.versionB.versionNumber}
                      </p>
                    </div>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--accent-light)' }} />
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right — Version sidebar */}
        <div
          className="w-64 flex-shrink-0 rounded-2xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', height: 'fit-content', position: 'sticky', top: '108px' }}
        >
          <div className="px-3 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <GitBranch size={13} style={{ color: 'var(--accent-light)' }} />
            <span className="text-xs font-semibold text-slate-300">VERSION HISTORY</span>
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>
              {prompt.versions.length}
            </span>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <VersionSidebar
              versions={prompt.versions}
              activeVersionId={activeVersionId}
              onLoad={loadVersion}
              onTagChange={handleTagChange}
              onCompare={handleCompare}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <DiffViewer
        isOpen={showDiff}
        onClose={() => setShowDiff(false)}
        versionA={diffVersions.a}
        versionB={diffVersions.b}
      />
      <ExperimentCreator
        isOpen={showExpCreator}
        onClose={() => setShowExpCreator(false)}
        promptId={promptId}
        versions={prompt.versions}
        onCreated={handleExpCreated}
      />
      <ApiIntegrationModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        promptId={promptId}
        promptName={prompt.name}
      />
    </div>
  )
}
