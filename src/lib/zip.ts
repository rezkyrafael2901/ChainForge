// @ts-ignore
import JSZip from 'jszip'
// @ts-ignore
import { saveAs } from 'file-saver'
import { GeneratedProject } from '@/types'

export async function downloadProjectAsZip(project: GeneratedProject): Promise<void> {
  const zip = new JSZip()
  const projectName = project.spec.name.replace(/\s+/g, '-').toLowerCase()
  const root = zip.folder(projectName)!

  // === Foundry config ===
  root.file('foundry.toml', `[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.20"
optimizer = true
optimizer_runs = 200`)

  root.file('.gitignore', `# Compiler
/out
/cache

# Dependencies
/node_modules
/lib

# Env
.env
.env.local

# IDE
.vscode
.idea`)

  root.file('.env.example', `# Deploy
PRIVATE_KEY=your_private_key_here
RPC_URL=${getRpcUrl(project.spec.chain)}

# Optional
ETHERSCAN_API_KEY=your_etherscan_api_key`)

  // === Contracts ===
  const contractsFolder = root.folder('src')!.folder('contracts')!
  project.contracts.forEach(contract => {
    const filename = contract.path.split('/').pop() || 'Contract.sol'
    contractsFolder.file(filename, contract.content)
  })

  // === Deploy script ===
  const scriptFolder = root.folder('script')!
  const deployFilename = project.deployScript.path.split('/').pop() || 'Deploy.s.sol'
  scriptFolder.file(deployFilename, project.deployScript.content)

  // === Frontend ===
  const frontendFolder = root.folder('frontend')!
  project.frontend.forEach(file => {
    const filename = file.path.split('/').pop() || 'index.html'
    frontendFolder.file(filename, file.content)
  })

  // === Tests ===
  const testFolder = root.folder('test')!
  testFolder.file('README.md', `# Tests

Run tests with:
\`\`\`bash
forge test
\`\`\`

Add your test files here using Foundry's testing framework.
`)

  // === Libs (OpenZeppelin remapping) ===
  const libFolder = root.folder('lib')!
  libFolder.file('README.md', `# Dependencies

Install dependencies:
\`\`\`bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit
\`\`\`

Then set remappings in \`foundry.toml\`:
\`\`\`toml
remappings = ["@openzeppelin/=lib/openzeppelin-contracts/"]
\`\`\`
`)

  // === README ===
  root.file('README.md', project.readme)

  // === Generate ZIP ===
  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `${projectName}-chainforge.zip`)
}

function getRpcUrl(chain: string): string {
  const rpcs: Record<string, string> = {
    ethereum: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
    base: 'https://mainnet.base.org',
    arbitrum: 'https://arb1.arbitrum.io/rpc',
    polygon: 'https://polygon-rpc.com',
    bsc: 'https://bsc-dataseed.binance.org',
    avalanche: 'https://api.avax.network/ext/bc/C/rpc',
  }
  return rpcs[chain] || 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY'
}
