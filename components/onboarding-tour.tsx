'use client'

import { useState, useEffect } from 'react'
import {
  FlaskConical, FolderOpen, Layers, GitBranch, Play,
  Zap, Trophy, X, ChevronRight, ChevronLeft, Sparkles,
} from 'lucide-react'

const STORAGE_KEY = 'promptlab_onboarding_done'

interface Step {
  icon: React.ElementType
  iconColor: string
  iconBg: string
  title: string
  subtitle: string
  description: string
  example: React.ReactNode
  tip?: string
}

const STEPS: Step[] = [
  {
    icon: Sparkles,
    iconColor: '#a78bfa',
    iconBg: 'rgba(124,58,237,0.15)',
    title: 'Welcome to PromptLab! 👋',
    subtitle: 'Your AI Prompt Engineering Workspace',
    description:
      'PromptLab is a professional tool for prompt engineers. You can version-control your AI prompts like Git, run A/B experiments to compare them, and measure which prompt performs best — all backed by real data.',
    example: (
      <div className="flex items-center justify-center gap-6">
        {[
          { icon: GitBranch, label: 'Version Control', color: '#a78bfa' },
          { icon: FlaskConical, label: 'A/B Testing', color: '#06b6d4' },
          { icon: Trophy, label: 'Analytics', color: '#f59e0b' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: FolderOpen,
    iconColor: '#a78bfa',
    iconBg: 'rgba(124,58,237,0.15)',
    title: 'Step 1 — Create a Project',
    subtitle: 'Think of it like a Git repository',
    description:
      'A Project is a workspace that holds all your prompts for a specific use case. For example: "Customer Support Bot", "SEO Content Writer", or "Code Review Assistant".',
    example: (
      <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)' }}>
            <FolderOpen size={15} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">Customer Support Bot</div>
            <div className="text-xs" style={{ color: '#64748b' }}>3 prompts · Created today</div>
          </div>
        </div>
        <div className="flex gap-2">
          {['Email Classifier', 'Response Writer', 'Ticket Summarizer'].map((name) => (
            <span key={name} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
              {name}
            </span>
          ))}
        </div>
      </div>
    ),
    tip: '💡 Go to Projects → Click "New Project" to get started',
  },
  {
    icon: Layers,
    iconColor: '#06b6d4',
    iconBg: 'rgba(6,182,212,0.12)',
    title: 'Step 2 — Create a Prompt',
    subtitle: 'The thing you\'ll actually engineer',
    description:
      'Inside a project, you create Prompts. Each prompt has a name and purpose — like "Summarize Email". You\'ll then write and refine the actual prompt text inside it.',
    example: (
      <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-xs font-semibold mb-3" style={{ color: '#64748b' }}>INSIDE "Customer Support Bot"</div>
        {['Email Classifier', 'Response Writer'].map((name, i) => (
          <div key={name} className="flex items-center justify-between py-2.5" style={{ borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <div className="flex items-center gap-2.5">
              <Layers size={13} style={{ color: '#06b6d4' }} />
              <span className="text-sm text-slate-300">{name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}>v3</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>production</span>
            </div>
          </div>
        ))}
      </div>
    ),
    tip: '💡 Open a project → Click "New Prompt" → Enter the prompt\'s purpose',
  },
  {
    icon: GitBranch,
    iconColor: '#a78bfa',
    iconBg: 'rgba(124,58,237,0.15)',
    title: 'Step 3 — Write Your Prompt Template',
    subtitle: 'Use {variables} for dynamic inputs',
    description:
      'In the Prompt Editor, write your prompt in the User Template box. Use curly braces like {topic} or {text} for parts that will change with each use. PromptLab automatically detects these variables.',
    example: (
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-3 py-2 text-xs font-semibold" style={{ background: 'rgba(0,0,0,0.4)', color: '#64748b' }}>USER TEMPLATE</div>
        <div className="p-4 font-mono text-sm leading-relaxed" style={{ background: 'rgba(0,0,0,0.3)', color: '#e2e8f0' }}>
          Summarize the following email in{' '}
          <span className="px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>{'{tone}'}</span>
          {' '}tone, max{' '}
          <span className="px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>{'{length}'}</span>
          {' '}sentences:{'  '}
          <span className="px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>{'{email}'}</span>
        </div>
        <div className="px-3 py-2 flex gap-2" style={{ background: 'rgba(124,58,237,0.06)', borderTop: '1px solid rgba(124,58,237,0.15)' }}>
          <span className="text-xs" style={{ color: '#64748b' }}>Detected:</span>
          {['{tone}', '{length}', '{email}'].map((v) => (
            <span key={v} className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa' }}>{v}</span>
          ))}
        </div>
      </div>
    ),
    tip: '💡 Variables in {curly braces} are auto-detected and become input fields when testing',
  },
  {
    icon: GitBranch,
    iconColor: '#10b981',
    iconBg: 'rgba(16,185,129,0.12)',
    title: 'Step 4 — Save Versions',
    subtitle: 'Like Git commits for your prompts',
    description:
      'Every time you improve your prompt, click "Save Version" with a short commit message describing what changed. PromptLab keeps every version so you can always roll back or compare.',
    example: (
      <div className="flex flex-col gap-2">
        {[
          { v: 'v3', msg: 'Add professional tone instruction', tag: 'production', time: '2h ago', active: true },
          { v: 'v2', msg: 'Switch to bullet point format', tag: 'staging', time: '1d ago', active: false },
          { v: 'v1', msg: 'Initial version', tag: 'draft', time: '3d ago', active: false },
        ].map(({ v, msg, tag, time, active }) => (
          <div key={v} className="rounded-lg px-3 py-2.5 flex items-center gap-3" style={{ background: active ? 'rgba(124,58,237,0.12)' : 'rgba(0,0,0,0.25)', border: `1px solid ${active ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}` }}>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>{v}</span>
            <span className="text-xs text-slate-300 flex-1">{msg}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{
              background: tag === 'production' ? 'rgba(16,185,129,0.12)' : tag === 'staging' ? 'rgba(245,158,11,0.12)' : 'rgba(148,163,184,0.1)',
              color: tag === 'production' ? '#10b981' : tag === 'staging' ? '#f59e0b' : '#94a3b8',
            }}>{tag}</span>
            <span className="text-xs" style={{ color: '#475569' }}>{time}</span>
          </div>
        ))}
      </div>
    ),
    tip: '💡 Use tags: Draft → Staging → Production to manage your prompt lifecycle',
  },
  {
    icon: Play,
    iconColor: '#06b6d4',
    iconBg: 'rgba(6,182,212,0.12)',
    title: 'Step 5 — Quick Test',
    subtitle: 'Test any version instantly',
    description:
      'Use the Quick Test panel at the bottom of the editor. Fill in the {variable} values, click Run Prompt, and see the actual AI response along with latency, token count, and cost metrics.',
    example: (
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-3 flex gap-3" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex-1">
            <div className="text-xs mb-1" style={{ color: '#a78bfa' }}>{'{email}'}</div>
            <div className="text-xs text-slate-400 bg-black/20 rounded px-2 py-1">Hi team, the meeting is rescheduled...</div>
          </div>
        </div>
        <div className="p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[['⚡', '843ms', 'Latency'], ['🔢', '247', 'Tokens'], ['💰', '$0.000021', 'Cost']].map(([icon, val, label]) => (
              <div key={label} className="text-center py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs font-bold text-slate-200">{val}</div>
                <div className="text-xs" style={{ color: '#64748b', fontSize: '10px' }}>{label}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-300 leading-relaxed px-2 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
            The team meeting has been rescheduled. Please check your calendar for the updated time.
          </div>
        </div>
      </div>
    ),
    tip: '💡 Click "QUICK TEST" section in the editor to expand the test panel',
  },
  {
    icon: FlaskConical,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.12)',
    title: 'Step 6 — Run A/B Experiments',
    subtitle: 'Compare prompts with real data',
    description:
      'Once you have 2+ versions, create an A/B Experiment. Pick Version A vs Version B, add test inputs, and run. PromptLab calls Gemini for both versions, then uses an AI judge to score the quality of each output.',
    example: (
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-xs font-semibold text-slate-300">Formal vs Casual Tone</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>running</span>
        </div>
        <div className="grid grid-cols-2 divide-x p-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {[
            { v: 'v1', label: 'Version A', score: '4.2', color: '#a78bfa', wins: false },
            { v: 'v3', label: 'Version B', score: '4.8', color: '#06b6d4', wins: true },
          ].map(({ v, label, score, color, wins }) => (
            <div key={v} className="p-3 text-center" style={{ background: wins ? `${color}08` : 'rgba(0,0,0,0.2)' }}>
              <div className="text-xs mb-1" style={{ color }}>{label} ({v})</div>
              <div className="text-2xl font-bold" style={{ color: wins ? color : '#64748b' }}>{score}</div>
              <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>quality score</div>
              {wins && <div className="text-xs mt-1" style={{ color: '#f59e0b' }}>🏆 Winner</div>}
            </div>
          ))}
        </div>
      </div>
    ),
    tip: '💡 Go to the "Experiments" tab in the editor → Create A/B Experiment',
  },
  {
    icon: Trophy,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.12)',
    title: "You're all set! 🚀",
    subtitle: "Start building your first prompt",
    description:
      'You now know everything about PromptLab. The more you use it, the more you\'ll appreciate having a full history of your prompt iterations with scientific A/B test results to back your decisions.',
    example: (
      <div className="flex flex-col gap-3">
        {[
          { step: '1', text: 'Go to Projects → Create a project', done: false },
          { step: '2', text: 'Create your first prompt', done: false },
          { step: '3', text: 'Write your template with {variables}', done: false },
          { step: '4', text: 'Save a version + run a quick test', done: false },
          { step: '5', text: 'Save a second version → A/B experiment!', done: false },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>
              {step}
            </div>
            <span className="text-sm text-slate-300">{text}</span>
          </div>
        ))}
      </div>
    ),
    tip: '💡 Click the ? button in the navbar anytime to reopen this tour',
  },
]

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      // Small delay for better UX
      const t = setTimeout(() => setIsOpen(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const close = (markDone = true) => {
    if (markDone) localStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)
    setStep(0)
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
    else close()
  }

  const prev = () => { if (step > 0) setStep(step - 1) }

  const current = STEPS[step]
  const Icon = current.icon
  const progress = ((step + 1) / STEPS.length) * 100

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl fade-in"
        style={{
          background: 'var(--card)',
          border: '1px solid rgba(124,58,237,0.25)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.1)',
        }}
      >
        {/* Progress bar */}
        <div className="h-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: current.iconBg }}>
              <Icon size={15} style={{ color: current.iconColor }} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
          <button
            onClick={() => close()}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Titles */}
          <h2 className="text-xl font-bold text-slate-100 mb-1">{current.title}</h2>
          <p className="text-sm font-medium mb-3" style={{ color: current.iconColor }}>{current.subtitle}</p>
          <p className="text-sm leading-relaxed mb-5" style={{ color: '#94a3b8' }}>{current.description}</p>

          {/* Example visual */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {current.example}
          </div>

          {/* Tip */}
          {current.tip && (
            <div className="rounded-xl px-4 py-2.5 text-xs" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
              {current.tip}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === step ? '20px' : '6px',
                  height: '6px',
                  background: i === step ? '#7c3aed' : i < step ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {step === 0 && (
              <button
                onClick={() => close(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ color: '#64748b' }}
              >
                Skip tour
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
              style={{
                background: step === STEPS.length - 1 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
              }}
            >
              {step === STEPS.length - 1 ? (
                <><Zap size={13} /> Let&apos;s Go!</>
              ) : (
                <>Next <ChevronRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
