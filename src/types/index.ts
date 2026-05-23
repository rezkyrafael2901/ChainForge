export interface ChainConfig {
  id: string
  name: string
  symbol: string
  chainId: number
  rpcUrl: string
  explorerUrl: string
  explorerApi: string
  type: 'mainnet' | 'testnet'
  color: string
  icon: string
}

export type ProjectType = 'token' | 'nft' | 'dex' | 'staking' | 'dao'

export interface ProjectSpec {
  type: ProjectType
  chain: string
  name: string
  symbol: string
  description: string
  features: string[]
  params: Record<string, unknown>
}

export interface GeneratedFile {
  path: string
  content: string
  language: string
  description: string
}

export interface GeneratedProject {
  spec: ProjectSpec
  contracts: GeneratedFile[]
  frontend: GeneratedFile[]
  deployScript: GeneratedFile
  readme: string
  estimatedGas: string
}

export interface DeployRecord {
  id: string
  projectId: string
  projectName: string
  chain: string
  type: ProjectType
  txHash: string
  contractAddress?: string
  explorerUrl?: string
  createdAt: string
}

export interface SavedProjectRecord {
  id: string
  project: GeneratedProject
  createdAt: string
  updatedAt: string
  deploys: DeployRecord[]
}

export interface BuildStep {
  id: string
  label: string
  status: 'pending' | 'active' | 'complete' | 'error'
  detail?: string
}
