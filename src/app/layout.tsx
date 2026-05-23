import type { Metadata } from 'next'
import './globals.css'

const siteUrl = 'https://blockpilot.ai'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BlockPilot — AI Blockchain Project Builder',
    template: '%s | BlockPilot',
  },
  description: 'Prompt → generate → deploy. Build blockchain projects with AI — smart contracts, frontend, ZIP export, and MetaMask deployment.',
  keywords: ['BlockPilot', 'AI blockchain builder', 'Web3 agent', 'smart contract generator', 'dApp builder', 'EVM deploy'],
  authors: [{ name: 'BlockPilot' }],
  creator: 'BlockPilot',
  publisher: 'BlockPilot',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'BlockPilot',
    title: 'BlockPilot — AI Blockchain Project Builder',
    description: 'Turn prompts into deployable Web3 projects: contracts, frontend, ZIP export, and one-click ERC-20 deployment.',
    images: [
      {
        url: '/og.svg',
        width: 1200,
        height: 630,
        alt: 'BlockPilot — AI Blockchain Project Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlockPilot — AI Blockchain Project Builder',
    description: 'Prompt → generate → deploy Web3 projects with AI.',
    images: ['/og.svg'],
  },
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
