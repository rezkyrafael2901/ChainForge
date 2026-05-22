'use client'

import { useState, useEffect } from 'react'

interface WalletState {
  connected: boolean
  address: string
  chainId: number
  balance: string
}

interface DeployPanelProps {
  contractName: string
  contractType: string
  contractSource: string
  chain: string
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

export default function DeployPanel({ contractName, contractType, contractSource, chain }: DeployPanelProps) {
  const [wallet, setWallet] = useState<WalletState | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployResult, setDeployResult] = useState<{
    txHash: string
    address: string
    explorerUrl: string
  } | null>(null)
  const [deployError, setDeployError] = useState('')
  const [step, setStep] = useState<'connect' | 'ready' | 'deploying' | 'done'>('connect')

  // Check if MetaMask is installed
  const hasMetaMask = typeof window !== 'undefined' && !!window.ethereum

  // Check if already connected on mount
  useEffect(() => {
    if (!hasMetaMask) return
    
    window.ethereum!.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet()
        }
      })
      .catch(() => {})
  }, [])

  const connectWallet = async () => {
    if (!hasMetaMask) {
      setDeployError('MetaMask not installed. Install it from metamask.io')
      return
    }

    setIsConnecting(true)
    setDeployError('')

    try {
      const accounts = await window.ethereum!.request({ 
        method: 'eth_requestAccounts' 
      }) as string[]
      
      const chainIdHex = await window.ethereum!.request({ 
        method: 'eth_chainId' 
      }) as string
      
      const chainId = parseInt(chainIdHex, 16)
      
      const balanceHex = await window.ethereum!.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      }) as string
      
      const balance = (parseInt(balanceHex, 16) / 1e18).toFixed(4)

      setWallet({
        connected: true,
        address: accounts[0],
        chainId,
        balance,
      })
      setStep('ready')
    } catch (err: any) {
      setDeployError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const switchChain = async (targetChain: string) => {
    const targetChainId = CHAIN_IDS[targetChain]
    if (!targetChainId || !window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
    } catch (err: any) {
      setDeployError(`Please switch to ${targetChain} network in MetaMask`)
    }
  }

  const handleDeploy = async () => {
    if (!wallet) return
    
    setIsDeploying(true)
    setDeployError('')
    setStep('deploying')

    try {
      // For MVP: Guide user to deploy via Remix IDE
      // In production: This would compile and deploy directly via the wallet
      
      // Open Remix IDE with the contract
      const remixUrl = `https://remix.ethereum.org/#code=${encodeURIComponent(contractSource)}`
      
      setDeployResult({
        txHash: '',
        address: '',
        explorerUrl: remixUrl,
      })
      setStep('done')
    } catch (err: any) {
      setDeployError(err.message || 'Deployment failed')
      setStep('ready')
    } finally {
      setIsDeploying(false)
    }
  }

  const formatAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className="card-glow rounded-xl">
      <div className="bg-bg-secondary rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🚀</span>
          <div>
            <h3 className="text-lg font-semibold text-white">Deploy Contract</h3>
            <p className="text-sm text-gray-400">Deploy {contractName} to {chain}</p>
          </div>
        </div>

        {/* Error */}
        {deployError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {deployError}
          </div>
        )}

        {/* Step 1: Connect Wallet */}
        {!wallet && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Connect your wallet to deploy contracts directly from ChainForge.
            </p>
            <button
              onClick={connectWallet}
              disabled={isConnecting || !hasMetaMask}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connecting...
                </>
              ) : !hasMetaMask ? (
                '🦊 Install MetaMask'
              ) : (
                '🦊 Connect MetaMask'
              )}
            </button>
            {!hasMetaMask && (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-accent-primary hover:underline"
              >
                Download MetaMask →
              </a>
            )}
          </div>
        )}

        {/* Step 2: Connected - Ready */}
        {wallet && step === 'ready' && (
          <div className="space-y-4">
            {/* Wallet Info */}
            <div className="p-4 rounded-xl bg-bg-tertiary/50 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Connected Wallet</span>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  Connected
                </span>
              </div>
              <p className="text-white font-mono text-sm">{formatAddress(wallet.address)}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">Balance: {wallet.balance} ETH</span>
                <span className="text-xs text-gray-500">Chain ID: {wallet.chainId}</span>
              </div>
            </div>

            {/* Chain Warning */}
            {wallet.chainId !== CHAIN_IDS[chain] && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm flex items-center justify-between">
                <span>⚠️ Wrong network. Switch to {chain}</span>
                <button
                  onClick={() => switchChain(chain)}
                  className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-300 text-xs hover:bg-yellow-500/30 transition-colors"
                >
                  Switch
                </button>
              </div>
            )}

            {/* Deploy Button */}
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold text-lg transition-all hover:shadow-lg hover:shadow-accent-primary/25 disabled:opacity-50"
            >
              {isDeploying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Deploying...
                </span>
              ) : (
                `🚀 Deploy ${contractName}`
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              This will open Remix IDE with your contract pre-loaded
            </p>
          </div>
        )}

        {/* Step 3: Deploying */}
        {step === 'deploying' && (
          <div className="text-center py-8">
            <div className="animate-spin h-12 w-12 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white font-semibold">Deploying {contractName}...</p>
            <p className="text-sm text-gray-400 mt-2">Confirm the transaction in MetaMask</p>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 'done' && deployResult && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <span className="text-4xl mb-4 block">✅</span>
              <h4 className="text-xl font-bold text-white mb-2">Ready to Deploy!</h4>
              <p className="text-gray-400 text-sm">
                Your contract is ready. Click below to open Remix IDE with your contract pre-loaded.
              </p>
            </div>

            <a
              href={deployResult.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-center transition-all hover:shadow-lg hover:shadow-green-500/25"
            >
              🌐 Open Remix IDE
            </a>

            <button
              onClick={() => { setStep('ready'); setDeployResult(null) }}
              className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to deploy options
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}
