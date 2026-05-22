import { ProjectSpec, ProjectType } from '@/types'

const TYPE_KEYWORDS: Record<ProjectType, string[]> = {
  dex: ['dex', 'swap', 'exchange', 'amm', 'uniswap', 'sushiswap', 'trading', 'liquidity pool'],
  token: ['token', 'coin', 'erc20', 'erc-20', 'create token', 'buat token', 'bikin token', 'mata uang'],
  nft: ['nft', 'collection', 'mint', 'erc721', 'erc-721', 'erc1155', 'opensea', 'collectible'],
  staking: ['staking', 'stake', 'yield', 'farming', 'farm', 'earn', 'deposit', 'lock'],
  dao: ['dao', 'governance', 'voting', 'vote', 'proposal', 'treasury', 'community'],
}

const CHAIN_KEYWORDS: Record<string, string[]> = {
  ethereum: ['ethereum', 'eth', 'ether'],
  base: ['base'],
  arbitrum: ['arbitrum', 'arb'],
  polygon: ['polygon', 'matic'],
  bsc: ['bsc', 'bnb', 'binance', 'bsc chain'],
  avalanche: ['avalanche', 'avax'],
  sepolia: ['sepolia', 'testnet'],
}

const FEATURE_KEYWORDS: Record<string, string[]> = {
  mintable: ['mintable', 'mint', 'bisa mint', 'can mint'],
  burnable: ['burnable', 'burn', 'bisa burn'],
  pausable: ['pausable', 'pause', 'bisa pause'],
  capped: ['capped', 'cap', 'max supply', 'limited supply'],
  permit: ['permit', 'gasless approval'],
  votes: ['votes', 'voting power', 'delegation'],
  swap: ['swap', 'exchange', 'trade'],
  liquidity: ['liquidity', 'lp', 'pool'],
  royalties: ['royalties', 'royalty', 'creator fee'],
  whitelist: ['whitelist', 'allowlist', 'whitelisted'],
  airdrop: ['airdrop', 'multisend', 'batch transfer'],
  presale: ['presale', 'pre-sale', 'ido', 'ico'],
}

function extractName(input: string): string {
  // Try quoted strings first
  const quoted = input.match(/["']([^"']+)["']/)
  if (quoted) return quoted[1]
  
  // Try "named X" / "called X" / "namanya X" / "bernama X"
  const named = input.match(/(?:named|called|namanya|nama|bernama)\s+([A-Z][a-zA-Z0-9]+)/i)
  if (named) return named[1]
  
  // Try "X token" / "X DEX" pattern
  const afterType = input.match(/(?:token|dex|nft|staking|dao)\s+(?:named|called|namanya)?\s*(\w+)/i)
  if (afterType && afterType[1].length > 2) return afterType[1]
  
  return 'MyProject'
}

function extractSymbol(input: string, name: string): string {
  // Try "symbol X" / "ticker X" / "simbol X"
  const symbolMatch = input.match(/(?:symbol|ticker|simbol)\s+(\w{2,6})/i)
  if (symbolMatch) return symbolMatch[1].toUpperCase()
  
  // Try uppercase words (3-5 chars) that look like tickers
  const tickers = input.match(/[A-Z]{2,5}/g)
  if (tickers) {
    for (const t of tickers) {
      if (!['ETH', 'BSC', 'NFT', 'DEX', 'DAO', 'AMM', 'ERC', 'API', 'THE', 'AND'].includes(t)) {
        return t
      }
    }
  }
  
  // Generate from name
  const words = name.split(/\s+/)
  if (words.length >= 2) {
    return words.map(w => w[0]).join('').toUpperCase().slice(0, 5)
  }
  return name.slice(0, 4).toUpperCase()
}

function detectType(input: string): ProjectType {
  const lower = input.toLowerCase()
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return type as ProjectType
    }
  }
  return 'token'
}

function detectChain(input: string): string {
  const lower = input.toLowerCase()
  for (const [chain, keywords] of Object.entries(CHAIN_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return chain
    }
  }
  return 'ethereum'
}

function detectFeatures(input: string): string[] {
  const lower = input.toLowerCase()
  const features: string[] = []
  for (const [feature, keywords] of Object.entries(FEATURE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        features.push(feature)
        break
      }
    }
  }
  return features
}

export function parsePrompt(input: string): ProjectSpec {
  const type = detectType(input)
  const chain = detectChain(input)
  const name = extractName(input)
  const symbol = extractSymbol(input, name)
  const features = detectFeatures(input)
  
  // Add default features based on type
  const defaultFeatures: Record<ProjectType, string[]> = {
    token: ['mintable', 'burnable'],
    nft: ['mintable'],
    dex: ['swap', 'liquidity'],
    staking: [],
    dao: ['votes'],
  }
  
  const allFeatures = Array.from(new Set([...(defaultFeatures[type] || []), ...features]))
  
  // Extract numeric params — match "10k supply", "supply 10000", "10k", "1 juta" etc.
  const supplyMatch = input.match(/([\d,.]+)\s*(k|juta|million|m)\b|(?:supply|total|max|supply\s+of)\s*(?:of\s*)?([\d,.]+)\s*(k|juta|million|m)?/i)
  let supply = '1000000'
  if (supplyMatch) {
    const numStr = supplyMatch[1] || supplyMatch[3] || '0'
    const num = parseFloat(numStr.replace(/,/g, ''))
    const suffix = (supplyMatch[2] || supplyMatch[4] || '').toLowerCase()
    if (suffix === 'juta' || suffix === 'million' || suffix === 'm') {
      supply = String(num * 1000000)
    } else if (suffix === 'k') {
      supply = String(num * 1000)
    } else {
      supply = String(num)
    }
  }
  
  const feeMatch = input.match(/([\d.]+)%?\s*(?:fee|swap fee)/i)
  const fee = feeMatch ? feeMatch[1] + '%' : '0.3%'
  
  const priceMatch = input.match(/([\d.]+)\s*(?:price|mint price|cost)/i)
  const mintPrice = priceMatch ? priceMatch[1] : '0.01'
  
  return {
    type,
    chain,
    name,
    symbol,
    description: input,
    features: allFeatures,
    params: {
      supply,
      fee,
      mintPrice,
      decimals: type === 'token' ? 18 : 0,
      maxSupply: supply,
    },
  }
}
