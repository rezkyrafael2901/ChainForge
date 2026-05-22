import { ChainConfig } from '@/types'

export const CHAINS: ChainConfig[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    explorerApi: 'https://api.etherscan.io/api',
    type: 'mainnet',
    color: '#627eea',
    icon: '⟠',
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    explorerApi: 'https://api.basescan.org/api',
    type: 'mainnet',
    color: '#0052ff',
    icon: '🔵',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    explorerApi: 'https://api.arbiscan.io/api',
    type: 'mainnet',
    color: '#28a0f0',
    icon: '🔷',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    explorerApi: 'https://api.polygonscan.com/api',
    type: 'mainnet',
    color: '#8247e5',
    icon: '🟣',
  },
  {
    id: 'bsc',
    name: 'BNB Chain',
    symbol: 'BNB',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    explorerUrl: 'https://bscscan.com',
    explorerApi: 'https://api.bscscan.com/api',
    type: 'mainnet',
    color: '#f3ba2f',
    icon: '🟡',
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    explorerApi: 'https://api.snowtrace.io/api',
    type: 'mainnet',
    color: '#e84142',
    icon: '🔺',
  },
  {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    symbol: 'ETH',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    explorerApi: 'https://api-sepolia.etherscan.io/api',
    type: 'testnet',
    color: '#627eea',
    icon: '🧪',
  },
]

export function getChain(id: string): ChainConfig | undefined {
  return CHAINS.find(c => c.id === id)
}

export function getMainnets(): ChainConfig[] {
  return CHAINS.filter(c => c.type === 'mainnet')
}

export function getTestnets(): ChainConfig[] {
  return CHAINS.filter(c => c.type === 'testnet')
}
