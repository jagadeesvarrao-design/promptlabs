'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import OnboardingTour from '@/components/onboarding-tour'
import { FlaskConical, FolderOpen, GitBranch, Layers, Plus, ArrowRight, TrendingUp } from 'lucide-react'

interface Stats {
  projects: number
  prompts: number
  versions: number
  experiments: number
}

const FEATURES = [
  {
    icon: GitBranch,
    title: 'Version Control',
    description: 'Save every prompt iteration like a Git commit. Rollback to any version instantly.',
    color: '#7c3aed',
  },
  {
    icon: FlaskConical,
    title: 'A/B Testing',
    description: 'Run scientific experiments comparing two prompt versions across test datasets.',
    color: '#06b6d4',
  },
  {
    icon: TrendingUp,
    title: 'Analytics',
    description: 'Measure latency, cost, and quality. See which prompt wins with real data.',
    color: '#10b981',
  },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ projects: 0, prompts: 0, versions: 0, experiments: 0 })

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/projects')
        if (!res.ok) return
        const projects = await res.json()
        setStats((prev) => ({ ...prev, projects: projects.length }))

        let totalPrompts = 0
        projects.forEach((p: { _count: { prompts: number } }) => { totalPrompts += p._count.prompts })
        setStats((prev) => ({ ...prev, prompts: totalPrompts }))
      } catch { /* ignore */ }
    }
    loadStats()
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <OnboardingTour />
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(124,58,237,0.08)' }} />
        <div className="absolute top-10 right-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(6,182,212,0.06)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa' }}>
            <FlaskConical size={12} />
            Prompt Engineering Toolkit
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5">
            Version Control for
            <br />
            <span className="gradient-text">AI Prompts</span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--muted)' }}>
            Track every prompt change, run A/B experiments, and measure which version performs best.
            Built for prompt engineers who care about data.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/projects"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 8px 25px rgba(124,58,237,0.35)' }}
            >
              <Plus size={16} />
              New Project
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#94a3b8' }}
            >
              View Projects
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'Projects', value: stats.projects, icon: FolderOpen, color: '#7c3aed' },
            { label: 'Prompts', value: stats.prompts, icon: Layers, color: '#06b6d4' },
            { label: 'Versions', value: stats.versions, icon: GitBranch, color: '#10b981' },
            { label: 'Experiments', value: stats.experiments, icon: FlaskConical, color: '#f59e0b' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl p-6 transition-all hover:scale-105"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="text-3xl font-bold text-slate-100 mb-1">{value}</div>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-100 mb-2">What PromptLab does</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Everything you need to engineer prompts scientifically</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="rounded-2xl p-6 transition-all hover:scale-[1.02]"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}15` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick start */}
        <div className="rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.06))', border: '1px solid rgba(124,58,237,0.2)' }}>
          <h3 className="text-xl font-bold text-slate-100 mb-2">Ready to start?</h3>
          <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Create your first project and start saving prompt versions</p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}
          >
            <FolderOpen size={14} />
            Go to Projects
          </Link>
        </div>
      </div>
    </div>
  )
}
