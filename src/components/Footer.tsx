export default function Footer() {
  return (
    <footer className="border-t border-gray-800/50 py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Built by{' '}
          <a href="https://github.com/rezkyrafael2901/BlockPilot" className="text-accent-primary hover:text-accent-secondary">
            BlockPilot
          </a>
        </p>
        <div className="flex items-center gap-4">
          <a href="/pricing" className="text-sm text-gray-500 hover:text-white transition-colors">
            Pricing
          </a>
          <span className="text-gray-700">•</span>
          <a href="/docs" className="text-sm text-gray-500 hover:text-white transition-colors">
            Docs
          </a>
          <span className="text-gray-700">•</span>
          <a href="https://github.com/rezkyrafael2901/BlockPilot" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-white transition-colors">
            GitHub
          </a>
          <span className="text-gray-700">•</span>
          <span className="text-sm text-gray-500">v0.1.0</span>
        </div>
      </div>
    </footer>
  )
}
