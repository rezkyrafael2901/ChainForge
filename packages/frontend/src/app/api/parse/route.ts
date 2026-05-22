import { NextResponse } from 'next/server';
import { resolve } from 'node:path';

// Dynamic import of the engine — avoids bundling issues
async function getEngine() {
  const enginePath = resolve(process.cwd(), '../engine/src/index.ts');
  try {
    return await import(enginePath);
  } catch {
    // Fallback: try the compiled version
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

    if (engine?.parsePromptSafe) {
      const result = await engine.parsePromptSafe(prompt);
      if (result.success && result.spec) {
        // Override type/chain if provided
        if (type) result.spec.type = type;
        if (chain) result.spec.chain = chain;
      }
      return NextResponse.json(result);
    }

    // Fallback: return a mock spec if engine not available
    return NextResponse.json({
      success: true,
      spec: {
        name: 'MyProject',
        description: prompt,
        type: type || 'token',
        chain: chain || 'sepolia',
        contracts: [{ name: 'MainContract', type: type || 'token', params: {}, template: 'erc20' }],
        frontend: { pages: ['home', 'mint'], theme: 'dark', walletConnect: true },
        features: [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
