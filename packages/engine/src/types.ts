export type ProjectType = 'token' | 'nft' | 'dex' | 'staking' | 'dao' | 'marketplace';
export type Chain = 'ethereum' | 'base' | 'arbitrum' | 'polygon' | 'bsc' | 'sepolia';

export interface ProjectSpec {
  name: string;
  description: string;
  type: ProjectType;
  chain: Chain;
  contracts: ContractSpec[];
  frontend: FrontendSpec;
  features: string[];
}

export interface ContractSpec {
  name: string;
  type: string;
  params: Record<string, any>;
  template: string;
}

export interface FrontendSpec {
  pages: string[];
  theme: string;
  walletConnect: boolean;
}

export interface DeployResult {
  success: boolean;
  contracts: { name: string; address: string; txHash: string }[];
  frontendUrl: string;
  explorerUrl: string;
  errors: string[];
}
