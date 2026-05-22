// Client-side API helpers

export interface ParseResult {
  success: boolean;
  spec?: any;
  error?: string;
}

export interface GenerateResult {
  success: boolean;
  spec?: any;
  files?: Record<string, string>;
  error?: string;
}

/**
 * Parse a natural language prompt into a ProjectSpec.
 */
export async function parsePrompt(prompt: string, type?: string, chain?: string): Promise<ParseResult> {
  const res = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, type, chain }),
  });
  return res.json();
}

/**
 * Generate contracts from a prompt (parse + generate pipeline).
 */
export async function generateFromPrompt(prompt: string, type?: string, chain?: string): Promise<GenerateResult> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, type, chain }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Format an address for display.
 */
export function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Chain explorer URLs.
 */
export const EXPLORERS: Record<string, string> = {
  ethereum: 'https://etherscan.io',
  sepolia: 'https://sepolia.etherscan.io',
  base: 'https://basescan.org',
  arbitrum: 'https://arbiscan.io',
  polygon: 'https://polygonscan.com',
  bsc: 'https://bscscan.com',
};
