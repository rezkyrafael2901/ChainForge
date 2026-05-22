/**
 * Deployer — Handles Solidity compilation and deployment via Foundry.
 * Uses spawnSync to run forge commands with proper error handling.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DeployResult } from './types.js';

// --- Forge Command Runner ---

interface ForgeResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

function runForge(args: string[], cwd: string): ForgeResult {
  const result = spawnSync('forge', args, {
    cwd,
    encoding: 'utf-8',
    timeout: 300_000, // 5 minutes
    env: { ...process.env },
    stdio: 'pipe',
  });

  return {
    success: result.status === 0,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? result.error?.message ?? '',
  };
}

// --- Compile ---

/**
 * Compile Solidity contracts in the given project directory.
 * Runs `forge build` and throws on failure.
 */
export async function compileContracts(projectDir: string): Promise<void> {
  const dir = resolve(projectDir);
  if (!existsSync(dir)) {
    throw new Error(`Project directory does not exist: ${dir}`);
  }
  if (!existsSync(resolve(dir, 'foundry.toml'))) {
    throw new Error(`No foundry.toml found in ${dir}. Is this a Foundry project?`);
  }

  console.log('🔨 Compiling contracts...');
  const result = runForge(['build', '--force'], dir);

  if (!result.success) {
    const errorOutput = result.stderr || result.stdout;
    throw new Error(`Forge build failed:\n${errorOutput}`);
  }

  console.log('✅ Compilation successful');
}

// --- Deploy ---

/**
 * Deploy contracts to a testnet using Foundry script.
 * Returns a DeployResult with deployed contract addresses and tx hashes.
 */
export async function deployToTestnet(
  projectDir: string,
  privateKey: string,
  rpcUrl: string,
): Promise<DeployResult> {
  const dir = resolve(projectDir);
  const errors: string[] = [];
  const deployedContracts: DeployResult['contracts'] = [];

  // Verify the script exists
  const scriptPath = resolve(dir, 'script/Deploy.s.sol');
  if (!existsSync(scriptPath)) {
    return {
      success: false,
      contracts: [],
      frontendUrl: '',
      explorerUrl: '',
      errors: [`Deploy script not found at ${scriptPath}`],
    };
  }

  console.log('🚀 Deploying contracts...');

  const result = runForge(
    [
      'script',
      'script/Deploy.s.sol:DeployScript',
      '--rpc-url',
      rpcUrl,
      '--private-key',
      privateKey,
      '--broadcast',
      '--verify',
    ],
    dir,
  );

  // Parse output for deployed addresses and tx hashes
  if (result.stdout) {
    const addressRegex = /(\w+)\s+deployed\s+at:\s+(0x[a-fA-F0-9]{40})/g;
    let match: RegExpExecArray | null;
    while ((match = addressRegex.exec(result.stdout)) !== null) {
      deployedContracts.push({
        name: match[1],
        address: match[2],
        txHash: '', // Forge broadcast handles this
      });
    }

    // Also check for tx hashes in the broadcast output
    const txHashRegex = /Transaction:\s+(0x[a-fA-F0-9]{64})/g;
    let idx = 0;
    while ((match = txHashRegex.exec(result.stdout)) !== null) {
      if (idx < deployedContracts.length) {
        deployedContracts[idx].txHash = match[1];
      }
      idx++;
    }
  }

  if (!result.success) {
    errors.push(result.stderr || 'Deployment failed — check forge output');
  }

  // Build explorer URL
  const explorerUrl = buildExplorerUrl(rpcUrl, deployedContracts[0]?.address);

  return {
    success: result.success,
    contracts: deployedContracts,
    frontendUrl: '', // Would be set by a separate frontend deployment step
    explorerUrl,
    errors,
  };
}

// --- Verify ---

/**
 * Verify a deployed contract on the block explorer.
 */
export async function verifyContract(
  address: string,
  constructorArgs: any[] = [],
): Promise<void> {
  if (!address.startsWith('0x') || address.length !== 42) {
    throw new Error(`Invalid contract address: ${address}`);
  }

  console.log(`🔍 Verifying contract at ${address}...`);

  const args = ['verify-contract', address];
  if (constructorArgs.length > 0) {
    for (const arg of constructorArgs) {
      args.push('--constructor-args');
      args.push(String(arg));
    }
  }

  const result = runForge(args, process.cwd());

  if (!result.success) {
    throw new Error(`Verification failed:\n${result.stderr || result.stdout}`);
  }

  console.log('✅ Contract verified successfully');
}

// --- Utility ---

function buildExplorerUrl(rpcUrl: string, address?: string): string {
  const explorers: Record<string, string> = {
    'https://eth.llamarpc.com': 'https://etherscan.io',
    'https://mainnet.base.org': 'https://basescan.org',
    'https://arb1.arbitrum.io/rpc': 'https://arbiscan.io',
    'https://polygon-rpc.com': 'https://polygonscan.com',
    'https://bsc-dataseed.bnbchain.org': 'https://bscscan.com',
    'https://rpc.sepolia.org': 'https://sepolia.etherscan.io',
  };
  const base = explorers[rpcUrl] ?? 'https://sepolia.etherscan.io';
  return address ? `${base}/address/${address}` : base;
}
