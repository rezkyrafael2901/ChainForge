import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-bg-primary/80 border-b border-gray-800/50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="BlockPilot logo" className="h-9 w-9 rounded-xl shadow-lg shadow-accent-primary/20" />
          <span className="text-xl font-bold gradient-text">BlockPilot</span>
        </a>
        <nav className="flex items-center gap-3 md:gap-6">
          <a href="/#features" className="hidden md:inline text-sm text-gray-400 hover:text-white transition-colors">
            Features
          </a>
          <a href="/pricing" className="hidden md:inline text-sm text-gray-400 hover:text-white transition-colors">
            Pricing
          </a>
          <a href="/docs" className="hidden md:inline text-sm text-gray-400 hover:text-white transition-colors">
            Docs
          </a>
          <a
            href="https://github.com/rezkyrafael2901/BlockPilot"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline text-sm text-gray-400 hover:text-white transition-colors"
          >
            GitHub
          </a>
          <ThemeToggle />
          <a href="/#builder" className="px-4 py-2 rounded-lg bg-accent-primary text-white text-sm hover:bg-accent-secondary transition-colors">
            Launch Builder
          </a>
        </nav>
      </div>
    </header>
  )
}
