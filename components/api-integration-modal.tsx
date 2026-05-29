'use client'

import Modal from './modal'
import { Server, Code, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ApiIntegrationModalProps {
  isOpen: boolean
  onClose: () => void
  promptId: string
  promptName: string
}

export default function ApiIntegrationModal({ isOpen, onClose, promptId, promptName }: ApiIntegrationModalProps) {
  const [copied, setCopied] = useState(false)

  const codeSnippet = `// 1. Fetch the latest production prompt from PromptLab
const response = await fetch('https://promptlab.com/api/prompts/deploy?promptId=${promptId}')
const promptConfig = await response.json()

// 2. Use the fetched prompt with your AI SDK
const aiResponse = await ai.generate({
  model: promptConfig.model,
  temperature: promptConfig.temperature,
  maxTokens: promptConfig.maxTokens,
  systemInstruction: promptConfig.systemMessage,
  prompt: promptConfig.userTemplate, // Remember to replace {variables} here!
})`

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="API Integration" maxWidth="600px">
      <div className="flex flex-col gap-5">
        <div className="rounded-xl p-4 flex items-start gap-4" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(6,182,212,0.15)' }}>
            <Server size={20} style={{ color: '#06b6d4' }} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 mb-1">Dynamic Prompt Deployment</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              Instead of hardcoding prompts into your application, your code can fetch the prompt dynamically using this API endpoint. 
              Only versions tagged as <span className="font-mono text-green-400 bg-green-900/30 px-1 rounded">production</span> will be returned.
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>ENDPOINT URL</h4>
          <code className="block p-3 rounded-lg text-xs break-all" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: '#a78bfa' }}>
            GET /api/prompts/deploy?promptId={promptId}
          </code>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>USAGE EXAMPLE (JAVASCRIPT)</h4>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors"
              style={{ color: copied ? '#10b981' : 'var(--muted)', background: 'rgba(255,255,255,0.05)' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          </div>
          <div className="relative">
            <pre className="p-4 rounded-xl text-xs overflow-x-auto" style={{ background: '#0f0f1e', border: '1px solid var(--border)', color: '#e2e8f0' }}>
              <Code size={14} className="absolute top-4 right-4 opacity-20" />
              <code>{codeSnippet}</code>
            </pre>
          </div>
        </div>

        <div className="rounded-lg p-3 text-xs flex items-center gap-2" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fcd34d' }}>
          💡 Tip: You must tag a version as "production" in the Version History sidebar for this API to work!
        </div>
      </div>
    </Modal>
  )
}
