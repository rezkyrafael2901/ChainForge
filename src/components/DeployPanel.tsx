'use client'

import { useState, useEffect } from 'react'
import { ProjectSpec } from '@/types'
import { addDeployRecord, getCurrentProjectId } from '@/lib/storage'

interface WalletState {
  connected: boolean
  address: string
  chainId: number
  balance: string
}

interface CompileResult {
  success: boolean
  contractName: string
  abi: any[]
  bytecode: string
  source: string
  bytecodeSize: number
  warnings?: string[]
}

interface DeployPanelProps {
  spec: ProjectSpec
  contractSource: string
}

const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  base: 8453,
  arbitrum: 42161,
  polygon: 137,
  bsc: 56,
  avalanche: 43114,
  sepolia: 11155111,
}

const EXPLORER_URLS: Record<string, string> = {
  ethereum: 'https://etherscan.io',
  base: 'https://basescan.org',
  arbitrum: 'https://arbiscan.io',
  polygon: 'https://polygonscan.com',
  bsc: 'https://bscscan.com',
  avalanche: 'https://snowtrace.io',
  sepolia: 'https://sepolia.etherscan.io',
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  8453: 'Base',
  42161: 'Arbitrum',
  137: 'Polygon',
  56: 'BNB Chain',
  43114: 'Avalanche',
  11155111: 'Sepolia',
}

