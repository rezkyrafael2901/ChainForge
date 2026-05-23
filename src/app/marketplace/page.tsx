import Header from '@/components/Header'
import Footer from '@/components/Footer'

const TEMPLATES = [
  ['Meme Coin Launch', 'ERC-20 with mint/burn, branding copy, and deploy-ready README.', 'Free'],
  ['NFT Mint Page', 'ERC-721 collection with mint UI, max supply, and metadata notes.', 'Pro'],
  ['Token Presale', 'Whitelist-ready sale page and vesting checklist.', 'Pro'],
  ['Staking Rewards', 'Stake token, earn rewards, and track APY assumptions.', 'Pro'],
  ['DAO Governance', 'Voting token + proposal flow starter.', 'Studio'],
  ['Game Item NFTs', 'Creator-friendly game asset collection template.', 'Free'],
]

export default function MarketplacePage() {
  return (
    <div className="min-h-screen grid-bg">
      <Header />
      <main className="max-w-6xl mx-auto px-4 pt-28 pb-24">
        <div className="mb-12">
          <p className="text-sm text-cyan-300 font-semibold uppercase tracking-[0.2em]">Marketplace</p>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold text-white">Template marketplace</h1>
          <p className="mt-5 text-gray-400 max-w-2xl">Curated launch kits for common Web3 products. This is the foundation for premium templates and creator revenue share.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TEMPLATES.map(([title, desc, tier]) => (
            <div key={title} className="rounded-3xl border border-gray-800 bg-bg-secondary/80 p-6">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🧩</span>
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">{tier}</span>
              </div>
              <h2 className="mt-5 text-xl font-bold text-white">{title}</h2>
              <p className="mt-3 text-sm text-gray-400">{desc}</p>
              <a href="/#builder" className="mt-6 inline-flex text-sm font-semibold text-cyan-300 hover:text-cyan-200">Use template →</a>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
