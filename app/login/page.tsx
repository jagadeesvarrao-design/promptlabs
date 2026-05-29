'use client'

import { signIn } from 'next-auth/react'
import { FlaskConical, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(124,58,237,0.15)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(6,182,212,0.15)' }} />

      <div className="w-full max-w-md p-8 rounded-3xl relative z-10" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
            <FlaskConical size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Welcome to PromptLab</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Sign in to start versioning and A/B testing your AI prompts.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* Google Login (Real Auth) */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/projects' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-100 transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center my-2">
            <div className="flex-grow border-t" style={{ borderColor: 'var(--border)' }}></div>
            <span className="flex-shrink-0 px-4 text-xs font-medium" style={{ color: 'var(--muted)' }}>OR</span>
            <div className="flex-grow border-t" style={{ borderColor: 'var(--border)' }}></div>
          </div>

          {/* Guest/Demo Login (Recruiter Auth) */}
          <button
            onClick={() => signIn('credentials', { callbackUrl: '/projects' })}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 8px 25px rgba(124,58,237,0.25)' }}
          >
            Continue as Guest (Demo)
            <ArrowRight size={16} />
          </button>
          
          <p className="text-xs text-center mt-2" style={{ color: 'var(--muted-dark)' }}>
            Guest mode creates a temporary sandbox workspace.
          </p>
        </div>
      </div>
    </div>
  )
}
