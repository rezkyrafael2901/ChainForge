import { NextResponse } from 'next/server';

// Engine is not available on Vercel — use mock response
// Real AI parsing happens via the engine CLI or a dedicated backend

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Extract project info from prompt heuristically
    const lowerPrompt = prompt.toLowerCase();
    let type = 'token';
    if (lowerPrompt.includes('nft') || lowerPrompt.includes('koleksi')) type = 'nft';
    else if (lowerPrompt.includes('dex') || lowerPrompt.includes('swap')) type = 'dex';
    else if (lowerPrompt.includes('stak')) type = 'staking';
    else if (lowerPrompt.includes('dao') || lowerPrompt.includes('governance')) type = 'dao';
    else if (lowerPrompt.includes('marketplace') || lowerPrompt.includes('pasar')) type = 'marketplace';

    // Extract name heuristically
    const nameMatch = prompt.match(/(?:called|named|namanya|nama)\s+[\"']?([a-zA-Z][\w-]+)/i) ||
                      prompt.match(/[\"']([a-zA-Z][\w-]+)[\"']/);
    const name = nameMatch?.[1] || 'MyProject';

    // Extract supply
    const supplyMatch = prompt.match(/(\d+[\d,]*)\s*(?:supply|token|unit)/i);
    const supply = supplyMatch ? parseInt(supplyMatch[1].replace(/,/g, '')) : 1000000;

    const spec = {
      name,
      description: prompt.slice(0, 200),
      type,
      chain: 'sepolia',
      contracts: [
        {
          name: `${name}Token`,
          type: type === 'token' ? 'ERC20' : type === 'nft' ? 'ERC721' : 'ERC20',
          params: { tokenName: name, tokenSymbol: name.slice(0, 4).toUpperCase(), maxSupply: supply },
          template: type === 'nft' ? 'erc721' : 'erc20',
        },
      ],
      frontend: { pages: ['Home', 'Dashboard'], theme: 'dark', walletConnect: true },
      features: ['mintable', 'burnable'],
    };

    return NextResponse.json({ success: true, spec });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
