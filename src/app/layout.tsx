import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BlockPilot — AI Blockchain Project Builder',
  description: 'Prompt → Deploy. Build blockchain projects with AI. No code required.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg-primary antialiased">
        {children}
      </body>
    </html>
  )
}
