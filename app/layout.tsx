import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PromptLab — Prompt Version Control & A/B Testing',
  description:
    'Professional prompt engineering tool. Version control your AI prompts, run A/B experiments, and measure which prompts perform best.',
  keywords: ['prompt engineering', 'LLM', 'AI', 'A/B testing', 'version control', 'Gemini'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
