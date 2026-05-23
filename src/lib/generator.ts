import { ProjectSpec, GeneratedFile, GeneratedProject } from '@/types'
import { generateERC20 } from './templates/erc20'
import { generateERC721 } from './templates/erc721'
import { generateDEX } from './templates/dex'
import { generateStaking } from './templates/staking'
import { getChain } from './chains'

function generateContract(spec: ProjectSpec): GeneratedFile[] {
  const contracts: GeneratedFile[] = []

  switch (spec.type) {
    case 'token':
      contracts.push({
        path: `contracts/${spec.name.replace(/\s+/g, '')}.sol`,
        content: generateERC20(spec),
        language: 'solidity',
        description: `ERC-20 token contract for ${spec.name}`,
      })
      break
    case 'nft':
      contracts.push({
        path: `contracts/${spec.name.replace(/\s+/g, '')}.sol`,
        content: generateERC721(spec),
        language: 'solidity',
        description: `ERC-721 NFT collection contract for ${spec.name}`,
      })
      break
    case 'dex':
      contracts.push({
        path: `contracts/${spec.name.replace(/\s+/g, '')}Dex.sol`,
        content: generateDEX(spec),
        language: 'solidity',
        description: `AMM DEX contract (Factory + Router + Pair) for ${spec.name}`,
      })
      break
    case 'staking':
      contracts.push({
        path: `contracts/${spec.name.replace(/\s+/g, '')}Staking.sol`,
        content: generateStaking(spec),
        language: 'solidity',
        description: `Staking rewards contract for ${spec.name}`,
      })
      break
    case 'dao':
      // DAO placeholder — uses Governor from OpenZeppelin
      contracts.push({
        path: `contracts/${spec.name.replace(/\s+/g, '')}Governor.sol`,
        content: generateERC20({ ...spec, type: 'token', features: ['votes', 'permit'] }),
        language: 'solidity',
        description: `Governance token for ${spec.name} DAO`,
      })
      break
  }

  return contracts
}

function generateFrontend(spec: ProjectSpec): GeneratedFile[] {
  const chain = getChain(spec.chain)
  const files: GeneratedFile[] = []

  // Landing page
  files.push({
    path: 'frontend/index.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${spec.name} — ${spec.type.toUpperCase()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #0a0a0f;
            color: #e2e8f0;
            min-height: 100vh;
        }
        .hero {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
            text-align: center;
            background: radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 70%);
        }
        h1 {
            font-size: 3.5rem;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
        }
        .subtitle {
            font-size: 1.25rem;
            color: #94a3b8;
            margin-bottom: 2rem;
            max-width: 600px;
        }
        .badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.3);
            color: #818cf8;
            font-size: 0.875rem;
            margin-bottom: 2rem;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
            margin-top: 3rem;
        }
        .stat {
            text-align: center;
        }
        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #6366f1;
        }
        .stat-label {
            font-size: 0.875rem;
            color: #64748b;
            margin-top: 0.25rem;
        }
        .cta {
            margin-top: 3rem;
            padding: 1rem 2.5rem;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 1.125rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
        }
        .footer {
            text-align: center;
            padding: 2rem;
            color: #475569;
            font-size: 0.875rem;
        }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="hero">
        <div class="badge">${chain?.icon || '⟠'} ${chain?.name || spec.chain} Network</div>
        <h1>${spec.name}</h1>
        <p class="subtitle">${spec.description}</p>
        <div class="stats">
            <div class="stat">
                <div class="stat-value">${spec.params.supply || '1,000,000'}</div>
                <div class="stat-label">Total Supply</div>
            </div>
            <div class="stat">
                <div class="stat-value">${spec.type.toUpperCase()}</div>
                <div class="stat-label">Project Type</div>
            </div>
            <div class="stat">
                <div class="stat-value">${spec.features.length}</div>
                <div class="stat-label">Features</div>
            </div>
        </div>
        <button class="cta">Connect Wallet</button>
    </div>
    <div class="footer">
        Built with <a href="https://blockpilot.ai">🔥 BlockPilot</a>
    </div>
</body>
</html>`,
    language: 'html',
    description: `Landing page for ${spec.name}`,
  })

  return files
}

function generateDeployScript(spec: ProjectSpec): GeneratedFile {
  const name = spec.name.replace(/\s+/g, '')
  const chain = getChain(spec.chain)

  let scriptContent = ''

  if (spec.type === 'token') {
    scriptContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/${name}.sol";

contract Deploy${name} is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ${name} token = new ${name}(${spec.params.supply} * 10 ** 18);

        console.log("${name} deployed at:", address(token));
        console.log("Token symbol:", token.symbol());
        console.log("Total supply:", token.totalSupply());

        vm.stopBroadcast();
    }
}
`
  } else if (spec.type === 'nft') {
    scriptContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/${name}.sol";

contract Deploy${name} is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ${name} nft = new ${name}(
            "${spec.name}",
            "${spec.symbol}",
            "ipfs://BASE_URI/",
            msg.sender
        );

        console.log("${name} deployed at:", address(nft));
        console.log("Name:", nft.name());
        console.log("Max supply:", nft.MAX_SUPPLY());

        vm.stopBroadcast();
    }
}
`
  } else {
    scriptContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

// TODO: Add import for your generated contract
// import "../contracts/${name}.sol";

contract Deploy${name} is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // TODO: Add deployment logic here
        console.log("Deploy ${name} to ${chain?.name || spec.chain}");

        vm.stopBroadcast();
    }
}
`
  }

  return {
    path: `script/Deploy${name}.s.sol`,
    content: scriptContent,
    language: 'solidity',
    description: `Foundry deploy script for ${spec.name}`,
  }
}

export function generateProject(spec: ProjectSpec): GeneratedProject {
  const contracts = generateContract(spec)
  const frontend = generateFrontend(spec)
  const deployScript = generateDeployScript(spec)

  // Estimate gas based on project type
  const gasEstimates: Record<string, string> = {
    token: '~500,000 gas',
    nft: '~2,500,000 gas',
    dex: '~4,000,000 gas',
    staking: '~1,500,000 gas',
    dao: '~1,000,000 gas',
  }

  const readme = `# ${spec.name}

Generated by [BlockPilot](https://blockpilot.ai)

## Project Details
- **Type:** ${spec.type.toUpperCase()}
- **Chain:** ${getChain(spec.chain)?.name || spec.chain}
- **Features:** ${spec.features.join(', ')}

## Contracts
${contracts.map(c => `- \`${c.path}\` — ${c.description}`).join('\n')}

## Deploy

\`\`\`bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Compile
forge build

# Deploy to testnet
forge script script/Deploy${spec.name.replace(/\\s+/g, '')}.s.sol:Deploy${spec.name.replace(/\\s+/g, '')} \\
  --rpc-url ${getChain(spec.chain)?.rpcUrl || 'RPC_URL'} \\
  --broadcast --verify
\`\`\`

## Frontend
Open \`frontend/index.html\` in a browser or deploy to IPFS/Vercel.

## Security
- Generated contracts are templates — audit before mainnet use
- Run Slither: \`slither .\`
- Run tests: \`forge test\`

---
*Built with 🔥 [BlockPilot](https://blockpilot.ai)*
`

  return {
    spec,
    contracts,
    frontend,
    deployScript,
    readme,
    estimatedGas: gasEstimates[spec.type] || '~1,000,000 gas',
  }
}
