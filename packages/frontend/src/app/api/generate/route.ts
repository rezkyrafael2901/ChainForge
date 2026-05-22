import { NextResponse } from 'next/server';

// Mock Solidity contract templates
const ERC20_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract {{TOKEN_NAME}} is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    uint256 public maxSupply;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint256 maxSupply_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        maxSupply = maxSupply_;
        _mint(msg.sender, initialSupply_);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _update(address from, address to, uint256 value)
        internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, type, chain } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Parse project info from prompt
    const lowerPrompt = prompt.toLowerCase();
    let projectType = type || 'token';
    if (!type) {
      if (lowerPrompt.includes('nft') || lowerPrompt.includes('koleksi')) projectType = 'nft';
      else if (lowerPrompt.includes('dex') || lowerPrompt.includes('swap')) projectType = 'dex';
      else if (lowerPrompt.includes('stak')) projectType = 'staking';
      else if (lowerPrompt.includes('dao')) projectType = 'dao';
      else if (lowerPrompt.includes('marketplace')) projectType = 'marketplace';
    }

    const nameMatch = prompt.match(/(?:called|named|namanya|nama)\s+["']?([a-zA-Z][\w-]+)/i) ||
                      prompt.match(/["']([a-zA-Z][\w-]+)["']/);
    const name = nameMatch?.[1] || 'MyProject';

    const supplyMatch = prompt.match(/(\d+[\d,]*)\s*(?:supply|token|unit)/i);
    const supply = supplyMatch ? parseInt(supplyMatch[1].replace(/,/g, '')) : 1000000;

    const spec = {
      name,
      description: prompt.slice(0, 200),
      type: projectType,
      chain: chain || 'sepolia',
      contracts: [
        {
          name: `${name}Token`,
          type: projectType === 'nft' ? 'ERC721' : 'ERC20',
          params: {
            tokenName: name,
            tokenSymbol: name.slice(0, 4).toUpperCase(),
            maxSupply: supply,
          },
          template: projectType === 'nft' ? 'erc721' : 'erc20',
        },
      ],
      frontend: { pages: ['Home', 'Dashboard'], theme: 'dark', walletConnect: true },
      features: ['mintable', 'burnable', 'pausable'],
    };

    // Generate mock contract code
    const contractCode = ERC20_TEMPLATE
      .replace(/\{\{TOKEN_NAME\}\}/g, `${name}Token`);

    const files: Record<string, string> = {
      [`src/${name}Token.sol`]: contractCode,
      'script/Deploy.s.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/${name}Token.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();
        ${name}Token token = new ${name}Token("${name}", "${name.slice(0, 4).toUpperCase()}", ${supply} * 10**18, ${supply} * 10**18);
        console.log("Token deployed at:", address(token));
        vm.stopBroadcast();
    }
}`,
      'foundry.toml': `[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.24"
optimizer = true
optimizer_runs = 200`,
      'frontend/src/config.ts': `export const chainId = 11155111;
export const contracts = {
  token: "0x0000000000000000000000000000000000000000",
} as const;`,
    };

    return NextResponse.json({ success: true, spec, files });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
