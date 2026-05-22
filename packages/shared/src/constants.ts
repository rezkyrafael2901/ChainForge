/**
 * ChainForge constants
 */

/** Current version of ChainForge */
export const CHAINFORGE_VERSION = '0.1.0';

/** Default gas limit for contract deployments */
export const DEFAULT_GAS_LIMIT = 5_000_000n;

/** Maximum retries for RPC calls */
export const MAX_RETRIES = 3;

/** Delay between retries in milliseconds */
export const RETRY_DELAY_MS = 2_000;

/** Default block confirmation count to wait for */
export const BLOCK_CONFIRMATIONS = 2;

/** OpenZeppelin contracts version used for templates */
export const OPENZEPPELIN_VERSION = '5.0.0';

/** Solidity compiler version */
export const SOLIDITY_VERSION = '0.8.24';

/** IPFS gateway URL for pinned metadata */
export const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

/** Supported contract templates with their OpenZeppelin imports */
export const CONTRACT_TEMPLATES = {
  erc20: {
    name: 'ERC-20 Token',
    imports: ['@openzeppelin/contracts/token/ERC20/ERC20.sol', '@openzeppelin/contracts/access/Ownable.sol'],
    description: 'Standard fungible token',
  },
  erc721: {
    name: 'ERC-721 NFT',
    imports: ['@openzeppelin/contracts/token/ERC721/ERC721.sol', '@openzeppelin/contracts/access/Ownable.sol'],
    description: 'Standard non-fungible token',
  },
  erc1155: {
    name: 'ERC-1155 Multi-Token',
    imports: ['@openzeppelin/contracts/token/ERC1155/ERC1155.sol', '@openzeppelin/contracts/access/Ownable.sol'],
    description: 'Multi-token standard',
  },
  staking: {
    name: 'Staking Contract',
    imports: [
      '@openzeppelin/contracts/token/ERC20/ERC20.sol',
      '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol',
      '@openzeppelin/contracts/access/Ownable.sol',
      '@openzeppelin/contracts/utils/ReentrancyGuard.sol',
    ],
    description: 'Token staking with rewards',
  },
  governance: {
    name: 'Governance Contract',
    imports: [
      '@openzeppelin/contracts/governance/Governor.sol',
      '@openzeppelin/contracts/governance/extensions/GovernorSettings.sol',
      '@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol',
      '@openzeppelin/contracts/governance/extensions/GovernorVotes.sol',
    ],
    description: 'DAO governance with voting',
  },
  multisig: {
    name: 'Multi-Signature Wallet',
    imports: [
      '@openzeppelin/contracts/access/Ownable.sol',
      '@openzeppelin/contracts/utils/ReentrancyGuard.sol',
    ],
    description: 'Multi-signature wallet requiring N-of-M approvals',
  },
  dex: {
    name: 'Simple DEX',
    imports: [
      '@openzeppelin/contracts/token/ERC20/ERC20.sol',
      '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol',
      '@openzeppelin/contracts/utils/ReentrancyGuard.sol',
    ],
    description: 'Simple AMM-style decentralized exchange',
  },
} as const;

/** Anthropic model to use for prompt parsing */
export const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

/** Max tokens for Claude responses */
export const MAX_TOKENS = 8192;
