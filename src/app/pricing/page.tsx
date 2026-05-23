import Header from '@/components/Header'
import Footer from '@/components/Footer'

const TIERS = [
  {
    name: 'Starter',
    price: 'Free',
    desc: 'For experimenting with prompt-to-project generation.',
    features: ['Prompt parser', 'Token/NFT/DEX/staking templates', 'ZIP export', 'Community support'],
    cta: 'Start building',
  },
  {
    name: 'Pro',
    price: '$19/mo',
    desc: 'For founders shipping testnet MVPs faster.',
    features: ['Everything in Starter', 'One-click ERC-20 deploy', 'Premium templates', 'Saved projects', 'Priority generations'],
    cta: 'Coming soon',
    highlight: true,
  },
  {
    name: 'Studio',
    price: 'Custom',
    desc: 'For agencies, incubators, and chain ecosystems.',
    features: ['White-label builder', 'Custom templates', 'Team workspace', 'API access', 'Dedicated support'],
    cta: 'Contact us',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen grid-bg">
      <Header />
      <main className="max-w-6xl mx-auto px-4 pt-28 pb-24">
        <div className="text-center mb-14">
          <p className="text-sm text-cyan-300 font-semibold uppercase tracking-[0.2em]">Pricing</p>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold text-white">Launch faster, scale when ready.</h1>
          <p className="mt-5 text-lg text-gray-400 max-w-2xl mx-auto">
            BlockPilot starts free for builders and grows into a full AI launchpad for teams.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl border p-6 bg-bg-secondary/80 ${tier.highlight ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'border-gray-800'}`}
            >
              {tier.highlight && <div className="mb-4 inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">Most useful for MVPs</div>}
              <h2 className="text-2xl font-bold text-white">{tier.name}</h2>
              <div className="mt-4 text-4xl font-bold gradient-text">{tier.price}</div>
              <p className="mt-3 text-sm text-gray-400 min-h-[42px]">{tier.desc}</p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-gray-300">
                    <span className="text-emerald-400">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={tier.name === 'Starter' ? '/#builder' : '#'}
                className={`mt-8 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors ${tier.highlight ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white' : 'border border-gray-800 text-gray-300 hover:text-white hover:border-indigo-500/50'}`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
