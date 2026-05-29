'use client'

import { useState } from 'react'
import { Plus, Trash2, FlaskConical } from 'lucide-react'
import Modal from './modal'
import { parseCSV } from '@/lib/csv-parser'

interface Version {
  id: string
  versionNumber: number
  tag: string
  model: string
}

interface ExperimentCreatorProps {
  isOpen: boolean
  onClose: () => void
  promptId: string
  versions: Version[]
  onCreated: (experiment: { id: string }) => void
}

interface TestCase {
  inputVariables: Record<string, string>
  expectedOutput: string
}

export default function ExperimentCreator({ isOpen, onClose, promptId, versions, onCreated }: ExperimentCreatorProps) {
  const [name, setName] = useState('')
  const [versionAId, setVersionAId] = useState(versions[0]?.id || '')
  const [versionBId, setVersionBId] = useState(versions[1]?.id || versions[0]?.id || '')
  const [testCases, setTestCases] = useState<TestCase[]>([{ inputVariables: {}, expectedOutput: '' }])
  const [evaluationRubric, setEvaluationRubric] = useState('')
  const [varKey, setVarKey] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  // Add a variable field to all test cases
  const addVariable = () => {
    if (!varKey.trim()) return
    setTestCases((prev) =>
      prev.map((tc) => ({ ...tc, inputVariables: { ...tc.inputVariables, [varKey.trim()]: '' } }))
    )
    setVarKey('')
  }

  const updateTestCaseVar = (tcIndex: number, key: string, value: string) => {
    setTestCases((prev) => {
      const next = [...prev]
      next[tcIndex] = { ...next[tcIndex], inputVariables: { ...next[tcIndex].inputVariables, [key]: value } }
      return next
    })
  }

  const updateTestCaseExpected = (tcIndex: number, value: string) => {
    setTestCases((prev) => {
      const next = [...prev]
      next[tcIndex] = { ...next[tcIndex], expectedOutput: value }
      return next
    })
  }

  const removeTestCase = (i: number) => {
    setTestCases((prev) => prev.filter((_, idx) => idx !== i))
  }

  const addTestCase = () => {
    const template = testCases[0] || { inputVariables: {}, expectedOutput: '' }
    const blankVars: Record<string, string> = {}
    Object.keys(template.inputVariables).forEach((k) => { blankVars[k] = '' })
    setTestCases((prev) => [...prev, { inputVariables: blankVars, expectedOutput: '' }])
  }

  const varKeys = Object.keys(testCases[0]?.inputVariables || {})

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = parseCSV(text)
        
        if (parsed.data.length === 0) {
          setError('No valid data found in CSV')
          return
        }

        // Map CSV headers to existing template variables, or add new ones
        const newTestCases: TestCase[] = parsed.data.map((row) => {
          const inputVars: Record<string, string> = {}
          let expected = ''

          Object.entries(row).forEach(([key, val]) => {
            const trimmedKey = key.trim()
            if (trimmedKey.toLowerCase() === 'expectedoutput' || trimmedKey.toLowerCase() === 'expected output' || trimmedKey.toLowerCase() === 'expected') {
              expected = val
            } else {
              inputVars[trimmedKey] = val
            }
          })

          // Ensure all existing varKeys are present in the new test cases
          varKeys.forEach(vk => {
            if (inputVars[vk] === undefined) inputVars[vk] = ''
          })

          return { inputVariables: inputVars, expectedOutput: expected }
        })

        setTestCases(newTestCases)
        setError('')
      } catch (err) {
        setError('Failed to parse CSV file')
      }
    }
    reader.readAsText(file)
    // reset input
    e.target.value = ''
  }

  const handleCreate = async () => {
    if (!name.trim()) { setError('Experiment name is required'); return }
    if (versionAId === versionBId) { setError('Select two different versions to compare'); return }
    setIsCreating(true)
    setError('')
    try {
      const res = await fetch('/api/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, promptId, versionAId, versionBId, testCases, evaluationRubric }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onCreated(data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create experiment')
    } finally {
      setIsCreating(false)
    }
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm text-slate-200 placeholder-slate-500 transition-all outline-none focus:ring-1"
  const inputStyle = { background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', '--tw-ring-color': 'rgba(124,58,237,0.5)' } as React.CSSProperties

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create A/B Experiment" maxWidth="600px">
      <div className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Experiment Name</label>
          <input className={inputCls} style={inputStyle} placeholder="e.g. Formal vs Casual Tone" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Version selectors */}
        <div className="grid grid-cols-2 gap-3">
          {[['Version A', versionAId, setVersionAId], ['Version B', versionBId, setVersionBId]].map(([label, val, setter]) => (
            <div key={label as string}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>{label as string}</label>
              <select
                className={inputCls}
                style={inputStyle}
                value={val as string}
                onChange={(e) => (setter as (v: string) => void)(e.target.value)}
              >
                {versions.map((v) => (
                  <option key={v.id} value={v.id} style={{ background: '#0f0f1e' }}>
                    v{v.versionNumber} · {v.tag} · {v.model.split('-')[1]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Custom Rubric */}
        <div>
          <label className="block text-xs font-medium mb-1.5 flex items-center justify-between" style={{ color: 'var(--muted)' }}>
            <span>Custom Grading Rubric <span className="text-slate-500 font-normal">(Optional)</span></span>
          </label>
          <textarea
            className={inputCls}
            style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
            placeholder="e.g. Score 5 if the tone is humorous, 1 if dry. Must include the word 'pirate'."
            value={evaluationRubric}
            onChange={(e) => setEvaluationRubric(e.target.value)}
          />
        </div>

        {/* Variable fields definition */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Template Variables</label>
          <div className="flex gap-2">
            <input
              className={inputCls}
              style={inputStyle}
              placeholder="Variable name (e.g. topic)"
              value={varKey}
              onChange={(e) => setVarKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addVariable()}
            />
            <button onClick={addVariable} className="px-3 py-2 rounded-lg text-sm transition-colors flex-shrink-0" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>
              Add
            </button>
          </div>
          {varKeys.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {varKeys.map((k) => (
                <span key={k} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>
                  {'{' + k + '}'}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Test cases */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              Test Cases ({testCases.length})
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer" style={{ color: '#06b6d4', background: 'rgba(6,182,212,0.1)' }}>
                <Plus size={10} /> Bulk Import (CSV)
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
              <button onClick={addTestCase} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors" style={{ color: '#a78bfa', background: 'rgba(124,58,237,0.1)' }}>
                <Plus size={10} /> Add Case
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {testCases.map((tc, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Case {i + 1}</span>
                  {testCases.length > 1 && (
                    <button onClick={() => removeTestCase(i)} className="text-xs text-red-400 hover:text-red-300">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                {varKeys.map((key) => (
                  <div key={key} className="mb-1.5">
                    <label className="text-xs mb-0.5 block" style={{ color: 'var(--accent-light)', fontSize: '10px' }}>{'{' + key + '}'}</label>
                    <input
                      className={inputCls}
                      style={inputStyle}
                      placeholder={`Value for ${key}`}
                      value={tc.inputVariables[key] || ''}
                      onChange={(e) => updateTestCaseVar(i, key, e.target.value)}
                    />
                  </div>
                ))}
                <div className="mt-1.5">
                  <label className="text-xs mb-0.5 block" style={{ color: 'var(--muted)', fontSize: '10px' }}>Expected output (optional)</label>
                  <input
                    className={inputCls}
                    style={inputStyle}
                    placeholder="Expected response for quality scoring..."
                    value={tc.expectedOutput}
                    onChange={(e) => updateTestCaseExpected(i, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium text-sm text-white transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}
        >
          <FlaskConical size={14} />
          {isCreating ? 'Creating...' : 'Create Experiment'}
        </button>
      </div>
    </Modal>
  )
}
