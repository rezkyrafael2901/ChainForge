import { ProjectSpec, ProjectType } from '@/types'

interface AIProvider {
  name: string
  endpoint: string
  apiKey: string
  model: string
}

// Try providers in order — first success wins
const PROVIDERS: AIProvider[] = [
  // Provider 1: OpenAI-compatible (9Router local proxy)
  ...(process.env.AI_API_URL ? [{
    name: 'openai-compatible',
    endpoint: process.env.AI_API_URL,
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  }] : []),
  // Provider 2: Anthropic Claude
  ...(process.env.ANTHROPIC_API_KEY ? [{
    name: 'anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
  }] : []),
  // Provider 3: OpenAI
  ...(process.env.OPENAI_API_KEY ? [{
    name: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  }] : []),
]

const PARSE_PROMPT = `You are a blockchain project parser. Extract structured data from the user's prompt.

Return ONLY valid JSON (no markdown, no explanation) with this exact schema:
{
  "type": "token" | "nft" | "dex" | "staking" | "dao",
  "chain": "ethereum" | "base" | "arbitrum" | "polygon" | "bsc" | "avalanche",
  "name": "string (project name)",
  "symbol": "string (token symbol, 3-5 chars uppercase)",
  "description": "string (one-line description)",
  "features": ["array of feature IDs"],
  "params": {
    "supply": "string (number)",
    "decimals": 18,
    "mintPrice": "string (optional)",
    "maxSupply": "string (optional)",
    "fee": "string (optional)"
  }
}

Feature IDs by type:
- token: mintable, burnable, capped, permit, votes, pausable, snapshot
- nft: enumerable, royalties, reveal, autoincrement, mintprice, maxsupply, whitelist
- dex: swap, liquidity, fees, factory, flashloan
- staking: rewards, lockperiod, emergency, compound, multitier
- dao: governance, timelock, voting, quorum, delegation

Rules:
- If chain not specified, default to "ethereum"
- If type not clear, infer from context (token/crypto → token, NFT/collection → nft, swap/exchange → dex, stake/yield → staking, vote/governance → dao)
- Extract name from context (e.g. "CryptoRupiah" from "token bernama CryptoRupiah")
- Generate a reasonable symbol if not provided (first letters of name, 3-5 chars)
- For supply, parse "1 juta" → "1000000", "10k" → "10000", "1 million" → "1000000"
- Always include sensible defaults for features based on the project type
- token defaults: [mintable, burnable]
- nft defaults: [enumerable, royalties, maxsupply]
- dex defaults: [swap, liquidity, fees, factory]
- staking defaults: [rewards]
- dao defaults: [governance, timelock, voting, delegation]

User prompt: `

export async function parseWithAI(prompt: string): Promise<ProjectSpec | null> {
  for (const provider of PROVIDERS) {
    try {
      const result = await callProvider(provider, prompt)
      if (result) return result
    } catch (err) {
      console.error(`[AI Parser] ${provider.name} failed:`, err)
      continue
    }
  }
  return null // All providers failed
}

async function callProvider(provider: AIProvider, prompt: string): Promise<ProjectSpec | null> {
  const fullPrompt = PARSE_PROMPT + prompt

  let body: string
  let headers: Record<string, string>

  if (provider.name === 'anthropic') {
    body = JSON.stringify({
      model: provider.model,
      max_tokens: 500,
      messages: [{ role: 'user', content: fullPrompt }],
    })
    headers = {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01',
    }
  } else {
    // OpenAI-compatible format
    body = JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: 'You are a JSON-only responder. Never include markdown formatting.' },
        { role: 'user', content: fullPrompt },
      ],
      max_tokens: 500,
      temperature: 0.1,
    })
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout

  try {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    let content: string

    if (provider.name === 'anthropic') {
      content = data.content?.[0]?.text || ''
    } else {
      content = data.choices?.[0]?.message?.content || ''
    }

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (!parsed.type || !parsed.chain || !parsed.name) return null

    // Normalize
    parsed.type = parsed.type.toLowerCase() as ProjectType
    parsed.chain = parsed.chain.toLowerCase()
    parsed.features = Array.isArray(parsed.features) ? parsed.features : []
    parsed.params = parsed.params || { supply: '1000000', decimals: 18 }

    return parsed as ProjectSpec
  } finally {
    clearTimeout(timeout)
  }
}

export function hasAIProvider(): boolean {
  return PROVIDERS.length > 0
}

export function getProviderName(): string {
  return PROVIDERS[0]?.name || 'none'
}
