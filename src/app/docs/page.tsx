import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SECTIONS = [
  {
    title: '1. Describe your idea',
    body: 'Start with a plain-language prompt. You can write in Indonesian or English. Mention the project type, chain, supply, fees, and any special features.',
    example: 'Bikin token ERC-20 bernama CryptoRupiah simbol CRP supply 1 juta di Base, mintable dan burnable.',
  },
  {
    title: '2. Tune the generated spec',
    body: 'BlockPilot parses your intent, then you can manually select chain, project type, and feature toggles before generation.',
    example: 'Supported MVP types: ERC-20 token, NFT collection, DEX, staking platform, and DAO.',
  },
  {
    title: '3. Generate project files',
    body: 'The generator creates smart contracts, frontend files, deployment scripts, README, and ZIP export so the project stays inspectable and portable.',
    example: 'Use the ZIP when you want to open the project locally or hand it to a developer.',
  },
  {
    title: '4. Deploy safely',
    body: 'Direct MetaMask deployment currently supports ERC-20 contracts. Other templates can be exported or deployed manually while direct deploy support expands.',
    example: 'Always test on Sepolia/Base Sepolia first and review generated code before mainnet.',
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen grid-bg">
      <Header />
      <main className="max-w-5xl mx-auto px-4 pt-28 pb-24">
        <div className="mb-12">
          <p className="text-sm text-cyan-300 font-semibold uppercase tracking-[0.2em]">Docs</p>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold text-white">How to build with BlockPilot</h1>
          <p className="mt-5 text-lg text-gray-400 max-w-3xl">
            A practical guide for turning prompts into generated blockchain projects and deploying them safely.
          </p>
        </div>

        <div className="space-y-5">
          {SECTIONS.map((section) => (
            <section key={section.title} className="rounded-3xl border border-gray-800 bg-bg-secondary/80 p-6">
              <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              <p className="mt-3 text-gray-400 leading-relaxed">{section.body}</p>
              <div className="mt-5 rounded-2xl border border-gray-800 bg-bg-primary/70 p-4 text-sm text-gray-300">
                <span className="text-cyan-300 font-semibold">Example:</span> {section.example}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="text-xl font-bold text-white">Mainnet safety note</h2>
          <p className="mt-2 text-gray-300">
            BlockPilot speeds up prototyping, but generated smart contracts should still be reviewed, tested, and audited before handling real user funds.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
