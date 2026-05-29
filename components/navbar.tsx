'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { FlaskConical, FolderOpen, LayoutDashboard, Zap, HelpCircle, Settings, LogOut } from 'lucide-react'

const STORAGE_KEY = 'promptlab_onboarding_done'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  const reopenTour = () => {
    localStorage.removeItem(STORAGE_KEY)
    router.push('/')
    // Force reload to trigger the useEffect in OnboardingTour
    setTimeout(() => window.location.href = '/', 100)
  }

  return (
    <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(7,7,15,0.85)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
            <FlaskConical size={14} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">
            Prompt<span className="gradient-text">Lab</span>
          </span>
        </Link>

        {/* Center Nav */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: active ? '#a78bfa' : '#94a3b8',
                  background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
                }}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
          {status === 'authenticated' && (
            <Link
              href="/settings"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color: pathname.startsWith('/settings') ? '#a78bfa' : '#94a3b8',
                background: pathname.startsWith('/settings') ? 'rgba(124,58,237,0.12)' : 'transparent',
              }}
            >
              <Settings size={14} />
              Settings
            </Link>
          )}
        </div>

        {/* Right: Help + User */}
        <div className="flex items-center gap-3">
          <button
            onClick={reopenTour}
            title="Open onboarding guide"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            style={{ color: '#64748b' }}
          >
            <HelpCircle size={15} />
          </button>
          
          {status === 'authenticated' ? (
            <div className="flex items-center gap-3 pl-3" style={{ borderLeft: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="Avatar" className="w-6 h-6 rounded-full border border-white/10" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30"></div>
                )}
                <span className="text-xs font-medium text-slate-300 hidden sm:block">{session.user?.name || 'User'}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                title="Log out"
                className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 text-slate-400 hover:text-red-400"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