export default function DeployPanel({ spec, contractSource }: DeployPanelProps) {
  const [wallet, setWallet] = useState<WalletState | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null)
  const [txHash, setTxHash] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [deployError, setDeployError] = useState('')
  const [step, setStep] = useState<'connect' | 'ready' | 'compiled' | 'deploying' | 'done'>('connect')

  const hasMetaMask = typeof window !== 'undefined' && !!window.ethereum
  const targetChainId = CHAIN_IDS[spec.chain]
  const explorerUrl = EXPLORER_URLS[spec.chain] || EXPLORER_URLS.ethereum
  const directDeploySupported = ['token', 'nft'].includes(spec.type)

  useEffect(() => {
    if (!hasMetaMask) return
    window.ethereum!.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) connectWallet(false)
      })
      .catch(() => {})
  }, [])

  const connectWallet = async (requestAccess = true) => {
    if (!hasMetaMask) {
      setDeployError('MetaMask not installed. Install it from metamask.io')
      return
    }
    setIsConnecting(true)
    setDeployError('')
    try {
      const accounts = await window.ethereum!.request({
        method: requestAccess ? 'eth_requestAccounts' : 'eth_accounts',
      }) as string[]
      if (!accounts.length) return

      const chainIdHex = await window.ethereum!.request({ method: 'eth_chainId' }) as string
      const chainId = parseInt(chainIdHex, 16)
      const balanceHex = await window.ethereum!.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      }) as string
      const balance = (Number(BigInt(balanceHex)) / 1e18).toFixed(4)

      setWallet({ connected: true, address: accounts[0], chainId, balance })
      setStep('ready')
    } catch (err: any) {
      setDeployError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const switchChain = async () => {
    if (!targetChainId || !window.ethereum) return
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
      await connectWallet(false)
    } catch (err: any) {
      setDeployError(`Please switch to ${spec.chain} network in MetaMask`)
    }
  }

  const compileContract = async () => {
    if (!directDeploySupported) {
      setDeployError('Direct deploy currently supports ERC-20 token projects only. Use ZIP/Remix for this type.')
      return
    }
    setIsCompiling(true)
    setDeployError('')
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Compilation failed')
      setCompileResult(data)
      setStep('compiled')
    } catch (err: any) {
      setDeployError(err.message || 'Failed to compile contract')
    } finally {
      setIsCompiling(false)
    }
  }

  const deployContract = async () => {
    if (!wallet || !compileResult || !window.ethereum) return
    setIsDeploying(true)
    setDeployError('')
    setStep('deploying')
    try {
      if (targetChainId && wallet.chainId !== targetChainId) {
        throw new Error(`Wrong network. Switch to ${spec.chain} first.`)
      }

      // Estimate gas separately for better error handling
      let gas: string | undefined
      try {
        gas = await window.ethereum.request({
          method: 'eth_estimateGas',
          params: [{ from: wallet.address, data: compileResult.bytecode }],
        }) as string
      } catch {
        // Wallet can still estimate internally; continue without gas
      }

      const txParams: Record<string, string> = {
        from: wallet.address,
        data: compileResult.bytecode,
      }
      if (gas) txParams.gas = gas

      const hash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      }) as string
      setTxHash(hash)

      const receipt = await waitForReceipt(hash)
      if (receipt?.contractAddress) {
        setContractAddress(receipt.contractAddress)
      }
      const projectId = getCurrentProjectId()
      if (projectId) {
        addDeployRecord({
          id: `${Date.now()}-${hash.slice(2, 10)}`,
          projectId,
          projectName: spec.name,
          chain: spec.chain,
          type: spec.type,
          txHash: hash,
          contractAddress: receipt?.contractAddress,
          explorerUrl,
          createdAt: new Date().toISOString(),
        })
      }
      setStep('done')
    } catch (err: any) {
      setDeployError(err.message || 'Deployment failed')
      setStep(compileResult ? 'compiled' : 'ready')
    } finally {
      setIsDeploying(false)
    }
  }

  const waitForReceipt = async (hash: string) => {
    for (let i = 0; i < 60; i++) {
      const receipt = await window.ethereum!.request({
        method: 'eth_getTransactionReceipt',
        params: [hash],
      }) as any
      if (receipt) return receipt
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    return null
  }

  const openRemix = () => {
    const source = compileResult?.source || contractSource
    const remixUrl = `https://remix.ethereum.org/#code=${encodeURIComponent(source)}`
    window.open(remixUrl, '_blank', 'noopener,noreferrer')
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className="card-glow rounded-xl">
      <div className="bg-bg-secondary rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🚀</span>
          <div>
            <h3 className="text-lg font-semibold text-white">One-Click Deploy</h3>
            <p className="text-sm text-gray-400">Compile + deploy {spec.name} directly with MetaMask</p>
          </div>
        </div>

        {deployError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {deployError}
          </div>
        )}

        {!directDeploySupported && (
          <div className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
            Direct deploy currently supports ERC-20 tokens and NFT collections. For {spec.type.toUpperCase()}, use Download ZIP or Remix-assisted deploy.
          </div>
        )}

        {!wallet && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">Connect your wallet to deploy from BlockPilot.</p>
            <button
              onClick={() => connectWallet(true)}
              disabled={isConnecting || !hasMetaMask}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isConnecting ? 'Connecting...' : !hasMetaMask ? '🦊 Install MetaMask' : '🦊 Connect MetaMask'}
            </button>
            {!hasMetaMask && (
              <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="block text-center text-sm text-accent-primary hover:underline">
                Download MetaMask →
              </a>
            )}
          </div>
        )}

        {wallet && step !== 'done' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-bg-tertiary/50 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Connected Wallet</span>
                <span className="text-xs text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span>Connected</span>
              </div>
              <p className="text-white font-mono text-sm">{formatAddress(wallet.address)}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">Balance: {wallet.balance} ETH</span>
                <span className="text-xs text-gray-500">{CHAIN_NAMES[wallet.chainId] || `Chain ${wallet.chainId}`}</span>
              </div>
            </div>

            {targetChainId && wallet.chainId !== targetChainId && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm flex items-center justify-between">
                <span>⚠️ Wrong network. Target: {spec.chain}</span>
                <button onClick={switchChain} className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-300 text-xs hover:bg-yellow-500/30 transition-colors">Switch</button>
              </div>
            )}

            {!compileResult ? (
              <button
                onClick={compileContract}
                disabled={isCompiling || !directDeploySupported}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold text-lg transition-all hover:shadow-lg hover:shadow-accent-primary/25 disabled:opacity-50"
              >
                {isCompiling ? '⚙️ Compiling...' : '⚙️ Compile for Deploy'}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                  ✅ Compiled successfully — bytecode {compileResult.bytecodeSize.toLocaleString()} bytes
                </div>
                <button
                  onClick={deployContract}
                  disabled={isDeploying || Boolean(targetChainId && wallet.chainId !== targetChainId)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-lg transition-all hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50"
                >
                  {isDeploying ? 'Deploying...' : `🚀 Deploy ${compileResult.contractName}`}
                </button>
              </div>
            )}

            <button onClick={openRemix} className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Or open in Remix IDE →
            </button>
          </div>
        )}

        {step === 'deploying' && (
          <div className="text-center py-6">
            <div className="animate-spin h-12 w-12 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white font-semibold">Waiting for confirmation...</p>
            {txHash && <a href={`${explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-sm text-accent-primary hover:underline">View transaction →</a>}
          </div>
        )}

        {step === 'done' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <span className="text-4xl mb-4 block">✅</span>
              <h4 className="text-xl font-bold text-white mb-2">Contract Deployed!</h4>
              <p className="text-gray-400 text-sm">{contractAddress ? formatAddress(contractAddress) : 'Transaction confirmed'}</p>
            </div>
            {contractAddress && <a href={`${explorerUrl}/address/${contractAddress}`} target="_blank" rel="noopener noreferrer" className="block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-center transition-all hover:shadow-lg hover:shadow-green-500/25">View Contract on Explorer</a>}
            {txHash && <a href={`${explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="block text-center text-sm text-accent-primary hover:underline">View Transaction →</a>}
          </div>
        )}
      </div>
    </div>
  )
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on?: (event: string, callback: (...args: any[]) => void) => void
      removeListener?: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}
