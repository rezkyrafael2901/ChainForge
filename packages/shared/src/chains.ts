import type { ChainId } from './types.js';

/**
 * Chain configuration for supported blockchain networks
 */
export interface ChainConfig {
  id: ChainId;
  name: string;
  chainId: number;
  rpcUrlEnv: string;
  explorerUrl: string;
  explorerApiUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
}

/**
 * Supported blockchain network configurations
 */
export const SUPPORTED_CHAINS: Record<ChainId, ChainConfig> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrlEnv: 'ETHEREUM_RPC_URL',
    explorerUrl: 'https://etherscan.io',
    explorerApiUrl: 'https://api.etherscan.io/api',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    isTestnet: false,
  },
  sepolia: {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrlEnv: 'SEPOLIA_RPC_URL',
    explorerUrl: 'https://sepolia.etherscan.io',
    explorerApiUrl: 'https://api-sepolia.etherscan.io/api',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
    isTestnet: true,
  },
  base: {
    id: 'base',
    name: 'Base',
    chainId: 8453,
    rpcUrlEnv: 'BASE_RPC_URL',
    explorerUrl: 'https://basescan.org',
    explorerApiUrl: 'https://api.basescan.org/api',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    isTestnet: false,
  },
  'base-sepolia': {
    id: 'base-sepolia',
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrlEnv: 'BASE_SEPOLIA_RPC_URL',
    explorerUrl: 'https://sepolia.basescan.org',
    explorerApiUrl: 'https://api-sepolia.basescan.org/api',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
    isTestnet: true,
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrlEnv: 'ARBITRUM_RPC_URL',
    explorerUrl: 'https://arbiscan.io',
    explorerApiUrl: 'https://api.arbiscan.io/api',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    isTestnet: false,
  },
  'arbitrum-sepolia': {
    id: 'arbitrum-sepolia',
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    rpcUrlEnv: 'ARBITRUM_SEPOLIA_RPC_URL',
    explorerUrl: 'https://sepolia.arbiscan.io',
    explorerApiUrl: 'https://api-sepolia.arbiscan.io/api',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
    isTestnet: true,
  },
};

/**
 * Get chain config by numeric chain ID
 */
export function getChainByChainId(chainId: number): ChainConfig | undefined {
  return Object.values(SUPPORTED_CHAINS).find((c) => c.chainId === chainId);
}

/**
 * Get only testnet chains
 */
export function getTestnets(): ChainConfig[] {
  return Object.values(SUPPORTED_CHAINS).filter((c) => c.isTestnet);
}

/**
 * Get only mainnet chains
 */
export function getMainnets(): ChainConfig[] {
  return Object.values(SUPPORTED_CHAINS).filter((c) => !c.isTestnet);
}
