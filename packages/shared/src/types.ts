/**
 * Shared TypeScript interfaces for ChainForge
 */

/** Supported blockchain network identifiers */
export type ChainId = 'ethereum' | 'sepolia' | 'base' | 'base-sepolia' | 'arbitrum' | 'arbitrum-sepolia';

/** Supported project template types */
export type ProjectType =
  | 'erc20'
  | 'erc721'
  | 'erc1155'
  | 'dex'
  | 'staking'
  | 'governance'
  | 'multisig'
  | 'custom';

/** Contract function parameter definition */
export interface FunctionParam {
  name: string;
  type: string;
  description?: string;
}

/** Contract function definition */
export interface FunctionDef {
  name: string;
  params: FunctionParam[];
  returnType?: string;
  visibility: 'public' | 'external' | 'internal' | 'private';
  mutability: 'view' | 'pure' | 'payable' | 'nonpayable';
  description?: string;
}

/** Contract event definition */
export interface EventDef {
  name: string;
  params: FunctionParam[];
  indexed: number[];
  description?: string;
}

/** Contract configuration derived from parsed requirements */
export interface ContractConfig {
  name: string;
  symbol?: string;
  description: string;
  type: ProjectType;
  features: string[];
  functions: FunctionDef[];
  events: EventDef[];
  constructorParams: FunctionParam[];
  accessControl: 'ownable' | 'roles' | 'none';
  upgradeable: boolean;
  mintable?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  maxSupply?: string;
}

/** Frontend configuration for the generated web app */
export interface FrontendConfig {
  framework: 'next' | 'vite';
  features: string[];
  walletConnect: boolean;
  chainId: ChainId;
  contractAddresses: Record<string, string>;
  theme: 'light' | 'dark' | 'auto';
}

/** Deployment result after contract deployment */
export interface DeployResult {
  success: boolean;
  chainId: ChainId;
  contractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: bigint;
  verificationResult?: VerificationResult;
  error?: string;
  timestamp: number;
}

/** Contract verification result on block explorer */
export interface VerificationResult {
  success: boolean;
  explorerUrl?: string;
  error?: string;
}

/** Top-level project specification parsed from user prompt */
export interface ProjectSpec {
  name: string;
  description: string;
  type: ProjectType;
  chain: ChainId;
  contracts: ContractConfig[];
  frontend: FrontendConfig | null;
  ipfsMetadata?: boolean;
  originalPrompt: string;
  parsedAt: number;
}
