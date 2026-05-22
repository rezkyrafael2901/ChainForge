import { NextResponse } from 'next/server';
import { resolve } from 'node:path';

async function getEngine() {
  const enginePath = resolve(process.cwd(), '../engine/src/index.ts');
  try {
    return await import(enginePath);
  } catch {
    try {
      return await import('@chainforge/engine');
    } catch {
      return null;
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, type, chain } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    const engine = await getEngine();

    if (engine?.parsePromptSafe && engine?.generateContracts) {
      // Parse prompt
      const parsed = await engine.parsePromptSafe(prompt);
      if (!parsed.success || !parsed.spec) {
        return NextResponse.json({ success: false, error: parsed.error || 'Failed to parse prompt' }, { status: 422 });
      }

      // Override type/chain if provided
      if (type) parsed.spec.type = type;
      if (chain) parsed.spec.chain = chain;

      // Generate contracts
      const files: Map<string, string> = await engine.generateContracts(parsed.spec);

      // Convert Map to object for JSON
      const filesObj: Record<string, string> = {};
      files.forEach((content: string, path: string) => {
        filesObj[path] = content;
      });

      return NextResponse.json({
        success: true,
        spec: parsed.spec,
        files: filesObj,
      });
    }

    // Fallback: mock response when engine not available
    const mockSpec = {
      name: 'MyProject',
      description: prompt,
      type: type || 'token',
      chain: chain || 'sepolia',
      contracts: [{ name: 'MainContract', type: type || 'token', params: {}, template: 'erc20' }],
      frontend: { pages: ['home', 'mint'], theme: 'dark', walletConnect: true },
      features: [],
    };

    const mockFiles: Record<string, string> = {
      'contracts/MyProject.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyProject is ERC20 {
    constructor() ERC20("MyProject", "MYP") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}`,
      'hardhat.config.ts': `import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
};

export default config;`,
    };

    return NextResponse.json({
      success: true,
      spec: mockSpec,
      files: mockFiles,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
